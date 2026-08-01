import { uuidv7 } from 'uuidv7'
import type { Exercise, Level, Workout, WorkoutItem, Zone } from './types'
import { isDynamicStretch, isStaticStretch } from './stretches'

export type Goal = 'strength' | 'circuit'

export interface AutofillInput {
  zone: Zone
  minutes: number
  level: Level
  /** Absent ⇒ 'strength' (the rep-based default). 'circuit' ⇒ a timed HIIT circuit. */
  goal?: Goal
  /**
   * Rotates the exercise selection so repeated "generate" taps yield different
   * routines, in both goals. Absent/0 ⇒ the first window (kept deterministic
   * for tests); each increment shifts to a fresh set of exercises.
   */
  variant?: number
}

const LEVEL_RANK: Record<Level, number> = {
  beginner: 0,
  intermediate: 1,
  expert: 2,
}

const DEFAULTS = { sets: 3, reps: 10, restSeconds: 30 }
const SECONDS_PER_REP = 3

function estimateSeconds(item: WorkoutItem): number {
  return item.sets * (item.reps * SECONDS_PER_REP + item.restSeconds)
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * Propose a workout for a zone + time budget + level. Deterministic in its
 * exercise selection (candidates ordered by id; no Date.now/Math.random in the
 * pick). The returned workout is a normal editable Workout — the builder loads it.
 */
const byId = (a: Exercise, b: Exercise) => a.id.localeCompare(b.id)

/** Group items by a key, preserving insertion order within each group. */
function groupBy<T>(items: T[], key: (item: T) => string): T[][] {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const g = groups.get(k) ?? []
    g.push(item)
    groups.set(k, g)
  }
  return [...groups.values()]
}

/** Round-robin the lists, so consecutive picks come from different groups. */
function interleave<T>(lists: T[][]): T[] {
  const max = Math.max(0, ...lists.map((l) => l.length))
  const out: T[] = []
  for (let i = 0; i < max; i++) {
    for (const l of lists) if (l[i]) out.push(l[i])
  }
  return out
}

/**
 * Candidate exercises for a zone + level. A 'full' (full-body) workout draws
 * from EVERY zone — round-robin across zones for variety — because no exercise
 * is itself tagged 'full'; treating 'full' as an exact match would yield none.
 */
function candidatesFor(
  catalog: Exercise[],
  zone: Zone,
  level: Level,
): Exercise[] {
  const eligible = catalog
    .filter((e) => LEVEL_RANK[e.level] <= LEVEL_RANK[level])
    .slice()
    .sort(byId)

  if (zone !== 'full') return eligible.filter((e) => e.zone === zone)

  return interleave(groupBy(eligible, (e) => e.zone))
}

/**
 * Order candidates for a rep-based strength workout.
 *
 * Stretching is dropped: it belongs in the warm-up and cool-down, not in the main block.
 * The rest is round-robined by primary muscle so consecutive picks train different things
 * — sorting by id alone made a routine open with four variations of the same push-up,
 * because the catalog names them alike and they sort together.
 *
 * The variant rotates WITHIN each muscle group rather than across the flattened list:
 * muscle groups are very uneven (upper-body is mostly chest), so rotating the flat list
 * would just walk the window into the long chest tail and serve a monotonous routine.
 * Rotating per group keeps every variant balanced, and covers the pool in as many
 * variants as the largest group has exercises.
 */
function strengthOrder(candidates: Exercise[], variant: number): Exercise[] {
  const main = candidates.filter((e) => e.category !== 'stretching')
  const groups = groupBy(
    oneStepPerChain(main, variant),
    (e) => e.primaryMuscles[0] ?? e.zone,
  )
  return interleave(groups.map((g) => rotate(g, variant)))
}

/**
 * Keep one exercise per progression chain, so a routine cannot serve four variations of
 * the same push-up. The variant decides which step of the chain comes up, so successive
 * routines walk the progression instead of always offering its easiest rung.
 */
function oneStepPerChain(list: Exercise[], variant: number): Exercise[] {
  const groups = groupBy(list, (e) => e.chain?.id ?? e.id)
  return groups.map(
    (g) =>
      rotate(
        g.slice().sort((a, b) => (a.chain?.step ?? 0) - (b.chain?.step ?? 0)),
        variant,
      )[0],
  )
}

/** Seconds a warm-up or cool-down item is held for. */
const STRETCH_SECONDS = 30
/** Share of the time budget spent warming up, and again cooling down. */
const PREP_SHARE = 0.1

/**
 * Pick stretches that match the muscles the session actually trained.
 *
 * Preference order: stretches covering a worked muscle first, then anything else in the
 * same zone as a fallback — some muscles have no dynamic stretch at all (there is no
 * dynamic triceps stretch in the catalog), and warming the shoulder before triceps work
 * is better than warming nothing.
 */
function prepBlock(
  catalog: Exercise[],
  main: WorkoutItem[],
  block: 'warmup' | 'cooldown',
  zone: Zone,
  budget: number,
  variant: number,
): WorkoutItem[] {
  const pick = block === 'warmup' ? isDynamicStretch : isStaticStretch
  const exerciseById = new Map(catalog.map((e) => [e.id, e]))
  const worked = new Set(
    main.flatMap((it) => exerciseById.get(it.exerciseId)?.primaryMuscles ?? []),
  )

  const candidates = catalog.filter(pick).slice().sort(byId)
  const matching = candidates.filter((e) =>
    e.primaryMuscles.some((m) => worked.has(m)),
  )
  const sameZone = candidates.filter(
    (e) => !matching.includes(e) && (zone === 'full' || e.zone === zone),
  )
  const ordered = [...rotate(matching, variant), ...rotate(sameZone, variant)]

  const slots = Math.floor(budget / STRETCH_SECONDS)
  return ordered.slice(0, Math.max(0, slots)).map((e) => ({
    exerciseId: e.id,
    sets: 1,
    reps: 0,
    restSeconds: 0,
    workSeconds: STRETCH_SECONDS,
    block,
  }))
}

export function autofill(catalog: Exercise[], input: AutofillInput): Workout {
  if (input.goal === 'circuit') return autofillCircuit(catalog, input)

  const total = input.minutes * 60
  const variant = input.variant ?? 0
  // The minutes asked for are the minutes of the whole session, warm-up and cool-down
  // included — so the main block gets what is left after reserving both.
  const prepBudget = Math.round(total * PREP_SHARE)
  const budget = total - 2 * prepBudget

  // Each "generate" tap bumps the variant, so a fresh set of exercises comes up instead
  // of the same routine every time.
  const candidates = strengthOrder(
    candidatesFor(catalog, input.zone, input.level),
    variant,
  )

  const main: WorkoutItem[] = []
  let used = 0
  for (const ex of candidates) {
    const item: WorkoutItem = { exerciseId: ex.id, ...DEFAULTS, block: 'main' }
    const cost = estimateSeconds(item)
    if (used + cost > budget && main.length > 0) break
    main.push(item)
    used += cost
    if (used >= budget) break
  }

  // Warm up and cool down the muscles this session actually trained.
  const prep = (block: 'warmup' | 'cooldown') =>
    main.length
      ? prepBlock(catalog, main, block, input.zone, prepBudget, variant)
      : []

  return {
    id: uuidv7(),
    name: `${capitalize(input.zone)} · ${input.minutes} min`,
    zone: input.zone,
    items: [...prep('warmup'), ...main, ...prep('cooldown')],
    createdAt: 0,
  }
}

// Timed-circuit defaults (seconds). 40s on / 20s off is a common HIIT interval.
const CIRCUIT = { workSeconds: 40, restSeconds: 20 }
const MAX_CIRCUIT_ITEMS = 6
const MIN_ROUNDS = 2
const MAX_ROUNDS = 6

/**
 * Order candidates for a fat-burn circuit: prefer dynamic, higher-energy
 * movements (plyometrics, cardio) first, then strength as filler. Stretching
 * exercises are dropped entirely — they belong in a warm-up, not a circuit.
 * Ordering within each tier stays by id, so selection is deterministic.
 */
function circuitOrder(candidates: Exercise[]): Exercise[] {
  const energetic = candidates.filter(
    (e) => e.category === 'plyometrics' || e.category === 'cardio',
  )
  const strength = candidates.filter(
    (e) =>
      e.category !== 'plyometrics' &&
      e.category !== 'cardio' &&
      e.category !== 'stretching',
  )
  return [...energetic, ...strength]
}

/** Rotate an array left by `by` positions (wrapping); identity for empty/0. */
function rotate<T>(arr: T[], by: number): T[] {
  if (arr.length === 0) return arr
  const k = ((by % arr.length) + arr.length) % arr.length
  return [...arr.slice(k), ...arr.slice(0, k)]
}

function autofillCircuit(catalog: Exercise[], input: AutofillInput): Workout {
  const budget = input.minutes * 60
  const ordered = circuitOrder(candidatesFor(catalog, input.zone, input.level))
  // Shift the window by whole circuits per variant so consecutive "generate"
  // taps surface a fresh set of exercises instead of the same one every time.
  const rotated = rotate(ordered, (input.variant ?? 0) * MAX_CIRCUIT_ITEMS)
  const chosen = rotated.slice(0, MAX_CIRCUIT_ITEMS)

  const items: WorkoutItem[] = chosen.map((ex) => ({
    exerciseId: ex.id,
    sets: 0,
    reps: 0,
    ...CIRCUIT,
  }))

  const perRound = items.length * (CIRCUIT.workSeconds + CIRCUIT.restSeconds)
  const rounds = perRound
    ? Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, Math.round(budget / perRound)))
    : MIN_ROUNDS

  return {
    id: uuidv7(),
    name: `${capitalize(input.zone)} · ${circuitLabel(input.minutes)}`,
    zone: input.zone,
    mode: 'timed',
    rounds,
    items,
    createdAt: 0,
  }
}

const circuitLabel = (min: number) => `HIIT ${min} min`
