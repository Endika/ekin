# Ekin

> Bodyweight home workouts — build your own routines, train anywhere. No equipment, no account, offline-first.

**[Try it now →](https://endika.github.io/ekin/)**

[![Latest release](https://img.shields.io/github/v/release/Endika/ekin?style=flat-square&color=FF3D6E&label=release)](https://github.com/Endika/ekin/releases/latest)
[![CI](https://img.shields.io/github/actions/workflow/status/Endika/ekin/ci.yml?style=flat-square&label=ci&branch=main)](https://github.com/Endika/ekin/actions/workflows/ci.yml)
[![Last commit](https://img.shields.io/github/last-commit/Endika/ekin?style=flat-square)](https://github.com/Endika/ekin/commits/main)
[![Conventional Commits](https://img.shields.io/badge/conventional_commits-1.0.0-FE5196?style=flat-square)](https://www.conventionalcommits.org)
[![License: MIT](https://img.shields.io/github/license/Endika/ekin?style=flat-square&color=10B981)](./LICENSE)

## What you can do

- Build your own workout by hand: pick a zone, add bodyweight exercises from a searchable library, set sets/reps/rest.
- **Auto-fill** a routine in one tap from a zone, time budget and level — then edit anything.
- **Reuse** saved workouts: load a past routine back into the builder and tweak it.
- Train with a guided session player — timer, rest countdown, exercise demo, and on-screen wake-lock so the screen never sleeps mid-set.
- Log the reps you actually did, then track **progress**: current streak, totals, and a per-exercise rep-evolution chart.
- **Optional AI assistant** (Gemini): bring your own API key to swap an exercise or make a workout easier/harder. Hidden entirely without a key — nothing else needs the network.
- Available in **6 languages**: English, Spanish, Basque, Galician, Catalan and Valencian (auto-detected, switchable in Settings).
- Works **offline** after first load. Install it as a PWA on your phone.
- Local-only data, stored on your device. No signup, no email, no backend.

## How to start

1. Open [Ekin](https://endika.github.io/ekin/) on your phone.
2. Name your workout, pick a zone, and add a few exercises.
3. Tap **Start** and train.

## Install on your device

Open the site in your browser and choose **Add to Home Screen** (iOS Safari) or **Install** (Chrome/Android). It runs full-screen and works offline.

## Tech stack

- Svelte 5 + Vite + TypeScript
- PWA (service worker + manifest via `vite-plugin-pwa`), self-hosted fonts, offline-first
- IndexedDB for local persistence
- `svelte-i18n` for localization; optional direct-to-Gemini AI assist (browser-side, user's own key)

## Development

```bash
npm install
npm run dev      # local dev server
npm run check    # lint + typecheck + tests
npm run build    # production build to dist/
```

`npm run sync-exercises` refreshes the bundled exercise catalog; `npm run icons` regenerates the PWA icons from `public/favicon.svg`.

## Credits

Exercise data from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (MIT).
