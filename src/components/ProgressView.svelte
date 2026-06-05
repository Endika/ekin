<script lang="ts">
  import { listSessions } from '../data/sessions-repo'
  import { exerciseSeries, exercisedIds } from '../domain/progression'
  import { allExercises } from '../stores/catalog-store'
  import type { Session } from '../domain/types'
  import StatsBar from './StatsBar.svelte'
  import EvolutionChart from './EvolutionChart.svelte'
  import HistoryList from './HistoryList.svelte'

  let sessions = $state<Session[]>([])
  let selected = $state('')

  $effect(() => {
    listSessions().then((s) => {
      sessions = s
      const ids = exercisedIds(s)
      if (!selected && ids.length) selected = ids[0]
    })
  })

  const nameOf = (id: string) =>
    allExercises.find((e) => e.id === id)?.name ?? id
  let ids = $derived(exercisedIds(sessions))
  let series = $derived(selected ? exerciseSeries(sessions, selected) : [])
</script>

{#if sessions.length}
  <StatsBar {sessions} />

  <section class="progress fade-up">
    <label class="picker">
      <span>Exercise</span>
      <select bind:value={selected}>
        {#each ids as id (id)}
          <option value={id}>{nameOf(id)}</option>
        {/each}
      </select>
    </label>
    <EvolutionChart points={series} />
  </section>
{/if}

<HistoryList {sessions} />

<style>
  .progress {
    display: grid;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }
  .picker {
    display: grid;
    gap: 0.3rem;
  }
  .picker span {
    color: var(--muted);
    font-size: 0.82rem;
  }
  .picker select {
    min-height: 44px;
    padding: 0 0.7rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font: inherit;
  }
</style>
