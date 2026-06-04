<script lang="ts">
  import type { WorkoutItem } from '../domain/types'
  import Icon from './Icon.svelte'
  let {
    item,
    name,
    onpatch,
    onremove,
    onmoveup,
    onmovedown,
  }: {
    item: WorkoutItem
    name: string
    onpatch: (p: Partial<WorkoutItem>) => void
    onremove: () => void
    onmoveup: () => void
    onmovedown: () => void
  } = $props()

  const fields = [
    { key: 'sets' as const, label: 'Sets', min: 1, step: 1 },
    { key: 'reps' as const, label: 'Reps', min: 1, step: 1 },
    { key: 'restSeconds' as const, label: 'Rest s', min: 0, step: 5 },
  ]
  const bump = (key: keyof WorkoutItem, delta: number, min: number) =>
    onpatch({ [key]: Math.max(min, (item[key] as number) + delta) })
</script>

<div class="row card">
  <div class="head">
    <span class="thumb" aria-hidden="true"
      ><Icon name="dumbbell" size={20} /></span
    >
    <strong class="name">{name}</strong>
    <div class="reorder">
      <button onclick={onmoveup} aria-label="Move up">
        <Icon name="chevron-up" size={18} />
      </button>
      <button onclick={onmovedown} aria-label="Move down">
        <Icon name="chevron-down" size={18} />
      </button>
      <button class="del" onclick={onremove} aria-label="Remove">
        <Icon name="trash" size={18} />
      </button>
    </div>
  </div>
  <div class="fields">
    {#each fields as f (f.key)}
      <div class="stepper">
        <span class="lbl">{f.label}</span>
        <div class="ctrl">
          <button
            aria-label={'Decrease ' + f.label}
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
            aria-label={'Increase ' + f.label}
            onclick={() => bump(f.key, f.step, f.min)}
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
      </div>
    {/each}
  </div>
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
    border-radius: 11px;
    background:
      linear-gradient(
        135deg,
        rgba(255, 122, 24, 0.22),
        rgba(255, 45, 120, 0.22)
      ),
      var(--surface-2);
    color: var(--accent);
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
