import type { Exercise, Zone } from './types'
import data from '../data/exercises.json'

export function loadCatalog(): Exercise[] {
  return data as unknown as Exercise[]
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
 * Instructions for an exercise in the given locale, falling back to the English
 * source when that locale has no (complete) translation yet.
 */
export function localizedInstructions(ex: Exercise, locale: string): string[] {
  const t = ex.instructionsI18n?.[locale]
  return t && t.length ? t : ex.instructions
}
