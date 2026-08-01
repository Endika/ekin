// Build-time translation of exercise instructions into the 6-locale set.
//
// One-off / occasional: run it once with your own Gemini key, then commit the
// updated catalogs. It is idempotent and resumable — it skips exercises already
// translated for a locale and saves after each exercise, so a crash or
// rate-limit loses no completed work. English (`instructions`) is the source and
// is never overwritten, and neither is wger's own human-written Spanish.
//
//   GEMINI_API_KEY=... npm run translate-instructions
//
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

// Both catalogs. Translations of wger text are adaptations of CC-BY-SA content and are
// published under that same licence — see NOTICE.md.
const FILES = ['src/data/exercises.json', 'src/data/exercises.wger.json']
const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const LOCALES = {
  es: 'Spanish (Spain)',
  eu: 'Basque (Euskara)',
  gl: 'Galician',
  ca: 'Catalan',
  va: 'Valencian (the Valencian variant of Catalan)',
}

const key = process.env.GEMINI_API_KEY
if (!key) {
  console.error('Set GEMINI_API_KEY in the environment.')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function translate(steps, localeName, attempt = 0) {
  const prompt = [
    `Translate these bodyweight-exercise instruction steps into ${localeName}.`,
    'Keep the fitness terminology natural and the imperative tone.',
    'Return ONLY a JSON array of strings, same length and order as the input.',
    'No prose, no markdown, no numbering.',
    '',
    JSON.stringify(steps),
  ].join('\n')

  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })

  if (res.status === 429 && attempt < 5) {
    await sleep(2000 * (attempt + 1))
    return translate(steps, localeName, attempt + 1)
  }
  if (!res.ok) throw new Error(`http ${res.status}`)

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const match = text.match(/\[[\s\S]*\]/)
  const arr = JSON.parse(match ? match[0] : text)
  if (!Array.isArray(arr) || arr.length !== steps.length)
    throw new Error('unexpected shape')
  return arr.map(String)
}

let translated = 0
let skipped = 0
let failed = 0

for (const file of FILES) {
  if (!existsSync(file)) continue
  const data = JSON.parse(readFileSync(file, 'utf8'))
  console.log(`\n${file} — ${data.length} exercises`)

  for (const ex of data) {
    if (!ex.instructions?.length) continue
    ex.instructionsI18n ??= {}
    let changed = false

    for (const [loc, name] of Object.entries(LOCALES)) {
      // Anything already there is kept — including wger's own Spanish, which is
      // human-written and better than a machine pass over it.
      if (ex.instructionsI18n[loc]?.length) {
        skipped++
        continue
      }
      try {
        ex.instructionsI18n[loc] = await translate(ex.instructions, name)
        translated++
        changed = true
        await sleep(150) // gentle pacing
      } catch (err) {
        failed++
        console.warn(`skip ${ex.id}/${loc}: ${err.message}`)
      }
    }

    if (changed) writeFileSync(file, JSON.stringify(data, null, 2) + '\n') // resumable
  }
}

console.log(`\ntranslated ${translated}, skipped ${skipped}, failed ${failed}`)
