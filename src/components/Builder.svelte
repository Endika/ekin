<script lang="ts">
  import { builder } from '../stores/builder'
  import { allExercises } from '../stores/catalog-store'
  import BuilderItem from './BuilderItem.svelte'
  import CatalogList from './CatalogList.svelte'
  import SavedWorkouts from './SavedWorkouts.svelte'
  import AutofillPanel from './AutofillPanel.svelte'
  import AiAssist from './AiAssist.svelte'
  import ImageLightbox from './ImageLightbox.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import Icon from './Icon.svelte'
  import { _ } from 'svelte-i18n'
  import { get } from 'svelte/store'
  import { saveWorkout } from '../data/workouts-repo'
  import { saved } from '../stores/saved-store'
  import type { Zone } from '../domain/types'

  let { onstart }: { onstart: () => void } = $props()
  let picking = $state(false)
  let isTimed = $derived($builder.mode === 'timed')
  let savedList = $state<ReturnType<typeof SavedWorkouts>>()
  let preview = $state<{ image: string; name: string }>()
  let pendingNew = $state(false)
  const zones: Zone[] = ['upper', 'core', 'legs', 'full']
  const exerciseOf = (id: string) => allExercises.find((e) => e.id === id)
  const nameOf = (id: string) => exerciseOf(id)?.name ?? id

  async function save() {
    await saveWorkout($builder)
    await saved.refresh()
    // stay in Build and reveal the saved workout instead of jumping away
    savedList?.reveal()
  }

  // Start a fresh workout (new id) so the next Save creates a new entry rather
  // than overwriting the current one.
  function doNew() {
    builder.reset(get(_)('builder.defaultName'), 'full')
    pendingNew = false
  }
  function onNew() {
    if ($builder.items.length) pendingNew = true
    else doNew()
  }
</script>

<section class="builder fade-up">
  <SavedWorkouts bind:this={savedList} />
  <AutofillPanel />

  <div class="title-row">
    <input
      class="title"
      aria-label={$_('builder.nameLabel')}
      bind:value={$builder.name}
      oninput={(e) => builder.rename(e.currentTarget.value)}
    />
    <button class="new-btn" onclick={onNew}>
      <Icon name="plus" size={16} />
      {$_('builder.new')}
    </button>
  </div>

  <div class="type" role="group" aria-label={$_('autofill.goal')}>
    <button class:active={!isTimed} onclick={() => builder.setMode('reps')}>
      {$_('autofill.goal_strength')}
    </button>
    <button class:active={isTimed} onclick={() => builder.setMode('timed')}>
      {$_('autofill.goal_circuit')}
    </button>
  </div>

  <div class="zones" role="group" aria-label={$_('autofill.zone')}>
    {#each zones as z (z)}
      <button
        class:active={$builder.zone === z}
        onclick={() => builder.setZone(z)}>{$_('zone.' + z)}</button
      >
    {/each}
  </div>

  {#if isTimed}
    <div class="circuit card">
      <label>
        <span>{$_('builder.rounds')}</span>
        <input
          type="number"
          min="1"
          value={$builder.rounds ?? 1}
          oninput={(e) => builder.setRounds(+e.currentTarget.value)}
        />
      </label>
    </div>
  {/if}

  <div class="items">
    {#each $builder.items as item, i (item.exerciseId + i)}
      <BuilderItem
        {item}
        name={nameOf(item.exerciseId)}
        image={exerciseOf(item.exerciseId)?.images[0]}
        zone={exerciseOf(item.exerciseId)?.zone}
        timed={isTimed}
        onpatch={(p) => builder.patch(i, p)}
        onremove={() => builder.remove(i)}
        onmoveup={() => i > 0 && builder.move(i, i - 1)}
        onmovedown={() =>
          i < $builder.items.length - 1 && builder.move(i, i + 1)}
        onpreview={(image, name) => (preview = { image, name })}
      />
    {/each}
    {#if !$builder.items.length}
      <p class="empty card">
        {$_('builder.empty')}
      </p>
    {/if}
  </div>

  <AiAssist />

  {#if picking}
    <CatalogList onpick={(id) => builder.add(id)} />
  {/if}

  <div class="actions">
    <button class="ghost" onclick={() => (picking = !picking)}>
      <Icon name={picking ? 'check' : 'plus'} size={18} />
      {picking ? $_('builder.done') : $_('builder.addExercise')}
    </button>
    <button class="ghost" onclick={save} disabled={!$builder.items.length}>
      {$_('builder.save')}
    </button>
    <button
      class="start btn-grad"
      onclick={onstart}
      disabled={!$builder.items.length}
    >
      <Icon name="play" size={20} />
      {$_('builder.start')}
    </button>
  </div>
</section>

{#if preview}
  <ImageLightbox
    image={preview.image}
    name={preview.name}
    onclose={() => (preview = undefined)}
  />
{/if}

{#if pendingNew}
  <ConfirmDialog
    message={$_('builder.newConfirm')}
    confirmLabel={$_('builder.new')}
    onconfirm={doNew}
    oncancel={() => (pendingNew = false)}
  />
{/if}

<style>
  .builder {
    display: grid;
    gap: 0.85rem;
    padding-bottom: 5.5rem;
  }
  .title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    /* Grid item of .builder: without this it keeps the native input's intrinsic
       width (~20ch) as its min-size and overflows narrow viewports. */
    min-width: 0;
  }
  .title {
    flex: 1;
    min-width: 0;
    font-family: var(--font-display);
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    padding: 0.5rem 0.65rem;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: transparent;
  }
  .title:focus-visible {
    background: var(--surface);
    border-color: var(--border);
  }
  .new-btn {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 40px;
    padding: 0 0.8rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    font-weight: 600;
  }

  .type {
    display: flex;
    gap: 0.4rem;
  }
  .type button {
    flex: 1;
    min-height: 40px;
    padding: 0 0.6rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    font-weight: 600;
  }
  .type button.active {
    background: var(--grad);
    border-color: transparent;
    color: #fff;
    box-shadow: var(--shadow-glow);
  }

  .zones {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .zones button {
    flex: 1;
    min-width: 4rem;
    min-height: 38px;
    padding: 0 0.5rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    font-weight: 600;
    text-transform: capitalize;
  }
  .zones button.active {
    background: var(--grad);
    border-color: transparent;
    color: #fff;
    box-shadow: var(--shadow-glow);
  }

  .circuit {
    padding: 0.85rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(7rem, 100%), 1fr));
    gap: 0.6rem;
  }
  .circuit label {
    display: grid;
    gap: 0.25rem;
    min-width: 0;
  }
  .circuit label span {
    color: var(--muted);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
  }
  .circuit input {
    width: 100%;
    min-width: 0;
    min-height: 42px;
    text-align: center;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    color: var(--text);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.1rem;
  }

  .items {
    display: grid;
    gap: 0.6rem;
  }
  .empty {
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--muted);
  }
  .empty strong {
    color: var(--text);
  }

  .actions {
    position: sticky;
    bottom: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.6rem 0 max(0.6rem, env(safe-area-inset-bottom));
    background: linear-gradient(transparent, var(--bg) 35%);
  }
  .actions .ghost {
    min-height: 52px;
    padding: 0 0.9rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .actions .start {
    flex: 1;
    min-height: 52px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    font-size: 1.1rem;
  }
</style>
