<script lang="ts">
  import { builder } from '../stores/builder'
  import { allExercises } from '../stores/catalog-store'
  import BuilderItem from './BuilderItem.svelte'
  import CatalogList from './CatalogList.svelte'
  import SavedWorkouts from './SavedWorkouts.svelte'
  import AutofillPanel from './AutofillPanel.svelte'
  import Icon from './Icon.svelte'
  import { saveWorkout } from '../data/workouts-repo'
  import { saved } from '../stores/saved-store'
  import type { Zone } from '../domain/types'

  let { onstart, onsaved }: { onstart: () => void; onsaved?: () => void } =
    $props()
  let picking = $state(false)
  const zones: Zone[] = ['upper', 'core', 'legs', 'full']
  const nameOf = (id: string) =>
    allExercises.find((e) => e.id === id)?.name ?? id

  async function save() {
    await saveWorkout($builder)
    await saved.refresh()
    onsaved?.()
  }
</script>

<section class="builder fade-up">
  <SavedWorkouts />
  <AutofillPanel />

  <input
    class="title"
    aria-label="Workout name"
    bind:value={$builder.name}
    oninput={(e) => builder.rename(e.currentTarget.value)}
  />

  <div class="zones" role="group" aria-label="Zone">
    {#each zones as z (z)}
      <button
        class:active={$builder.zone === z}
        onclick={() => builder.setZone(z)}>{z}</button
      >
    {/each}
  </div>

  <div class="items">
    {#each $builder.items as item, i (item.exerciseId + i)}
      <BuilderItem
        {item}
        name={nameOf(item.exerciseId)}
        onpatch={(p) => builder.patch(i, p)}
        onremove={() => builder.remove(i)}
        onmoveup={() => i > 0 && builder.move(i, i - 1)}
        onmovedown={() =>
          i < $builder.items.length - 1 && builder.move(i, i + 1)}
      />
    {/each}
    {#if !$builder.items.length}
      <p class="empty card">
        No exercises yet. Tap <strong>Add exercise</strong> to build your session.
      </p>
    {/if}
  </div>

  {#if picking}
    <CatalogList onpick={(id) => builder.add(id)} />
  {/if}

  <div class="actions">
    <button class="ghost" onclick={() => (picking = !picking)}>
      <Icon name={picking ? 'check' : 'plus'} size={18} />
      {picking ? 'Done' : 'Add exercise'}
    </button>
    <button class="ghost" onclick={save} disabled={!$builder.items.length}>
      Save
    </button>
    <button
      class="start btn-grad"
      onclick={onstart}
      disabled={!$builder.items.length}
    >
      <Icon name="play" size={20} /> Start
    </button>
  </div>
</section>

<style>
  .builder {
    display: grid;
    gap: 0.85rem;
    padding-bottom: 5.5rem;
  }
  .title {
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
