import { readFileSync } from 'node:fs'

/**
 * The catalog as it was left by the previous run, or null when there is none. Reading and
 * catching the miss is the only honest test: an `existsSync` before the read answers a
 * question about a moment that has already passed by the time the read happens.
 *
 * @param {string} f
 * @returns {any[] | null}
 */
export const readPrevious = (f) => {
  try {
    return JSON.parse(readFileSync(f, 'utf8'))
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT')
      return null
    throw err
  }
}
