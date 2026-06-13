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

  it('rep mode tick does nothing during the work phase', () => {
    const s = initSession(workout)
    expect(s.phase).toBe('work')
    expect(tick(s)).toEqual(s) // work is manual in rep mode
  })
})

const timed: Workout = {
  id: 't',
  name: 'T',
  zone: 'full',
  mode: 'timed',
  rounds: 2,
  createdAt: 1,
  items: [
    { exerciseId: 'a', sets: 0, reps: 0, restSeconds: 3, workSeconds: 4 },
    { exerciseId: 'b', sets: 0, reps: 0, restSeconds: 3, workSeconds: 4 },
  ],
}

describe('timed circuit timer', () => {
  it('starts counting the first work interval down', () => {
    const s = initSession(timed)
    expect(s.phase).toBe('work')
    expect(s.remaining).toBe(4)
    expect(s.roundIndex).toBe(0)
  })

  it('work -> rest -> next item work within a round', () => {
    let s = initSession(timed)
    s = advance(s) // work a -> rest
    expect(s).toMatchObject({ phase: 'rest', itemIndex: 0, remaining: 3 })
    s = advance(s) // rest -> work b
    expect(s).toMatchObject({ phase: 'work', itemIndex: 1, remaining: 4 })
  })

  it('loops back to item 0 for the next round after the last item', () => {
    let s = initSession(timed)
    // round 0: work a -> rest -> work b -> rest -> (loops) round 1 work a
    s = advance(advance(advance(advance(s))))
    expect(s).toMatchObject({
      phase: 'work',
      itemIndex: 0,
      roundIndex: 1,
      remaining: 4,
    })
  })

  it('finishes after the last item of the last round', () => {
    let s = initSession(timed)
    // round 0: work a, rest, work b, rest -> round 1 work a
    s = advance(advance(advance(advance(advance(s)))))
    // round 1: work a, rest, work b, rest -> done
    s = advance(advance(advance(advance(s))))
    expect(s.phase).toBe('done')
  })

  it('tick counts both work and rest down and auto-advances', () => {
    let s = initSession(timed)
    for (let i = 0; i < 4; i++) s = tick(s) // work a 4s -> rest
    expect(s).toMatchObject({ phase: 'rest', remaining: 3 })
    for (let i = 0; i < 3; i++) s = tick(s) // rest 3s -> work b
    expect(s).toMatchObject({ phase: 'work', itemIndex: 1, remaining: 4 })
  })

  it('falls back to a real work interval when workSeconds is missing', () => {
    const malformed: Workout = {
      ...timed,
      rounds: 1,
      items: [{ exerciseId: 'a', sets: 0, reps: 0, restSeconds: 0 }],
    }
    const s = initSession(malformed)
    expect(s.remaining).toBeGreaterThan(1) // not an instant 0-second skip
  })

  it('skips the rest phase for an item with zero rest', () => {
    const noRest: Workout = {
      ...timed,
      rounds: 1,
      items: [
        { exerciseId: 'a', sets: 0, reps: 0, restSeconds: 0, workSeconds: 4 },
        { exerciseId: 'b', sets: 0, reps: 0, restSeconds: 0, workSeconds: 4 },
      ],
    }
    let s = initSession(noRest)
    s = advance(s) // work a -> straight to work b (no rest)
    expect(s).toMatchObject({ phase: 'work', itemIndex: 1, remaining: 4 })
    s = advance(s) // work b -> done (last item, last round)
    expect(s.phase).toBe('done')
  })
})
