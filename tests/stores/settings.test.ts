import { describe, it, expect, afterEach } from 'vitest'
import { get } from 'svelte/store'
import { geminiKey } from '../../src/stores/settings'

const AQ_KEY = 'AQ.' + 'Ab8RN6Kx_q-Zt0wPmY3vLs9JcHd2FeUg7oTiWnBa4XrQkVy1Ez'

afterEach(() => geminiKey.clear())

describe('geminiKey', () => {
  it('keeps a pasted AQ. key exactly, minus surrounding whitespace', () => {
    geminiKey.set(`  ${AQ_KEY}\n`)
    expect(get(geminiKey)).toBe(AQ_KEY)
    expect(localStorage.getItem('ekin:gemini-key')).toBe(AQ_KEY)
  })
})
