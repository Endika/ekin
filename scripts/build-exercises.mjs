import { writeFileSync, mkdirSync } from 'node:fs'

const SRC =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const IMG_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

const ZONE_BY_MUSCLE = {
  chest: 'upper',
  shoulders: 'upper',
  triceps: 'upper',
  biceps: 'upper',
  'middle back': 'upper',
  'lower back': 'core',
  lats: 'upper',
  traps: 'upper',
  forearms: 'upper',
  neck: 'upper',
  abdominals: 'core',
  quadriceps: 'legs',
  hamstrings: 'legs',
  calves: 'legs',
  glutes: 'legs',
  adductors: 'legs',
  abductors: 'legs',
}

const res = await fetch(SRC)
if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
const all = await res.json()

const bodyweight = all
  .filter((e) => e.equipment === 'body only' || e.equipment === null)
  .map((e) => {
    const primary = e.primaryMuscles?.[0]
    return {
      id: e.id,
      name: e.name,
      zone: ZONE_BY_MUSCLE[primary] ?? 'full',
      level: e.level,
      primaryMuscles: e.primaryMuscles ?? [],
      instructions: e.instructions ?? [],
      images: (e.images ?? []).map((p) => IMG_BASE + p),
    }
  })

mkdirSync('src/data', { recursive: true })
writeFileSync('src/data/exercises.json', JSON.stringify(bodyweight, null, 2))
console.log(`wrote ${bodyweight.length} bodyweight exercises`)
