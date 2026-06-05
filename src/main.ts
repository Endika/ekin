import { mount } from 'svelte'
import { waitLocale } from 'svelte-i18n'
import './app.css'
import { setupI18n } from './i18n'
import App from './routes/App.svelte'

setupI18n()

const app = await waitLocale().then(() =>
  mount(App, {
    target: document.getElementById('app')!,
  }),
)

export default app
