export type Zone = 'upper' | 'core' | 'legs' | 'full'
export type Level = 'beginner' | 'intermediate' | 'expert'

/**
 * Source category from free-exercise-db (e.g. 'strength', 'cardio',
 * 'plyometrics', 'stretching'). Kept as a free string — we tolerate any value
 * the dataset emits rather than failing the build on an unknown one. Used to
 * bias circuit auto-fill toward higher-energy movements.
 */
export type Category = string

export interface Exercise {
  id: string
  name: string
  zone: Zone
  level: Level
  category: Category
  primaryMuscles: string[]
  /** English step-by-step instructions (the dataset's source language). */
  instructions: string[]
  /**
   * Translated instructions keyed by locale (es/eu/gl/ca/va). English uses
   * `instructions` directly. Absent until the build-time translation script
   * (`npm run translate-instructions`) populates it; the UI falls back to
   * English per locale when missing.
   */
  instructionsI18n?: Record<string, string[]>
  images: string[]
}

/** A workout is either rep-based (sets×reps×rest) or a timed circuit. */
export type WorkoutMode = 'reps' | 'timed'

export interface WorkoutItem {
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  /** Timed mode only: seconds of work per round. Ignored in rep mode. */
  workSeconds?: number
}

export interface Workout {
  id: string
  name: string
  zone: Zone
  items: WorkoutItem[]
  createdAt: number
  /** Absent ⇒ 'reps' (back-compat with workouts saved before M4). */
  mode?: WorkoutMode
  /** Timed mode only: how many times the whole item list repeats. */
  rounds?: number
}

export interface SetLog {
  setIndex: number
  reps: number
}

export interface SessionItemLog {
  exerciseId: string
  sets: SetLog[]
}

export interface Session {
  id: string
  workoutId: string
  workoutName: string
  startedAt: number
  endedAt: number
  durationSeconds: number
  logs: SessionItemLog[]
}
