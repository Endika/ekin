/**
 * Progression chains: exercises that are the same movement at different difficulties.
 *
 * Two jobs at once. A chain gives an exercise a "next level" to work toward, and it stops
 * a routine from serving several variations of one move — the catalog treats Incline
 * Push-Up, Incline Push-Up Wide and Wall Pushup as unrelated exercises, so a generated
 * upper-body session used to include all of them.
 *
 * Exercises sharing a step are alternatives of equal difficulty (a grip variation), not a
 * progression. The generator picks one exercise per chain per routine.
 *
 * Covers BOTH catalogs. free-exercise-db ids are the bare upstream id; wger ids carry the
 * `wger-` prefix. Curated by hand — wger's own `variation_group` only covers 50 exercises
 * and does not line up with these movements.
 */
export const CHAINS = {
  // ── push (horizontal) ─────────────────────────────────────────────────────
  'wger-713': { id: 'push', step: 0 }, // wall push-up, the easiest rung
  'Incline_Push-Up': { id: 'push', step: 1 },
  'Incline_Push-Up_Wide': { id: 'push', step: 1 },
  'Incline_Push-Up_Medium': { id: 'push', step: 1 },
  'Incline_Push-Up_Reverse_Grip': { id: 'push', step: 1 },
  'Incline_Push-Up_Close-Grip': { id: 'push', step: 1 },
  'wger-1218': { id: 'push', step: 1 }, // knee push-ups
  Pushups: { id: 'push', step: 2 },
  'Push-Up_Wide': { id: 'push', step: 2 },
  Pushups_Close_and_Wide_Hand_Positions: { id: 'push', step: 2 },
  Push_Up_to_Side_Plank: { id: 'push', step: 3 },
  'Decline_Push-Up': { id: 'push', step: 3 },
  'Push-Ups_With_Feet_Elevated': { id: 'push', step: 3 },
  'wger-1086': { id: 'push', step: 3 }, // close-grip press-ups
  'wger-1209': { id: 'push', step: 3 }, // shoulder-width three-point
  'wger-985': { id: 'push', step: 3 }, // push-up rotations
  'Push-Ups_-_Close_Triceps_Position': { id: 'push', step: 4 },
  'Plyo_Push-up': { id: 'push', step: 4 },
  'wger-386': { id: 'push', step: 4 }, // diamond
  'wger-1554': { id: 'push', step: 4 }, // clap
  'wger-1217': { id: 'push', step: 4 }, // finger push-up
  'wger-1777': { id: 'push', step: 4 }, // deficit
  'Clock_Push-Up': { id: 'push', step: 5 },
  'wger-1284': { id: 'push', step: 5 }, // pseudo planche
  'Single-Arm_Push-Up': { id: 'push', step: 6 },
  'wger-1293': { id: 'push', step: 6 }, // one-armed

  // ── push (vertical) ───────────────────────────────────────────────────────
  'wger-454': { id: 'pike', step: 0 },
  'wger-1090': { id: 'pike', step: 1 }, // V push-up
  'wger-711': { id: 'pike', step: 2 }, // wall handstand
  'Handstand_Push-Ups': { id: 'pike', step: 3 },

  'wger-1916': { id: 'planche', step: 0 }, // tuck planche
  'wger-1286': { id: 'planche', step: 1 }, // dynamic planche

  // ── dip ───────────────────────────────────────────────────────────────────
  Bench_Dips: { id: 'dip', step: 0 },
  'wger-1774': { id: 'dip', step: 0 }, // chair dips
  'wger-1000': { id: 'dip', step: 0 }, // floor dips
  'wger-1320': { id: 'dip', step: 0 }, // bench dips on floor
  'Dips_-_Triceps_Version': { id: 'dip', step: 1 },
  'Body-Up': { id: 'dip', step: 1 },
  'wger-194': { id: 'dip', step: 1 }, // dips

  // ── legs ──────────────────────────────────────────────────────────────────
  Bodyweight_Squat: { id: 'squat', step: 0 },
  'wger-1208': { id: 'squat', step: 0 }, // prisoner squat
  'wger-1963': { id: 'squat', step: 0 }, // slow squat
  Freehand_Jump_Squat: { id: 'squat', step: 1 },
  'wger-1733': { id: 'squat', step: 1 }, // isometric to failure
  'wger-1948': { id: 'squat', step: 2 }, // one-leg box squat
  Shrimp_Squad: { id: 'squat', step: 2 },
  'wger-1020': { id: 'squat', step: 3 }, // pistol
  'wger-1201': { id: 'squat', step: 3 }, // dragon squat

  Bodyweight_Walking_Lunge: { id: 'lunge', step: 0 },
  'wger-984': { id: 'lunge', step: 0 }, // lunges
  'wger-999': { id: 'lunge', step: 0 }, // reverse lunges
  'wger-1102': { id: 'lunge', step: 0 }, // alternate back lunges
  'wger-1907': { id: 'lunge', step: 1 }, // unilateral lunges
  'wger-986': { id: 'lunge', step: 1 }, // side split squats
  'wger-988': { id: 'lunge', step: 2 }, // bulgarian split squats
  Split_Jump: { id: 'lunge', step: 2 },

  Butt_Lift_Bridge: { id: 'hip-bridge', step: 0 },
  'wger-1906': { id: 'hip-bridge', step: 0 }, // hip bridge
  Single_Leg_Glute_Bridge: { id: 'hip-bridge', step: 1 },
  'wger-1913': { id: 'hip-bridge', step: 1 }, // unilateral hip thrust
  'wger-1263': { id: 'hip-bridge', step: 2 }, // back bridge

  Prone_Manual_Hamstring: { id: 'ham-curl', step: 0 },
  'Floor_Glute-Ham_Raise': { id: 'ham-curl', step: 1 },
  Natural_Glute_Ham_Raise: { id: 'ham-curl', step: 2 },

  'wger-997': { id: 'burpee', step: 0 }, // 4-count burpee
  'wger-616': { id: 'burpee', step: 0 }, // squat thrust
  'wger-998': { id: 'burpee', step: 1 }, // no-push-up burpee

  // ── core ──────────────────────────────────────────────────────────────────
  Crunches: { id: 'crunch', step: 0 },
  'Crunch_-_Hands_Overhead': { id: 'crunch', step: 1 },
  'Sit-Up': { id: 'crunch', step: 1 },
  '3_4_Sit-Up': { id: 'crunch', step: 1 },
  Tuck_Crunch: { id: 'crunch', step: 1 },
  'wger-1478': { id: 'crunch', step: 1 }, // levitation crunch
  'Janda_Sit-Up': { id: 'crunch', step: 2 },
  'Jackknife_Sit-Up': { id: 'crunch', step: 2 },
  Decline_Crunch: { id: 'crunch', step: 2 },
  'Frog_Sit-Ups': { id: 'crunch', step: 2 },
  'wger-1476': { id: 'crunch', step: 2 }, // butterfly sit-up
  'wger-1479': { id: 'crunch', step: 2 }, // sit-up elbow thrust

  'Bent-Knee_Hip_Raise': { id: 'leg-raise', step: 0 },
  Reverse_Crunch: { id: 'leg-raise', step: 0 },
  'wger-1105': { id: 'leg-raise', step: 0 }, // seated knee tuck
  'Leg_Pull-In': { id: 'leg-raise', step: 1 },
  Flat_Bench_Lying_Leg_Raise: { id: 'leg-raise', step: 1 },
  Seated_Leg_Tucks: { id: 'leg-raise', step: 1 },
  'wger-377': { id: 'leg-raise', step: 1 }, // lying leg raises
  Decline_Reverse_Crunch: { id: 'leg-raise', step: 2 },
  Cocoons: { id: 'leg-raise', step: 2 },

  'wger-1853': { id: 'l-sit', step: 0 }, // foot-supported
  'wger-382': { id: 'l-sit', step: 1 }, // L hold
  'wger-1852': { id: 'l-sit', step: 1 }, // L-sit
  'wger-1847': { id: 'l-sit', step: 2 }, // straddle L-sit

  Plank: { id: 'plank', step: 0 },
  'wger-1001': { id: 'plank', step: 0 }, // high plank
  'Butt-Ups': { id: 'plank', step: 1 },
  Side_Bridge: { id: 'plank', step: 1 },
  'wger-580': { id: 'plank', step: 1 }, // side plank
  'wger-1091': { id: 'plank', step: 2 }, // shoulder taps
  'wger-1766': { id: 'plank', step: 2 }, // plank reach
  'wger-1410': { id: 'plank', step: 2 }, // alternating leg lift
  'wger-1406': { id: 'plank', step: 2 }, // plank to elbow extension
  'wger-1288': { id: 'plank', step: 2 }, // dynamic side plank
  'wger-1911': { id: 'plank', step: 2 }, // cat plank
  Spider_Crawl: { id: 'plank', step: 3 },
  'wger-1489': { id: 'plank', step: 3 }, // plank jacks

  Oblique_Crunches: { id: 'oblique', step: 0 },
  'Oblique_Crunches_-_On_The_Floor': { id: 'oblique', step: 0 },
  'Cross-Body_Crunch': { id: 'oblique', step: 0 },
  Elbow_to_Knee: { id: 'oblique', step: 0 },
  Alternate_Heel_Touchers: { id: 'oblique', step: 0 },
  'wger-1411': { id: 'oblique', step: 0 }, // heel touches
  Side_Jackknife: { id: 'oblique', step: 1 },
  Decline_Oblique_Crunch: { id: 'oblique', step: 1 },
  'wger-1912': { id: 'oblique', step: 1 }, // russian-twist style
  Russian_Twist: { id: 'oblique', step: 2 },
  'wger-1474': { id: 'oblique', step: 2 }, // inverted W
}
