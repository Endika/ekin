/**
 * Progression chains: exercises that are the same movement at different difficulties.
 *
 * Two jobs at once. A chain gives an exercise a "next level" to work toward, and it stops
 * a routine from serving four variations of one move — the catalog treats Incline Push-Up,
 * Incline Push-Up Wide, Incline Push-Up Medium and Incline Push-Up Reverse Grip as four
 * unrelated exercises, so a generated upper-body session used to include all of them.
 *
 * Exercises sharing a step are alternatives of equal difficulty (a grip variation), not a
 * progression. The generator picks one exercise per chain per routine.
 *
 * Curated by hand against the free-exercise-db catalog; wger's `variation_group` will seed
 * more of these when its exercises are imported.
 */
export const CHAINS = {
  // ── upper ────────────────────────────────────────────────────────────────
  'Incline_Push-Up': { id: 'push', step: 0 },
  'Incline_Push-Up_Wide': { id: 'push', step: 0 },
  'Incline_Push-Up_Medium': { id: 'push', step: 0 },
  'Incline_Push-Up_Reverse_Grip': { id: 'push', step: 0 },
  'Incline_Push-Up_Close-Grip': { id: 'push', step: 0 },
  Pushups: { id: 'push', step: 1 },
  'Push-Up_Wide': { id: 'push', step: 1 },
  Pushups_Close_and_Wide_Hand_Positions: { id: 'push', step: 1 },
  Push_Up_to_Side_Plank: { id: 'push', step: 2 },
  'Decline_Push-Up': { id: 'push', step: 2 },
  'Push-Ups_With_Feet_Elevated': { id: 'push', step: 2 },
  'Push-Ups_-_Close_Triceps_Position': { id: 'push', step: 3 },
  'Plyo_Push-up': { id: 'push', step: 3 },
  'Clock_Push-Up': { id: 'push', step: 4 },
  'Single-Arm_Push-Up': { id: 'push', step: 5 },

  Bench_Dips: { id: 'dip', step: 0 },
  'Dips_-_Triceps_Version': { id: 'dip', step: 1 },
  'Body-Up': { id: 'dip', step: 1 },

  // ── legs ─────────────────────────────────────────────────────────────────
  Bodyweight_Squat: { id: 'squat', step: 0 },
  Freehand_Jump_Squat: { id: 'squat', step: 1 },

  Bodyweight_Walking_Lunge: { id: 'lunge', step: 0 },
  Split_Jump: { id: 'lunge', step: 1 },

  Butt_Lift_Bridge: { id: 'hip-bridge', step: 0 },
  Single_Leg_Glute_Bridge: { id: 'hip-bridge', step: 1 },

  Prone_Manual_Hamstring: { id: 'ham-curl', step: 0 },
  'Floor_Glute-Ham_Raise': { id: 'ham-curl', step: 1 },
  Natural_Glute_Ham_Raise: { id: 'ham-curl', step: 2 },

  // ── core ─────────────────────────────────────────────────────────────────
  Crunches: { id: 'crunch', step: 0 },
  'Crunch_-_Hands_Overhead': { id: 'crunch', step: 1 },
  'Sit-Up': { id: 'crunch', step: 1 },
  '3_4_Sit-Up': { id: 'crunch', step: 1 },
  Tuck_Crunch: { id: 'crunch', step: 1 },
  'Janda_Sit-Up': { id: 'crunch', step: 2 },
  'Jackknife_Sit-Up': { id: 'crunch', step: 2 },
  Decline_Crunch: { id: 'crunch', step: 2 },
  'Frog_Sit-Ups': { id: 'crunch', step: 2 },

  'Bent-Knee_Hip_Raise': { id: 'leg-raise', step: 0 },
  Reverse_Crunch: { id: 'leg-raise', step: 0 },
  'Leg_Pull-In': { id: 'leg-raise', step: 1 },
  Flat_Bench_Lying_Leg_Raise: { id: 'leg-raise', step: 1 },
  Seated_Leg_Tucks: { id: 'leg-raise', step: 1 },
  Decline_Reverse_Crunch: { id: 'leg-raise', step: 2 },
  Cocoons: { id: 'leg-raise', step: 2 },

  Plank: { id: 'plank', step: 0 },
  'Butt-Ups': { id: 'plank', step: 1 },
  Side_Bridge: { id: 'plank', step: 1 },
  Spider_Crawl: { id: 'plank', step: 2 },

  Oblique_Crunches: { id: 'oblique', step: 0 },
  'Oblique_Crunches_-_On_The_Floor': { id: 'oblique', step: 0 },
  'Cross-Body_Crunch': { id: 'oblique', step: 0 },
  Elbow_to_Knee: { id: 'oblique', step: 0 },
  Alternate_Heel_Touchers: { id: 'oblique', step: 0 },
  Side_Jackknife: { id: 'oblique', step: 1 },
  Decline_Oblique_Crunch: { id: 'oblique', step: 1 },
  Russian_Twist: { id: 'oblique', step: 2 },
}
