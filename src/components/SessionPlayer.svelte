<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { uuidv7 } from 'uuidv7'
  import type { Workout, Session, SessionItemLog } from '../domain/types'
  import { initSession, tick, advance } from '../lib/timer'
  import { requestWakeLock, releaseWakeLock } from '../lib/wakeLock'
  import { allExercises } from '../stores/catalog-store'

  let {
    workout,
    onfinish,
  }: { workout: Workout; onfinish: (s: Session) => void } = $props()

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
      if (state.phase === 'rest') {
        const before = state.phase
        state = tick(state)
        if (state.phase !== before) buzz()
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
  <p>Session complete 💪</p>
{:else if current}
  <section class="player">
    <header>
      <span>Exercise {state.itemIndex + 1}/{workout.items.length}</span>
      <span>Set {state.setIndex + 1}/{workout.items[state.itemIndex].sets}</span
      >
    </header>

    {#if state.phase === 'rest'}
      <div class="rest">
        <span class="count">{state.remaining}</span>
        <p>Rest</p>
      </div>
    {:else}
      <h2>{current.name}</h2>
      {#if current.images[0] && imgOk}<img
          src={current.images[0]}
          alt={current.name}
          onerror={() => (imgOk = false)}
        />{/if}
      <ol class="instructions">
        {#each current.instructions.slice(0, 3) as step, i (i)}<li>
            {step}
          </li>{/each}
      </ol>
      <label class="reps">
        Reps done
        <input
          type="number"
          min="0"
          bind:value={logs[state.itemIndex][state.setIndex]}
        />
      </label>
    {/if}

    <button class="next" onclick={next}
      >{state.phase === 'rest' ? 'Skip rest' : 'Done set'}</button
    >
  </section>
{/if}

<style>
  .player {
    display: grid;
    gap: 0.75rem;
    text-align: center;
  }
  header {
    display: flex;
    justify-content: space-between;
    color: var(--muted);
  }
  img {
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    border-radius: 12px;
  }
  .rest {
    display: grid;
    place-items: center;
    padding: 2rem 0;
  }
  .count {
    font-size: 4rem;
    font-weight: 800;
  }
  .instructions {
    text-align: left;
  }
  .reps input {
    width: 5rem;
    padding: 0.5rem;
    min-height: 44px;
  }
  .next {
    min-height: 56px;
    border-radius: 14px;
    background: var(--accent);
    color: white;
    font-size: 1.1rem;
  }
</style>
