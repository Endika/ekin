import { describe, it, expect } from 'vitest'
import { requestAssist } from '../../src/ai/assist'
import type { GeminiClient } from '../../src/ai/gemini'
import type { Exercise, Workout, Zone } from '../../src/domain/types'

const ex = (id: string, zone: Zone): Exercise => ({
  id,
  name: id.toUpperCase(),
  zone,
  level: 'beginner',
  category: 'strength',
  primaryMuscles: [],
  instructions: [],
  images: [],
})

const catalog: Exercise[] = [ex('a', 'legs'), ex('b', 'legs'), ex('c', 'core')]

const workout: Workout = {
  id: 'w',
  name: 'W',
  zone: 'legs',
  createdAt: 1,
  items: [{ exerciseId: 'a', sets: 3, reps: 10, restSeconds: 30 }],
}

// in-memory fake — never touches the network
const fake = (reply: string | (() => Promise<string>)): GeminiClient => ({
  generate: typeof reply === 'string' ? () => Promise.resolve(reply) : reply,
})

describe('requestAssist', () => {
  it('applies a valid swap to an editable workout', async () => {
    const client = fake(
      '{"items":[{"exerciseId":"b","sets":3,"reps":10,"restSeconds":30}]}',
    )
    const res = await requestAssist(client, catalog, workout, {
      kind: 'swap',
      itemIndex: 0,
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.workout.items[0].exerciseId).toBe('b')
      expect(res.workout.id).toBe('w') // same workout, new items
    }
  })

  it('applies a valid difficulty adjustment', async () => {
    const client = fake(
      '{"items":[{"exerciseId":"a","sets":2,"reps":6,"restSeconds":45}]}',
    )
    const res = await requestAssist(client, catalog, workout, {
      kind: 'adjust',
      direction: 'easier',
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.workout.items[0].reps).toBe(6)
  })

  it('tolerates markdown-fenced JSON', async () => {
    const client = fake(
      '```json\n{"items":[{"exerciseId":"b","sets":3,"reps":12,"restSeconds":20}]}\n```',
    )
    const res = await requestAssist(client, catalog, workout, {
      kind: 'swap',
      itemIndex: 0,
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.workout.items[0].exerciseId).toBe('b')
  })

  it('rejects malformed JSON without throwing', async () => {
    const res = await requestAssist(
      fake('sorry, here you go!'),
      catalog,
      workout,
      {
        kind: 'adjust',
        direction: 'harder',
      },
    )
    expect(res).toEqual({ ok: false, error: 'bad_json' })
  })

  it('rejects an exerciseId that is not in the catalog', async () => {
    const client = fake(
      '{"items":[{"exerciseId":"ghost","sets":3,"reps":10,"restSeconds":30}]}',
    )
    const res = await requestAssist(client, catalog, workout, {
      kind: 'swap',
      itemIndex: 0,
    })
    expect(res.ok).toBe(false)
  })

  it('rejects out-of-range numbers', async () => {
    const client = fake(
      '{"items":[{"exerciseId":"a","sets":0,"reps":10,"restSeconds":30}]}',
    )
    const res = await requestAssist(client, catalog, workout, {
      kind: 'adjust',
      direction: 'easier',
    })
    expect(res.ok).toBe(false)
  })

  it('returns ok:false when the client throws, never propagating', async () => {
    const client = fake(() => Promise.reject(new Error('network down')))
    const res = await requestAssist(client, catalog, workout, {
      kind: 'swap',
      itemIndex: 0,
    })
    expect(res).toEqual({ ok: false, error: 'request_failed' })
  })
})

const timedWorkout: Workout = {
  id: 't',
  name: 'T',
  zone: 'legs',
  mode: 'timed',
  rounds: 3,
  createdAt: 1,
  items: [
    { exerciseId: 'a', sets: 0, reps: 0, workSeconds: 40, restSeconds: 20 },
  ],
}

describe('requestAssist — timed circuits', () => {
  it('applies a timed swap keeping the seconds format', async () => {
    const client = fake(
      '{"rounds":3,"items":[{"exerciseId":"b","workSeconds":40,"restSeconds":20}]}',
    )
    const res = await requestAssist(client, catalog, timedWorkout, {
      kind: 'swap',
      itemIndex: 0,
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.workout.mode).toBe('timed')
      expect(res.workout.items[0]).toMatchObject({
        exerciseId: 'b',
        workSeconds: 40,
        restSeconds: 20,
      })
    }
  })

  it('applies a timed difficulty adjustment (rounds + intervals)', async () => {
    const client = fake(
      '{"rounds":5,"items":[{"exerciseId":"a","workSeconds":50,"restSeconds":10}]}',
    )
    const res = await requestAssist(client, catalog, timedWorkout, {
      kind: 'adjust',
      direction: 'harder',
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.workout.rounds).toBe(5)
      expect(res.workout.items[0].workSeconds).toBe(50)
    }
  })

  it('rejects a timed reply with a too-short work interval', async () => {
    const client = fake(
      '{"rounds":3,"items":[{"exerciseId":"a","workSeconds":0,"restSeconds":20}]}',
    )
    const res = await requestAssist(client, catalog, timedWorkout, {
      kind: 'adjust',
      direction: 'easier',
    })
    expect(res.ok).toBe(false)
  })
})
