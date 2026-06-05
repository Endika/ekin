<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Icon from './Icon.svelte'
  import LocaleSelect from './LocaleSelect.svelte'
  import { geminiKey } from '../stores/settings'

  let { onclose }: { onclose: () => void } = $props()
  let keyInput = $state($geminiKey)
</script>

<div
  class="backdrop"
  role="presentation"
  onclick={(e) => {
    if (e.target === e.currentTarget) onclose()
  }}
>
  <section
    class="sheet"
    role="dialog"
    aria-modal="true"
    aria-label={$_('settings.title')}
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
  </section>
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
