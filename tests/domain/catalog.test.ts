import { describe, it, expect } from 'vitest'
import { loadCatalog, filterByZone, search } from '../../src/domain/catalog'

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
