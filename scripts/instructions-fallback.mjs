/**
 * Hand-written instructions for exercises free-exercise-db ships with an empty
 * `instructions` array.
 *
 * Upstream has a handful of entries that are name-and-image only. They render in the app
 * as an exercise you cannot follow, and the translation script skips them because there is
 * no source text. Filling them here keeps them in the catalog and lets them be translated
 * like everything else; the build applies these only when upstream provides nothing, so a
 * later upstream fix wins automatically.
 */
export const INSTRUCTIONS_FALLBACK = {
  Side_Bridge: [
    'Lie on your side with your legs straight, stacking one foot on top of the other.',
    'Prop yourself up on the forearm of the lower arm, elbow directly under the shoulder.',
    'Raise your hips until your body forms a straight line from head to feet. This is the starting position.',
    'Hold the position, keeping the hips lifted and the shoulder away from the ear. Breathe steadily.',
    'Lower under control and repeat on the other side.',
  ],
  Side_Jackknife: [
    'Lie on your side with your legs straight and stacked, and rest the lower arm across your chest.',
    'Place the hand of the upper arm behind your head, elbow pointing up.',
    'Contract your obliques to raise your legs and your torso towards each other, folding at the waist.',
    'Pause briefly at the top, where the elbow and the hip come closest together.',
    'Lower slowly to the starting position without letting your legs rest, and repeat for the recommended repetitions before switching sides.',
  ],
}
