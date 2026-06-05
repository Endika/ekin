<script lang="ts">
  import { saved } from '../stores/saved-store'
  import { builder } from '../stores/builder'
  import Icon from './Icon.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import { _ } from 'svelte-i18n'
  import { tick } from 'svelte'
  import type { Workout } from '../domain/types'

  let { onload }: { onload?: () => void } = $props()
  let open = $state(false)
  let section = $state<HTMLElement>()
  let pendingDelete = $state<Workout>()
  let editingId = $state<string>()
  let editName = $state('')

  // Called by the builder after a save: open the list and scroll it into view
  // so the user sees where the saved workout landed.
  export async function reveal() {
    open = true
    await tick()
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function load(w: Workout) {
    // clone so editing the builder never mutates the stored copy
    builder.load(structuredClone(w))
    onload?.()
  }

  function startEdit(w: Workout) {
    editingId = w.id
    editName = w.name
  }
  async function commitEdit(w: Workout) {
    if (editingId !== w.id) return
    await saved.rename(w, editName)
    editingId = undefined
  }
  function cancelEdit() {
    editingId = undefined
  }

  function confirmDelete() {
    if (pendingDelete) saved.remove(pendingDelete.id)
    pendingDelete = undefined
  }

  function autofocus(node: HTMLInputElement) {
    node.focus()
    node.select()
  }
</script>

{#if $saved.length}
  <section class="saved" bind:this={section}>
    <button class="head" onclick={() => (open = !open)} aria-expanded={open}>
      <span class="title">
        <Icon name="rotate" size={18} />
        {$_('saved.title')}
        <span class="count">{$saved.length}</span>
      </span>
      <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} />
    </button>

    {#if open}
      <ul class="list">
        {#each $saved as w (w.id)}
          <li class="card">
            <div class="meta">
              {#if editingId === w.id}
                <input
                  class="rename"
                  bind:value={editName}
                  use:autofocus
                  onblur={() => commitEdit(w)}
                  onkeydown={(e) => {
                    if (e.key === 'Enter') commitEdit(w)
                    else if (e.key === 'Escape') cancelEdit()
                  }}
                  aria-label={$_('common.rename')}
                />
              {:else}
                <strong>{w.name}</strong>
              {/if}
              <span class="sub"
                >{$_('zone.' + w.zone)} ·
                {$_('saved.exercises', {
                  values: { count: w.items.length },
                })}</span
              >
            </div>
            <div class="row-actions">
              <button class="load" onclick={() => load(w)}>
                <Icon name="rotate" size={16} />
                {$_('saved.load')}
              </button>
              <button
                class="icon-btn"
                onclick={() => startEdit(w)}
                aria-label={$_('common.rename')}
              >
                <Icon name="edit" size={16} />
              </button>
              <button
                class="icon-btn del"
                onclick={() => (pendingDelete = w)}
                aria-label={$_('saved.deleteLabel', {
                  values: { name: w.name },
                })}
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

{#if pendingDelete}
  <ConfirmDialog
    message={$_('saved.deleteConfirm', {
      values: { name: pendingDelete.name },
    })}
    confirmLabel={$_('common.delete')}
    danger
    onconfirm={confirmDelete}
    oncancel={() => (pendingDelete = undefined)}
  />
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
  .rename {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1rem;
    padding: 0.2rem 0.4rem;
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    color: var(--text);
    min-width: 0;
    width: 100%;
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
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    min-height: 40px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted);
  }
  .icon-btn.del {
    color: var(--danger);
  }
</style>
