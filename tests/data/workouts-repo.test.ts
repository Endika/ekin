import { describe, it, expect, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import {
  saveWorkout,
  listWorkouts,
  getWorkout,
  deleteWorkout,
} from '../../src/data/workouts-repo'
import { newWorkout, addItem } from '../../src/domain/workout'

beforeEach(() => {
  // Fresh IDBFactory per test: a clean store with no leaked open
  // connections, so isolation is deterministic (no blocked deletes).
  globalThis.indexedDB = new IDBFactory()
})

describe('workouts-repo', () => {
  it('saves, stamps createdAt, and reads back', async () => {
    const w = addItem(newWorkout('Push', 'upper'), 'ex1')
    const saved = await saveWorkout(w)
    expect(saved.createdAt).toBeGreaterThan(0)
    const got = await getWorkout(w.id)
    expect(got?.items).toHaveLength(1)
  })

  it('lists newest first and deletes', async () => {
    const a = await saveWorkout({ ...newWorkout('A', 'core'), createdAt: 1000 })
    const b = await saveWorkout({ ...newWorkout('B', 'legs'), createdAt: 2000 })
    expect((await listWorkouts()).map((w) => w.id)).toEqual([b.id, a.id])
    await deleteWorkout(a.id)
    expect((await listWorkouts()).map((w) => w.id)).toEqual([b.id])
  })
})
