import type { Exercise, Workout, WorkoutItem } from '../domain/types'
import type { GeminiClient } from './gemini'

export type AssistRequest =
  | { kind: 'swap'; itemIndex: number; reason?: string }
  | { kind: 'adjust'; direction: 'easier' | 'harder' }

export type AssistResult =
  | { ok: true; workout: Workout }
  | { ok: false; error: string }

const isTimed = (w: Workout) => w.mode === 'timed'

function poolFor(catalog: Exercise[], workout: Workout): string {
  // A 'full' workout can use any zone; no exercise is itself tagged 'full'.
  return catalog
    .filter((e) => workout.zone === 'full' || e.zone === workout.zone)
    .map((e) => `${e.id}: ${e.name} [${e.zone}, ${e.level}]`)
    .join('\n')
}

export function buildPrompt(
  catalog: Exercise[],
  workout: Workout,
  req: AssistRequest,
): string {
  return isTimed(workout)
    ? buildTimedPrompt(catalog, workout, req)
    : buildRepPrompt(catalog, workout, req)
}

function buildRepPrompt(
  catalog: Exercise[],
  workout: Workout,
  req: AssistRequest,
): string {
  const instruction =
    req.kind === 'swap'
      ? `Replace the exercise at index ${req.itemIndex} with a different exercise from the catalog (same zone when possible). Keep the other items unchanged.${
          req.reason ? ` Reason: ${req.reason}.` : ''
        }`
      : `Make the whole workout ${req.direction} by adjusting sets, reps and rest. Keep the same exercises.`

  return [
    'You are a bodyweight-fitness assistant.',
    'Return ONLY a JSON object of the form {"items":[{"exerciseId","sets","reps","restSeconds"}]}.',
    'Every exerciseId MUST come from the catalog below. No prose, no markdown.',
    '',
    'Catalog (id: name [zone, level]):',
    poolFor(catalog, workout),
    '',
    `Current items: ${JSON.stringify(workout.items)}`,
    '',
    `Task: ${instruction}`,
  ].join('\n')
}

function buildTimedPrompt(
  catalog: Exercise[],
  workout: Workout,
  req: AssistRequest,
): string {
  const items = JSON.stringify(
    workout.items.map((it) => ({
      exerciseId: it.exerciseId,
      workSeconds: it.workSeconds,
      restSeconds: it.restSeconds,
    })),
  )
  const instruction =
    req.kind === 'swap'
      ? `Replace the exercise at index ${req.itemIndex} with a different exercise from the catalog (same zone when possible), keeping its workSeconds and restSeconds. Keep the other items and the rounds unchanged.${
          req.reason ? ` Reason: ${req.reason}.` : ''
        }`
      : `Make the whole circuit ${req.direction}: ${
          req.direction === 'harder'
            ? 'increase workSeconds and/or rounds and shorten restSeconds'
            : 'decrease workSeconds and/or rounds and lengthen restSeconds'
        }. Keep the same exercises.`

  return [
    'You are a bodyweight-fitness assistant.',
    'This is a TIMED HIIT circuit measured in seconds — there are no reps.',
    'Return ONLY a JSON object of the form {"rounds":<int>,"items":[{"exerciseId","workSeconds","restSeconds"}]}.',
    'workSeconds is the work interval (>=5), restSeconds the rest (>=0), rounds how many times the whole list repeats (>=1).',
    'Every exerciseId MUST come from the catalog below. No prose, no markdown.',
    '',
    'Catalog (id: name [zone, level]):',
    poolFor(catalog, workout),
    '',
    `Current rounds: ${workout.rounds ?? 1}`,
    `Current items: ${items}`,
    '',
    `Task: ${instruction}`,
  ].join('\n')
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/** Pulls the JSON payload out of a model reply, tolerating ``` fences. */
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = (fenced ? fenced[1] : text).trim()
  return JSON.parse(raw)
}

function toInt(v: unknown): number {
  return Math.round(Number(v))
}

function validateItems(
  parsed: unknown,
  ids: Set<string>,
): WorkoutItem[] | null {
  const list = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.items)
      ? parsed.items
      : null
  if (!list || list.length === 0) return null

  const out: WorkoutItem[] = []
  for (const raw of list) {
    if (!isRecord(raw)) return null
    const exerciseId = raw.exerciseId
    if (typeof exerciseId !== 'string' || !ids.has(exerciseId)) return null
    const sets = toInt(raw.sets)
    const reps = toInt(raw.reps)
    const restSeconds = toInt(raw.restSeconds)
    if (!Number.isFinite(sets) || sets < 1) return null
    if (!Number.isFinite(reps) || reps < 1) return null
    if (!Number.isFinite(restSeconds) || restSeconds < 0) return null
    out.push({ exerciseId, sets, reps, restSeconds })
  }
  return out
}

function listOf(parsed: unknown): unknown[] | null {
  const list = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.items)
      ? parsed.items
      : null
  return list && list.length ? list : null
}

/** Validates a timed-circuit reply: rounds + per-item work/rest in seconds. */
function validateTimed(
  parsed: unknown,
  ids: Set<string>,
): { rounds: number; items: WorkoutItem[] } | null {
  const list = listOf(parsed)
  if (!list) return null

  const items: WorkoutItem[] = []
  for (const raw of list) {
    if (!isRecord(raw)) return null
    const exerciseId = raw.exerciseId
    if (typeof exerciseId !== 'string' || !ids.has(exerciseId)) return null
    const workSeconds = toInt(raw.workSeconds)
    const restSeconds = toInt(raw.restSeconds)
    if (!Number.isFinite(workSeconds) || workSeconds < 5) return null
    if (!Number.isFinite(restSeconds) || restSeconds < 0) return null
    items.push({ exerciseId, sets: 0, reps: 0, workSeconds, restSeconds })
  }

  const roundsRaw = isRecord(parsed) ? toInt(parsed.rounds) : NaN
  const rounds = Number.isFinite(roundsRaw) && roundsRaw >= 1 ? roundsRaw : 1
  return { rounds, items }
}

/**
 * Asks the model to transform the workout, then validates the reply against the
 * catalog. Any failure (network, bad JSON, unknown id, bad numbers) returns
 * { ok: false }; the caller keeps the original workout untouched.
 */
export async function requestAssist(
  client: GeminiClient,
  catalog: Exercise[],
  workout: Workout,
  req: AssistRequest,
): Promise<AssistResult> {
  let text: string
  try {
    text = await client.generate(buildPrompt(catalog, workout, req))
  } catch {
    return { ok: false, error: 'request_failed' }
  }

  let parsed: unknown
  try {
    parsed = extractJson(text)
  } catch {
    return { ok: false, error: 'bad_json' }
  }

  const ids = new Set(catalog.map((e) => e.id))

  if (isTimed(workout)) {
    const res = validateTimed(parsed, ids)
    if (!res) return { ok: false, error: 'invalid' }
    return {
      ok: true,
      workout: { ...workout, rounds: res.rounds, items: res.items },
    }
  }

  const items = validateItems(parsed, ids)
  if (!items) return { ok: false, error: 'invalid' }

  return { ok: true, workout: { ...workout, items } }
}
