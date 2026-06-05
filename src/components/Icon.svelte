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
