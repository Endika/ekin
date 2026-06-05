<script lang="ts">
  import type { Exercise } from '../domain/types'
  import Icon from './Icon.svelte'
  import { _ } from 'svelte-i18n'
  let {
    exercise,
    onpick,
  }: { exercise: Exercise; onpick?: (id: string) => void } = $props()
  let imgOk = $state(true)
</script>

<button class="card" onclick={() => onpick?.(exercise.id)}>
  <div class="media">
    {#if exercise.images[0] && imgOk}
      <img
        src={exercise.images[0]}
        alt={exercise.name}
        loading="lazy"
        onerror={() => (imgOk = false)}
      />
    {:else}
      <div class="placeholder" aria-hidden="true">
        <Icon name="dumbbell" size={32} />
      </div>
    {/if}
    <span class="zone">{$_('zone.' + exercise.zone)}</span>
  </div>
  <span class="name">{exercise.name}</span>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.55rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow-card);
    text-align: left;
    color: inherit;
  }
  .media {
    position: relative;
  }
  img,
  .placeholder {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    display: grid;
    place-items: center;
  }
  .placeholder {
    background:
      linear-gradient(
        135deg,
        rgba(255, 122, 24, 0.18),
        rgba(255, 45, 120, 0.18)
      ),
      var(--surface-2);
    color: var(--accent);
  }
  .zone {
    position: absolute;
    top: 0.4rem;
    left: 0.4rem;
    padding: 0.15rem 0.55rem;
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: var(--radius-pill);
    background: rgba(20, 16, 25, 0.6);
    color: #fff;
    backdrop-filter: blur(4px);
  }
  .name {
    font-family: var(--font-display);
    font-weight: 600;
    line-height: 1.2;
  }
</style>
