import type { Exercise } from './types'

/**
 * Stretches that are active movement rather than a held position, so they belong in a
 * warm-up. Everything else classified as `stretching` is treated as static and goes to
 * the cool-down.
 *
 * The list is curated by hand and deliberately conservative: a static stretch pushed into
 * a warm-up is the harmful mistake (it does not warm anything up and blunts the work that
 * follows), whereas a dynamic one left in the cool-down is merely a missed opportunity.
 * So anything ambiguous stays static.
 */
const DYNAMIC_STRETCHES = new Set([
  'Ankle_Circles',
  'Arm_Circles',
  'Cat_Stretch',
  'Crossover_Reverse_Lunge',
  'Dynamic_Back_Stretch',
  'Dynamic_Chest_Stretch',
  'Elbow_Circles',
  'Frog_Hops',
  'Front_Leg_Raises',
  'Groiners',
  'Hip_Circles_prone',
  'Inchworm',
  'Iron_Crosses_stretch',
  'Knee_Circles',
  'Rear_Leg_Raises',
  'Scissor_Kick',
  'Shoulder_Circles',
  'Shoulder_Raise',
  'Side_Leg_Raises',
  'Sit_Squats',
  'Standing_Hip_Circles',
  'Standing_Pelvic_Tilt',
  'Windmills',
  'Worlds_Greatest_Stretch',
  'Wrist_Circles',
])

export const isStretch = (e: Exercise): boolean => e.category === 'stretching'

/**
 * Imported exercises classify themselves via `stretchKind`; free-exercise-db ones fall
 * back to the curated list above. Unclassified means static, the safe default.
 */
const kindOf = (e: Exercise): 'dynamic' | 'static' =>
  e.stretchKind ?? (DYNAMIC_STRETCHES.has(e.id) ? 'dynamic' : 'static')

/** Active-movement stretch, suitable for warming up. */
export const isDynamicStretch = (e: Exercise): boolean =>
  isStretch(e) && kindOf(e) === 'dynamic'

/** Held stretch, suitable for cooling down. Any unclassified stretch lands here. */
export const isStaticStretch = (e: Exercise): boolean =>
  isStretch(e) && kindOf(e) === 'static'
