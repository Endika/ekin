export type Zone = 'upper' | 'core' | 'legs' | 'full'
export type Level = 'beginner' | 'intermediate' | 'expert'

export interface Exercise {
  id: string
  name: string
  zone: Zone
  level: Level
  primaryMuscles: string[]
  instructions: string[]
  images: string[]
}

export interface WorkoutItem {
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
}

export interface Workout {
  id: string
  name: string
  zone: Zone
  items: WorkoutItem[]
  createdAt: number
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
