<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import Icon from './Icon.svelte'
  import LocaleSelect from './LocaleSelect.svelte'
  import { geminiKey } from '../stores/settings'
  import { theme, type Theme } from '../stores/theme'
  import { allExercises } from '../stores/catalog-store'
  import { playCue, primeSound, soundEnabled } from '../lib/sound'

  let { onclose }: { onclose: () => void } = $props()
  let keyInput = $state($geminiKey)
  let sheet = $state<HTMLElement>()

  // Hand-rolled rather than a native `<dialog>` + `showModal()`: the sheet is laid out by
  // the backdrop it lives in, and jsdom 30 ships `HTMLDialogElement` with only `open` on
  // it — no `showModal`, no `close` — so the native path would both need the backdrop
  // rebuilt around `::backdrop` and be impossible to cover in this suite.
  onMount(() => {
    // Snapshot the opener before we move focus, and hand it back on close.
    const opener = document.activeElement
    sheet?.focus()
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  })

  const FOCUSABLE =
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

  /** Tabbable children, in DOM order. Disabled controls (the empty key's Clear) are out. */
  function tabbables() {
    return [...(sheet?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
      (el) => !el.matches(':disabled') && el.tabIndex >= 0,
    )
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onclose()
      return
    }
    if (e.key !== 'Tab' || !sheet) return
    const stops = tabbables()
    if (!stops.length) {
      e.preventDefault()
      sheet.focus()
      return
    }
    const first = stops[0]
    const last = stops[stops.length - 1]
    // The sheet itself only holds focus right after opening, and Shift+Tab from there
    // has to wrap to the end rather than escape backwards into the page.
    const atStart =
      document.activeElement === first || document.activeElement === sheet
    if (e.shiftKey && atStart) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // CC-BY-SA requires attribution in the medium the work is distributed in — for an app,
  // a visible credits screen. Counted from the data so it cannot drift.
  const attributed = allExercises.filter((e) => e.source)
  const wgerCount = attributed.length
  const wgerAuthors = new Set(attributed.map((e) => e.source!.author)).size

  const themes: { value: Theme; icon: 'monitor' | 'sun' | 'moon' }[] = [
    { value: 'system', icon: 'monitor' },
    { value: 'light', icon: 'sun' },
    { value: 'dark', icon: 'moon' },
  ]

  function setSound(on: boolean) {
    // Toggling here is a guaranteed user gesture, so it is our best chance to unlock
    // the AudioContext on iOS before the session player needs it.
    if (on) primeSound()
    soundEnabled.set(on)
    if (on) playCue('work') // after set(), or playCue bails out as still-muted
  }
</script>

<div
  class="backdrop"
  role="presentation"
  onclick={(e) => {
    if (e.target === e.currentTarget) onclose()
  }}
  {onkeydown}
>
  <div
    class="sheet"
    role="dialog"
    aria-modal="true"
    aria-label={$_('settings.title')}
    tabindex="-1"
    bind:this={sheet}
  >
    <header>
      <h2>{$_('settings.title')}</h2>
      <button class="close" onclick={onclose} aria-label={$_('settings.title')}>
        <Icon name="x" size={20} />
      </button>
    </header>

    <label class="field">
      <span>{$_('settings.language')}</span>
      <LocaleSelect />
    </label>

    <div class="field">
      <span>{$_('settings.theme')}</span>
      <div class="seg" role="group" aria-label={$_('settings.theme')}>
        {#each themes as t (t.value)}
          <button
            class:active={$theme === t.value}
            onclick={() => theme.set(t.value)}
          >
            <Icon name={t.icon} size={16} />
            {$_('theme.' + t.value)}
          </button>
        {/each}
      </div>
    </div>

    <div class="field">
      <label class="switch-row">
        <span class="glyph" class:on={$soundEnabled}>
          <Icon name={$soundEnabled ? 'volume' : 'volume-off'} size={18} />
        </span>
        <span class="name">{$_('settings.sound')}</span>
        <input
          class="switch"
          type="checkbox"
          role="switch"
          checked={$soundEnabled}
          onchange={(e) => setSound(e.currentTarget.checked)}
        />
      </label>
      <small>{$_('settings.soundHint')}</small>
    </div>

    <label class="field">
      <span>{$_('settings.aiKey')}</span>
      <div class="key-row">
        <input
          type="password"
          autocomplete="off"
          placeholder={$_('settings.aiKeyPlaceholder')}
          bind:value={keyInput}
          onchange={() => geminiKey.set(keyInput)}
          onblur={() => geminiKey.set(keyInput)}
        />
        <button
          class="clear"
          onclick={() => {
            geminiKey.clear()
            keyInput = ''
          }}
          disabled={!keyInput}
        >
          {$_('settings.clear')}
        </button>
      </div>
      <small>{$_('settings.aiKeyHint')}</small>
    </label>

    <div class="field credits">
      <span>{$_('settings.credits')}</span>
      <small>
        {$_('settings.creditsFree')}
        <a
          href="https://github.com/yuhonas/free-exercise-db"
          target="_blank"
          rel="noreferrer">free-exercise-db</a
        >
        ({$_('settings.publicDomain')}).
      </small>
      <small>
        {$_('settings.creditsWger', { values: { count: wgerCount } })}
        <a href="https://wger.de" target="_blank" rel="noreferrer">wger</a>
        —
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer">CC-BY-SA</a
        >, {$_('settings.creditsAuthors', {
          values: { count: wgerAuthors },
        })}
      </small>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }
  .sheet {
    width: 100%;
    max-width: 720px;
    display: grid;
    gap: 1rem;
    padding: 1.25rem 1.25rem max(1.25rem, env(safe-area-inset-bottom));
    border-radius: var(--radius) var(--radius) 0 0;
    background: var(--bg);
    border: 1px solid var(--border);
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 800;
  }
  .close {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
  }
  .field {
    display: grid;
    gap: 0.4rem;
  }
  .field span {
    color: var(--muted);
    font-size: 0.85rem;
  }
  .field small {
    color: var(--muted);
    font-size: 0.75rem;
    line-height: 1.35;
  }
  .seg {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.4rem;
  }
  .seg button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-height: 44px;
    padding: 0 0.4rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--muted);
    font-weight: 600;
  }
  .seg button.active {
    background: var(--grad);
    border-color: transparent;
    color: #fff;
    box-shadow: var(--shadow-glow);
  }
  .switch-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 44px;
    cursor: pointer;
  }
  .switch-row .glyph {
    display: grid;
    place-items: center;
  }
  .switch-row .glyph.on {
    color: var(--accent);
  }
  .switch-row .name {
    flex: 1;
  }
  .switch {
    flex: none;
    appearance: none;
    width: 52px;
    height: 30px;
    margin: 0;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--surface-2);
  }
  .switch::after {
    content: '';
    display: block;
    width: 22px;
    height: 22px;
    margin: 3px;
    border-radius: var(--radius-pill);
    background: var(--muted);
  }
  .switch:checked {
    background: var(--grad);
    border-color: transparent;
    box-shadow: var(--shadow-glow);
  }
  .switch:checked::after {
    background: #fff;
    transform: translateX(22px);
  }
  @media (prefers-reduced-motion: no-preference) {
    .switch,
    .switch::after {
      transition:
        background 0.15s ease,
        transform 0.15s ease;
    }
  }
  .key-row {
    display: flex;
    gap: 0.5rem;
  }
  .key-row input {
    flex: 1;
    min-width: 0;
    min-height: 44px;
    padding: 0 0.7rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    font: inherit;
  }
  .key-row .clear {
    min-height: 44px;
    padding: 0 0.9rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--danger);
    font-weight: 600;
  }
  .key-row .clear:disabled {
    color: var(--muted);
    opacity: 0.6;
  }
</style>
