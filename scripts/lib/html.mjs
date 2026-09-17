// Plain text out of the HTML that wger stores in an exercise `description`.

/**
 * One pass leaves the tags that the removal itself reveals: `<<a>script>` drops `<a>` and
 * exposes `<script>`. Repeat until nothing more is removed.
 *
 * @param {string} s
 */
const stripTags = (s) => {
  let out = s
  for (let prev; prev !== out;) {
    prev = out
    out = out.replace(/<[^>]+>/g, '')
  }
  return out
}

/** @param {string} html */
export const strip = (html) =>
  stripTags(
    html
      .replace(/<li>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n'),
  )
    // `&amp;` goes last: decoding it first turns `&amp;quot;` into a literal quote.
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
