<script lang="ts">
  import type { SeriesPoint } from '../domain/progression'
  import { _ } from 'svelte-i18n'

  let { points }: { points: SeriesPoint[] } = $props()

  const W = 320
  const H = 140
  const PAD = 18

  let layout = $derived.by(() => {
    if (points.length === 0) return null
    const values = points.map((p) => p.value)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const span = max - min || 1
    const n = points.length
    const innerW = W - PAD * 2
    const innerH = H - PAD * 2
    const x = (i: number) => (n === 1 ? W / 2 : PAD + (innerW * i) / (n - 1))
    const y = (v: number) => PAD + innerH * (1 - (v - min) / span)
    const coords = points.map((p, i) => ({ cx: x(i), cy: y(p.value) }))
    return {
      coords,
      line: coords.map((c) => `${c.cx},${c.cy}`).join(' '),
      max,
      min,
    }
  })

  let label = $derived(
    points.length
      ? `Reps evolution over ${points.length} sessions, latest ${points[points.length - 1].value}`
      : 'No data',
  )
</script>

{#if !layout}
  <p class="empty card">
    {$_('progress.noData')}
  </p>
{:else}
  <div class="wrap card">
    <svg viewBox="0 0 {W} {H}" role="img" aria-label={label} class="chart">
      <defs>
        <linearGradient id="evo-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ff7a18" />
          <stop offset="100%" stop-color="#ff2d78" />
        </linearGradient>
      </defs>
      {#if layout.coords.length > 1}
        <polyline
          points={layout.line}
          fill="none"
          stroke="url(#evo-stroke)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      {/if}
      {#each layout.coords as c, i (i)}
        <circle cx={c.cx} cy={c.cy} r="4" fill="url(#evo-stroke)" />
      {/each}
    </svg>
    <div class="axis">
      <span>{$_('progress.max')} {layout.max}</span>
      <span>{$_('progress.min')} {layout.min}</span>
    </div>
  </div>
{/if}

<style>
  .wrap {
    padding: 0.85rem;
    display: grid;
    gap: 0.4rem;
  }
  .chart {
    width: 100%;
    height: auto;
    display: block;
  }
  .axis {
    display: flex;
    justify-content: space-between;
    color: var(--muted);
    font-size: 0.78rem;
  }
  .empty {
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--muted);
  }
</style>
