<script lang="ts">
  import { computeStats } from '../domain/stats'
  import type { Session } from '../domain/types'
  import Icon from './Icon.svelte'
  import { _ } from 'svelte-i18n'

  let { sessions }: { sessions: Session[] } = $props()
  let stats = $derived(computeStats(sessions, Date.now()))
</script>

<div class="stats fade-up">
  <div class="pill streak">
    <span class="ico"><Icon name="flame" size={18} /></span>
    <span class="val">{stats.currentStreak}</span>
    <span class="lbl">{$_('stats.streak')}</span>
  </div>
  <div class="pill">
    <span class="val">{stats.totalSessions}</span>
    <span class="lbl">{$_('stats.sessions')}</span>
  </div>
  <div class="pill">
    <span class="val">{stats.totalMinutes}</span>
    <span class="lbl">{$_('stats.minutes')}</span>
  </div>
</div>

<style>
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin: 0.25rem 0 0.75rem;
  }
  .pill {
    display: grid;
    justify-items: center;
    gap: 0.1rem;
    padding: 0.8rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    text-align: center;
  }
  .val {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.5rem;
    line-height: 1;
  }
  .lbl {
    color: var(--muted);
    font-size: 0.75rem;
  }
  .streak {
    position: relative;
  }
  .streak .ico {
    color: var(--accent);
  }
  .streak .val {
    background: var(--grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
</style>
