<script lang="ts">
  import Builder from '../components/Builder.svelte'
  import SessionPlayer from '../components/SessionPlayer.svelte'
  import HistoryList from '../components/HistoryList.svelte'
  import { builder } from '../stores/builder'
  import { addSession } from '../data/sessions-repo'
  import type { Session, Workout } from '../domain/types'

  let view: 'builder' | 'session' | 'history' = $state('builder')
  let active: Workout | undefined = $state()

  function start() {
    active = $builder
    view = 'session'
  }
  async function onfinish(s: Session) {
    await addSession(s)
    view = 'history'
  }
</script>

<nav class="tabs">
  <button class:active={view === 'builder'} onclick={() => (view = 'builder')}
    >Build</button
  >
  <button class:active={view === 'history'} onclick={() => (view = 'history')}
    >History</button
  >
</nav>

<main class="app">
  {#if view === 'builder'}
    <Builder onstart={start} onsaved={() => (view = 'history')} />
  {:else if view === 'session' && active}
    <SessionPlayer workout={active} {onfinish} />
  {:else if view === 'history'}
    <HistoryList />
  {/if}
</main>

<style>
  .tabs {
    display: flex;
    gap: 0.5rem;
    padding: max(0.5rem, env(safe-area-inset-top)) 1rem 0.5rem;
    position: sticky;
    top: 0;
    background: var(--bg);
  }
  .tabs button {
    flex: 1;
    min-height: 44px;
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  .tabs button.active {
    background: var(--accent);
    color: white;
  }
  .app {
    padding: 0 1rem max(1rem, env(safe-area-inset-bottom));
    max-width: 720px;
    margin: 0 auto;
  }
</style>
