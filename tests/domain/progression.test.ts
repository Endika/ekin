import { describe, it, expect } from 'vitest'
import { exerciseSeries, exercisedIds } from '../../src/domain/progression'
import type { Session, SessionItemLog } from '../../src/domain/types'

const log = (exerciseId: string, reps: number[]): SessionItemLog => ({
  exerciseId,
  sets: reps.map((r, setIndex) => ({ setIndex, reps: r })),
})

const session = (startedAt: number, logs: SessionItemLog[]): Session => ({
  id: `s-${startedAt}`,
  workoutId: 'w',
  workoutName: 'W',
  startedAt,
  endedAt: startedAt + 600_000,
  durationSeconds: 600,
  logs,
})

describe('exerciseSeries', () => {
  it('returns summed reps per session, oldest to newest', () => {
    const sessions = [
      session(3000, [log('push', [10, 10])]),
      session(1000, [log('push', [8, 7])]),
      session(2000, [log('push', [9, 9, 9])]),
    ]
    expect(exerciseSeries(sessions, 'push')).toEqual([
      { dateMs: 1000, value: 15 },
      { dateMs: 2000, value: 27 },
      { dateMs: 3000, value: 20 },
    ])
  })

  it('returns empty for an exercise never performed', () => {
    const sessions = [session(1000, [log('push', [10])])]
    expect(exerciseSeries(sessions, 'squat')).toEqual([])
  })

  it('ignores timed-circuit logs (no logged reps)', () => {
    // A timed session records the exercise with no sets.
    const timedLog: SessionItemLog = { exerciseId: 'burpee', sets: [] }
    const sessions = [session(1000, [timedLog])]
    expect(exerciseSeries(sessions, 'burpee')).toEqual([])
    expect(exercisedIds(sessions)).toEqual([])
  })
})

describe('exercisedIds', () => {
  it('returns the distinct ids most-recently-used first', () => {
    const sessions = [
      session(1000, [log('push', [10]), log('squat', [12])]),
      session(2000, [log('squat', [12])]),
    ]
    expect(exercisedIds(sessions)).toEqual(['squat', 'push'])
  })
})
