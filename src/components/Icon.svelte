<script lang="ts">
  type IconName =
    | 'search'
    | 'plus'
    | 'trash'
    | 'chevron-up'
    | 'chevron-down'
    | 'minus'
    | 'dumbbell'
    | 'play'
    | 'check'
    | 'flame'
    | 'clock'
    | 'build'
    | 'history'
    | 'rotate'
    | 'chart'
    | 'wand'
    | 'settings'
    | 'x'
    | 'sun'
    | 'moon'
    | 'monitor'
    | 'upper'
    | 'core'
    | 'legs'

  let { name, size = 24 }: { name: IconName; size?: number } = $props()

  // 24x24, stroke 1.75, currentColor, rounded linecaps.
  const paths: Record<IconName, string> = {
    search: 'M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0 M21 21l-4.3 -4.3',
    plus: 'M12 5v14 M5 12h14',
    minus: 'M5 12h14',
    trash:
      'M4 7h16 M10 11v6 M14 11v6 M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12 M9 7V4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
    'chevron-up': 'M6 15l6 -6l6 6',
    'chevron-down': 'M6 9l6 6l6 -6',
    dumbbell:
      'M6.5 6.5l11 11 M21 21l-1 -1 M3 3l1 1 M18 22l4 -4 M2 6l4 -4 M3 10l7 -7 M14 21l7 -7',
    play: 'M7 4v16l13 -8z',
    check: 'M5 12l5 5l9 -11',
    flame:
      'M12 21c-4 0 -7 -2.5 -7 -6.5c0 -2 1 -4 2.5 -5.5c.5 2 1.5 2.5 1.5 2.5c0 -3 1.5 -5 3.5 -6.5c-.5 3 1 4.5 2.5 6.5c.9 1.2 1.5 2.6 1.5 3.5c0 4 -3 6 -8 6z',
    clock: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M12 7v5l3 2',
    build: 'M4 5h16 M4 12h10 M4 19h7 M17 14l4 4 M21 14l-4 4',
    history: 'M3.05 11a9 9 0 1 1 .5 4 M3 16v-5h5 M12 7v5l3 2',
    rotate: 'M20 11a8 8 0 1 0 -2.3 5.7 M20 11v-5 M20 11h-5',
    chart: 'M4 4v16h16 M8 14l3 -3l2 2l5 -6',
    wand: 'M6 21l13 -13l-3 -3l-13 13z M15 6l3 3 M5 4l1 2l2 1l-2 1l-1 2l-1 -2l-2 -1l2 -1z',
    settings:
      'M10.3 4.3a1.94 1.94 0 0 1 3.4 0a1.94 1.94 0 0 0 2.7 1.1a1.94 1.94 0 0 1 2.4 2.4a1.94 1.94 0 0 0 1.1 2.7a1.94 1.94 0 0 1 0 3.4a1.94 1.94 0 0 0 -1.1 2.7a1.94 1.94 0 0 1 -2.4 2.4a1.94 1.94 0 0 0 -2.7 1.1a1.94 1.94 0 0 1 -3.4 0a1.94 1.94 0 0 0 -2.7 -1.1a1.94 1.94 0 0 1 -2.4 -2.4a1.94 1.94 0 0 0 -1.1 -2.7a1.94 1.94 0 0 1 0 -3.4a1.94 1.94 0 0 0 1.1 -2.7a1.94 1.94 0 0 1 2.4 -2.4a1.94 1.94 0 0 0 2.7 -1.1z M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    x: 'M6 6l12 12 M18 6l-12 12',
    sun: 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0 M12 2v2 M12 20v2 M4 12h-2 M22 12h-2 M5 5l1.5 1.5 M17.5 17.5l1.5 1.5 M5 19l1.5 -1.5 M17.5 6.5l1.5 -1.5',
    moon: 'M18 16a8 8 0 0 1 -10 -10a8 8 0 1 0 10 10z',
    monitor: 'M3 5h18v11h-18z M9 20h6 M12 16v4',
    // Body-zone glyphs (used as image fallbacks)
    upper: 'M6 6h12 M8 6c0 4 1 6 4 6s4 -2 4 -6 M12 12v5 M9 20h6',
    core: 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    legs: 'M9 4v8l-2 8 M15 4v8l2 8 M9 12h6',
  }
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#each paths[name].split(' M') as seg, i (i)}
    <path d={i === 0 ? seg : 'M' + seg} />
  {/each}
</svg>
