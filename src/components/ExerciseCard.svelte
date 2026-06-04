<script lang="ts">
  import type { Exercise } from '../domain/types'
  let {
    exercise,
    onpick,
  }: { exercise: Exercise; onpick?: (id: string) => void } = $props()
  let imgOk = $state(true)
</script>

<button class="card" onclick={() => onpick?.(exercise.id)}>
  {#if exercise.images[0] && imgOk}
    <img
      src={exercise.images[0]}
      alt={exercise.name}
      loading="lazy"
      onerror={() => (imgOk = false)}
    />
  {:else}
    <div class="placeholder" aria-hidden="true">🏋️</div>
  {/if}
  <span class="name">{exercise.name}</span>
  <span class="zone">{exercise.zone}</span>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    text-align: left;
    min-height: 44px;
  }
  img,
  .placeholder {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 8px;
    background: var(--surface-2);
    display: grid;
    place-items: center;
    font-size: 2rem;
  }
  .name {
    font-weight: 600;
  }
  .zone {
    font-size: 0.75rem;
    color: var(--muted);
  }
</style>
