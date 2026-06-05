import { describe, it, expect } from 'vitest'
import { computeStats } from '../../src/domain/stats'
import type { Session } from '../../src/domain/types'

// Build timestamps with local Date so the test is TZ-independent
// (matches the implementation, which also uses local calendar days).
const at = (y: number, m: number, d: number, h = 10) =>
  new Date(y, m - 1, d, h).getTime()

const session = (startedAt: number, durationSeconds = 600): Session => ({
  id: `s-${startedAt}`,
  workoutId: 'w',
  workoutName: 'W',
  startedAt,
  endedAt: startedAt + durationSeconds * 1000,
  durationSeconds,
  logs: [],
})

const TODAY = at(2026, 6, 5)

describe('computeStats', () => {
  it('returns zeros for no sessions', () => {
    expect(computeStats([], TODAY)).toEqual({
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
    })
  })

  it('counts streak across today and yesterday, breaking at a gap', () => {
    const sessions = [
      session(at(2026, 6, 5)), // today
      session(at(2026, 6, 4)), // yesterday
      session(at(2026, 6, 2)), // gap on the 3rd
    ]
    expect(computeStats(sessions, TODAY).currentStreak).toBe(2)
  })

  it('keeps the streak current when the last session was yesterday', () => {
    expect(computeStats([session(at(2026, 6, 4))], TODAY).currentStreak).toBe(1)
  })

  it('drops the streak to 0 when the last session is older than yesterday', () => {
    expect(computeStats([session(at(2026, 6, 2))], TODAY).currentStreak).toBe(0)
  })

  it('counts multiple sessions on the same day as one streak day', () => {
    const sessions = [
      session(at(2026, 6, 5, 8)),
      session(at(2026, 6, 5, 19)),
      session(at(2026, 6, 4, 9)),
    ]
    const stats = computeStats(sessions, TODAY)
    expect(stats.currentStreak).toBe(2)
    expect(stats.totalSessions).toBe(3)
  })

  it('sums totals in minutes', () => {
    const stats = computeStats(
      [session(at(2026, 6, 5), 600), session(at(2026, 6, 4), 900)],
      TODAY,
    )
    expect(stats.totalSessions).toBe(2)
    expect(stats.totalMinutes).toBe(25) // (600+900)/60
  })
})
