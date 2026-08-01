<script lang="ts">
  import { _ } from 'svelte-i18n'
  import type { Exercise } from '../domain/types'
  import { chainNeighbours } from '../domain/catalog'
  import { allExercises } from '../stores/catalog-store'
  import Icon from './Icon.svelte'
  import { zoneIcon } from '../lib/zoneIcon'

  let {
    image,
    name,
    instructions = [],
    exercise,
    onclose,
  }: {
    image: string
    name: string
    instructions?: string[]
    /** Enables the progression rungs and the attribution line. */
    exercise?: Exercise
    onclose: () => void
  } = $props()

  let rungs = $derived(
    exercise ? chainNeighbours(allExercises, exercise) : undefined,
  )
</script>

<div
  class="backdrop"
  role="presentation"
  onclick={(e) => e.target === e.currentTarget && onclose()}
  onkeydown={(e) => e.key === 'Escape' && onclose()}
>
  <figure>
    <!-- `figcaption` has to be the first or last child of a `figure`, but it should read
         under the image. It stays first in the DOM and the grid `order` below puts it
         back in place visually. -->
    <figcaption>{name}</figcaption>
    {#if image}
      <img src={image} alt={name} />
    {:else}
      <div class="ph" aria-hidden="true">
        <Icon
          name={exercise ? zoneIcon(exercise.zone) : 'dumbbell'}
          size={56}
        />
      </div>
    {/if}
    {#if instructions.length}
      <ol class="steps">
        {#each instructions as step (step)}
          <li>{step}</li>
        {/each}
      </ol>
    {/if}

    {#if rungs?.previous || rungs?.next}
      <div class="rungs">
        {#if rungs.previous}
          <p>
            <span class="label">{$_('exercise.easier')}</span>
            {rungs.previous.name}
          </p>
        {/if}
        {#if rungs.next}
          <p>
            <span class="label">{$_('exercise.nextLevel')}</span>
            {rungs.next.name}
          </p>
        {/if}
      </div>
    {/if}

    {#if exercise?.source}
      <p class="credit">
        {$_('exercise.credit', {
          values: {
            author: exercise.source.author,
            source: exercise.source.name,
          },
        })}
        ·
        <a href={exercise.source.licenseUrl} target="_blank" rel="noreferrer">
          {exercise.source.license}
        </a>
      </p>
    {/if}
  </figure>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.75);
  }
  figure {
    margin: 0;
    display: grid;
    gap: 0.6rem;
    justify-items: center;
    max-width: 560px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }
  img {
    width: 100%;
    height: auto;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    order: -1; /* the image renders above the caption; see the comment in the markup */
  }
  .ph {
    order: -1;
    width: 100%;
    aspect-ratio: 4 / 3;
    display: grid;
    place-items: center;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
    opacity: 0.7;
  }
  figcaption {
    font-family: var(--font-display);
    font-weight: 600;
    color: #fff;
    text-align: center;
  }
  .steps {
    margin: 0;
    padding: 0 0 0 1.2rem;
    display: grid;
    gap: 0.5rem;
    color: #fff;
    font-size: 0.92rem;
    line-height: 1.45;
    justify-self: stretch;
  }
  .steps li {
    opacity: 0.92;
  }
  .rungs {
    justify-self: stretch;
    display: grid;
    gap: 0.35rem;
    padding-top: 0.6rem;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }
  .rungs p {
    margin: 0;
    color: #fff;
    font-size: 0.9rem;
  }
  .rungs .label {
    opacity: 0.65;
    margin-right: 0.35rem;
  }
  .credit {
    justify-self: stretch;
    margin: 0;
    color: #fff;
    opacity: 0.6;
    font-size: 0.78rem;
    line-height: 1.4;
  }
  .credit a {
    color: inherit;
  }
</style>
