import { describe, it, expect } from 'vitest'
import { initSession, tick, advance } from '../../src/lib/timer'
import type { Workout } from '../../src/domain/types'

const workout: Workout = {
  id: 'w',
  name: 'W',
  zone: 'core',
  createdAt: 1,
  items: [
    { exerciseId: 'a', sets: 2, reps: 10, restSeconds: 5 },
    { exerciseId: 'b', sets: 1, reps: 8, restSeconds: 5 },
  ],
}

describe('session timer', () => {
  it('starts on the first exercise in "work" phase', () => {
    const s = initSession(workout)
    expect(s.phase).toBe('work')
    expect(s.itemIndex).toBe(0)
    expect(s.setIndex).toBe(0)
  })

  it('advance from last set of an item goes to next item', () => {
    let s = initSession(workout)
    s = advance(s) // set 0 done -> rest
    expect(s.phase).toBe('rest')
    s = advance(s) // rest done -> set 1 work
    expect(s).toMatchObject({ phase: 'work', itemIndex: 0, setIndex: 1 })
    s = advance(s) // last set of item 0 -> next item
    expect(s).toMatchObject({ phase: 'work', itemIndex: 1, setIndex: 0 })
  })

  it('finishes after the last set of the last item', () => {
    let s = initSession(workout)
    s = advance(advance(advance(s))) // through item 0
    s = advance(s) // last set of item 1
    expect(s.phase).toBe('done')
  })

  it('tick counts down rest and auto-advances at zero', () => {
    let s = initSession(workout)
    s = advance(s) // -> rest, restSeconds 5
    expect(s.remaining).toBe(5)
    for (let i = 0; i < 5; i++) s = tick(s)
    expect(s.phase).toBe('work')
    expect(s.setIndex).toBe(1)
  })
})
