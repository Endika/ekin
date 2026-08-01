import { describe, it, expect } from 'vitest'
import {
  loadCatalog,
  filterByZone,
  search,
  localizedInstructions,
  chainOf,
  chainNeighbours,
} from '../../src/domain/catalog'
import type { Exercise } from '../../src/domain/types'
import { NEEDS_EQUIPMENT } from '../../scripts/needs-equipment.mjs'

describe('catalog', () => {
  it('loads only bodyweight exercises with required fields', () => {
    const all = loadCatalog()
    expect(all.length).toBeGreaterThan(50)
    for (const e of all) {
      expect(e.id).toBeTruthy()
      expect(e.name).toBeTruthy()
      expect(['upper', 'core', 'legs', 'full']).toContain(e.zone)
    }
  })

  it('filters by zone', () => {
    const core = filterByZone(loadCatalog(), 'core')
    expect(core.length).toBeGreaterThan(0)
    expect(core.every((e) => e.zone === 'core')).toBe(true)
  })

  it('search matches name case-insensitively', () => {
    const all = loadCatalog()
    const hit = search(all, all[0].name.slice(0, 4).toUpperCase())
    expect(hit.some((e) => e.id === all[0].id)).toBe(true)
  })

  // Ekin assumes nothing but the floor, a wall and household furniture. Upstream's
  // `equipment` field is not enough on its own — it calls Pullups and Chin-Up "body only".
  it('excludes every exercise that needs equipment', () => {
    const ids = new Set(loadCatalog().map((e) => e.id))
    const leaked = [...NEEDS_EQUIPMENT].filter((id) => ids.has(id))
    expect(leaked).toEqual([])
  })
})

describe('imported exercises', () => {
  const imported = loadCatalog().filter((e) => e.source)

  it('carries attribution for every one of them', () => {
    expect(imported.length).toBeGreaterThan(100)
    for (const e of imported) {
      expect(e.source!.author).toBeTruthy()
      expect(e.source!.license).toMatch(/^(CC-BY|CC0|ODbL)/)
      expect(e.source!.url).toMatch(/^https:\/\//)
    }
  })

  // The whole catalog must stay usable with nothing but the floor, a wall and furniture.
  it('needs no equipment you would have to buy', () => {
    const banned =
      /\b(pull-?up bar|chin-?up bar|barbell|dumbbell|kettlebell|resistance band|trx|suspension trainer|gymnastic rings)\b/i
    const offenders = loadCatalog()
      .filter((e) => banned.test(`${e.name} ${e.instructions.join(' ')}`))
      .map((e) => e.name)
    expect(offenders).toEqual([])
  })
})

describe('progression chains', () => {
  const chained = (id: string, chainId: string, step: number): Exercise => ({
    id,
    name: id,
    zone: 'upper',
    level: 'beginner',
    category: 'strength',
    primaryMuscles: [],
    instructions: [],
    images: [],
    chain: { id: chainId, step },
  })

  const list = [
    chained('easy', 'push', 0),
    chained('mid-a', 'push', 1),
    chained('mid-b', 'push', 1),
    chained('hard', 'push', 2),
    chained('other', 'squat', 0),
  ]

  it('orders a chain easiest first', () => {
    expect(chainOf(list, 'push').map((e) => e.id)).toEqual([
      'easy',
      'mid-a',
      'mid-b',
      'hard',
    ])
  })

  it('finds the rungs below and above', () => {
    const { previous, next } = chainNeighbours(list, list[1])
    expect(previous?.id).toBe('easy')
    expect(next?.id).toBe('hard') // skips the equally hard alternative
  })

  it('has no rung below the first nor above the last', () => {
    expect(chainNeighbours(list, list[0]).previous).toBeUndefined()
    expect(chainNeighbours(list, list[3]).next).toBeUndefined()
  })

  it('reports nothing for an exercise that stands alone', () => {
    const alone = { ...list[0], chain: undefined }
    expect(chainNeighbours(list, alone)).toEqual({})
  })

  it('every chain in the real catalog has at least two rungs', () => {
    const all = loadCatalog()
    const ids = new Set(all.flatMap((e) => (e.chain ? [e.chain.id] : [])))
    expect(ids.size).toBeGreaterThan(0)
    for (const id of ids) expect(chainOf(all, id).length).toBeGreaterThan(1)
  })
})

describe('localizedInstructions', () => {
  const ex = (i18n?: Record<string, string[]>): Exercise => ({
    id: 'x',
    name: 'X',
    zone: 'core',
    level: 'beginner',
    category: 'strength',
    primaryMuscles: [],
    instructions: ['Step one', 'Step two'],
    instructionsI18n: i18n,
    images: [],
  })

  it('returns the locale translation when present', () => {
    const e = ex({ es: ['Paso uno', 'Paso dos'] })
    expect(localizedInstructions(e, 'es')).toEqual(['Paso uno', 'Paso dos'])
  })

  it('falls back to English when the locale is missing', () => {
    expect(localizedInstructions(ex({ es: ['Paso uno'] }), 'eu')).toEqual([
      'Step one',
      'Step two',
    ])
  })

  it('falls back to English when there are no translations at all', () => {
    expect(localizedInstructions(ex(), 'es')).toEqual(['Step one', 'Step two'])
  })

  it('falls back when the translation is empty', () => {
    expect(localizedInstructions(ex({ es: [] }), 'es')).toEqual([
      'Step one',
      'Step two',
    ])
  })
})
