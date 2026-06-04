<script lang="ts">
  import { listSessions } from '../data/sessions-repo'
  import type { Session } from '../domain/types'
  let sessions = $state<Session[]>([])
  $effect(() => {
    listSessions().then((s) => (sessions = s))
  })
  const fmt = (ms: number) => new Date(ms).toLocaleDateString()
  const mins = (s: number) => Math.round(s / 60)
</script>

<ul class="history">
  {#each sessions as s (s.id)}
    <li>
      <strong>{s.workoutName}</strong>
      <span>{fmt(s.startedAt)} · {mins(s.durationSeconds)} min</span>
    </li>
  {:else}
    <li class="empty">No sessions yet — build a workout and start.</li>
  {/each}
</ul>

<style>
  .history {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }
  li {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .empty {
    color: var(--muted);
    justify-content: center;
  }
</style>
