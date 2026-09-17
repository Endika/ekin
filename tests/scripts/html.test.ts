import { describe, it, expect } from 'vitest'
import { strip } from '../../scripts/lib/html.mjs'

describe('strip', () => {
  it('turns block markup into line breaks', () => {
    expect(strip('<p>one<br/>two</p><ul><li>three</li></ul>')).toBe(
      'one\ntwo\n\nthree',
    )
  })

  it('removes tags a single pass would reveal', () => {
    expect(strip('<<a>script>')).toBe('script>')
    expect(strip('<<a>script>alert(1)<</a>/script>')).toBe(
      'script>alert(1)/script>',
    )
  })

  it('does not decode an entity twice', () => {
    expect(strip('&amp;quot;')).toBe('&quot;')
    expect(strip('&amp;#39;')).toBe('&#39;')
    expect(strip('&amp;nbsp;')).toBe('&nbsp;')
  })

  it('decodes the entities wger emits', () => {
    expect(strip('a&nbsp;b &amp; c &quot;d&quot; &#39;e&#39;')).toBe(
      'a b & c "d" \'e\'',
    )
  })
})
