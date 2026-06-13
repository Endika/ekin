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

// A log carries a rep series only when it has logged sets. Timed circuits log
// no reps, so they are excluded from the rep-evolution views (they still count
// toward history, streak and stats, which key off the session itself).
const hasReps = (l: { sets: unknown[] }) => l.sets.length > 0

/** Rep totals for one exercise across sessions, oldest → newest. */
export function exerciseSeries(
  sessions: Session[],
  exerciseId: string,
): SeriesPoint[] {
  return sessions
    .filter((s) =>
      s.logs.some((l) => l.exerciseId === exerciseId && hasReps(l)),
    )
    .slice()
    .sort((a, b) => a.startedAt - b.startedAt)
    .map((s) => ({
      dateMs: s.startedAt,
      value: repsForExercise(s, exerciseId),
    }))
}

/** Distinct exercise ids with logged reps, newest-first by last use. */
export function exercisedIds(sessions: Session[]): string[] {
  const lastUse = new Map<string, number>()
  for (const s of sessions) {
    for (const l of s.logs) {
      if (!hasReps(l)) continue
      const prev = lastUse.get(l.exerciseId) ?? 0
      if (s.startedAt > prev) lastUse.set(l.exerciseId, s.startedAt)
    }
  }
  return [...lastUse.keys()].sort(
    (a, b) => (lastUse.get(b) ?? 0) - (lastUse.get(a) ?? 0),
  )
}
