<script lang="ts">
  import { locale } from 'svelte-i18n'
  import { locales, setLocale, type Locale } from '../i18n'
</script>

<select
  class="locale"
  value={$locale}
  onchange={(e) => setLocale(e.currentTarget.value as Locale)}
>
  {#each locales as l (l.code)}
    <option value={l.code}>{l.label}</option>
  {/each}
</select>

<style>
  .locale {
    min-height: 44px;
    padding: 0 0.7rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    font: inherit;
  }
</style>
