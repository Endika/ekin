import { uuidv7 } from 'uuidv7'
import type { Exercise, Level, Workout, WorkoutItem, Zone } from './types'

export interface AutofillInput {
  zone: Zone
  minutes: number
  level: Level
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

  const groups = new Map<string, Exercise[]>()
  for (const e of eligible) {
    const g = groups.get(e.zone) ?? []
    g.push(e)
    groups.set(e.zone, g)
  }
  const lists = [...groups.values()]
  const max = Math.max(0, ...lists.map((l) => l.length))
  const out: Exercise[] = []
  for (let i = 0; i < max; i++) {
    for (const l of lists) if (l[i]) out.push(l[i])
  }
  return out
}

export function autofill(catalog: Exercise[], input: AutofillInput): Workout {
  const budget = input.minutes * 60
  const candidates = candidatesFor(catalog, input.zone, input.level)

  const items: WorkoutItem[] = []
  let used = 0
  for (const ex of candidates) {
    const item: WorkoutItem = { exerciseId: ex.id, ...DEFAULTS }
    const cost = estimateSeconds(item)
    if (used + cost > budget && items.length > 0) break
    items.push(item)
    used += cost
    if (used >= budget) break
  }

  return {
    id: uuidv7(),
    name: `${capitalize(input.zone)} · ${input.minutes} min`,
    zone: input.zone,
    items,
    createdAt: 0,
  }
}
