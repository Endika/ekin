import { writable } from 'svelte/store'

const KEY = 'ekin:gemini-key'

function readKey(): string {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

function createGeminiKey() {
  const { subscribe, set } = writable<string>(readKey())
  return {
    subscribe,
    set: (value: string) => {
      const trimmed = value.trim()
      if (trimmed) localStorage.setItem(KEY, trimmed)
      else localStorage.removeItem(KEY)
      set(trimmed)
    },
    clear: () => {
      localStorage.removeItem(KEY)
      set('')
    },
  }
}

export const geminiKey = createGeminiKey()
