import { writable } from 'svelte/store'
import type { Workout } from '../domain/types'
import { listWorkouts, deleteWorkout } from '../data/workouts-repo'

function createSavedStore() {
  const { subscribe, set } = writable<Workout[]>([])

  async function refresh() {
    set(await listWorkouts())
  }

  async function remove(id: string) {
    await deleteWorkout(id)
    await refresh()
  }

  refresh()

  return { subscribe, refresh, remove }
}

export const saved = createSavedStore()
