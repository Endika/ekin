import { uuidv7 } from 'uuidv7'
import type { Workout, WorkoutItem, WorkoutMode, Zone } from './types'

export function newWorkout(name: string, zone: Zone): Workout {
  return { id: uuidv7(), name, zone, items: [], createdAt: 0 }
}

const CIRCUIT_DEFAULTS = { workSeconds: 40, restSeconds: 20, rounds: 3 }
const REP_DEFAULTS = { sets: 3, reps: 10, restSeconds: 30 }

/**
 * Convert a workout between rep-based and timed-circuit form, filling the target
 * format's missing fields with sane defaults so a hand-built rep workout can
 * become a HIIT (and back) without losing exercises.
 */
export function setWorkoutMode(w: Workout, mode: WorkoutMode): Workout {
  if (mode === 'timed') {
    return {
      ...w,
      mode: 'timed',
      rounds: w.rounds ?? CIRCUIT_DEFAULTS.rounds,
      items: w.items.map((it) => ({
        ...it,
        workSeconds: it.workSeconds ?? CIRCUIT_DEFAULTS.workSeconds,
        restSeconds: it.restSeconds || CIRCUIT_DEFAULTS.restSeconds,
      })),
    }
  }
  return {
    ...w,
    mode: 'reps',
    items: w.items.map((it) => ({
      ...it,
      sets: it.sets >= 1 ? it.sets : REP_DEFAULTS.sets,
      reps: it.reps >= 1 ? it.reps : REP_DEFAULTS.reps,
      restSeconds:
        it.restSeconds >= 1 ? it.restSeconds : REP_DEFAULTS.restSeconds,
    })),
  }
}

export function addItem(w: Workout, exerciseId: string): Workout {
  // In a timed circuit a new exercise inherits the circuit's work/rest interval
  // (from the existing items, or a sensible default) instead of sets/reps.
  if (w.mode === 'timed') {
    const ref = w.items[0]
    const item: WorkoutItem = {
      exerciseId,
      sets: 0,
      reps: 0,
      workSeconds: ref?.workSeconds ?? 40,
      restSeconds: ref?.restSeconds ?? 20,
    }
    return { ...w, items: [...w.items, item] }
  }
  const item: WorkoutItem = { exerciseId, sets: 3, reps: 10, restSeconds: 30 }
  return { ...w, items: [...w.items, item] }
}

export function updateItem(
  w: Workout,
  index: number,
  patch: Partial<WorkoutItem>,
): Workout {
  return {
    ...w,
    items: w.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
  }
}

export function removeItem(w: Workout, index: number): Workout {
  return { ...w, items: w.items.filter((_, i) => i !== index) }
}

export function moveItem(w: Workout, from: number, to: number): Workout {
  const items = [...w.items]
  const [it] = items.splice(from, 1)
  items.splice(to, 0, it)
  return { ...w, items }
}
