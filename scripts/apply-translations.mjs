// Merge hand-written translations into the catalogs.
//
// Input is a JSON file shaped { "<exercise id>": { "<locale>": ["step", ...] } }.
//
// Step counts need not match the English source: wger's own Spanish differs from its
// English for 39 exercises, and the UI renders whatever the locale provides. What is
// checked is that the value is a non-empty list of non-empty strings, and unknown ids are
// reported — so a malformed batch is refused rather than silently corrupting a catalog.
//
//   node scripts/apply-translations.mjs <batch.json> [...]
//
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const FILES = ['src/data/exercises.json', 'src/data/exercises.wger.json']
const batches = process.argv.slice(2)
if (!batches.length) {
  console.error('usage: node scripts/apply-translations.mjs <batch.json> [...]')
  process.exit(2)
}

const incoming = new Map()
for (const b of batches) {
  for (const [id, locales] of Object.entries(
    JSON.parse(readFileSync(b, 'utf8')),
  )) {
    incoming.set(id, { ...(incoming.get(id) ?? {}), ...locales })
  }
}

let applied = 0
const problems = []
const unseen = new Set(incoming.keys())

for (const file of FILES) {
  if (!existsSync(file)) continue
  const data = JSON.parse(readFileSync(file, 'utf8'))
  let changed = false

  for (const ex of data) {
    const add = incoming.get(ex.id)
    if (!add) continue
    unseen.delete(ex.id)

    for (const [loc, steps] of Object.entries(add)) {
      const ok =
        Array.isArray(steps) &&
        steps.length > 0 &&
        steps.every((s) => typeof s === 'string' && s.trim())
      if (!ok) {
        problems.push(`${ex.id}/${loc}: not a non-empty list of strings`)
        continue
      }
      ex.instructionsI18n ??= {}
      ex.instructionsI18n[loc] = steps
      applied++
      changed = true
    }
  }

  if (changed) writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
}

for (const id of unseen) problems.push(`${id}: no such exercise`)
console.log(`applied ${applied} translations`)
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
