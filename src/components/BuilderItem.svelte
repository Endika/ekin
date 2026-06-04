<script lang="ts">
  import type { WorkoutItem } from '../domain/types'
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
</script>

<div class="row">
  <div class="head">
    <strong>{name}</strong>
    <div class="reorder">
      <button onclick={onmoveup} aria-label="Move up">↑</button>
      <button onclick={onmovedown} aria-label="Move down">↓</button>
      <button onclick={onremove} aria-label="Remove">✕</button>
    </div>
  </div>
  <div class="fields">
    <label
      >Sets <input
        type="number"
        min="1"
        value={item.sets}
        oninput={(e) => onpatch({ sets: +e.currentTarget.value })}
      /></label
    >
    <label
      >Reps <input
        type="number"
        min="1"
        value={item.reps}
        oninput={(e) => onpatch({ reps: +e.currentTarget.value })}
      /></label
    >
    <label
      >Rest s <input
        type="number"
        min="0"
        value={item.restSeconds}
        oninput={(e) => onpatch({ restSeconds: +e.currentTarget.value })}
      /></label
    >
  </div>
</div>

<style>
  .row {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.6rem;
    display: grid;
    gap: 0.5rem;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .reorder button {
    min-width: 40px;
    min-height: 40px;
  }
  .fields {
    display: flex;
    gap: 0.5rem;
  }
  .fields label {
    display: grid;
    font-size: 0.75rem;
    color: var(--muted);
  }
  .fields input {
    width: 4rem;
    padding: 0.4rem;
    min-height: 40px;
  }
</style>
