/**
 * Exercises from free-exercise-db that need equipment Ekin does not assume.
 *
 * Ekin is equipment-free: floor, wall and household furniture (a chair, a step) are fair
 * game; anything you would have to buy is not.
 *
 * The upstream `equipment` field cannot decide this on its own — it tags Pullups, Chin-Up,
 * Inverted Row and Hanging Leg Raise as `body only` even though they all need a bar. Hence
 * this hand-curated deny list, checked by id on top of the equipment filter.
 *
 * Kept on purpose, despite mentioning gear: the `Incline_Push-Up_*` family offers "a smith
 * machine bar OR sturdy elevated platform" (a chair works); Hyperextensions and
 * Natural_Glute_Ham_Raise mention a plate or band only as optional extra resistance;
 * Seated_Calf_Stretch accepts "band, towel, or your hand"; and Freehand_Jump_Squat's "ball
 * of your feet" is the foot, not a ball.
 */
export const NEEDS_EQUIPMENT = new Set([
  // pull-up bar
  'Chin-Up',
  'Gorilla_Chin_Crunch',
  'Hanging_Leg_Raise',
  'Hanging_Pike',
  'Pullups',
  'Scapular_Pull-Up',
  'V-Bar_Pullup',
  'Wide-Grip_Rear_Pull-Up',
  'Wind_Sprints',
  // barbell in a rack
  'Body_Tricep_Press',
  'Inverted_Row',
  // free weights / balls
  'Close-Grip_Push-Up_off_of_a_Dumbbell',
  'Crunch_-_Legs_On_Exercise_Ball',
])
