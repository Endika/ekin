<script lang="ts">
  let {
    image,
    name,
    onclose,
  }: { image: string; name: string; onclose: () => void } = $props()
</script>

<div
  class="backdrop"
  role="presentation"
  onclick={onclose}
  onkeydown={(e) => e.key === 'Escape' && onclose()}
>
  <figure>
    <img src={image} alt={name} />
    <figcaption>{name}</figcaption>
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
</style>
