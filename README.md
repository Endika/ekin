# Ekin

Bodyweight home-workout PWA: offline-first, mobile-first, build your own routines and train anywhere — no equipment, no account.

## Features

- Build custom routines from a searchable exercise library
- Guided workout sessions with timers and progress tracking
- Fully offline after first load (installable PWA)
- Mobile-first UI
- Local-only data, stored on your device

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build is emitted to `dist/`.

## Tech stack

- Svelte 5 + Vite + TypeScript
- PWA (service worker + manifest via `vite-plugin-pwa`)
- IndexedDB for local persistence

## Credits

Exercise data from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (MIT).
