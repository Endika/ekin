<script lang="ts">
  import { listSessions } from '../data/sessions-repo'
  import type { Session } from '../domain/types'
  import Icon from './Icon.svelte'
  let sessions = $state<Session[]>([])
  $effect(() => {
    listSessions().then((s) => (sessions = s))
  })
  const fmt = (ms: number) => new Date(ms).toLocaleDateString()
  const mins = (s: number) => Math.round(s / 60)
</script>

<ul class="history fade-up">
  {#each sessions as s (s.id)}
    <li class="card">
      <div class="left">
        <strong>{s.workoutName}</strong>
        <span class="date">{fmt(s.startedAt)}</span>
      </div>
      <span class="dur">
        <Icon name="clock" size={16} />
        {mins(s.durationSeconds)} min
      </span>
    </li>
  {:else}
    <li class="empty card">
      <span class="badge" aria-hidden="true"
        ><Icon name="flame" size={28} /></span
      >
      <strong>No sessions yet</strong>
      <span class="hint">Build a workout and start training.</span>
    </li>
  {/each}
</ul>

<style>
  .history {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0;
    display: grid;
    gap: 0.6rem;
  }
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.95rem 1rem;
  }
  .left {
    display: grid;
    gap: 0.15rem;
  }
  .left strong {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.05rem;
  }
  .date {
    color: var(--muted);
    font-size: 0.85rem;
  }
  .dur {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    color: var(--muted);
    font-weight: 600;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .empty {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
    padding: 2.5rem 1.5rem;
  }
  .badge {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background:
      linear-gradient(135deg, rgba(255, 122, 24, 0.2), rgba(255, 45, 120, 0.2)),
      var(--surface-2);
    color: var(--accent);
    margin-bottom: 0.25rem;
  }
  .empty strong {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.15rem;
  }
  .hint {
    color: var(--muted);
  }
</style>
