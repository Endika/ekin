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

/**
 * A non-empty list of non-empty strings — the shape the UI renders as steps.
 *
 * @param {unknown} steps
 */
export const isStepList = (steps) =>
  Array.isArray(steps) &&
  steps.length > 0 &&
  steps.every((s) => typeof s === 'string' && s.trim() !== '')

/**
 * The fields the app reads off every catalog entry. Checked before anything fetched from
 * the network is written to disk: upstream changing shape must fail the sync, not ship a
 * catalog the app cannot render.
 *
 * @param {unknown} e
 */
export const isExercise = (e) => {
  if (typeof e !== 'object' || e === null) return false
  const { id, name, instructions } = /** @type {Record<string, unknown>} */ (e)
  return (
    typeof id === 'string' &&
    id !== '' &&
    typeof name === 'string' &&
    name !== '' &&
    Array.isArray(instructions) &&
    instructions.every((s) => typeof s === 'string')
  )
}
