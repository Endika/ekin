<script lang="ts">
  import { _ } from 'svelte-i18n'
  import type { Exercise } from '../domain/types'
  import { chainNeighbours } from '../domain/catalog'
  import { allExercises } from '../stores/catalog-store'

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
    <img src={image} alt={name} />
    <figcaption>{name}</figcaption>
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
