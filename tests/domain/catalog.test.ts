import { describe, it, expect } from 'vitest'
import {
  loadCatalog,
  filterByZone,
  search,
  localizedInstructions,
} from '../../src/domain/catalog'
import type { Exercise } from '../../src/domain/types'

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
