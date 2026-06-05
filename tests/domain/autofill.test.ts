import { describe, it, expect } from 'vitest'
import { autofill } from '../../src/domain/autofill'
import type { Exercise, Level, Zone } from '../../src/domain/types'

const ex = (id: string, zone: Zone, level: Level): Exercise => ({
  id,
  name: id.toUpperCase(),
  zone,
  level,
  primaryMuscles: [],
  instructions: [],
  images: [],
})

const catalog: Exercise[] = [
  ex('a', 'legs', 'beginner'),
  ex('b', 'legs', 'expert'),
  ex('c', 'core', 'beginner'),
  ex('d', 'full', 'beginner'),
  ex('e', 'legs', 'intermediate'),
]

const zoneOf = (id: string) => catalog.find((x) => x.id === id)!.zone
const levelOf = (id: string) => catalog.find((x) => x.id === id)!.level

// each item costs 3 * (10*3 + 30) = 180s with the defaults
const ITEM_SECONDS = 180

describe('autofill', () => {
  it('only picks exercises of the requested zone or full body', () => {
    const w = autofill(catalog, { zone: 'legs', minutes: 60, level: 'expert' })
    expect(w.items.length).toBeGreaterThan(0)
    for (const it of w.items) {
      expect(['legs', 'full']).toContain(zoneOf(it.exerciseId))
    }
  })

  it('never exceeds the requested level', () => {
    const w = autofill(catalog, {
      zone: 'legs',
      minutes: 60,
      level: 'beginner',
    })
    for (const it of w.items) {
      expect(levelOf(it.exerciseId)).toBe('beginner')
    }
  })

  it('is deterministic in its selection for the same input', () => {
    const a = autofill(catalog, { zone: 'legs', minutes: 30, level: 'expert' })
    const b = autofill(catalog, { zone: 'legs', minutes: 30, level: 'expert' })
    expect(a.items).toEqual(b.items)
  })

  it('roughly fits the time budget (≤ budget + one item slack)', () => {
    const w = autofill(catalog, { zone: 'legs', minutes: 10, level: 'expert' })
    const total = w.items.length * ITEM_SECONDS
    expect(total).toBeLessThanOrEqual(10 * 60 + ITEM_SECONDS)
  })

  it('gives at least as many items for a larger budget', () => {
    const small = autofill(catalog, {
      zone: 'legs',
      minutes: 5,
      level: 'expert',
    })
    const large = autofill(catalog, {
      zone: 'legs',
      minutes: 30,
      level: 'expert',
    })
    expect(large.items.length).toBeGreaterThanOrEqual(small.items.length)
  })

  it('returns an empty workout when no zone nor full-body exercise matches', () => {
    // full-body exercises apply to every zone by design, so exclude them here
    const noFull = catalog.filter((e) => e.zone !== 'full')
    const w = autofill(noFull, { zone: 'upper', minutes: 30, level: 'expert' })
    expect(w.items).toEqual([])
  })

  it('returns a valid editable workout', () => {
    const w = autofill(catalog, { zone: 'legs', minutes: 20, level: 'expert' })
    expect(w.id).toBeTruthy()
    expect(w.zone).toBe('legs')
    for (const it of w.items) {
      expect(it.sets).toBeGreaterThan(0)
      expect(it.reps).toBeGreaterThan(0)
      expect(it.restSeconds).toBeGreaterThanOrEqual(0)
    }
  })
})
