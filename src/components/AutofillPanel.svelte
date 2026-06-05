<script lang="ts">
  import { builder } from '../stores/builder'
  import { allExercises } from '../stores/catalog-store'
  import { autofill } from '../domain/autofill'
  import type { Level, Zone } from '../domain/types'
  import Icon from './Icon.svelte'
  import { _ } from 'svelte-i18n'

  let { onfill }: { onfill?: () => void } = $props()
  let open = $state(true)

  const zones: Zone[] = ['upper', 'core', 'legs', 'full']
  const levels: Level[] = ['beginner', 'intermediate', 'expert']
  const times = [10, 20, 30, 45]

  let zone = $state<Zone>('full')
  let minutes = $state(20)
  let level = $state<Level>('beginner')

  function generate() {
    builder.load(autofill(allExercises, { zone, minutes, level }))
    open = false // collapse so the generated exercises are immediately visible
    onfill?.()
  }
</script>

<section class="autofill">
  <button class="head" onclick={() => (open = !open)} aria-expanded={open}>
    <span class="title">
      <Icon name="wand" size={18} />
      {$_('autofill.title')}
    </span>
    <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} />
  </button>

  {#if open}
    <div class="panel card">
      <label>
        <span>{$_('autofill.zone')}</span>
        <select bind:value={zone}>
          {#each zones as z (z)}<option value={z}>{$_('zone.' + z)}</option
            >{/each}
        </select>
      </label>
      <label>
        <span>{$_('autofill.time')}</span>
        <select bind:value={minutes}>
          {#each times as t (t)}<option value={t}
              >{$_('autofill.minutes', { values: { count: t } })}</option
            >{/each}
        </select>
      </label>
      <label>
        <span>{$_('autofill.level')}</span>
        <select bind:value={level}>
          {#each levels as l (l)}<option value={l}>{$_('level.' + l)}</option
            >{/each}
        </select>
      </label>
      <button class="gen btn-grad" onclick={generate}>
        <Icon name="wand" size={18} />
        {$_('autofill.generate')}
      </button>
      <p class="hint">{$_('autofill.hint')}</p>
    </div>
  {/if}
</section>

<style>
  .autofill {
    display: grid;
    gap: 0.5rem;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.7rem 0.85rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text);
    font-family: var(--font-display);
    font-weight: 600;
  }
  .title {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }
  .panel {
    padding: 0.85rem;
    display: grid;
    /* Mobile: stack so the native selects never force horizontal overflow */
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
  @media (min-width: 420px) {
    .panel {
      /* minmax(0,1fr) — tracks may shrink below the select's intrinsic width */
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  label {
    display: grid;
    gap: 0.25rem;
    min-width: 0;
  }
  label span {
    color: var(--muted);
    font-size: 0.78rem;
  }
  select {
    width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: 0 0.5rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    font: inherit;
    text-transform: capitalize;
  }
  .gen {
    grid-column: 1 / -1;
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    font-weight: 700;
  }
  .hint {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--muted);
    font-size: 0.78rem;
    text-align: center;
  }
</style>
