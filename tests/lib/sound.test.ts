import { describe, it, expect, beforeEach, vi } from 'vitest'
import { get } from 'svelte/store'

type Ramp = { value: number; time: number }

class FakeParam {
  value = 0
  ramps: Ramp[] = []
  sets: Ramp[] = []
  setValueAtTime(value: number, time: number) {
    this.value = value
    this.sets.push({ value, time })
  }
  exponentialRampToValueAtTime(value: number, time: number) {
    this.ramps.push({ value, time })
  }
}

class FakeOscillator {
  type = ''
  frequency = new FakeParam()
  startedAt: number | null = null
  stoppedAt: number | null = null
  connectedTo: unknown[] = []
  connect(node: unknown) {
    this.connectedTo.push(node)
    return node
  }
  start(time: number) {
    this.startedAt = time
  }
  stop(time: number) {
    this.stoppedAt = time
  }
}

class FakeGain {
  gain = new FakeParam()
  connectedTo: unknown[] = []
  connect(node: unknown) {
    this.connectedTo.push(node)
    return node
  }
}

class FakeAudioContext {
  static created: FakeAudioContext[] = []
  currentTime = 10
  destination = { name: 'destination' }
  state = 'suspended'
  resumeCalls = 0
  oscillators: FakeOscillator[] = []
  gains: FakeGain[] = []

  constructor() {
    FakeAudioContext.created.push(this)
  }
  createOscillator() {
    const osc = new FakeOscillator()
    this.oscillators.push(osc)
    return osc
  }
  createGain() {
    const gain = new FakeGain()
    this.gains.push(gain)
    return gain
  }
  resume() {
    this.resumeCalls++
    this.state = 'running'
    return Promise.resolve()
  }
}

const global = globalThis as { AudioContext?: unknown }

function installAudio(): void {
  FakeAudioContext.created = []
  global.AudioContext = FakeAudioContext
}

function only(): FakeAudioContext {
  expect(FakeAudioContext.created).toHaveLength(1)
  return FakeAudioContext.created[0]
}

// The module caches its AudioContext and reads localStorage once at import time, so every
// test needs a fresh copy of it rather than a shared singleton.
async function loadSound() {
  vi.resetModules()
  return import('../../src/lib/sound')
}

beforeEach(() => {
  localStorage.clear()
  installAudio()
})

describe('playCue', () => {
  it('plays audible notes when sound is enabled', async () => {
    const { playCue } = await loadSound()
    playCue('work')

    const ac = only()
    expect(ac.oscillators.length).toBeGreaterThan(0)
    for (const osc of ac.oscillators) {
      expect(osc.startedAt).not.toBeNull()
      expect(osc.stoppedAt).toBeGreaterThan(osc.startedAt!)
    }
  })

  it('plays nothing when sound is disabled', async () => {
    const { playCue, soundEnabled } = await loadSound()
    soundEnabled.set(false)
    playCue('work')
    playCue('finish')

    expect(FakeAudioContext.created).toHaveLength(0)
  })

  it('resumes playing when sound is switched back on', async () => {
    const { playCue, soundEnabled } = await loadSound()
    soundEnabled.set(false)
    playCue('tick')
    soundEnabled.set(true)
    playCue('tick')

    expect(only().oscillators).toHaveLength(1)
  })

  it('gives each cue a distinguishable shape', async () => {
    const { playCue } = await loadSound()
    let played = 0
    const notes = (cue: 'work' | 'rest' | 'tick' | 'finish') => {
      playCue(cue)
      const fresh = only().oscillators.slice(played)
      played += fresh.length
      return fresh
    }

    const work = notes('work')
    const rest = notes('rest')
    const tick = notes('tick')
    const finish = notes('finish')

    const opening = (n: FakeOscillator[]) => n[0].frequency.value
    const closing = (n: FakeOscillator[]) => n[n.length - 1].frequency.value
    for (const cue of [work, rest, tick, finish])
      expect(cue.length).toBeGreaterThan(0)

    // go and finish climb; stop sits below go; no two cues open on the same pitch
    expect(closing(work)).toBeGreaterThan(opening(work))
    expect(closing(finish)).toBeGreaterThan(opening(finish))
    expect(opening(rest)).toBeLessThan(opening(work))
    const openings = [work, rest, tick, finish].map(opening)
    expect(new Set(openings).size).toBe(openings.length)
  })

  it('keeps the tick short and high so it never bleeds into the phase cue', async () => {
    const { playCue } = await loadSound()
    playCue('tick')
    playCue('rest')
    const [tick, rest] = only().oscillators

    expect(tick.stoppedAt! - tick.startedAt!).toBeLessThan(0.1)
    expect(tick.frequency.value).toBeGreaterThan(rest.frequency.value)
  })

  it('shapes every note with an attack and a decay instead of a hard switch', async () => {
    const { playCue } = await loadSound()
    playCue('finish')

    const ac = only()
    expect(ac.gains.length).toBeGreaterThan(0)
    expect(ac.gains).toHaveLength(ac.oscillators.length) // one envelope per note
    for (const gain of ac.gains) {
      const [attack, decay] = gain.gain.ramps
      expect(gain.gain.sets[0].value).toBeLessThan(attack.value)
      expect(decay.value).toBeLessThan(attack.value)
      expect(decay.time).toBeGreaterThan(attack.time)
    }
    for (const gain of ac.gains)
      expect(gain.connectedTo).toContain(ac.destination)
  })

  it('finishes every cue well inside 600ms', async () => {
    for (const cue of ['work', 'rest', 'tick', 'finish'] as const) {
      FakeAudioContext.created = []
      const { playCue } = await loadSound()
      playCue(cue)
      const ac = only()
      const end = Math.max(...ac.oscillators.map((o) => o.stoppedAt!))
      expect(end - ac.currentTime).toBeLessThan(0.6)
    }
  })

  it('reuses a single AudioContext across cues', async () => {
    const { playCue, primeSound } = await loadSound()
    primeSound()
    playCue('work')
    playCue('rest')

    expect(FakeAudioContext.created).toHaveLength(1)
  })
})

describe('primeSound', () => {
  it('creates and resumes the context', async () => {
    const { primeSound } = await loadSound()
    primeSound()

    expect(only().resumeCalls).toBe(1)
    expect(only().state).toBe('running')
  })

  it('is safe to call repeatedly', async () => {
    const { primeSound } = await loadSound()
    primeSound()
    primeSound()
    primeSound()

    expect(only().state).toBe('running')
  })

  it('swallows a rejected resume', async () => {
    class Blocked extends FakeAudioContext {
      resume() {
        this.resumeCalls++
        return Promise.reject(new Error('autoplay blocked'))
      }
    }
    global.AudioContext = Blocked

    const { primeSound, playCue } = await loadSound()
    expect(() => primeSound()).not.toThrow()
    expect(() => playCue('work')).not.toThrow()
  })

  it('survives a constructor that throws', async () => {
    global.AudioContext = class {
      constructor() {
        throw new Error('no audio hardware')
      }
    }

    const { primeSound, playCue } = await loadSound()
    expect(() => primeSound()).not.toThrow()
    expect(() => playCue('finish')).not.toThrow()
  })
})

describe('without WebAudio', () => {
  it('does not throw when AudioContext is absent', async () => {
    delete global.AudioContext

    const { primeSound, playCue } = await loadSound()
    expect(() => primeSound()).not.toThrow()
    for (const cue of ['work', 'rest', 'tick', 'finish'] as const) {
      expect(() => playCue(cue)).not.toThrow()
    }
  })

  it('falls back to the webkit-prefixed constructor', async () => {
    delete global.AudioContext
    const prefixed = globalThis as { webkitAudioContext?: unknown }
    prefixed.webkitAudioContext = FakeAudioContext

    const { playCue } = await loadSound()
    playCue('rest')
    delete prefixed.webkitAudioContext

    expect(only().oscillators).toHaveLength(1)
  })
})

describe('soundEnabled', () => {
  it('defaults to on when nothing is stored', async () => {
    const { soundEnabled } = await loadSound()
    expect(get(soundEnabled)).toBe(true)
  })

  it('round-trips through localStorage', async () => {
    const first = await loadSound()
    first.soundEnabled.set(false)
    expect(get(first.soundEnabled)).toBe(false)

    const reloaded = await loadSound()
    expect(get(reloaded.soundEnabled)).toBe(false)

    reloaded.soundEnabled.set(true)
    const again = await loadSound()
    expect(get(again.soundEnabled)).toBe(true)
  })

  it('defaults to on when localStorage is unavailable', async () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('storage disabled')
      },
    })

    try {
      const { soundEnabled, playCue } = await loadSound()
      expect(get(soundEnabled)).toBe(true)
      expect(() => soundEnabled.set(false)).not.toThrow()
      expect(get(soundEnabled)).toBe(false)
      expect(() => playCue('work')).not.toThrow()
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original)
    }
  })
})
