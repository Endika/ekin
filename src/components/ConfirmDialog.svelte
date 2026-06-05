<script lang="ts">
  import { _ } from 'svelte-i18n'

  let {
    message,
    confirmLabel,
    danger = false,
    onconfirm,
    oncancel,
  }: {
    message: string
    confirmLabel: string
    danger?: boolean
    onconfirm: () => void
    oncancel: () => void
  } = $props()
</script>

<div
  class="backdrop"
  role="presentation"
  onclick={(e) => {
    if (e.target === e.currentTarget) oncancel()
  }}
  onkeydown={(e) => e.key === 'Escape' && oncancel()}
>
  <section class="dialog card" role="alertdialog" aria-modal="true">
    <p class="msg">{message}</p>
    <div class="actions">
      <button class="cancel" onclick={oncancel}>{$_('common.cancel')}</button>
      <button class="confirm" class:danger onclick={onconfirm}>
        {confirmLabel}
      </button>
    </div>
  </section>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.6);
  }
  .dialog {
    width: 100%;
    max-width: 360px;
    display: grid;
    gap: 1.1rem;
    padding: 1.25rem;
  }
  .msg {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.05rem;
    line-height: 1.4;
  }
  .actions {
    display: flex;
    gap: 0.6rem;
  }
  .actions button {
    flex: 1;
    min-height: 48px;
    border-radius: var(--radius-sm);
    font-weight: 600;
  }
  .cancel {
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
  }
  .confirm {
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
  }
  .confirm.danger {
    border-color: transparent;
    background: var(--danger);
    color: #fff;
  }
</style>
