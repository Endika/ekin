import type { Workout } from '../domain/types'

export type Phase = 'work' | 'rest' | 'done'

export interface PlayerState {
  workout: Workout
  itemIndex: number
  setIndex: number
  /** Timed mode only: which round of the circuit we are on (0-based). */
  roundIndex: number
  phase: Phase
  remaining: number
}

const isTimed = (w: Workout) => w.mode === 'timed'
const workSecondsOf = (w: Workout, i: number) => w.items[i].workSeconds ?? 0

export function initSession(workout: Workout): PlayerState {
  const base = {
    workout,
    itemIndex: 0,
    setIndex: 0,
    roundIndex: 0,
    phase: (workout.items.length ? 'work' : 'done') as Phase,
  }
  // Timed circuits count the first work interval down; rep mode works manually.
  if (isTimed(workout) && workout.items.length)
    return { ...base, remaining: workSecondsOf(workout, 0) }
  return { ...base, remaining: 0 }
}

export function advance(s: PlayerState): PlayerState {
  if (s.phase === 'done') return s
  return isTimed(s.workout) ? advanceTimed(s) : advanceReps(s)
}

function advanceReps(s: PlayerState): PlayerState {
  const item = s.workout.items[s.itemIndex]
  if (s.phase === 'work') {
    const isLastSet = s.setIndex >= item.sets - 1
    if (!isLastSet) return { ...s, phase: 'rest', remaining: item.restSeconds }
    return startNextItemReps(s)
  }
  return { ...s, phase: 'work', setIndex: s.setIndex + 1, remaining: 0 }
}

function startNextItemReps(s: PlayerState): PlayerState {
  const nextItem = s.itemIndex + 1
  if (nextItem >= s.workout.items.length)
    return { ...s, phase: 'done', remaining: 0 }
  return { ...s, itemIndex: nextItem, setIndex: 0, phase: 'work', remaining: 0 }
}

function advanceTimed(s: PlayerState): PlayerState {
  const item = s.workout.items[s.itemIndex]
  // work -> rest (skip the rest phase entirely if this item has no rest)
  if (s.phase === 'work') {
    if (item.restSeconds > 0)
      return { ...s, phase: 'rest', remaining: item.restSeconds }
    return startNextItemTimed(s)
  }
  // rest -> next item's work
  return startNextItemTimed(s)
}

function startNextItemTimed(s: PlayerState): PlayerState {
  const nextItem = s.itemIndex + 1
  if (nextItem < s.workout.items.length)
    return {
      ...s,
      itemIndex: nextItem,
      phase: 'work',
      remaining: workSecondsOf(s.workout, nextItem),
    }
  // end of the circuit: loop to the next round, or finish
  const nextRound = s.roundIndex + 1
  const rounds = s.workout.rounds ?? 1
  if (nextRound >= rounds) return { ...s, phase: 'done', remaining: 0 }
  return {
    ...s,
    roundIndex: nextRound,
    itemIndex: 0,
    phase: 'work',
    remaining: workSecondsOf(s.workout, 0),
  }
}

export function tick(s: PlayerState): PlayerState {
  // Rep mode only ticks the rest countdown; timed mode ticks work and rest.
  const counting = isTimed(s.workout)
    ? s.phase === 'work' || s.phase === 'rest'
    : s.phase === 'rest'
  if (!counting) return s
  if (s.remaining <= 1) return advance(s)
  return { ...s, remaining: s.remaining - 1 }
}
