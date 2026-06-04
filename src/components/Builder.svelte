<script lang="ts">
  import { builder } from '../stores/builder'
  import { allExercises } from '../stores/catalog-store'
  import BuilderItem from './BuilderItem.svelte'
  import CatalogList from './CatalogList.svelte'
  import { saveWorkout } from '../data/workouts-repo'
  import type { Zone } from '../domain/types'

  let { onstart, onsaved }: { onstart: () => void; onsaved?: () => void } =
    $props()
  let picking = $state(false)
  const zones: Zone[] = ['upper', 'core', 'legs', 'full']
  const nameOf = (id: string) =>
    allExercises.find((e) => e.id === id)?.name ?? id

  async function save() {
    await saveWorkout($builder)
    onsaved?.()
  }
</script>

<section class="builder">
  <input
    class="title"
    bind:value={$builder.name}
    oninput={(e) => builder.rename(e.currentTarget.value)}
  />
  <select
    value={$builder.zone}
    onchange={(e) => builder.setZone(e.currentTarget.value as Zone)}
  >
    {#each zones as z (z)}<option value={z}>{z}</option>{/each}
  </select>

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
  </div>

  <div class="actions">
    <button onclick={() => (picking = !picking)}
      >{picking ? 'Done adding' : '+ Add exercise'}</button
    >
    <button onclick={save} disabled={!$builder.items.length}>Save</button>
    <button class="primary" onclick={onstart} disabled={!$builder.items.length}
      >Start</button
    >
  </div>

  {#if picking}
    <CatalogList onpick={(id) => builder.add(id)} />
  {/if}
</section>

<style>
  .builder {
    display: grid;
    gap: 0.75rem;
  }
  .title {
    font-size: 1.25rem;
    font-weight: 700;
    padding: 0.4rem;
    border: 1px solid var(--border);
    border-radius: 10px;
  }
  .items {
    display: grid;
    gap: 0.5rem;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    position: sticky;
    bottom: 0;
    padding: 0.5rem 0 max(0.5rem, env(safe-area-inset-bottom));
    background: var(--bg);
  }
  .actions button {
    flex: 1;
    min-height: 48px;
    border-radius: 12px;
    border: 1px solid var(--border);
  }
  .actions .primary {
    background: var(--accent);
    color: white;
  }
</style>
