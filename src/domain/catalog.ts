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
