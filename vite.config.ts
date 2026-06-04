import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/ekin/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Ekin',
        short_name: 'Ekin',
        description: 'Bodyweight home workouts',
        theme_color: '#141019',
        background_color: '#141019',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/ekin/',
        scope: '/ekin/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname === 'raw.githubusercontent.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-images',
              expiration: { maxEntries: 1000 },
            },
          },
        ],
      },
    }),
  ],
  test: { environment: 'jsdom', setupFiles: ['tests/setup.ts'] },
})
