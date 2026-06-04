// Placeholder: writes an empty exercise catalog if none exists yet.
// Task 1 replaces this with the real generator.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const out = new URL('../src/data/exercises.json', import.meta.url)
const outPath = out.pathname

if (!existsSync(outPath)) {
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, '[]\n')
}
