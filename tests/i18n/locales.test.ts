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

function messages(obj: Tree, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).flatMap(([k, v]) => {
      const path = prefix ? `${prefix}.${k}` : k
      return typeof v === 'string'
        ? [[path, v]]
        : Object.entries(messages(v, path))
    }),
  )
}

/** The `{name}` slots a message expects, e.g. "Set {n}/{total}" → ["n", "total"]. */
const placeholders = (msg: string) =>
  [...msg.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*[},]/g)].map((m) => m[1]).sort()

const enKeys = keyPaths(en as Tree)
const enMessages = messages(en as Tree)
const others: Record<string, Tree> = { es, eu, gl, ca, va }

describe('locale catalogs', () => {
  it('English defines a non-empty key set', () => {
    expect(enKeys.length).toBeGreaterThan(20)
  })

  for (const [code, tree] of Object.entries(others)) {
    it(`${code} has exactly the same keys as en`, () => {
      expect(keyPaths(tree)).toEqual(enKeys)
    })

    // A translation that loses a slot renders "Set /" and one that invents a slot renders
    // the braces raw, both only at runtime and only in that language.
    it(`${code} keeps every interpolation slot en declares`, () => {
      const translated = messages(tree)
      const mismatched = enKeys.filter(
        (k) =>
          String(placeholders(enMessages[k])) !==
          String(placeholders(translated[k] ?? '')),
      )
      expect(mismatched).toEqual([])
    })
  }
})

// The whole source tree, read as text. Globbed at run time rather than listed, so calls
// added after this test was written are checked too.
const sources = Object.values(
  import.meta.glob('../../src/**/*.{svelte,ts}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
)

const matches = (re: RegExp) => [
  ...new Set(sources.flatMap((s) => [...s.matchAll(re)].map((m) => m[1]))),
]

// `$_('a.b')` — a whole key. The closing `,` or `)` is what keeps the concatenated
// `$_('block.' + x)` calls out of this list; those are checked as prefixes below.
const usedKeys = matches(/\$_\(\s*'([^']+)'\s*[,)]/g).sort()
const usedPrefixes = matches(/\$_\(\s*'([^']+)'\s*\+/g).sort()

/**
 * Key parity across locales cannot catch `$_('settings.sounnd')` — every locale is
 * equally missing it, and svelte-i18n just renders the key back. So read the app's own
 * calls out of the source tree and check each one against en.
 */
describe('message keys used by the app', () => {
  it('resolves every literal key to an English message', () => {
    expect(usedKeys.length).toBeGreaterThan(50)
    expect(usedKeys.filter((k) => !enMessages[k])).toEqual([])
  })

  it('resolves every key built by concatenation', () => {
    expect(usedPrefixes.length).toBeGreaterThan(0)
    for (const prefix of usedPrefixes) {
      const under = enKeys.filter((k) => k.startsWith(prefix))
      // a prefix is only concatenated because it has several alternatives
      expect(under.length, `no en messages under '${prefix}'`).toBeGreaterThan(
        1,
      )
    }
  })
})
