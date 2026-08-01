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
  /**
   * Position in a progression chain — the same movement at different difficulties, e.g.
   * incline push-up → push-up → diamond → one-arm. Exercises sharing a `step` are equally
   * hard alternatives, not a progression. A routine takes at most one exercise per chain.
   * Absent ⇒ the exercise stands alone.
   */
  chain?: { id: string; step: number }
  /**
   * For a stretching exercise, whether it is active movement (warm-up) or a held position
   * (cool-down). Set by the wger importer; free-exercise-db entries are classified by the
   * curated list in `domain/stretches.ts` instead.
   */
  stretchKind?: 'dynamic' | 'static'
  /**
   * Where the exercise came from, when it is not public-domain free-exercise-db. Present
   * on wger imports, whose CC-BY-SA licence requires the author and licence to travel
   * with the content and be shown to the user. See NOTICE.md.
   */
  source?: {
    name: string
    url: string
    license: string
    licenseUrl: string
    author: string
    authorUrl?: string
  }
}

/** A workout is either rep-based (sets×reps×rest) or a timed circuit. */
export type WorkoutMode = 'reps' | 'timed'

/**
 * Which part of the session an item belongs to. Absent ⇒ 'main', so workouts saved before
 * warm-ups existed still play as a single main block.
 */
export type WorkoutBlock = 'warmup' | 'main' | 'cooldown'

export interface WorkoutItem {
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
  /**
   * Seconds of work. Used by timed circuits, and by warm-up / cool-down items, which are
   * held for a duration rather than counted in reps.
   */
  workSeconds?: number
  /** Absent ⇒ 'main' (back-compat with workouts saved before M5). */
  block?: WorkoutBlock
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
