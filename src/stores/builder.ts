import { writable } from 'svelte/store'
import type { Workout, WorkoutItem, Zone } from '../domain/types'
import {
  newWorkout,
  addItem,
  updateItem,
  removeItem,
  moveItem,
} from '../domain/workout'

function createBuilder() {
  const { subscribe, set, update } = writable<Workout>(
    newWorkout('My workout', 'full'),
  )
  return {
    subscribe,
    reset: (name: string, zone: Zone) => set(newWorkout(name, zone)),
    load: (w: Workout) => set(w),
    add: (exerciseId: string) => update((w) => addItem(w, exerciseId)),
    patch: (i: number, p: Partial<WorkoutItem>) =>
      update((w) => updateItem(w, i, p)),
    remove: (i: number) => update((w) => removeItem(w, i)),
    move: (from: number, to: number) => update((w) => moveItem(w, from, to)),
    rename: (name: string) => update((w) => ({ ...w, name })),
    setZone: (zone: Zone) => update((w) => ({ ...w, zone })),
  }
}

export const builder = createBuilder()
