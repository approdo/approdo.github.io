import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { removeMetadata, svgDrawing } from '../../scripts/lib/svg'

// The icons and the link-preview image that `npm run brand-images` makes from Approdo's logo files
// (scripts/generate-brand-images.mjs, tasks BR-004 and BR-008 B8). The rules hold for any logo: the tab
// icon is the logo file, the PNG images have the sizes that browsers and apps expect, and the script
// draws nothing of its own. The browser tests (tests/e2e/smoke.spec.ts) compare the home-screen icon
// and the images in favicon.ico with the logo.

const publicDir = new URL('../../public/', import.meta.url)
const brandDir = new URL('images/brand/', publicDir)

/** Width, height, bit depth and colour type of a PNG image, from its IHDR chunk. */
function pngInfo(png: Buffer, label: string) {
  expect(png.subarray(1, 4).toString('latin1'), `${label} is a PNG image`).toBe('PNG')
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20), bitDepth: png[24]!, colorType: png[25]!, bytes: png.length }
}

/** pngInfo() of a PNG file in public/. */
function pngHeader(file: string) {
  return pngInfo(readFileSync(new URL(file, publicDir)), file)
}

/**
 * The images of an ICO file, as its directory lists them: a 6-byte header (reserved, type 1 = icon,
 * number of images), then 16 bytes per image. Each image here is a PNG file inside the ICO file.
 */
function icoImages(ico: Buffer) {
  expect(ico.readUInt16LE(0), 'reserved').toBe(0)
  expect(ico.readUInt16LE(2), 'an icon file (type 1)').toBe(1)
  return Array.from({ length: ico.readUInt16LE(4) }, (_, index) => {
    const entry = 6 + 16 * index
    const bytes = ico.readUInt32LE(entry + 8)
    const offset = ico.readUInt32LE(entry + 12)
    return {
      // A width or height of 0 stands for 256.
      width: ico[entry]! || 256,
      height: ico[entry + 1]! || 256,
      bitsPerPixel: ico.readUInt16LE(entry + 6),
      bytes,
      offset,
      data: ico.subarray(offset, offset + bytes),
    }
  })
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

  it('makes a favicon.ico for clients that ask for /favicon.ico: square PNG images, 16×16 and 32×32 among them (task BR-008 B8)', () => {
    const ico = readFileSync(new URL('favicon.ico', publicDir))
    const images = icoImages(ico)
    expect(images.map(image => image.width)).toEqual(expect.arrayContaining([16, 32]))
    // The directory gives each image's bits per pixel: its channels (colour type 2 = RGB, 6 = RGB with
    // alpha) times its bit depth.
    const channels: Record<number, number> = { 2: 3, 6: 4 }

    // The images come right after the directory, one after the other, up to the end of the file.
    let end = 6 + 16 * images.length
    for (const image of images) {
      const label = `favicon.ico ${image.width}×${image.height}`
      expect(image.height, `${label} is square`).toBe(image.width)
      const png = pngInfo(image.data, label)
      expect([png.width, png.height], label).toEqual([image.width, image.height])
      expect(image.bitsPerPixel, label).toBe(channels[png.colorType]! * png.bitDepth)
      expect(image.offset, label).toBe(end)
      end += image.bytes
    }
    expect(end).toBe(ico.length)
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
