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
export function autofill(catalog: Exercise[], input: AutofillInput): Workout {
  const budget = input.minutes * 60
  const candidates = catalog
    .filter((e) => e.zone === input.zone || e.zone === 'full')
    .filter((e) => LEVEL_RANK[e.level] <= LEVEL_RANK[input.level])
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))

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
