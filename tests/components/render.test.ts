import { describe, it, expect, beforeAll } from 'vitest'
import { mount, unmount } from 'svelte'
import { get } from 'svelte/store'
import { locale, waitLocale, _ } from 'svelte-i18n'
import '../../src/i18n'
import SessionPlayer from '../../src/components/SessionPlayer.svelte'
import ImageLightbox from '../../src/components/ImageLightbox.svelte'
import Settings from '../../src/components/Settings.svelte'
import { loadCatalog, chainNeighbours } from '../../src/domain/catalog'
import { autofill } from '../../src/domain/autofill'
import type { Workout } from '../../src/domain/types'

/**
 * These mount the real components against the real catalog and read the DOM they produce.
 * The pixels are not checked — but "does the player label the warm-up block", "does the
 * preview offer a next rung", "does Settings credit wger" are answered by the markup.
 */
async function render(Component: unknown, props: Record<string, unknown>) {
  const target = document.createElement('div')
  document.body.appendChild(target)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance = mount(Component as any, { target, props })
  await new Promise((r) => setTimeout(r, 0))
  return {
    text: () => target.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    html: () => target.innerHTML,
    destroy: () => unmount(instance),
  }
}

beforeAll(async () => {
  locale.set('es')
  await waitLocale()
})

/** The rendered copy for a key, so a wording edit in the locale files cannot break a test. */
const t = (key: string, values?: Record<string, string | number>) =>
  get(_)(key, values ? { values } : undefined)

describe('SessionPlayer', () => {
  it('labels the warm-up block on the first item', async () => {
    const workout = autofill(loadCatalog(), {
      zone: 'legs',
      minutes: 30,
      level: 'intermediate',
    })
    expect(workout.items[0].block).toBe('warmup')

    const view = await render(SessionPlayer, { workout, onfinish: () => {} })
    expect(view.text()).toContain(t('block.warmup'))
    view.destroy()
  })

  it('shows the set counter once the main block starts', async () => {
    const cat = loadCatalog()
    const mainOnly: Workout = {
      id: 'w',
      name: 'W',
      zone: 'legs',
      createdAt: 0,
      items: [
        {
          exerciseId: cat.find((e) => e.category === 'strength')!.id,
          sets: 3,
          reps: 10,
          restSeconds: 30,
          block: 'main',
        },
      ],
    }
    const view = await render(SessionPlayer, {
      workout: mainOnly,
      onfinish: () => {},
    })
    const text = view.text()
    expect(text).toContain(t('player.set', { n: 1, total: 3 }))
    expect(text).not.toContain(t('block.warmup'))
    view.destroy()
  })
})

describe('ImageLightbox', () => {
  it('offers the next rung of a progression chain', async () => {
    const cat = loadCatalog()
    const exercise = cat.find(
      (e) => e.chain?.id === 'push' && e.chain.step === 1,
    )!
    const { next } = chainNeighbours(cat, exercise)
    expect(next).toBeDefined()

    const view = await render(ImageLightbox, {
      image: exercise.images[0] ?? '',
      name: exercise.name,
      instructions: exercise.instructions,
      exercise,
      onclose: () => {},
    })
    const text = view.text()
    expect(text).toContain(t('exercise.nextLevel'))
    expect(text).toContain(next!.name)
    view.destroy()
  })

  it('credits the author and licence of an imported exercise', async () => {
    const exercise = loadCatalog().find((e) => e.source)!
    const view = await render(ImageLightbox, {
      image: exercise.images[0] ?? '',
      name: exercise.name,
      instructions: exercise.instructions,
      exercise,
      onclose: () => {},
    })
    const text = view.text()
    expect(text).toContain(exercise.source!.author)
    expect(text).toContain('wger')
    expect(text).toMatch(/CC-BY/)
    view.destroy()
  })
})

describe('ImageLightbox without an image', () => {
  it('still shows the instructions', async () => {
    // A good chunk of the catalog ships without an image; instructions must stay reachable.
    const exercise = loadCatalog().find(
      (e) => !e.images.length && e.instructions.length,
    )!
    const view = await render(ImageLightbox, {
      image: '',
      name: exercise.name,
      instructions: exercise.instructions,
      exercise,
      onclose: () => {},
    })
    expect(view.text()).toContain(exercise.instructions[0].slice(0, 40))
    expect(view.html()).not.toContain('<img') // placeholder, not a broken image
    view.destroy()
  })
})

describe('Settings', () => {
  it('shows the credits screen naming wger and CC-BY-SA', async () => {
    const view = await render(Settings, { onclose: () => {} })
    const text = view.text()
    expect(text).toContain(t('settings.credits'))
    expect(text).toContain('wger')
    expect(text).toContain('CC-BY-SA')
    expect(text).toContain('free-exercise-db')
    view.destroy()
  })
})
