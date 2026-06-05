import { describe, it, expect } from 'vitest'
import en from '../../src/i18n/locales/en.json'
import es from '../../src/i18n/locales/es.json'
import eu from '../../src/i18n/locales/eu.json'
import gl from '../../src/i18n/locales/gl.json'
import ca from '../../src/i18n/locales/ca.json'
import va from '../../src/i18n/locales/va.json'

type Tree = { [k: string]: string | Tree }

// Sorted dotted key paths of a message tree, e.g. "player.exercise".
function keyPaths(obj: Tree, prefix = ''): string[] {
  return Object.entries(obj)
    .flatMap(([k, v]) => {
      const path = prefix ? `${prefix}.${k}` : k
      return typeof v === 'string' ? [path] : keyPaths(v, path)
    })
    .sort()
}

const enKeys = keyPaths(en as Tree)
const others: Record<string, Tree> = { es, eu, gl, ca, va }

describe('locale catalogs', () => {
  it('English defines a non-empty key set', () => {
    expect(enKeys.length).toBeGreaterThan(20)
  })

  for (const [code, tree] of Object.entries(others)) {
    it(`${code} has exactly the same keys as en`, () => {
      expect(keyPaths(tree)).toEqual(enKeys)
    })
  }
})
