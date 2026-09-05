<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { uuidv7 } from 'uuidv7'
  import type { Workout, Session, SessionItemLog } from '../domain/types'
  import { initSession, tick, advance, isTimedItem } from '../lib/timer'
  import { requestWakeLock, releaseWakeLock } from '../lib/wakeLock'
  import { primeSound, playCue, soundEnabled, type Cue } from '../lib/sound'
  import { allExercises } from '../stores/catalog-store'
  import { localizedInstructions } from '../domain/catalog'
  import Icon from './Icon.svelte'
  import { zoneIcon } from '../lib/zoneIcon'
  import { _, locale } from 'svelte-i18n'

  let {
    workout,
    onfinish,
  }: { workout: Workout; onfinish: (s: Session) => void } = $props()

  const isTimed = workout.mode === 'timed'
  const rounds = workout.rounds ?? 1

  let player = $state(initSession(workout))
  let startedAt = Date.now()
  let interval: ReturnType<typeof setInterval> | undefined
  let logs: number[][] = $state(
    workout.items.map((it) => Array(it.sets).fill(it.reps)),
  )

  const exOf = (id: string) => allExercises.find((e) => e.id === id)
  let current = $derived(
    player.phase === 'done'
      ? undefined
      : exOf(workout.items[player.itemIndex].exerciseId),
  )
  let steps = $derived(
    current ? localizedInstructions(current, $locale ?? 'en') : [],
  )

  let currentBlock = $derived(
    player.phase === 'done'
      ? 'main'
      : (workout.items[player.itemIndex].block ?? 'main'),
  )

  // The countdown ring is shown for rest (both modes) and for any work phase that counts
  // itself down — a circuit interval, or a warm-up / cool-down stretch. Rep work is manual.
  let ringActive = $derived(
    player.phase === 'rest' ||
      (player.phase === 'work' && isTimedItem(workout, player.itemIndex)),
  )

  // Rest/work ring geometry (visual only).
  const R = 86
  const CIRC = 2 * Math.PI * R
  let ringTotal = $derived(
    ringActive
      ? Math.max(
          1,
          player.phase === 'rest'
            ? workout.items[player.itemIndex].restSeconds
            : (workout.items[player.itemIndex].workSeconds ?? 1),
        )
      : 1,
  )
  let ringOffset = $derived(CIRC * (1 - player.remaining / ringTotal))

  let imgOk = $state(true)
  $effect(() => {
    void current?.id
    imgOk = true
  })

  function buzz() {
    if ('vibrate' in navigator) navigator.vibrate(60)
  }

  // The phone trains face down on the floor: a silenced phone still has the buzz, a
  // phone in a pocket still has the cue. Both fire, never one instead of the other.
  function signal(cue: Cue) {
    buzz()
    playCue(cue)
  }

  function next() {
    player = advance(player)
    if (player.phase === 'done') finish()
    else signal(player.phase)
  }

  function finish() {
    signal('finish')
    // Only the main block is logged. Warm-up and cool-down stretches are held for time,
    // not counted in reps, so logging them would plot a flat zero series on the progress
    // charts for every stretch ever done.
    const sessionLogs: SessionItemLog[] = workout.items
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => (it.block ?? 'main') === 'main')
      .map(({ it, i }) => ({
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
    if (document.visibilityState === 'visible' && player.phase !== 'done') {
      requestWakeLock()
    }
  }

  onMount(() => {
    requestWakeLock()
    // Fallback for entry points that reach the player without a Start click. Muted, there
    // is nothing to unlock, so no AudioContext is built either.
    if ($soundEnabled) primeSound()
    document.addEventListener('visibilitychange', onVisibilityChange)
    interval = setInterval(() => {
      // Whatever the ring draws is what counts down, so the two can never disagree.
      if (!ringActive) return
      // tick() advances exactly when the last second runs out, so the phase cue replaces
      // the final tick instead of stacking on top of it.
      const advancing = player.remaining <= 1
      player = tick(player)
      if (player.phase === 'done') finish()
      else if (advancing) signal(player.phase)
      else if (player.remaining <= 3) playCue('tick')
    }, 1000)
  })
  onDestroy(() => {
    if (interval) clearInterval(interval)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    releaseWakeLock()
  })
</script>

{#if player.phase === 'done'}
  <p class="done">{$_('player.complete')}</p>
{:else if current}
  <section class="player fade-up">
    <header>
      <span class="pill">
        {$_('player.exercise', {
          values: {
            n: player.itemIndex + 1,
            total: workout.items.length,
          },
        })}
      </span>
      <!-- Warm-up and cool-down play once, outside the rounds and outside the sets, so
           neither counter means anything while one is running. -->
      {#if currentBlock !== 'main'}
        <span class="pill block">{$_('block.' + currentBlock)}</span>
      {:else if isTimed}
        <span class="pill">
          {$_('player.round', {
            values: { n: player.roundIndex + 1, total: rounds },
          })}
        </span>
      {:else}
        <span class="pill">
          {$_('player.set', {
            values: {
              n: player.setIndex + 1,
              total: workout.items[player.itemIndex].sets,
            },
          })}
        </span>
      {/if}
    </header>

    {#if ringActive}
      <div class="rest">
        <!-- Any self-counting work phase, not just a circuit interval: a warm-up hold in a
             rep workout counts down too, and without this the ring named no exercise. -->
        {#if player.phase === 'work' && current}
          <h2 class="work-name">{current.name}</h2>
          {#if current.images[0] && imgOk}
            <img
              class="work-img"
              src={current.images[0]}
              alt={current.name}
              onerror={() => (imgOk = false)}
            />
          {:else}
            <div class="work-img ph" aria-hidden="true">
              <Icon name={zoneIcon(current.zone)} size={48} />
            </div>
          {/if}
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
            <span class="count grad-text">{player.remaining}</span>
            <span class="rest-label">
              {player.phase === 'rest' ? $_('player.rest') : $_('player.go')}
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
          {#each Array(workout.items[player.itemIndex].sets) as _, d (d)}
            <span class="dot" class:on={d <= player.setIndex}></span>
          {/each}
        </div>

        <div class="reps">
          <span class="reps-label">{$_('player.repsDone')}</span>
          <div class="ctrl">
            <button
              aria-label={$_('a11y.decreaseReps')}
              onclick={() =>
                (logs[player.itemIndex][player.setIndex] = Math.max(
                  0,
                  logs[player.itemIndex][player.setIndex] - 1,
                ))}
            >
              <Icon name="minus" size={20} />
            </button>
            <input
              type="number"
              min="0"
              bind:value={logs[player.itemIndex][player.setIndex]}
            />
            <button
              aria-label={$_('a11y.increaseReps')}
              onclick={() => (logs[player.itemIndex][player.setIndex] += 1)}
            >
              <Icon name="plus" size={20} />
            </button>
          </div>
        </div>
      </div>
    {/if}

    {#if steps.length}
      <details class="howto">
        <summary>
          <Icon name="info" size={16} />
          {$_('player.howto')}
        </summary>
        <ol>
          {#each steps as step (step)}
            <li>{step}</li>
          {/each}
        </ol>
      </details>
    {/if}

    <!-- A running clock is cut short, whether it is a rest, a circuit interval or a
         stretch held for time. Only manual rep work is reported as done. -->
    <button class="next btn-grad" onclick={next}>
      {#if player.phase === 'rest'}
        <Icon name="play" size={22} /> {$_('player.skipRest')}
      {:else if ringActive}
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
  .work-img {
    width: 100%;
    max-width: 260px;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    margin-bottom: 0.9rem;
  }
  .work-img.ph {
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

  .howto {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    text-align: left;
    padding: 0 0.9rem;
  }
  .howto summary {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.7rem 0;
    cursor: pointer;
    color: var(--muted);
    font-weight: 600;
    list-style: none;
  }
  .howto summary::-webkit-details-marker {
    display: none;
  }
  .howto ol {
    margin: 0 0 0.8rem;
    padding-left: 1.2rem;
    display: grid;
    gap: 0.45rem;
    color: var(--text);
    font-size: 0.9rem;
    line-height: 1.45;
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
