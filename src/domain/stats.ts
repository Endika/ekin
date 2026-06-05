import type { Session } from './types'

export interface Stats {
  totalSessions: number
  totalMinutes: number
  /** consecutive calendar days with a session, ending today or yesterday */
  currentStreak: number
}

/** Local midnight timestamp for the calendar day containing `ms`. */
function dayKey(ms: number): number {
  const d = new Date(ms)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Calendar day before `dayMs` (DST/month-boundary safe). */
function prevDay(dayMs: number): number {
  const d = new Date(dayMs)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1).getTime()
}

export function computeStats(sessions: Session[], todayMs: number): Stats {
  const totalSessions = sessions.length
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
  const totalMinutes = Math.round(totalSeconds / 60)

  const days = new Set(sessions.map((s) => dayKey(s.startedAt)))
  const today = dayKey(todayMs)
  const yesterday = prevDay(today)

  let cursor: number
  if (days.has(today)) cursor = today
  else if (days.has(yesterday)) cursor = yesterday
  else return { totalSessions, totalMinutes, currentStreak: 0 }

  let currentStreak = 0
  while (days.has(cursor)) {
    currentStreak++
    cursor = prevDay(cursor)
  }
  return { totalSessions, totalMinutes, currentStreak }
}
