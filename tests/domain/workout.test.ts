import { describe, it, expect } from 'vitest'
import {
  newWorkout,
  addItem,
  updateItem,
  removeItem,
  moveItem,
} from '../../src/domain/workout'

describe('workout reducers', () => {
  it('creates an empty workout with an id', () => {
    const w = newWorkout('Push day', 'upper')
    expect(w.id).toBeTruthy()
    expect(w.items).toEqual([])
    expect(w.zone).toBe('upper')
  })

  it('adds an item with sane defaults', () => {
    const w = addItem(newWorkout('w', 'core'), 'ex1')
    expect(w.items).toHaveLength(1)
    expect(w.items[0]).toMatchObject({
      exerciseId: 'ex1',
      sets: 3,
      reps: 10,
      restSeconds: 30,
    })
  })

  it('adds a timed item that inherits the circuit interval', () => {
    const base = {
      ...newWorkout('c', 'full'),
      mode: 'timed' as const,
      rounds: 3,
      items: [
        { exerciseId: 'a', sets: 0, reps: 0, workSeconds: 30, restSeconds: 15 },
      ],
    }
    const w = addItem(base, 'b')
    expect(w.items[1]).toMatchObject({
      exerciseId: 'b',
      workSeconds: 30,
      restSeconds: 15,
    })
  })

  it('updates an item immutably', () => {
    const base = addItem(newWorkout('w', 'core'), 'ex1')
    const next = updateItem(base, 0, { reps: 15 })
    expect(next.items[0].reps).toBe(15)
    expect(base.items[0].reps).toBe(10)
  })

  it('removes and reorders items', () => {
    let w = addItem(addItem(newWorkout('w', 'legs'), 'a'), 'b')
    w = moveItem(w, 0, 1)
    expect(w.items.map((i) => i.exerciseId)).toEqual(['b', 'a'])
    w = removeItem(w, 0)
    expect(w.items.map((i) => i.exerciseId)).toEqual(['a'])
  })
})
