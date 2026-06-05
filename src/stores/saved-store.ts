import { writable } from 'svelte/store'
import type { Workout } from '../domain/types'
import { listWorkouts, deleteWorkout, saveWorkout } from '../data/workouts-repo'

function createSavedStore() {
  const { subscribe, set } = writable<Workout[]>([])

  async function refresh() {
    set(await listWorkouts())
  }

  async function remove(id: string) {
    await deleteWorkout(id)
    await refresh()
  }

  async function rename(workout: Workout, name: string) {
    const trimmed = name.trim()
    if (!trimmed || trimmed === workout.name) return
    await saveWorkout({ ...workout, name: trimmed })
    await refresh()
  }

  refresh()

  return { subscribe, refresh, remove, rename }
}

export const saved = createSavedStore()
