import { writable } from 'svelte/store'

export type Cue = 'work' | 'rest' | 'tick' | 'finish'

const KEY = 'ekin:sound'

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

function createSoundEnabled() {
  const { subscribe, set } = writable<boolean>(read())
  return {
    subscribe,
    set: (on: boolean) => {
      try {
        localStorage.setItem(KEY, on ? 'on' : 'off')
      } catch {
        /* ignore */
      }
      set(on)
    },
  }
}

export const soundEnabled = createSoundEnabled()

let enabled = true
soundEnabled.subscribe((on) => (enabled = on))

type AudioContextCtor = new () => AudioContext

let ctx: AudioContext | null = null

function context(): AudioContext | null {
  if (ctx) return ctx
  try {
    const global = globalThis as {
      AudioContext?: AudioContextCtor
      webkitAudioContext?: AudioContextCtor
    }
    const Ctor = global.AudioContext ?? global.webkitAudioContext
    if (Ctor) ctx = new Ctor()
  } catch {
    ctx = null
  }
  return ctx
}

/**
 * iOS Safari only lets an AudioContext start from inside a user gesture, and a context
 * created outside one stays suspended forever. Call this synchronously from a click
 * handler (start session, toggle sound) so the first real cue is actually audible.
 */
export function primeSound(): void {
  const ac = context()
  if (!ac) return
  try {
    ac.resume().catch(() => {})
  } catch {
    /* ignore */
  }
}

type Note = { freq: number; at: number; dur: number }

// The phone is on the floor and out of sight, so the cues have to be told apart by
// shape alone: rising for go, low for stop, a pinprick for the countdown.
const CUES: Record<Cue, Note[]> = {
  work: [
    { freq: 660, at: 0, dur: 0.12 },
    { freq: 990, at: 0.13, dur: 0.18 },
  ],
  rest: [{ freq: 330, at: 0, dur: 0.26 }],
  tick: [{ freq: 1320, at: 0, dur: 0.05 }],
  finish: [
    { freq: 523, at: 0, dur: 0.14 },
    { freq: 659, at: 0.15, dur: 0.14 },
    { freq: 784, at: 0.3, dur: 0.26 },
  ],
}

const PEAK = 0.22
const ATTACK = 0.01
const SILENT = 0.0001 // exponential ramps cannot reach 0

function playNote(ac: AudioContext, note: Note, start: number): void {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(note.freq, start)
  gain.gain.setValueAtTime(SILENT, start)
  gain.gain.exponentialRampToValueAtTime(PEAK, start + ATTACK)
  gain.gain.exponentialRampToValueAtTime(SILENT, start + note.dur)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(start)
  osc.stop(start + note.dur)
}

export function playCue(cue: Cue): void {
  if (!enabled) return
  const ac = context()
  if (!ac) return
  try {
    const now = ac.currentTime
    for (const note of CUES[cue]) playNote(ac, note, now + note.at)
  } catch {
    /* ignore */
  }
}
