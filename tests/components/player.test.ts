import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest'
import { mount, unmount, tick } from 'svelte'
import { locale, waitLocale } from 'svelte-i18n'
import '../../src/i18n'
import SessionPlayer from '../../src/components/SessionPlayer.svelte'
import { soundEnabled } from '../../src/lib/sound'
import { loadCatalog } from '../../src/domain/catalog'
import type { Workout } from '../../src/domain/types'

/**
 * The player is where the timer, the cues and the markup meet, and only a mounted
 * component proves they meet correctly: that a warm-up in a rep workout counts itself
 * down, that the last three seconds beep and the phase change replaces the fourth beep,
 * and that muting really does silence a whole session.
 *
 * sound.ts is the real module — mocking it would only prove the player calls a mock. It
 * is WebAudio that is faked, one class recording every note the session actually plays.
 */
const notes: number[] = []
let resumes = 0

class FakeAudioContext {
  currentTime = 0
  destination = { name: 'destination' }
  createOscillator() {
    return {
      type: '',
      frequency: { setValueAtTime: (freq: number) => notes.push(freq) },
      connect: () => {},
      start: () => {},
      stop: () => {},
    }
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    }
  }
  resume() {
    resumes++
    return Promise.resolve()
  }
}
;(globalThis as { AudioContext?: unknown }).AudioContext = FakeAudioContext

const catalog = loadCatalog()
const stretch = catalog.find((e) => e.category === 'stretching')!
const lift = catalog.find((e) => e.category === 'strength')!

/** A rep workout that opens with a 5s warm-up hold — the screen D3 left nameless. */
const repWorkout = (): Workout => ({
  id: 'w',
  name: 'W',
  zone: 'legs',
  createdAt: 0,
  items: [
    {
      exerciseId: stretch.id,
      sets: 1,
      reps: 0,
      restSeconds: 0,
      workSeconds: 5,
      block: 'warmup',
    },
    {
      exerciseId: lift.id,
      sets: 2,
      reps: 10,
      restSeconds: 30,
      block: 'main',
    },
  ],
})

const timedWorkout = (): Workout => ({
  id: 't',
  name: 'T',
  zone: 'legs',
  createdAt: 0,
  mode: 'timed',
  rounds: 3,
  items: [
    {
      exerciseId: stretch.id,
      sets: 1,
      reps: 0,
      restSeconds: 0,
      workSeconds: 2,
      block: 'warmup',
    },
    {
      exerciseId: lift.id,
      sets: 0,
      reps: 0,
      workSeconds: 2,
      restSeconds: 0,
      block: 'main',
    },
  ],
})

// Static import and `await tick()`: a dynamic import after vi.resetModules() gives the
// test a second Svelte runtime, and flushSync() right after mount() runs outside the
// mount's effect scope — both die with effect_orphan.
function render(workout: Workout, onfinish: () => void = () => {}) {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const instance = mount(SessionPlayer, {
    target,
    props: { workout, onfinish },
  })
  return {
    text: () => target.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    html: () => target.innerHTML,
    count: () => target.querySelector('.count')?.textContent ?? '',
    destroy: () => unmount(instance),
  }
}

let view: ReturnType<typeof render> | undefined

async function step(seconds = 1) {
  for (let i = 0; i < seconds; i++) {
    await vi.advanceTimersByTimeAsync(1000)
    await tick()
  }
}

beforeAll(async () => {
  locale.set('en')
  await waitLocale()
})

beforeEach(() => {
  notes.length = 0
  resumes = 0
  soundEnabled.set(true)
  vi.useFakeTimers()
})

afterEach(() => {
  view?.destroy()
  view = undefined
  vi.useRealTimers()
})

describe('a warm-up hold in a rep workout', () => {
  it('counts itself down and then hands over to the first exercise', async () => {
    view = render(repWorkout())
    await tick()
    expect(view.count()).toBe('5')

    await step(4)
    expect(view.count()).toBe('1')

    await step()
    // The ring is gone: rep work is manual, and the set counter has taken over.
    expect(view.count()).toBe('')
    expect(view.text()).toContain(lift.name)
    expect(view.text()).toContain('Set 1/2')
  })

  it('names the stretch and shows it, instead of an anonymous countdown', async () => {
    view = render(repWorkout())
    await tick()

    const text = view.text()
    expect(text).toContain('Warm-up')
    expect(text).toContain(stretch.name)
    expect(view.html()).toContain('work-img')
    // The hold runs itself out; there is no set to report as done.
    expect(text).toContain('Skip')
    expect(text).not.toContain('Done set')
  })
})

describe('the cues of a countdown', () => {
  it('ticks the last three seconds and then plays the work cue', async () => {
    view = render(repWorkout())
    await tick()
    notes.length = 0 // the mount primes the context; the session has not sounded yet

    await step(5)
    // Three ticks at 3/2/1, then the rising two-note cue INSTEAD of a fourth tick.
    expect(notes).toEqual([1320, 1320, 1320, 660, 990])
  })

  it('unlocks the audio context as the session opens', async () => {
    view = render(repWorkout())
    await tick()

    expect(resumes).toBeGreaterThan(0)
  })
})

describe('a muted session', () => {
  it('plays nothing at all, and never even wakes the audio context', async () => {
    soundEnabled.set(false)
    view = render(timedWorkout())
    await tick()

    await step(12)
    expect(view.text()).toContain('Session complete')
    expect(notes).toEqual([])
    expect(resumes).toBe(0)
  })
})

describe('the header of a timed circuit', () => {
  it('labels the warm-up rather than counting a round it is not part of', async () => {
    view = render(timedWorkout())
    await tick()

    expect(view.text()).toContain('Warm-up')
    expect(view.text()).not.toContain('Round')

    // Into the main block, where the round counter is the honest label.
    await step(2)
    expect(view.text()).toContain('Round 1/3')
    expect(view.text()).not.toContain('Warm-up')
  })
})
