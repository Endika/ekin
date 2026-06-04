// Rasterizes the brand mark into PWA PNG icons.
// Regenerate with: npm run icons
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const faviconPath = resolve(root, 'public/favicon.svg')
const favicon = readFileSync(faviconPath, 'utf8')

// Maskable variant: gradient fills the full bleed (no rounded corners) and the
// mark sits inside the ~80% safe zone so it survives platform mask cropping.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff7a18" />
      <stop offset="1" stop-color="#ff2d78" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)" />
  <g transform="translate(256 256) scale(0.74) translate(-256 -256)"
     fill="none" stroke="#fff" stroke-width="44"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M150 140 L300 256 L150 372" />
    <path d="M256 140 L406 256 L256 372" opacity="0.45" />
  </g>
</svg>`

function render(svg, size, out) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
  })
  const png = resvg.render().asPng()
  writeFileSync(resolve(root, out), png)
  console.log(`wrote ${out} (${size}x${size})`)
}

render(favicon, 192, 'public/icon-192.png')
render(favicon, 512, 'public/icon-512.png')
render(maskable, 512, 'public/icon-512-maskable.png')
