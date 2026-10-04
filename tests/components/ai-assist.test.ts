import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { mount, unmount, tick } from 'svelte'
import { get } from 'svelte/store'
import { locale, waitLocale, _ } from 'svelte-i18n'
import '../../src/i18n'
import AiAssist from '../../src/components/AiAssist.svelte'
import { builder } from '../../src/stores/builder'
import { geminiKey } from '../../src/stores/settings'
import { allExercises } from '../../src/stores/catalog-store'

const realFetch = globalThis.fetch
let cleanup: (() => void) | undefined

/** Hand-written fetch fake answering every request with one Google error. */
function googleFails(code: number, reason: string) {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: {
          code,
          message: 'English text that must not reach the user',
          status: 'PERMISSION_DENIED',
          details: [{ reason, domain: 'googleapis.com' }],
        },
      }),
      { status: code },
    )
}

const t = (key: string) => get(_)(key)

async function pressEasier() {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const instance = mount(AiAssist, { target })
  cleanup = () => {
    unmount(instance)
    target.remove()
  }
  await tick()
  target.querySelector<HTMLButtonElement>('button.head')!.click()
  await tick()
  const easier = [...target.querySelectorAll('button')].find(
    (b) => b.textContent?.trim() === t('ai.easier'),
  )!
  easier.click()
  for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0))
  return target
}

beforeAll(async () => {
  locale.set('es')
  await waitLocale()
})

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  globalThis.fetch = realFetch
  geminiKey.clear()
})

describe('AiAssist errors', () => {
  it('explains a disabled API in the user language, with a console link', async () => {
    geminiKey.set('AQ.' + 'x'.repeat(50))
    builder.reset('W', 'full')
    builder.add(allExercises[0].id)
    googleFails(403, 'SERVICE_DISABLED')

    const target = await pressEasier()
    const status = target.querySelector('.status.err')!
    expect(status.textContent).toContain(t('ai.errors.api_disabled'))
    expect(status.textContent).not.toContain('English text')
    const link = status.querySelector('a')!
    expect(link.href).toContain(
      'console.cloud.google.com/apis/library/generativelanguage.googleapis.com',
    )
    expect(link.textContent?.trim()).toBe(t('ai.errors.fix'))
  })

  it('keeps the generic message for a failure Google does not explain', async () => {
    geminiKey.set('AQ.' + 'x'.repeat(50))
    builder.reset('W', 'full')
    builder.add(allExercises[0].id)
    googleFails(500, 'SOMETHING_ELSE')

    const target = await pressEasier()
    const status = target.querySelector('.status.err')!
    expect(status.textContent?.trim()).toBe(t('ai.failed'))
    expect(status.querySelector('a')).toBeNull()
  })
})
