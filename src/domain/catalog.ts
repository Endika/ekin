import type { Exercise, Zone } from './types'
import data from '../data/exercises.json'
import wger from '../data/exercises.wger.json'

/**
 * The catalog is two separately-licensed datasets kept in separate files: free-exercise-db
 * (public domain) and wger (CC-BY-SA, each exercise carrying its own attribution in
 * `source`). They are concatenated at read time, never merged on disk. See NOTICE.md.
 */
export function loadCatalog(): Exercise[] {
  return [...data, ...wger] as unknown as Exercise[]
}

export function filterByZone(list: Exercise[], zone: Zone): Exercise[] {
  return list.filter((e) => e.zone === zone)
}

export function search(list: Exercise[], term: string): Exercise[] {
  const q = term.trim().toLowerCase()
  if (!q) return list
  return list.filter((e) => e.name.toLowerCase().includes(q))
}

/**
 * The exercises of a progression chain, easiest first. Exercises sharing a step are
 * equally hard alternatives, and keep a stable order by id.
 */
export function chainOf(list: Exercise[], chainId: string): Exercise[] {
  return list
    .filter((e) => e.chain?.id === chainId)
    .sort(
      (a, b) => a.chain!.step - b.chain!.step || a.name.localeCompare(b.name),
    )
}

/**
 * The rungs immediately below and above an exercise in its chain — what to regress to
 * when it is too hard, and what to work toward next. Both are undefined for an exercise
 * that stands alone, or at either end of its chain.
 */
export function chainNeighbours(
  list: Exercise[],
  exercise: Exercise,
): { previous?: Exercise; next?: Exercise } {
  const step = exercise.chain?.step
  if (step === undefined) return {}
  const siblings = chainOf(list, exercise.chain!.id)
  return {
    previous: siblings.filter((e) => e.chain!.step < step).at(-1),
    next: siblings.find((e) => e.chain!.step > step),
  }
}

/**
 * Instructions for an exercise in the given locale, falling back to the English
 * source when that locale has no (complete) translation yet.
 */
export function localizedInstructions(ex: Exercise, locale: string): string[] {
  const t = ex.instructionsI18n?.[locale]
  return t && t.length ? t : ex.instructions
}
