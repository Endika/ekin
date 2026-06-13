<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { uuidv7 } from 'uuidv7'
  import type { Workout, Session, SessionItemLog } from '../domain/types'
  import { initSession, tick, advance } from '../lib/timer'
  import { requestWakeLock, releaseWakeLock } from '../lib/wakeLock'
  import { allExercises } from '../stores/catalog-store'
  import Icon from './Icon.svelte'
  import { zoneIcon } from '../lib/zoneIcon'
  import { _ } from 'svelte-i18n'

  let {
    workout,
    onfinish,
  }: { workout: Workout; onfinish: (s: Session) => void } = $props()

  const isTimed = workout.mode === 'timed'
  const rounds = workout.rounds ?? 1

  let state = $state(initSession(workout))
  let startedAt = Date.now()
  let interval: ReturnType<typeof setInterval> | undefined
  let logs: number[][] = $state(
    workout.items.map((it) => Array(it.sets).fill(it.reps)),
  )

  const exOf = (id: string) => allExercises.find((e) => e.id === id)
  let current = $derived(
    state.phase === 'done'
      ? undefined
      : exOf(workout.items[state.itemIndex].exerciseId),
  )

  // The countdown ring is shown for rest (both modes) and for the work phase in
  // timed mode (it auto-counts the work interval). Rep-mode work is manual.
  let ringActive = $derived(
    state.phase === 'rest' || (isTimed && state.phase === 'work'),
  )

  // Rest/work ring geometry (visual only).
  const R = 86
  const CIRC = 2 * Math.PI * R
  let ringTotal = $derived(
    ringActive
      ? Math.max(
          1,
          state.phase === 'rest'
            ? workout.items[state.itemIndex].restSeconds
            : (workout.items[state.itemIndex].workSeconds ?? 1),
        )
      : 1,
  )
  let ringOffset = $derived(CIRC * (1 - state.remaining / ringTotal))

  let imgOk = $state(true)
  $effect(() => {
    void current?.id
    imgOk = true
  })

  function buzz() {
    if ('vibrate' in navigator) navigator.vibrate(60)
  }

  function next() {
    buzz()
    state = advance(state)
    if (state.phase === 'done') finish()
  }

  function finish() {
    const sessionLogs: SessionItemLog[] = workout.items.map((it, i) => ({
      exerciseId: it.exerciseId,
      sets: logs[i].map((reps, setIndex) => ({ setIndex, reps })),
    }))
    const ended = Date.now()
    onfinish({
      id: uuidv7(),
      workoutId: workout.id,
      workoutName: workout.name,
      startedAt,
      endedAt: ended,
      durationSeconds: Math.round((ended - startedAt) / 1000),
      logs: sessionLogs,
    })
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible' && state.phase !== 'done') {
      requestWakeLock()
    }
  }

  onMount(() => {
    requestWakeLock()
    document.addEventListener('visibilitychange', onVisibilityChange)
    interval = setInterval(() => {
      // Timed mode auto-counts work and rest; rep mode only counts rest.
      const counts =
        state.phase === 'rest' || (isTimed && state.phase === 'work')
      if (counts) {
        const before = state.phase
        state = tick(state)
        if (state.phase !== before) buzz()
        if (state.phase === 'done') finish()
      }
    }, 1000)
  })
  onDestroy(() => {
    if (interval) clearInterval(interval)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    releaseWakeLock()
  })
</script>

{#if state.phase === 'done'}
  <p class="done">{$_('player.complete')}</p>
{:else if current}
  <section class="player fade-up">
    <header>
      <span class="pill">
        {$_('player.exercise', {
          values: {
            n: state.itemIndex + 1,
            total: workout.items.length,
          },
        })}
      </span>
      {#if isTimed}
        <span class="pill">
          {$_('player.round', {
            values: { n: state.roundIndex + 1, total: rounds },
          })}
        </span>
      {:else}
        <span class="pill">
          {$_('player.set', {
            values: {
              n: state.setIndex + 1,
              total: workout.items[state.itemIndex].sets,
            },
          })}
        </span>
      {/if}
    </header>

    {#if ringActive}
      <div class="rest">
        {#if isTimed && state.phase === 'work' && current}
          <h2 class="work-name">{current.name}</h2>
        {/if}
        <div class="ring-wrap">
          <svg class="ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#ff7a18" />
                <stop offset="1" stop-color="#ff2d78" />
              </linearGradient>
            </defs>
            <circle class="track" cx="100" cy="100" r={R} />
            <circle
              class="bar"
              cx="100"
              cy="100"
              r={R}
              stroke-dasharray={CIRC}
              stroke-dashoffset={ringOffset}
            />
          </svg>
          <div class="ring-center">
            <span class="count grad-text">{state.remaining}</span>
            <span class="rest-label">
              {state.phase === 'rest' ? $_('player.rest') : $_('player.go')}
            </span>
          </div>
        </div>
      </div>
    {:else}
      <div class="work">
        {#if current.images[0] && imgOk}
          <img
            src={current.images[0]}
            alt={current.name}
            onerror={() => (imgOk = false)}
          />
        {:else}
          <div class="ph" aria-hidden="true">
            <Icon
              name={current ? zoneIcon(current.zone) : 'dumbbell'}
              size={64}
            />
          </div>
        {/if}
        <h2>{current.name}</h2>

        <div class="dots" aria-label={$_('a11y.setProgress')}>
          {#each Array(workout.items[state.itemIndex].sets) as _, d (d)}
            <span class="dot" class:on={d <= state.setIndex}></span>
          {/each}
        </div>

        <div class="reps">
          <span class="reps-label">{$_('player.repsDone')}</span>
          <div class="ctrl">
            <button
              aria-label={$_('a11y.decreaseReps')}
              onclick={() =>
                (logs[state.itemIndex][state.setIndex] = Math.max(
                  0,
                  logs[state.itemIndex][state.setIndex] - 1,
                ))}
            >
              <Icon name="minus" size={20} />
            </button>
            <input
              type="number"
              min="0"
              bind:value={logs[state.itemIndex][state.setIndex]}
            />
            <button
              aria-label={$_('a11y.increaseReps')}
              onclick={() => (logs[state.itemIndex][state.setIndex] += 1)}
            >
              <Icon name="plus" size={20} />
            </button>
          </div>
        </div>
      </div>
    {/if}

    <button class="next btn-grad" onclick={next}>
      {#if state.phase === 'rest'}
        <Icon name="play" size={22} /> {$_('player.skipRest')}
      {:else if isTimed}
        <Icon name="play" size={22} /> {$_('player.skip')}
      {:else}
        <Icon name="check" size={22} /> {$_('player.doneSet')}
      {/if}
    </button>
  </section>
{/if}

<style>
  .done {
    text-align: center;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.5rem;
    padding: 3rem 0;
  }
  .player {
    display: grid;
    gap: 1.1rem;
    text-align: center;
    padding-top: 0.5rem;
  }
  header {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .pill {
    padding: 0.3rem 0.8rem;
    border-radius: var(--radius-pill);
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--muted);
    font-weight: 600;
    font-size: 0.85rem;
  }

  /* Rest ring */
  .rest {
    position: relative;
    display: grid;
    place-items: center;
    padding: 1.5rem 0;
  }
  .work-name {
    margin: 0 0 0.6rem;
    font-size: 1.5rem;
    text-align: center;
  }
  .ring-wrap {
    position: relative;
    display: grid;
    place-items: center;
  }
  .ring {
    width: min(74vw, 300px);
    height: min(74vw, 300px);
    transform: rotate(-90deg);
  }
  .ring .track {
    fill: none;
    stroke: var(--surface-2);
    stroke-width: 14;
  }
  .ring .bar {
    fill: none;
    stroke: url(#ring-grad);
    stroke-width: 14;
    stroke-linecap: round;
    filter: drop-shadow(0 0 10px var(--accent-glow));
  }
  .ring-center {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    gap: 0.1rem;
  }
  .count {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 5rem;
    line-height: 1;
  }
  .rest-label {
    color: var(--muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.85rem;
  }

  /* Work */
  .work {
    display: grid;
    gap: 0.9rem;
    justify-items: center;
  }
  img,
  .ph {
    width: 100%;
    max-width: 420px;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }
  .ph {
    display: grid;
    place-items: center;
    background:
      linear-gradient(
        135deg,
        rgba(255, 122, 24, 0.18),
        rgba(255, 45, 120, 0.18)
      ),
      var(--surface-2);
    color: var(--accent);
  }
  .work h2 {
    margin: 0;
    font-size: 1.6rem;
  }
  .dots {
    display: flex;
    gap: 0.4rem;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .dot.on {
    background: var(--grad);
    border-color: transparent;
    box-shadow: 0 0 8px var(--accent-glow);
  }

  .reps {
    display: grid;
    gap: 0.5rem;
    justify-items: center;
  }
  .reps-label {
    color: var(--muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.78rem;
  }
  .reps .ctrl {
    display: flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface);
    overflow: hidden;
  }
  .reps .ctrl button {
    display: grid;
    place-items: center;
    width: 52px;
    height: 56px;
    border: none;
    background: transparent;
    color: var(--text);
  }
  .reps .ctrl input {
    width: 4.5rem;
    text-align: center;
    border: none;
    background: transparent;
    padding: 0;
    height: 56px;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.6rem;
  }

  .next {
    min-height: 60px;
    border-radius: var(--radius);
    font-size: 1.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  @media (prefers-reduced-motion: no-preference) {
    .ring .bar {
      transition: stroke-dashoffset 1s linear;
    }
  }
</style>
