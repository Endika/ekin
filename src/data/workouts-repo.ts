import { openEkinDb } from './db'
import type { Workout } from '../domain/types'

export async function saveWorkout(w: Workout): Promise<Workout> {
  const toSave: Workout = { ...w, createdAt: w.createdAt || Date.now() }
  const db = await openEkinDb()
  await db.put('workouts', toSave)
  return toSave
}

export async function listWorkouts(): Promise<Workout[]> {
  const db = await openEkinDb()
  const all = (await db.getAll('workouts')) as Workout[]
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  const db = await openEkinDb()
  return (await db.get('workouts', id)) as Workout | undefined
}

export async function deleteWorkout(id: string): Promise<void> {
  const db = await openEkinDb()
  await db.delete('workouts', id)
}
