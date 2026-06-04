import { uuidv7 } from 'uuidv7'
import type { Workout, WorkoutItem, Zone } from './types'

export function newWorkout(name: string, zone: Zone): Workout {
  return { id: uuidv7(), name, zone, items: [], createdAt: 0 }
}

export function addItem(w: Workout, exerciseId: string): Workout {
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
