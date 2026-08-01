// Import bodyweight exercises from wger into src/data/exercises.wger.json.
//
// Kept in its OWN file, never merged into exercises.json: wger's content is CC-BY-SA
// while free-exercise-db is public domain. Two separate files is a collection of
// separately-licensed works (mere aggregation); folding them into one JSON would make the
// result a derivative and drag the whole catalog under the share-alike terms.
//
// Each exercise carries its own attribution, as CC-BY-SA requires. See NOTICE.md.
//
//   npm run import-wger
//
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'

const OUT = 'src/data/exercises.wger.json'
const API =
  'https://wger.de/api/v2/exerciseinfo/?format=json&limit=500&equipment='
// 7 = none (bodyweight), 4 = gym mat. Nothing you would have to buy.
const EQUIPMENT = [7, 4]
const EN = 2
const ES = 4

const LICENSES = {
  1: {
    name: 'CC-BY-SA 3.0',
    url: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  2: {
    name: 'CC-BY-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  3: {
    name: 'CC0 1.0',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  4: { name: 'CC-BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  5: { name: 'ODbL', url: 'https://opendatacommons.org/licenses/odbl/' },
}

// wger muscles are latin; ekin speaks free-exercise-db's vocabulary.
const MUSCLE = {
  1: 'biceps',
  2: 'shoulders',
  3: 'chest', // serratus anterior
  4: 'chest',
  5: 'triceps',
  6: 'abdominals',
  7: 'calves',
  8: 'glutes',
  9: 'traps',
  10: 'quadriceps',
  11: 'hamstrings',
  12: 'lats',
  13: 'biceps', // brachialis
  14: 'abdominals', // obliques
  15: 'calves', // soleus
}

const ZONE_BY_CATEGORY = {
  8: 'upper', // Arms
  9: 'legs', // Legs
  10: 'core', // Abs
  11: 'upper', // Chest
  12: 'upper', // Back
  13: 'upper', // Shoulders
  14: 'legs', // Calves
  15: 'legs', // Cardio
}

/**
 * Not every wger exercise tags its muscles, but ekin needs at least one: the warm-up and
 * cool-down are chosen by matching the muscles the session trained, and an exercise with
 * none would never get stretched. Fall back to the category's representative muscle.
 */
const MUSCLE_BY_CATEGORY = {
  8: 'triceps',
  9: 'quadriceps',
  10: 'abdominals',
  11: 'chest',
  12: 'lats',
  13: 'shoulders',
  14: 'calves',
  15: 'quadriceps',
}

/** Needs kit we do not assume, or is not an exercise at all. */
/** Kit we do not assume. Checked against the name AND the description. */
const REJECT = new RegExp(
  [
    /\b(trx|suspension|bands?|ball|foam roller|roller|kettlebell|dumbbell|barbell|machine|cable|rope|sled|bike|treadmill|pull-?ups?|chin-?ups?|rings?|weights|weight plate|plate|gym80|vibration|wheel|bars?)\b/
      .source,
    // held weight, but not "shift your body weight onto your fingers"
    /\b(hold|holding|grab|grasp|lift)\s+(a\s+|the\s+)?weight\b/.source,
  ].join('|'),
  'i',
)

/**
 * Not physical training at all. Checked against the NAME ONLY — plenty of perfectly good
 * exercises mention breathing as a form cue ("keep your breathing steady", "exhale as you
 * lift"), and matching the description threw out Dynamic Planche, Bretzel stretch, Back
 * bridge, Heel Touches, Abdominal Draw-In and Back neck stretch.
 *
 * The prefixes must NOT be \b-terminated: \bmeditat\b would fail to match "meditation".
 */
const NOT_TRAINING = /\b(meditat|mindful|breath|cycl)\w*/i

/**
 * Rejected by hand: no pattern catches these without also catching good exercises.
 * Reviewed one by one against the English text.
 */
const EXCLUDE_IDS = new Set([
  1198, // "Inverted Rows" — "pull your chest to the bar", needs a bar
  1092, // "Bag training" — a punching bag
  1579, // "Bronco" — a rugby fitness test of 20/40/60 m shuttle runs
  962, // "Elliptical" — a gym cardio machine; its English text never says "machine"
  804, // "Sloper hanging" — climbing, needs a fingerboard
])
// Note the care around "weight": plural or held means kit, but "shift your body weight
// onto your fingers" is a Finger Pushup. Matching a bare \bweight\b threw out Finger
// Pushup, Isometric Wipers, Full Sit Outs and Slow Squat, all of them equipment-free.

/**
 * Descriptions that say nothing. wger lets a contributor save an exercise with a
 * placeholder, and a handful are literally "View the video to undestand the exercise" or a
 * bare YouTube link — nothing a user could follow, and nothing worth translating.
 */
const NO_INSTRUCTIONS =
  /^(see|view|watch)\b.*\b(video|clip)\b|^https?:\/\/|^\s*$/i

/** Reads as English but is not — wger has a few mislabelled translations. */
const NOT_ENGLISH = /^(talons fesses|hollow hold zurdo)/i

/** Active movement done to warm up, rather than a strength exercise. */
const MOBILITY =
  /\b(circles?|swings?|rotations?|mobility|dynamic|windmills?|inchworm|high knees|butt kicks?|jumping jacks?|arm crosses)\b/i

/** A held stretch, for cooling down. */
const STATIC_STRETCH = /\bstretch(es|ing)?\b|\bopener\b|\bpose\b/i

const ADVANCED =
  /\b(planche|l-?sit|straddle|one[- ]arm|one[- ]armed|single[- ]arm|handstand|muscle[- ]up|front lever|back lever|human flag|pistol|frog stand|dragon)\b/i

const strip = (html) =>
  html
    .replace(/<li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

/** A bare "Instructions:" heading is not a step. */
const HEADING = /^(instructions?|instrucciones|pasos|steps|how to)\s*:?\s*$/i

/** Split a description into instruction steps, the shape ekin's UI renders. */
function steps(html) {
  const text = strip(html || '')
  const lines = text
    .split('\n')
    .map((l) => l.trim().replace(/^[-–—*•]\s*/, ''))
    .filter((l) => l && !HEADING.test(l))
  if (lines.length > 1) return lines
  // One blob: split into sentences so it is not a wall of text.
  return (lines[0] ?? '')
    .split(/(?<=[.!?])\s+(?=[A-Z¡¿])/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** "Calf raises, left leg" and "…, right leg" are one exercise, not two. */
const SIDE = /[,(]?\s*\b(left|right)\b(\s+(leg|arm|side|hand))?\s*[)]?\s*$/i
const unside = (name) => name.replace(SIDE, '').trim()

async function fetchAll() {
  const seen = new Map()
  for (const eq of EQUIPMENT) {
    const res = await fetch(API + eq)
    if (!res.ok) throw new Error(`wger ${eq}: HTTP ${res.status}`)
    for (const e of (await res.json()).results) seen.set(e.id, e)
  }
  return [...seen.values()]
}

let raw
try {
  raw = await fetchAll()
} catch (err) {
  if (existsSync(OUT)) {
    console.warn(
      `warning: fetch failed (${err.message}); keeping existing ${OUT}`,
    )
    process.exit(0)
  }
  throw err
}

// Names already covered by free-exercise-db — do not import a second copy.
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const existing = new Set(
  existsSync('src/data/exercises.json')
    ? JSON.parse(readFileSync('src/data/exercises.json', 'utf8')).map((e) =>
        norm(e.name),
      )
    : [],
)

const out = []
const bySide = new Map()
const dropped = {
  noEnglish: 0,
  notEnglish: 0,
  rejected: 0,
  duplicate: 0,
  sideMerged: 0,
  noInstructions: 0,
}

for (const e of raw.sort((a, b) => a.id - b.id)) {
  const en = e.translations?.find((t) => t.language === EN)
  if (!en?.name) {
    dropped.noEnglish++
    continue
  }
  const name = unside(en.name.trim())
  const haystack = `${en.name} ${strip(en.description || '')}`
  if (NOT_ENGLISH.test(en.name)) {
    dropped.notEnglish++
    continue
  }
  if (
    EXCLUDE_IDS.has(e.id) ||
    REJECT.test(haystack) ||
    NOT_TRAINING.test(en.name)
  ) {
    dropped.rejected++
    continue
  }
  if (existing.has(norm(name))) {
    dropped.duplicate++
    continue
  }
  if (bySide.has(norm(name))) {
    dropped.sideMerged++
    continue
  }
  bySide.set(norm(name), true)

  const instructions = steps(en.description)
  if (!instructions.length) continue
  if (instructions.every((s) => NO_INSTRUCTIONS.test(s))) {
    dropped.noInstructions++
    continue
  }

  // exerciseinfo nests muscles as objects; the plain exercise endpoint sends bare ids.
  const categoryId = e.category?.id ?? e.category
  const tagged = [
    ...new Set(
      (e.muscles ?? [])
        .map((m) => MUSCLE[typeof m === 'object' ? m.id : m])
        .filter(Boolean),
    ),
  ]
  const fallback = MUSCLE_BY_CATEGORY[categoryId]
  const muscles = tagged.length ? tagged : fallback ? [fallback] : []
  // Mobility drills — neck circles, leg swings, arm rotations — are warm-up material, not
  // strength work. wger has no such category, so classify them here or they end up
  // proposed as the main exercise of a session.
  const dynamic = MOBILITY.test(en.name)
  const isStretch = dynamic || STATIC_STRETCH.test(haystack)
  const es = e.translations?.find((t) => t.language === ES)
  const lic = LICENSES[en.license] ?? LICENSES[2]

  out.push({
    id: `wger-${e.id}`,
    name,
    zone: ZONE_BY_CATEGORY[categoryId] ?? 'full',
    level: ADVANCED.test(name)
      ? 'expert'
      : isStretch
        ? 'beginner'
        : 'intermediate',
    category: isStretch ? 'stretching' : 'strength',
    ...(isStretch ? { stretchKind: dynamic ? 'dynamic' : 'static' } : {}),
    primaryMuscles: muscles,
    instructions,
    ...(es?.description
      ? { instructionsI18n: { es: steps(es.description) } }
      : {}),
    images: (e.images ?? []).map((i) => i.image).filter(Boolean),
    source: {
      name: 'wger',
      url: `https://wger.de/en/exercise/${e.id}/view/`,
      license: lic.name,
      licenseUrl: lic.url,
      author: en.license_author?.trim() || 'wger contributors',
      ...(en.license_author_url ? { authorUrl: en.license_author_url } : {}),
    },
  })
}

// Carry over translations from the previous run, keyed by id and only while the English
// source is unchanged — otherwise they would describe a different text. Without this, a
// re-import would silently discard every hand-written translation.
let kept = 0
if (existsSync(OUT)) {
  const previous = new Map(
    JSON.parse(readFileSync(OUT, 'utf8')).map((e) => [e.id, e]),
  )
  for (const ex of out) {
    const prev = previous.get(ex.id)
    if (!prev?.instructionsI18n) continue
    if (JSON.stringify(prev.instructions) !== JSON.stringify(ex.instructions))
      continue
    ex.instructionsI18n = { ...prev.instructionsI18n, ...ex.instructionsI18n }
    kept++
  }
}

mkdirSync('src/data', { recursive: true })
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')

const withImg = out.filter((e) => e.images.length).length
const withEs = out.filter((e) => e.instructionsI18n?.es).length
console.log(`wrote ${out.length} exercises from wger`)
console.log(`  kept translations for: ${kept}`)
console.log(`  with an image: ${withImg}`)
console.log(`  with official Spanish: ${withEs}`)
console.log(`  dropped: ${JSON.stringify(dropped)}`)
