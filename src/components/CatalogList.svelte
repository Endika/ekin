<script lang="ts">
  import { visibleExercises, zoneFilter, query } from '../stores/catalog-store'
  import ExerciseCard from './ExerciseCard.svelte'
  import Icon from './Icon.svelte'
  import type { Zone } from '../domain/types'
  let { onpick }: { onpick?: (id: string) => void } = $props()
  const zones: (Zone | 'all')[] = ['all', 'upper', 'core', 'legs', 'full']
</script>

<div class="catalog">
  <div class="filters">
    <div class="search">
      <span class="ico" aria-hidden="true"
        ><Icon name="search" size={18} /></span
      >
      <input placeholder="Search exercises" bind:value={$query} />
    </div>
    <div class="zones">
      {#each zones as z (z)}
        <button
          class:active={$zoneFilter === z}
          onclick={() => ($zoneFilter = z)}>{z}</button
        >
      {/each}
    </div>
  </div>

  <div class="grid">
    {#each $visibleExercises as ex (ex.id)}
      <ExerciseCard exercise={ex} {onpick} />
    {/each}
  </div>
</div>

<style>
  .filters {
    position: sticky;
    top: 64px;
    z-index: 4;
    background: linear-gradient(var(--bg) 80%, transparent);
    padding: 0.6rem 0 0.7rem;
    display: grid;
    gap: 0.6rem;
  }
  .search {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search .ico {
    position: absolute;
    left: 0.85rem;
    color: var(--muted);
    pointer-events: none;
  }
  .search input {
    width: 100%;
    padding: 0.7rem 0.9rem 0.7rem 2.6rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--surface);
  }
  .zones {
    display: flex;
    gap: 0.35rem;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .zones::-webkit-scrollbar {
    display: none;
  }
  .zones button {
    flex: none;
    padding: 0.4rem 0.85rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    font-weight: 600;
    min-height: 36px;
    text-transform: capitalize;
  }
  .zones button.active {
    background: var(--grad);
    border-color: transparent;
    color: #fff;
    box-shadow: var(--shadow-glow);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.6rem;
    padding-bottom: 1rem;
  }
</style>
