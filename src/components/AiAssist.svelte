<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { get } from 'svelte/store'
  import { builder } from '../stores/builder'
  import { geminiKey } from '../stores/settings'
  import { allExercises } from '../stores/catalog-store'
  import { httpGeminiClient } from '../ai/gemini'
  import { requestAssist, type AssistRequest } from '../ai/assist'
  import Icon from './Icon.svelte'

  let open = $state(false)
  let busy = $state(false)
  let failed = $state(false)
  let swapIndex = $state(0)

  const nameOf = (id: string) =>
    allExercises.find((e) => e.id === id)?.name ?? id

  async function run(req: AssistRequest) {
    if (busy) return
    busy = true
    failed = false
    const client = httpGeminiClient(get(geminiKey))
    const res = await requestAssist(client, allExercises, get(builder), req)
    busy = false
    if (res.ok) builder.load(res.workout)
    else failed = true
  }
</script>

{#if $geminiKey && $builder.items.length}
  <section class="ai">
    <button class="head" onclick={() => (open = !open)} aria-expanded={open}>
      <span class="title">
        <Icon name="wand" size={18} />
        {$_('ai.title')}
      </span>
      <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} />
    </button>

    {#if open}
      <div class="panel card">
        <div class="row">
          <button
            onclick={() => run({ kind: 'adjust', direction: 'easier' })}
            disabled={busy}
          >
            {$_('ai.easier')}
          </button>
          <button
            onclick={() => run({ kind: 'adjust', direction: 'harder' })}
            disabled={busy}
          >
            {$_('ai.harder')}
          </button>
        </div>

        <div class="row swap">
          <select bind:value={swapIndex} disabled={busy}>
            {#each $builder.items as item, i (item.exerciseId + i)}
              <option value={i}>{nameOf(item.exerciseId)}</option>
            {/each}
          </select>
          <button
            class="btn-grad"
            onclick={() => run({ kind: 'swap', itemIndex: swapIndex })}
            disabled={busy}
          >
            {$_('ai.swap')}
          </button>
        </div>

        {#if busy}
          <p class="status">{$_('ai.thinking')}</p>
        {:else if failed}
          <p class="status err">{$_('ai.failed')}</p>
        {/if}
      </div>
    {/if}
  </section>
{/if}

<style>
  .ai {
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
  .panel {
    padding: 0.85rem;
    display: grid;
    gap: 0.6rem;
  }
  .row {
    display: flex;
    gap: 0.5rem;
  }
  .row button {
    flex: 1;
    min-height: 46px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    font-weight: 600;
  }
  .swap select {
    flex: 1;
    min-width: 0;
    min-height: 46px;
    padding: 0 0.6rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    font: inherit;
  }
  .swap .btn-grad {
    flex: none;
    padding: 0 1rem;
    border: none;
  }
  .status {
    margin: 0;
    text-align: center;
    color: var(--muted);
    font-size: 0.85rem;
  }
  .status.err {
    color: var(--danger);
  }
  button:disabled {
    opacity: 0.6;
  }
</style>
