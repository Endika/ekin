<script lang="ts">
  import { visibleExercises, zoneFilter, query } from '../stores/catalog-store'
  import ExerciseCard from './ExerciseCard.svelte'
  import type { Zone } from '../domain/types'
  let { onpick }: { onpick?: (id: string) => void } = $props()
  const zones: (Zone | 'all')[] = ['all', 'upper', 'core', 'legs', 'full']
</script>

<div class="filters">
  <input placeholder="Search exercises" bind:value={$query} />
  <div class="zones">
    {#each zones as z (z)}
      <button class:active={$zoneFilter === z} onclick={() => ($zoneFilter = z)}
        >{z}</button
      >
    {/each}
  </div>
</div>

<div class="grid">
  {#each $visibleExercises as ex (ex.id)}
    <ExerciseCard exercise={ex} {onpick} />
  {/each}
</div>

<style>
  .filters {
    position: sticky;
    top: 0;
    background: var(--bg);
    padding: 0.5rem 0;
    display: grid;
    gap: 0.5rem;
  }
  input {
    width: 100%;
    padding: 0.6rem;
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  .zones {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
  }
  .zones button {
    padding: 0.4rem 0.7rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    min-height: 36px;
  }
  .zones button.active {
    background: var(--accent);
    color: white;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
    padding-bottom: 1rem;
  }
</style>
