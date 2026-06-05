import type { Zone } from '../domain/types'

/** Icon name to use as the image fallback for an exercise of a given zone. */
export function zoneIcon(zone: Zone): 'upper' | 'core' | 'legs' | 'dumbbell' {
  if (zone === 'upper' || zone === 'core' || zone === 'legs') return zone
  return 'dumbbell' // 'full' (no per-exercise meaning) or anything else
}
