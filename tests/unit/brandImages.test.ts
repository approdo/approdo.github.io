import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { removeMetadata, svgDrawing } from '../../scripts/lib/svg'

// The icons and the link-preview image that `npm run brand-images` makes from Approdo's logo files
// (scripts/generate-brand-images.mjs, task BR-004). The rules hold for any logo: the tab icon is the
// logo file, the PNG files have the sizes that browsers and apps expect, and the script draws nothing
// of its own. The browser test (tests/e2e/smoke.spec.ts) compares the home-screen icon with the logo.

const publicDir = new URL('../../public/', import.meta.url)
const brandDir = new URL('images/brand/', publicDir)

/** Width, height and colour type of a PNG file, from its IHDR chunk. */
function pngHeader(file: string) {
  const png = readFileSync(new URL(file, publicDir))
  expect(png.subarray(1, 4).toString('latin1'), `${file} is a PNG file`).toBe('PNG')
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20), colorType: png[25], bytes: png.length }
}

describe('svg helpers', () => {
  it('removeMetadata() removes the <metadata> element and keeps everything else as written', () => {
    const svg = '<svg viewBox="0 0 2 2"><metadata><x:m>AAAA\nBBBB</x:m></metadata>\n  <rect width="2" height="2"/></svg>'
    expect(removeMetadata(svg)).toBe('<svg viewBox="0 0 2 2">\n  <rect width="2" height="2"/></svg>')
  })

  it('svgDrawing() gives the same string for files that differ only in metadata and whitespace', () => {
    const a = '<svg>\n  <rect width="2"\n        height="2"/>\n</svg>\n'
    const b = '<svg><metadata>manifest</metadata><rect width="2" height="2"/></svg>'
    expect(svgDrawing(a)).toBe(svgDrawing(b))
    expect(svgDrawing(a)).not.toBe(svgDrawing('<svg><rect width="3" height="2"/></svg>'))
  })
})

describe('logo files and brand images', () => {
  it('keeps the logo copies free of the brand kit\'s <metadata>', () => {
    const logos = readdirSync(brandDir).filter(file => file.endsWith('.svg'))
    expect(logos).toContain('mark.svg')
    for (const file of logos) {
      const svg = readFileSync(new URL(file, brandDir), 'utf8')
      expect(svg, file).not.toContain('<metadata')
      expect(svg, file).toMatch(/^<svg [^>]*viewBox="[^"]+"/)
    }
  })

  it('uses the logo mark.svg as the tab icon, with the same drawing', () => {
    const favicon = readFileSync(new URL('favicon.svg', publicDir), 'utf8')
    const mark = readFileSync(new URL('mark.svg', brandDir), 'utf8')
    expect(svgDrawing(favicon)).toBe(svgDrawing(mark))
  })

  it('makes a 180×180 home-screen icon without transparency (iOS would fill it with black)', () => {
    const icon = pngHeader('apple-touch-icon.png')
    expect([icon.width, icon.height]).toEqual([180, 180])
    // Colour type 2 = RGB, no alpha channel.
    expect(icon.colorType).toBe(2)
  })

  it('makes a 1200×630 link-preview image of at most 300 kB (larger ones are dropped by some apps)', () => {
    const preview = pngHeader('og-image.png')
    expect([preview.width, preview.height]).toEqual([1200, 630])
    expect(preview.colorType).toBe(2)
    expect(preview.bytes).toBeLessThanOrEqual(300 * 1024)
  })

  it('draws no shape of its own in the brand-images script: the logo comes from its files', () => {
    const script = readFileSync(new URL('../../scripts/generate-brand-images.mjs', import.meta.url), 'utf8')
    // Control: the script does read the logo files.
    expect(script).toContain('mark.svg')
    expect(script).toContain('mark-on-dark.svg')
    expect(script).not.toMatch(/<(path|circle|ellipse|rect|polygon|polyline|line)\b/)
  })
})
