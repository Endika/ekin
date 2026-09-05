import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { mount, unmount, tick } from 'svelte'
import { locale, waitLocale } from 'svelte-i18n'
import '../../src/i18n'
import App from '../../src/routes/App.svelte'

/**
 * The settings sheet is a modal dialog, so it is driven here the way a keyboard user
 * drives it: through the real gear button in the real app shell. Nothing is stubbed —
 * the assertions are on where focus actually landed and on whether the dialog is still
 * in the document.
 */
let cleanup: (() => void) | undefined

function openApp() {
  const target = document.createElement('div')
  document.body.appendChild(target)
  const instance = mount(App, { target })
  cleanup = () => {
    unmount(instance)
    target.remove()
  }
  return target
}

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]')

/** The gear in the app header — the control that opens the sheet. */
const gear = (target: HTMLElement) =>
  target.querySelector<HTMLButtonElement>('header.brand button.gear')!

async function openSettings(target: HTMLElement) {
  const opener = gear(target)
  opener.focus()
  opener.click()
  await tick()
  return opener
}

function press(key: string, shiftKey = false) {
  document.activeElement!.dispatchEvent(
    new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }),
  )
}

beforeAll(async () => {
  locale.set('es')
  await waitLocale()
})

afterEach(async () => {
  cleanup?.()
  cleanup = undefined
  await tick()
})

describe('Settings as a modal dialog', () => {
  it('moves focus into the dialog when it opens', async () => {
    const target = openApp()
    await openSettings(target)

    expect(dialog()).not.toBeNull()
    expect(document.activeElement).toBe(dialog())
  })

  it('closes on Escape and hands focus back to the gear that opened it', async () => {
    const target = openApp()
    const opener = await openSettings(target)

    press('Escape')
    await tick()

    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('hands focus back when the close button is used', async () => {
    const target = openApp()
    const opener = await openSettings(target)

    const close = dialog()!.querySelector<HTMLButtonElement>('button.close')!
    close.focus() // a real click focuses the button; jsdom's does not
    close.click()
    await tick()

    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('wraps Tab from the last control back to the first', async () => {
    const target = openApp()
    await openSettings(target)

    const stops = [
      ...dialog()!.querySelectorAll<HTMLElement>('button, input, select, a'),
    ].filter((el) => !el.matches(':disabled'))
    expect(stops.length).toBeGreaterThan(1)

    stops[stops.length - 1].focus()
    press('Tab')

    expect(document.activeElement).toBe(stops[0])
  })

  it('wraps Shift+Tab from the top of the dialog to the last control', async () => {
    const target = openApp()
    await openSettings(target)

    const stops = [
      ...dialog()!.querySelectorAll<HTMLElement>('button, input, select, a'),
    ].filter((el) => !el.matches(':disabled'))

    // Focus is still on the dialog container, where it landed on open.
    expect(document.activeElement).toBe(dialog())
    press('Tab', true)

    expect(document.activeElement).toBe(stops[stops.length - 1])
  })
})
