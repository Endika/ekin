import { writable } from 'svelte/store'

export type Theme = 'system' | 'light' | 'dark'

const KEY = 'ekin:theme'

function read(): Theme {
  try {
    const t = localStorage.getItem(KEY)
    if (t === 'light' || t === 'dark' || t === 'system') return t
  } catch {
    /* ignore */
  }
  return 'system'
}

function apply(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

function createTheme() {
  const initial = read()
  const { subscribe, set } = writable<Theme>(initial)
  apply(initial)
  return {
    subscribe,
    set: (theme: Theme) => {
      try {
        localStorage.setItem(KEY, theme)
      } catch {
        /* ignore */
      }
      apply(theme)
      set(theme)
    },
  }
}

export const theme = createTheme()
