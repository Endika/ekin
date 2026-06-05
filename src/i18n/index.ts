import { addMessages, init, locale, getLocaleFromNavigator } from 'svelte-i18n'
import en from './locales/en.json'
import es from './locales/es.json'
import eu from './locales/eu.json'
import gl from './locales/gl.json'
import ca from './locales/ca.json'
import va from './locales/va.json'

export const locales = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'eu', label: 'Euskara' },
  { code: 'gl', label: 'Galego' },
  { code: 'ca', label: 'Català' },
  { code: 'va', label: 'Valencià' },
] as const

export type Locale = (typeof locales)[number]['code']

const SUPPORTED = locales.map((l) => l.code) as readonly string[]
const STORAGE_KEY = 'ekin:locale'

addMessages('en', en)
addMessages('es', es)
addMessages('eu', eu)
addMessages('gl', gl)
addMessages('ca', ca)
addMessages('va', va)

function isSupported(code: string | null | undefined): code is Locale {
  return !!code && SUPPORTED.includes(code)
}

function detect(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (isSupported(saved)) return saved
  const nav = getLocaleFromNavigator()?.slice(0, 2)
  if (isSupported(nav)) return nav
  return 'en'
}

export function setupI18n(): void {
  init({ fallbackLocale: 'en', initialLocale: detect() })
}

export function setLocale(code: Locale): void {
  localStorage.setItem(STORAGE_KEY, code)
  locale.set(code)
}
