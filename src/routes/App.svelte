<script lang="ts">
  import Builder from '../components/Builder.svelte'
  import SessionPlayer from '../components/SessionPlayer.svelte'
  import ProgressView from '../components/ProgressView.svelte'
  import Settings from '../components/Settings.svelte'
  import Icon from '../components/Icon.svelte'
  import { _ } from 'svelte-i18n'
  import { builder } from '../stores/builder'
  import { addSession } from '../data/sessions-repo'
  import type { Session, Workout } from '../domain/types'

  let view: 'builder' | 'session' | 'history' = $state('builder')
  let active: Workout | undefined = $state()
  let settingsOpen = $state(false)
  const version = __APP_VERSION__

  function start() {
    active = $builder
    view = 'session'
  }
  async function onfinish(s: Session) {
    await addSession(s)
    view = 'history'
  }
</script>

<header class="brand">
  <span class="logo">
    <Icon name="play" size={18} />
  </span>
  <span class="wordmark grad-text">ekin</span>
  <button
    class="gear"
    onclick={() => (settingsOpen = true)}
    aria-label={$_('settings.title')}
  >
    <Icon name="settings" size={20} />
  </button>
</header>

{#if settingsOpen}
  <Settings onclose={() => (settingsOpen = false)} />
{/if}

{#if view !== 'session'}
  <nav class="tabs" style="--idx: {view === 'builder' ? 0 : 1}">
    <span class="indicator" aria-hidden="true"></span>
    <button
      class:active={view === 'builder'}
      onclick={() => (view = 'builder')}
    >
      <Icon name="build" size={18} />
      {$_('nav.build')}
    </button>
    <button
      class:active={view === 'history'}
      onclick={() => (view = 'history')}
    >
      <Icon name="chart" size={18} />
      {$_('nav.progress')}
    </button>
  </nav>
{/if}

<main class="app">
  {#if view === 'builder'}
    <Builder onstart={start} />
  {:else if view === 'session' && active}
    <SessionPlayer workout={active} {onfinish} />
  {:else if view === 'history'}
    <ProgressView />
  {/if}

  {#if view !== 'session'}
    <footer class="ver">ekin v{version}</footer>
  {/if}
</main>

<style>
  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 720px;
    margin: 0 auto;
    padding: max(0.75rem, env(safe-area-inset-top)) 1.25rem 0.5rem;
  }
  .logo {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: var(--grad);
    color: #fff;
    box-shadow: var(--shadow-glow);
  }
  .wordmark {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.5rem;
    letter-spacing: -0.02em;
  }
  .gear {
    margin-left: auto;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
  }

  .tabs {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    gap: 0.25rem;
    max-width: 720px;
    margin: 0 auto;
    padding: 0.5rem 1.25rem 0.75rem;
    background: linear-gradient(var(--bg) 70%, transparent);
  }
  .tabs::after {
    content: '';
    position: absolute;
    inset: 0.5rem 1.25rem auto;
    height: 48px;
    border-radius: var(--radius-pill);
    background: var(--surface);
    border: 1px solid var(--border);
    z-index: -1;
  }
  .indicator {
    position: absolute;
    top: 0.5rem;
    left: 1.25rem;
    width: calc((100% - 2.5rem) / 2);
    height: 48px;
    border-radius: var(--radius-pill);
    background: var(--grad);
    box-shadow: var(--shadow-glow);
    transform: translateX(calc(var(--idx) * 100%));
    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .tabs button {
    position: relative;
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 48px;
    border: none;
    background: transparent;
    border-radius: var(--radius-pill);
    font-family: var(--font-display);
    font-weight: 600;
    color: var(--muted);
    transition: color 0.2s ease;
  }
  .tabs button.active {
    color: #fff;
  }

  .app {
    padding: 0.25rem 1.25rem max(1.25rem, env(safe-area-inset-bottom));
    max-width: 720px;
    margin: 0 auto;
  }
  .ver {
    margin-top: 1.5rem;
    text-align: center;
    color: var(--muted);
    font-size: 0.72rem;
    opacity: 0.6;
  }
</style>
