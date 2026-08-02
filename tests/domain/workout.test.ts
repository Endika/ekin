import { describe, it, expect } from 'vitest'
import {
  newWorkout,
  addItem,
  updateItem,
  removeItem,
  moveItem,
  setWorkoutMode,
} from '../../src/domain/workout'
import type { Workout } from '../../src/domain/types'

describe('workout reducers', () => {
  it('creates an empty workout with an id', () => {
    const w = newWorkout('Push day', 'upper')
    expect(w.id).toBeTruthy()
    expect(w.items).toEqual([])
    expect(w.zone).toBe('upper')
  })

  it('adds an item with sane defaults', () => {
    const w = addItem(newWorkout('w', 'core'), 'ex1')
    expect(w.items).toHaveLength(1)
    expect(w.items[0]).toMatchObject({
      exerciseId: 'ex1',
      sets: 3,
      reps: 10,
      restSeconds: 30,
    })
  })

  it('adds a timed item that inherits the circuit interval', () => {
    const base = {
      ...newWorkout('c', 'full'),
      mode: 'timed' as const,
      rounds: 3,
      items: [
        { exerciseId: 'a', sets: 0, reps: 0, workSeconds: 30, restSeconds: 15 },
      ],
    }
    const w = addItem(base, 'b')
    expect(w.items[1]).toMatchObject({
      exerciseId: 'b',
      workSeconds: 30,
      restSeconds: 15,
    })
  })

  it('inherits the interval of the first MAIN item, not of the warm-up', () => {
    const base = {
      ...newWorkout('c', 'full'),
      mode: 'timed' as const,
      rounds: 3,
      items: [
        {
          exerciseId: 'stretch',
          sets: 1,
          reps: 0,
          workSeconds: 30,
          restSeconds: 0,
          block: 'warmup' as const,
        },
        {
          exerciseId: 'a',
          sets: 0,
          reps: 0,
          workSeconds: 40,
          restSeconds: 20,
          block: 'main' as const,
        },
      ],
    }
    const w = addItem(base, 'b')
    expect(w.items[2]).toMatchObject({
      exerciseId: 'b',
      workSeconds: 40,
      restSeconds: 20,
    })
  })

  it('updates an item immutably', () => {
    const base = addItem(newWorkout('w', 'core'), 'ex1')
    const next = updateItem(base, 0, { reps: 15 })
    expect(next.items[0].reps).toBe(15)
    expect(base.items[0].reps).toBe(10)
  })

  it('removes and reorders items', () => {
    let w = addItem(addItem(newWorkout('w', 'legs'), 'a'), 'b')
    w = moveItem(w, 0, 1)
    expect(w.items.map((i) => i.exerciseId)).toEqual(['b', 'a'])
    w = removeItem(w, 0)
    expect(w.items.map((i) => i.exerciseId)).toEqual(['a'])
  })
})

const stretch = (id: string, block: 'warmup' | 'cooldown') => ({
  exerciseId: id,
  sets: 1,
  reps: 0,
  workSeconds: 30,
  restSeconds: 0,
  block,
})
const station = (id: string) => ({
  exerciseId: id,
  sets: 0,
  reps: 0,
  workSeconds: 40,
  restSeconds: 20,
  block: 'main' as const,
})
const idsOf = (w: Workout) => w.items.map((i) => i.exerciseId)
// lib/timer.ts locates the slice the rounds repeat over by counting the leading warm-ups
// and the trailing cool-downs, so every block has to stay one contiguous run.
const blockRuns = (w: Workout) => {
  const blocks = w.items.map((i) => i.block ?? 'main')
  return blocks.filter((b, i) => b !== blocks[i - 1])
}

describe('addItem placement', () => {
  const timed = (items: Workout['items']): Workout => ({
    ...newWorkout('c', 'full'),
    mode: 'timed',
    rounds: 3,
    items,
  })

  it('lands ahead of the cool-down when there is no main block yet', () => {
    const w = addItem(
      timed([stretch('warm', 'warmup'), stretch('cool', 'cooldown')]),
      'b',
    )
    expect(idsOf(w)).toEqual(['warm', 'b', 'cool'])
    expect(blockRuns(w)).toEqual(['warmup', 'main', 'cooldown'])
  })

  it('appends after an all-warm-up workout', () => {
    const w = addItem(timed([stretch('warm', 'warmup')]), 'b')
    expect(idsOf(w)).toEqual(['warm', 'b'])
    expect(w.items[1].block).toBe('main')
  })

  it('adds the first item of an empty workout', () => {
    const w = addItem(newWorkout('e', 'core'), 'b')
    expect(idsOf(w)).toEqual(['b'])
    expect(w.items[0].block).toBeUndefined()
  })

  it('stays contiguous however many exercises are added', () => {
    let w = timed([
      stretch('w1', 'warmup'),
      stretch('w2', 'warmup'),
      station('a'),
      stretch('c1', 'cooldown'),
      stretch('c2', 'cooldown'),
    ])
    for (const id of ['b', 'c', 'd']) w = addItem(w, id)
    expect(idsOf(w)).toEqual(['w1', 'w2', 'a', 'b', 'c', 'd', 'c1', 'c2'])
    expect(blockRuns(w)).toEqual(['warmup', 'main', 'cooldown'])
  })
})

describe('moveItem', () => {
  const circuit: Workout = {
    ...newWorkout('c', 'full'),
    mode: 'timed',
    rounds: 3,
    items: [
      stretch('warm', 'warmup'),
      station('a'),
      station('b'),
      stretch('cool', 'cooldown'),
    ],
  }

  it('keeps every block one contiguous run', () => {
    // One tap of the cool-down's up arrow used to drop it inside the main block, where
    // the rounds would then replay the stretch.
    const w = moveItem(circuit, 3, 1)
    expect(blockRuns(w)).toEqual(['warmup', 'main', 'cooldown'])
    expect(idsOf(w)).toEqual(['warm', 'a', 'b', 'cool'])
  })

  it('reorders freely inside a block', () => {
    expect(idsOf(moveItem(circuit, 2, 1))).toEqual(['warm', 'b', 'a', 'cool'])
  })

  it('treats a workout with no blocks as a single one', () => {
    const legacy: Workout = {
      ...newWorkout('old', 'core'),
      items: ['a', 'b', 'c'].map((exerciseId) => ({
        exerciseId,
        sets: 3,
        reps: 10,
        restSeconds: 30,
      })),
    }
    expect(idsOf(moveItem(legacy, 2, 0))).toEqual(['c', 'a', 'b'])
  })
})

describe('setWorkoutMode', () => {
  it('converts a hand-built rep workout into a timed circuit', () => {
    const reps = addItem(newWorkout('w', 'full'), 'a') // sets 3, reps 10, rest 30
    const timed = setWorkoutMode(reps, 'timed')
    expect(timed.mode).toBe('timed')
    expect(timed.rounds).toBe(3)
    // work gets a default; the existing rest is preserved (round-trip safe)
    expect(timed.items[0]).toMatchObject({ workSeconds: 40, restSeconds: 30 })
  })

  it('uses the circuit rest default when the source had no rest', () => {
    const w = {
      ...newWorkout('w', 'full'),
      items: [{ exerciseId: 'a', sets: 1, reps: 10, restSeconds: 0 }],
    }
    const timed = setWorkoutMode(w, 'timed')
    expect(timed.items[0].restSeconds).toBe(20)
  })

  it('converts a timed circuit back to reps with sane defaults', () => {
    const timed = {
      ...newWorkout('w', 'full'),
      mode: 'timed' as const,
      rounds: 4,
      items: [
        { exerciseId: 'a', sets: 0, reps: 0, workSeconds: 45, restSeconds: 15 },
      ],
    }
    const reps = setWorkoutMode(timed, 'reps')
    expect(reps.mode).toBe('reps')
    expect(reps.items[0]).toMatchObject({ sets: 3, reps: 10 })
  })

  it('leaves a warm-up or cool-down item untouched in both directions', () => {
    const prep = (block: 'warmup' | 'cooldown') => ({
      exerciseId: block,
      sets: 1,
      reps: 0,
      workSeconds: 30,
      restSeconds: 0,
      block,
    })
    const timed = {
      ...newWorkout('w', 'full'),
      mode: 'timed' as const,
      rounds: 3,
      items: [
        prep('warmup'),
        { exerciseId: 'a', sets: 0, reps: 0, workSeconds: 40, restSeconds: 20 },
        prep('cooldown'),
      ],
    }
    const back = setWorkoutMode(setWorkoutMode(timed, 'reps'), 'timed')
    // a stretch rests 0s on purpose — the circuit default must not leak into it
    expect(back.items[0]).toEqual(prep('warmup'))
    expect(back.items[2]).toEqual(prep('cooldown'))
  })

  it('preserves existing valid values instead of overwriting them', () => {
    const w = {
      ...newWorkout('w', 'full'),
      items: [{ exerciseId: 'a', sets: 5, reps: 8, restSeconds: 25 }],
    }
    const timed = setWorkoutMode(w, 'timed')
    const back = setWorkoutMode(timed, 'reps')
    expect(back.items[0]).toMatchObject({ sets: 5, reps: 8, restSeconds: 25 })
  })
})
