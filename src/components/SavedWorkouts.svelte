<script lang="ts">
  import { saved } from '../stores/saved-store'
  import { builder } from '../stores/builder'
  import Icon from './Icon.svelte'
  import type { Workout } from '../domain/types'

  let { onload }: { onload?: () => void } = $props()
  let open = $state(false)

  function load(w: Workout) {
    // clone so editing the builder never mutates the stored copy
    builder.load(structuredClone(w))
    onload?.()
  }

  function remove(w: Workout) {
    if (confirm(`Delete "${w.name}"?`)) saved.remove(w.id)
  }
</script>

{#if $saved.length}
  <section class="saved">
    <button class="head" onclick={() => (open = !open)} aria-expanded={open}>
      <span class="title">
        <Icon name="rotate" size={18} /> Saved workouts
        <span class="count">{$saved.length}</span>
      </span>
      <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} />
    </button>

    {#if open}
      <ul class="list">
        {#each $saved as w (w.id)}
          <li class="card">
            <div class="meta">
              <strong>{w.name}</strong>
              <span class="sub">{w.zone} · {w.items.length} exercises</span>
            </div>
            <div class="row-actions">
              <button class="load" onclick={() => load(w)}>
                <Icon name="rotate" size={16} /> Load
              </button>
              <button
                class="del"
                onclick={() => remove(w)}
                aria-label="Delete {w.name}"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}

<style>
  .saved {
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
  .count {
    min-width: 1.4rem;
    padding: 0 0.4rem;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    color: var(--muted);
    font-size: 0.8rem;
    text-align: center;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.7rem 0.85rem;
  }
  .meta {
    display: grid;
    gap: 0.1rem;
    min-width: 0;
  }
  .meta strong {
    font-family: var(--font-display);
    font-weight: 600;
  }
  .sub {
    color: var(--muted);
    font-size: 0.82rem;
    text-transform: capitalize;
  }
  .row-actions {
    display: flex;
    gap: 0.4rem;
    flex-shrink: 0;
  }
  .load {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 40px;
    padding: 0 0.7rem;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    font-weight: 600;
  }
  .del {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    min-height: 40px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--danger);
  }
</style>
