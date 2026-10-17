import { readFileSync } from 'node:fs'
import jsQR from 'jsqr'
import { describe, expect, it } from 'vitest'
import { site } from '../../app/data/site'
import { QUIET_ZONE, qrModules, qrSvg } from '../../scripts/lib/qr'
import { readColor } from '../../scripts/lib/tokens'

// The QR code of the LINE account (scripts/generate-line-qr.mjs). It is read back with jsQR, a QR
// reader that has nothing to do with the library that made it (qrcode-generator), so a wrong link or a
// broken code fails here. The browser test (tests/e2e/sections.spec.ts) reads the image on the page too.

const tokensCss = readFileSync(new URL('../../app/assets/css/tokens.css', import.meta.url), 'utf8')
const navy = readColor(tokensCss, 'harbor-navy')
const white = readColor(tokensCss, 'white')

/** Draws the modules as RGBA pixels, `scale` pixels per module, with the quiet zone around them. */
function rasterize(modules: boolean[][], dark: string, light: string, scale = 4) {
  const rgb = (hex: string) => [1, 3, 5].map(start => Number.parseInt(hex.slice(start, start + 2), 16))
  const side = (modules.length + 2 * QUIET_ZONE) * scale
  const pixels = new Uint8ClampedArray(side * side * 4)
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const row = Math.floor(y / scale) - QUIET_ZONE
      const column = Math.floor(x / scale) - QUIET_ZONE
      const isDark = modules[row]?.[column] ?? false
      pixels.set([...rgb(isDark ? dark : light), 255], (y * side + x) * 4)
    }
  }
  return { pixels, side }
}

describe('QR code of the LINE account', () => {
  const modules = qrModules(site.line.url)

  it('reads back as the LINE link, word for word, in the site colours', () => {
    const { pixels, side } = rasterize(modules, navy, white)
    expect(jsQR(pixels, side, side)?.data).toBe(site.line.url)
  })

  it('control: a different link does not read as the LINE link', () => {
    const { pixels, side } = rasterize(qrModules('https://example.com/'), navy, white)
    const decoded = jsQR(pixels, side, side)
    expect(decoded?.data).toBe('https://example.com/')
    expect(decoded?.data).not.toBe(site.line.url)
  })

  it('is a square with a quiet zone of 4 modules in the SVG', () => {
    expect(modules.every(row => row.length === modules.length)).toBe(true)
    const svg = qrSvg(modules, { color: navy, background: white })
    const side = modules.length + 2 * QUIET_ZONE
    expect(svg).toContain(`viewBox="0 0 ${side} ${side}"`)
    // Every dark run starts inside the quiet zone border.
    const starts = [...svg.matchAll(/M(\d+) (\d+)h(\d+)/g)].map(([, x, y, length]) => [Number(x), Number(y), Number(length)] as const)
    expect(starts.length).toBeGreaterThan(0)
    for (const [x, y, length] of starts) {
      expect(x).toBeGreaterThanOrEqual(QUIET_ZONE)
      expect(y).toBeGreaterThanOrEqual(QUIET_ZONE)
      expect(x + length).toBeLessThanOrEqual(side - QUIET_ZONE)
      expect(y).toBeLessThan(side - QUIET_ZONE)
    }
  })

  it('is the file in public/images/: run `npm run qr` after changing the LINE link', () => {
    const file = readFileSync(new URL('../../public/images/line-qr.svg', import.meta.url), 'utf8')
    expect(file).toContain(`fill="${navy}"`)
    expect(file).toContain(`fill="${white}"`)
    // The same path as a fresh one: the file holds the current link.
    const path = qrSvg(modules, { color: navy, background: white }).match(/ d="([^"]+)"/)![1]
    expect(file).toContain(` d="${path}"`)
  })
})
