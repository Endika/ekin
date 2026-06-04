import type { Workout } from '../domain/types'

export type Phase = 'work' | 'rest' | 'done'

export interface PlayerState {
  workout: Workout
  itemIndex: number
  setIndex: number
  phase: Phase
  remaining: number
}

export function initSession(workout: Workout): PlayerState {
  return {
    workout,
    itemIndex: 0,
    setIndex: 0,
    phase: workout.items.length ? 'work' : 'done',
    remaining: 0,
  }
}

export function advance(s: PlayerState): PlayerState {
  if (s.phase === 'done') return s
  const item = s.workout.items[s.itemIndex]
  if (s.phase === 'work') {
    const isLastSet = s.setIndex >= item.sets - 1
    if (!isLastSet) return { ...s, phase: 'rest', remaining: item.restSeconds }
    return startNextItem(s)
  }
  return { ...s, phase: 'work', setIndex: s.setIndex + 1, remaining: 0 }
}

function startNextItem(s: PlayerState): PlayerState {
  const nextItem = s.itemIndex + 1
  if (nextItem >= s.workout.items.length)
    return { ...s, phase: 'done', remaining: 0 }
  return { ...s, itemIndex: nextItem, setIndex: 0, phase: 'work', remaining: 0 }
}

export function tick(s: PlayerState): PlayerState {
  if (s.phase !== 'rest') return s
  if (s.remaining <= 1) return advance(s)
  return { ...s, remaining: s.remaining - 1 }
}
