import type { Session } from './types'

export interface SeriesPoint {
  dateMs: number
  /** total reps done for the exercise in that session */
  value: number
}

function repsForExercise(session: Session, exerciseId: string): number {
  const log = session.logs.find((l) => l.exerciseId === exerciseId)
  return log ? log.sets.reduce((sum, s) => sum + s.reps, 0) : 0
}

/** Rep totals for one exercise across sessions, oldest → newest. */
export function exerciseSeries(
  sessions: Session[],
  exerciseId: string,
): SeriesPoint[] {
  return sessions
    .filter((s) => s.logs.some((l) => l.exerciseId === exerciseId))
    .slice()
    .sort((a, b) => a.startedAt - b.startedAt)
    .map((s) => ({
      dateMs: s.startedAt,
      value: repsForExercise(s, exerciseId),
    }))
}

/** Distinct exercise ids that appear in any session log, newest-first by last use. */
export function exercisedIds(sessions: Session[]): string[] {
  const lastUse = new Map<string, number>()
  for (const s of sessions) {
    for (const l of s.logs) {
      const prev = lastUse.get(l.exerciseId) ?? 0
      if (s.startedAt > prev) lastUse.set(l.exerciseId, s.startedAt)
    }
  }
  return [...lastUse.keys()].sort(
    (a, b) => (lastUse.get(b) ?? 0) - (lastUse.get(a) ?? 0),
  )
}
