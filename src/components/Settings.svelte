<script lang="ts">
  import { _ } from 'svelte-i18n'
  import Icon from './Icon.svelte'
  import LocaleSelect from './LocaleSelect.svelte'

  let { onclose }: { onclose: () => void } = $props()
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
</style>
