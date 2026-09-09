/**
 * Generates FutbolYa PWA icons and splash assets into apps/web/public/.
 * Run: node apps/web/scripts/generate-pwa-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')
const iconsDir = path.join(publicDir, 'icons')
const splashDir = path.join(publicDir, 'splash')

const PRIMARY = '#006e2f'
const ACCENT = '#6bff8f'
const BG = '#f8f9ff'
const ON_PRIMARY = '#002109'

function logoSvg(size, { maskable = false } = {}) {
  const pad = maskable ? size * 0.18 : size * 0.12
  const inner = size - pad * 2
  const cx = size / 2
  const cy = size / 2
  const r = inner / 2
  const fontSize = Math.round(inner * 0.42)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${maskable ? PRIMARY : BG}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${PRIMARY}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.92}" fill="none" stroke="${ACCENT}" stroke-width="${Math.max(2, size * 0.02)}"/>
  <text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="${ACCENT}">FY</text>
</svg>`
}

function splashSvg(width, height) {
  const logo = Math.min(width, height) * 0.28
  const cx = width / 2
  const cy = height / 2 - height * 0.04
  const fontSize = Math.round(logo * 0.42)
  const titleSize = Math.round(Math.min(width, height) * 0.045)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${BG}"/>
  <circle cx="${cx}" cy="${cy}" r="${logo / 2}" fill="${PRIMARY}"/>
  <circle cx="${cx}" cy="${cy}" r="${logo / 2 * 0.92}" fill="none" stroke="${ACCENT}" stroke-width="${Math.max(3, logo * 0.03)}"/>
  <text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="${ACCENT}">FY</text>
  <text x="${cx}" y="${cy + logo / 2 + titleSize * 1.8}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="${ON_PRIMARY}" letter-spacing="4">FUTBOLYA</text>
</svg>`
}

async function svgToPng(svg, outPath) {
  await sharp(Buffer.from(svg)).png().toFile(outPath)
  console.log('wrote', path.relative(publicDir, outPath))
}

await mkdir(iconsDir, { recursive: true })
await mkdir(splashDir, { recursive: true })

await svgToPng(logoSvg(192), path.join(iconsDir, 'icon-192.png'))
await svgToPng(logoSvg(512), path.join(iconsDir, 'icon-512.png'))
await svgToPng(logoSvg(192, { maskable: true }), path.join(iconsDir, 'icon-192-maskable.png'))
await svgToPng(logoSvg(512, { maskable: true }), path.join(iconsDir, 'icon-512-maskable.png'))
await svgToPng(logoSvg(180), path.join(iconsDir, 'apple-touch-icon.png'))

// Favicon (32 + svg)
await svgToPng(logoSvg(32), path.join(publicDir, 'favicon-32.png'))
await writeFile(
  path.join(publicDir, 'favicon.svg'),
  logoSvg(48).replace('<?xml version="1.0" encoding="UTF-8"?>\n', ''),
)

// iOS startup (iPhone 14/15 portrait 1170x2532) + generic
await svgToPng(splashSvg(1170, 2532), path.join(splashDir, 'apple-splash-1170x2532.png'))
await svgToPng(splashSvg(1290, 2796), path.join(splashDir, 'apple-splash-1290x2796.png'))

console.log('PWA icons and splash generated.')
