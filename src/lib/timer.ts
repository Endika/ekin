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

// Fallback so a malformed timed item (mode 'timed' but no workSeconds) still
// gets a real work interval instead of silently flashing past at 0 seconds.
const DEFAULT_WORK_SECONDS = 30
const workSecondsOf = (w: Workout, i: number) =>
  w.items[i].workSeconds ?? DEFAULT_WORK_SECONDS

/**
 * Whether this item's work phase counts itself down. True for every item of a timed
 * circuit, and for warm-up / cool-down items in any mode: a stretch is held for a
 * duration, so counting reps for it would make no sense.
 */
export const isTimedItem = (w: Workout, i: number): boolean => {
  const block = w.items[i]?.block
  return isTimed(w) || block === 'warmup' || block === 'cooldown'
}

export function initSession(workout: Workout): PlayerState {
  const base = {
    workout,
    itemIndex: 0,
    setIndex: 0,
    roundIndex: 0,
    phase: (workout.items.length ? 'work' : 'done') as Phase,
  }
  // Timed intervals count themselves down; rep-mode work is manual.
  if (workout.items.length && isTimedItem(workout, 0))
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
  return {
    ...s,
    itemIndex: nextItem,
    setIndex: 0,
    phase: 'work',
    remaining: isTimedItem(s.workout, nextItem)
      ? workSecondsOf(s.workout, nextItem)
      : 0,
  }
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

/**
 * The slice of items the rounds repeat over, `end` exclusive: everything after the
 * leading warm-up and before the trailing cool-down, which play once each. A list with
 * no prep items yields the whole list, so a plain circuit loops exactly as before.
 * `start === end` (e.g. an all-warm-up list) means nothing repeats — better to play the
 * items once than to loop forever over an empty range.
 */
function mainRange(w: Workout): { start: number; end: number } {
  const blockOf = (i: number) => w.items[i].block ?? 'main'
  let start = 0
  while (start < w.items.length && blockOf(start) === 'warmup') start++
  let end = w.items.length
  while (end > start && blockOf(end - 1) === 'cooldown') end--
  return { start, end }
}

function startNextItemTimed(s: PlayerState): PlayerState {
  const nextItem = s.itemIndex + 1
  const { start, end } = mainRange(s.workout)
  const nextRound = s.roundIndex + 1
  // end of the main block: loop back for the next round, else fall through to the cool-down
  if (nextItem === end && end > start && nextRound < (s.workout.rounds ?? 1))
    return {
      ...s,
      roundIndex: nextRound,
      itemIndex: start,
      phase: 'work',
      remaining: workSecondsOf(s.workout, start),
    }
  if (nextItem >= s.workout.items.length)
    return { ...s, phase: 'done', remaining: 0 }
  return {
    ...s,
    itemIndex: nextItem,
    phase: 'work',
    remaining: workSecondsOf(s.workout, nextItem),
  }
}

export function tick(s: PlayerState): PlayerState {
  // Rest always counts down; work only when the item is a timed one (a circuit
  // interval, or a warm-up / cool-down stretch held for a duration).
  const counting =
    s.phase === 'rest' ||
    (s.phase === 'work' && isTimedItem(s.workout, s.itemIndex))
  if (!counting) return s
  if (s.remaining <= 1) return advance(s)
  return { ...s, remaining: s.remaining - 1 }
}
