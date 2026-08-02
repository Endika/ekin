import { uuidv7 } from 'uuidv7'
import type {
  Workout,
  WorkoutBlock,
  WorkoutItem,
  WorkoutMode,
  Zone,
} from './types'

export function newWorkout(name: string, zone: Zone): Workout {
  return { id: uuidv7(), name, zone, items: [], createdAt: 0 }
}

const CIRCUIT_DEFAULTS = { workSeconds: 40, restSeconds: 20, rounds: 3 }
const REP_DEFAULTS = { sets: 3, reps: 10, restSeconds: 30 }

/**
 * A warm-up or cool-down item is a stretch held for a duration with no rest after it: its
 * `restSeconds: 0` is the prescription, not a missing value. Both conversions below leave
 * those items alone, or switching modes would hand every stretch 20s of rest (timed) or
 * 30s (reps) and never give it back on the way home.
 */
const isPrep = (it: WorkoutItem) =>
  it.block === 'warmup' || it.block === 'cooldown'

/**
 * Convert a workout between rep-based and timed-circuit form, filling the target
 * format's missing fields with sane defaults so a hand-built rep workout can
 * become a HIIT (and back) without losing exercises.
 */
export function setWorkoutMode(w: Workout, mode: WorkoutMode): Workout {
  if (mode === 'timed') {
    return {
      ...w,
      mode: 'timed',
      rounds: w.rounds ?? CIRCUIT_DEFAULTS.rounds,
      items: w.items.map((it) =>
        isPrep(it)
          ? {
              ...it,
              workSeconds: it.workSeconds ?? CIRCUIT_DEFAULTS.workSeconds,
            }
          : {
              ...it,
              workSeconds: it.workSeconds ?? CIRCUIT_DEFAULTS.workSeconds,
              restSeconds: it.restSeconds || CIRCUIT_DEFAULTS.restSeconds,
            },
      ),
    }
  }
  return {
    ...w,
    mode: 'reps',
    items: w.items.map((it) =>
      isPrep(it)
        ? it
        : {
            ...it,
            sets: it.sets >= 1 ? it.sets : REP_DEFAULTS.sets,
            reps: it.reps >= 1 ? it.reps : REP_DEFAULTS.reps,
            restSeconds:
              it.restSeconds >= 1 ? it.restSeconds : REP_DEFAULTS.restSeconds,
          },
    ),
  }
}

/**
 * Where a newly added exercise belongs: just after the last main item, or — when the
 * workout is nothing but prep — just after the last warm-up, so it still lands ahead of
 * any cool-down.
 *
 * Appending at the very end instead would leave `warmup… main… cooldown… main`: the new
 * exercise would be played after the stretches, which is not what "add an exercise" means,
 * and the list would no longer hold the one-contiguous-main-run invariant the player reads
 * (`mainRange` in lib/timer.ts locates the main block by counting the LEADING warm-ups and
 * the TRAILING cool-downs, so a main item behind the cool-down swallows it into the part
 * that repeats every round).
 *
 * Both modes, not just timed: the rep-based auto-fill emits prep blocks too, so a rep
 * workout can equally end in a cool-down, and playing a new exercise after the stretches is
 * just as wrong there — only the round-looping consequence is timed-specific.
 */
function mainEnd(items: WorkoutItem[]): number {
  const lastOf = (block: WorkoutBlock) =>
    items.findLastIndex((it) => (it.block ?? 'main') === block)
  const lastMain = lastOf('main')
  // No main item at all: after the warm-up, i.e. index 0 when there is not even one.
  return lastMain >= 0 ? lastMain + 1 : lastOf('warmup') + 1
}

export function addItem(w: Workout, exerciseId: string): Workout {
  // In a timed circuit a new exercise inherits the circuit's work/rest interval
  // (from the existing items, or a sensible default) instead of sets/reps. The reference
  // is the first MAIN item: with a warm-up in front, items[0] is a stretch and would lend
  // its 30s hold and 0s rest to what is meant to be a circuit station.
  const build = (): WorkoutItem => {
    if (w.mode !== 'timed') return { exerciseId, ...REP_DEFAULTS }
    const ref = w.items.find((it) => (it.block ?? 'main') === 'main')
    return {
      exerciseId,
      sets: 0,
      reps: 0,
      workSeconds: ref?.workSeconds ?? CIRCUIT_DEFAULTS.workSeconds,
      restSeconds: ref?.restSeconds ?? CIRCUIT_DEFAULTS.restSeconds,
    }
  }

  // A workout whose items declare no block at all predates them; leave the newcomer
  // unstamped so the list stays uniform. `block` absent already reads as 'main'
  // everywhere, so stamping would buy no behaviour and would only make the workout claim
  // to know about blocks on the strength of its most recent item.
  const declaresBlocks = w.items.some((it) => it.block !== undefined)
  const item = declaresBlocks ? { ...build(), block: 'main' as const } : build()

  const at = mainEnd(w.items)
  return { ...w, items: [...w.items.slice(0, at), item, ...w.items.slice(at)] }
}

export function updateItem(
  w: Workout,
  index: number,
  patch: Partial<WorkoutItem>,
): Workout {
  return {
    ...w,
    items: w.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
  }
}

export function removeItem(w: Workout, index: number): Workout {
  return { ...w, items: w.items.filter((_, i) => i !== index) }
}

/**
 * Reorder an item, but never out of its own block: the destination is clamped to the run
 * of items sharing its block. `mainRange` in lib/timer.ts reads the blocks off the item
 * order alone, so a cool-down dragged one place up would land inside the main run and be
 * played again on every round.
 *
 * Clamping rather than refusing: the arrow at a boundary is disabled in the UI, so a move
 * that reaches here past the edge is a caller that did not know better, and parking the
 * item at the edge of its block is the closest thing to what was asked.
 *
 * A workout that declares no block at all is one single 'main' run, so the whole list is
 * one block and nothing is clamped — legacy workouts reorder exactly as before.
 */
export function moveItem(w: Workout, from: number, to: number): Workout {
  const blockOf = (i: number) => w.items[i].block ?? 'main'
  const block = blockOf(from)
  let start = from
  while (start > 0 && blockOf(start - 1) === block) start--
  let end = from + 1
  while (end < w.items.length && blockOf(end) === block) end++

  const items = [...w.items]
  const [it] = items.splice(from, 1)
  items.splice(Math.min(Math.max(to, start), end - 1), 0, it)
  return { ...w, items }
}
