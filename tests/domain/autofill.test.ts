import { describe, it, expect } from 'vitest'
import { autofill } from '../../src/domain/autofill'
import { loadCatalog } from '../../src/domain/catalog'
import { isDynamicStretch, isStaticStretch } from '../../src/domain/stretches'
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

  it('different variants surface a different set of exercises', () => {
    const wide = [
      ex('a1', 'legs', 'beginner'),
      ex('a2', 'legs', 'beginner'),
      ex('a3', 'legs', 'beginner'),
      ex('a4', 'legs', 'beginner'),
      ex('a5', 'legs', 'beginner'),
      ex('a6', 'legs', 'beginner'),
    ]
    const first = autofill(wide, { zone: 'legs', minutes: 6, level: 'expert' })
    const second = autofill(wide, {
      zone: 'legs',
      minutes: 6,
      level: 'expert',
      variant: 1,
    })
    const ids = (w: { items: { exerciseId: string }[] }) =>
      w.items.map((i) => i.exerciseId)
    expect(ids(first)).not.toEqual(ids(second))
  })

  it('is deterministic for the same variant', () => {
    const input = {
      zone: 'legs' as Zone,
      minutes: 30,
      level: 'expert' as Level,
      variant: 2,
    }
    expect(autofill(catalog, input).items).toEqual(
      autofill(catalog, input).items,
    )
  })

  it('keeps stretching out of the main block', () => {
    const withStretch = [
      ex('s', 'legs', 'beginner', 'strength'),
      ex('st', 'legs', 'beginner', 'stretching'),
    ]
    const w = autofill(withStretch, {
      zone: 'legs',
      minutes: 60,
      level: 'expert',
    })
    const mainIds = w.items
      .filter((i) => (i.block ?? 'main') === 'main')
      .map((i) => i.exerciseId)
    expect(mainIds).toEqual(['s'])
    // …but it is still used, as a cool-down
    expect(w.items.some((i) => i.block === 'cooldown')).toBe(true)
  })

  it('alternates muscles instead of stacking variations of one move', () => {
    // Four chest variations that sort together by id, plus two other muscles.
    const m = (id: string, muscle: string): Exercise => ({
      ...ex(id, 'upper', 'beginner'),
      primaryMuscles: [muscle],
    })
    const wide = [
      m('push-a', 'chest'),
      m('push-b', 'chest'),
      m('push-c', 'chest'),
      m('push-d', 'chest'),
      m('tri-a', 'triceps'),
      m('sho-a', 'shoulders'),
    ]
    const w = autofill(wide, { zone: 'upper', minutes: 9, level: 'expert' })
    const muscles = w.items.map(
      (i) => wide.find((e) => e.id === i.exerciseId)!.primaryMuscles[0],
    )
    // The first three picks must not all be chest.
    expect(new Set(muscles.slice(0, 3)).size).toBeGreaterThan(1)
  })

  it('never puts two rungs of the same chain in one routine', () => {
    const cat = loadCatalog()
    const byId = new Map(cat.map((e) => [e.id, e]))
    for (const zone of ['upper', 'core', 'legs'] as const) {
      for (let variant = 0; variant < 6; variant++) {
        const w = autofill(cat, {
          zone,
          minutes: 60,
          level: 'expert',
          variant,
        })
        const chains = w.items
          .filter((i) => (i.block ?? 'main') === 'main')
          .map((i) => byId.get(i.exerciseId)!.chain?.id)
          .filter(Boolean)
        expect(new Set(chains).size).toBe(chains.length)
      }
    }
  })

  it('walks the chain across variants instead of always offering the easiest rung', () => {
    // A chain whose first step holds several equally hard alternatives: rotating by
    // position would walk sideways through those three and never climb.
    const rung = (id: string, step: number): Exercise => ({
      ...ex(id, 'upper', 'beginner'),
      primaryMuscles: ['chest'],
      chain: { id: 'push', step },
    })
    const cat = [
      rung('easy-a', 0),
      rung('easy-b', 0),
      rung('easy-c', 0),
      rung('mid', 1),
      rung('hard', 2),
    ]
    const stepOf = (id: string) => cat.find((e) => e.id === id)!.chain!.step
    const seen = new Set<number>()
    for (let variant = 0; variant < 3; variant++) {
      const w = autofill(cat, {
        zone: 'upper',
        minutes: 60,
        level: 'expert',
        variant,
      })
      const main = w.items.filter((i) => (i.block ?? 'main') === 'main')
      expect(main).toHaveLength(1) // one rung per chain, always
      seen.add(stepOf(main[0].exerciseId))
    }
    expect([...seen].sort()).toEqual([0, 1, 2])
  })

  it('builds the session as warm-up, main, cool-down in that order', () => {
    const w = autofill(loadCatalog(), {
      zone: 'legs',
      minutes: 45,
      level: 'intermediate',
    })
    const blocks = w.items.map((i) => i.block ?? 'main')
    expect(blocks).toContain('warmup')
    expect(blocks).toContain('main')
    expect(blocks).toContain('cooldown')
    // no interleaving: each block is one contiguous run, in order
    const order = ['warmup', 'main', 'cooldown']
    const runs = blocks.filter((b, i) => b !== blocks[i - 1])
    expect(runs).toEqual(order)
  })

  it('warms up with movement and cools down with held stretches', () => {
    const cat = loadCatalog()
    const byId = new Map(cat.map((e) => [e.id, e]))
    const w = autofill(cat, {
      zone: 'legs',
      minutes: 45,
      level: 'intermediate',
    })
    for (const it of w.items) {
      const e = byId.get(it.exerciseId)!
      if (it.block === 'warmup') expect(isDynamicStretch(e)).toBe(true)
      if (it.block === 'cooldown') expect(isStaticStretch(e)).toBe(true)
    }
  })

  it('stretches the muscles the session actually worked', () => {
    const cat = loadCatalog()
    const byId = new Map(cat.map((e) => [e.id, e]))
    const w = autofill(cat, { zone: 'upper', minutes: 45, level: 'expert' })
    const worked = new Set(
      w.items
        .filter((i) => (i.block ?? 'main') === 'main')
        .flatMap((i) => byId.get(i.exerciseId)!.primaryMuscles),
    )
    const cooldown = w.items.filter((i) => i.block === 'cooldown')
    expect(cooldown.length).toBeGreaterThan(0)
    // an upper-body session must not send you off stretching hamstrings
    expect(
      cooldown.some((i) =>
        byId.get(i.exerciseId)!.primaryMuscles.some((m) => worked.has(m)),
      ),
    ).toBe(true)
  })

  it('fits warm-up and cool-down inside the requested minutes', () => {
    const minutes = 30
    const w = autofill(loadCatalog(), {
      zone: 'legs',
      minutes,
      level: 'intermediate',
    })
    const seconds = w.items.reduce(
      (sum, i) =>
        sum +
        (i.block === 'main'
          ? i.sets * (i.reps * 3 + i.restSeconds)
          : (i.workSeconds ?? 0)),
      0,
    )
    expect(seconds).toBeLessThanOrEqual(minutes * 60 + ITEM_SECONDS)
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
