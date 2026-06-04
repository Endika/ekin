import { writable, derived } from 'svelte/store'
import type { Zone } from '../domain/types'
import { loadCatalog, filterByZone, search } from '../domain/catalog'

export const allExercises = loadCatalog()
export const zoneFilter = writable<Zone | 'all'>('all')
export const query = writable('')

export const visibleExercises = derived([zoneFilter, query], ([$zone, $q]) => {
  let list = allExercises
  if ($zone !== 'all') list = filterByZone(list, $zone)
  return search(list, $q)
})
