<script lang="ts">
  import type { WorkoutItem, Zone } from '../domain/types'
  import Icon from './Icon.svelte'
  import { zoneIcon } from '../lib/zoneIcon'
  import { _ } from 'svelte-i18n'
  let {
    item,
    name,
    image,
    zone,
    timed = false,
    onpatch,
    onremove,
    onmoveup,
    onmovedown,
    onpreview,
  }: {
    item: WorkoutItem
    name: string
    image?: string
    zone?: Zone
    timed?: boolean
    onpatch: (p: Partial<WorkoutItem>) => void
    onremove: () => void
    onmoveup: () => void
    onmovedown: () => void
    onpreview?: (image: string, name: string) => void
  } = $props()

  let imgOk = $state(true)
  let showImage = $derived(!!image && imgOk)

  const fields = [
    { key: 'sets' as const, labelKey: 'item.sets', min: 1, step: 1 },
    { key: 'reps' as const, labelKey: 'item.reps', min: 1, step: 1 },
    { key: 'restSeconds' as const, labelKey: 'item.rest', min: 0, step: 5 },
  ]
  const bump = (key: keyof WorkoutItem, delta: number, min: number) =>
    onpatch({ [key]: Math.max(min, (item[key] as number) + delta) })
</script>

<div class="row card">
  <div class="head">
    {#if showImage}
      <button
        class="thumb"
        onclick={() => image && onpreview?.(image, name)}
        aria-label={name}
      >
        <img src={image} alt={name} onerror={() => (imgOk = false)} />
      </button>
    {:else}
      <span class="thumb fallback" aria-hidden="true">
        <Icon name={zone ? zoneIcon(zone) : 'dumbbell'} size={20} />
      </span>
    {/if}
    <strong class="name">{name}</strong>
    <div class="reorder">
      <button onclick={onmoveup} aria-label={$_('item.moveUp')}>
        <Icon name="chevron-up" size={18} />
      </button>
      <button onclick={onmovedown} aria-label={$_('item.moveDown')}>
        <Icon name="chevron-down" size={18} />
      </button>
      <button class="del" onclick={onremove} aria-label={$_('item.remove')}>
        <Icon name="trash" size={18} />
      </button>
    </div>
  </div>
  {#if !timed}
    <div class="fields">
      {#each fields as f (f.key)}
        <div class="stepper">
          <span class="lbl">{$_(f.labelKey)}</span>
          <div class="ctrl">
            <button
              aria-label={$_('a11y.decrease', {
                values: { label: $_(f.labelKey) },
              })}
              onclick={() => bump(f.key, -f.step, f.min)}
            >
              <Icon name="minus" size={16} />
            </button>
            <input
              type="number"
              min={f.min}
              value={item[f.key]}
              oninput={(e) => onpatch({ [f.key]: +e.currentTarget.value })}
            />
            <button
              aria-label={$_('a11y.increase', {
                values: { label: $_(f.labelKey) },
              })}
              onclick={() => bump(f.key, f.step, f.min)}
            >
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .row {
    padding: 0.85rem;
    display: grid;
    gap: 0.85rem;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }
  .thumb {
    flex: none;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 11px;
    background: var(--surface-2);
  }
  .thumb.fallback {
    border-color: transparent;
    background:
      linear-gradient(
        135deg,
        rgba(255, 122, 24, 0.22),
        rgba(255, 45, 120, 0.22)
      ),
      var(--surface-2);
    color: var(--accent);
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  button.thumb {
    cursor: zoom-in;
  }
  .name {
    flex: 1;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.02rem;
    min-width: 0;
  }
  .reorder {
    display: flex;
    gap: 0.15rem;
  }
  .reorder button {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--muted);
  }
  .reorder .del:active {
    color: var(--accent);
  }

  .fields {
    display: flex;
    gap: 0.5rem;
  }
  .stepper {
    flex: 1;
    display: grid;
    gap: 0.3rem;
    justify-items: center;
  }
  .lbl {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    font-weight: 600;
  }
  .ctrl {
    display: flex;
    align-items: center;
    width: 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    overflow: hidden;
  }
  .ctrl button {
    display: grid;
    place-items: center;
    width: 34px;
    height: 38px;
    border: none;
    background: transparent;
    color: var(--text);
    flex: none;
  }
  .ctrl input {
    width: 100%;
    min-width: 0;
    text-align: center;
    border: none;
    background: transparent;
    padding: 0;
    height: 38px;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 0.95rem;
  }
</style>
