<script lang="ts">
  let {
    image,
    name,
    instructions = [],
    onclose,
  }: {
    image: string
    name: string
    instructions?: string[]
    onclose: () => void
  } = $props()
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
</style>
