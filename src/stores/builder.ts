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
    // Timed-circuit edits: rounds is workout-level; work/rest are global to
    // every item in the light timed editor.
    setRounds: (rounds: number) =>
      update((w) => ({ ...w, rounds: Math.max(1, rounds) })),
    setWorkSeconds: (workSeconds: number) =>
      update((w) => ({
        ...w,
        items: w.items.map((it) => ({
          ...it,
          workSeconds: Math.max(5, workSeconds),
        })),
      })),
    setRestSeconds: (restSeconds: number) =>
      update((w) => ({
        ...w,
        items: w.items.map((it) => ({
          ...it,
          restSeconds: Math.max(0, restSeconds),
        })),
      })),
  }
}

export const builder = createBuilder()
