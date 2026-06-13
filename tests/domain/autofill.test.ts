import { describe, it, expect } from 'vitest'
import { autofill } from '../../src/domain/autofill'
import type { Exercise, Level, Zone } from '../../src/domain/types'

const ex = (
  id: string,
  zone: Zone,
  level: Level,
  category = 'strength',
): Exercise => ({
  id,
  name: id.toUpperCase(),
  zone,
  level,
  category,
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

  it('fills a full-body workout from every zone (no exercise is tagged "full")', () => {
    const w = autofill(catalog, { zone: 'full', minutes: 60, level: 'expert' })
    expect(w.items.length).toBeGreaterThan(0)
    const zones = new Set(w.items.map((it) => zoneOf(it.exerciseId)))
    expect(zones.size).toBeGreaterThan(1) // draws across multiple zones
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

const circuitCatalog: Exercise[] = [
  ex('s1', 'legs', 'beginner', 'strength'),
  ex('s2', 'core', 'beginner', 'strength'),
  ex('p1', 'legs', 'beginner', 'plyometrics'),
  ex('c1', 'full', 'beginner', 'cardio'),
  ex('st1', 'core', 'beginner', 'stretching'),
]
const catOf = (id: string) => circuitCatalog.find((x) => x.id === id)!.category

describe('autofill — circuit goal', () => {
  it('returns a timed workout with rounds and work/rest per item', () => {
    const w = autofill(circuitCatalog, {
      zone: 'full',
      minutes: 20,
      level: 'beginner',
      goal: 'circuit',
    })
    expect(w.mode).toBe('timed')
    expect(w.rounds).toBeGreaterThanOrEqual(2)
    expect(w.items.length).toBeGreaterThan(0)
    for (const it of w.items) {
      expect(it.workSeconds).toBeGreaterThan(0)
      expect(it.restSeconds).toBeGreaterThan(0)
    }
  })

  it('prefers plyometrics/cardio and drops stretching', () => {
    const w = autofill(circuitCatalog, {
      zone: 'full',
      minutes: 20,
      level: 'beginner',
      goal: 'circuit',
    })
    const cats = w.items.map((it) => catOf(it.exerciseId))
    expect(cats).not.toContain('stretching') // stretching excluded
    // the energetic ones come first
    expect(cats[0]).toMatch(/plyometrics|cardio/)
  })

  it('is deterministic for the same variant', () => {
    const inp = {
      zone: 'full' as const,
      minutes: 20,
      level: 'beginner' as const,
      goal: 'circuit' as const,
      variant: 2,
    }
    expect(autofill(circuitCatalog, inp).items).toEqual(
      autofill(circuitCatalog, inp).items,
    )
  })

  it('different variants surface a different set of exercises', () => {
    // 9 candidates, window of 6 → variant 0 and variant 1 pick different sets.
    const big: Exercise[] = Array.from({ length: 9 }, (_, i) =>
      ex(`p${i}`, 'full', 'beginner', 'plyometrics'),
    )
    const v0 = autofill(big, {
      zone: 'full',
      minutes: 20,
      level: 'beginner',
      goal: 'circuit',
      variant: 0,
    })
    const v1 = autofill(big, {
      zone: 'full',
      minutes: 20,
      level: 'beginner',
      goal: 'circuit',
      variant: 1,
    })
    const ids0 = v0.items.map((i) => i.exerciseId)
    const ids1 = v1.items.map((i) => i.exerciseId)
    expect(ids0).not.toEqual(ids1)
  })

  it("goal 'strength' matches the default rep-based output", () => {
    const base = {
      zone: 'legs' as const,
      minutes: 20,
      level: 'expert' as const,
    }
    const a = autofill(catalog, base)
    const b = autofill(catalog, { ...base, goal: 'strength' })
    expect(b.mode).toBeUndefined()
    expect(b.items).toEqual(a.items)
  })
})
