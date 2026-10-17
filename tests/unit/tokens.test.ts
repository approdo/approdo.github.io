import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { blendColors, contrastRatio, readColor, readColorTokens, readFontFamilies } from '../../scripts/lib/tokens'

// Rules of the token file, app/assets/css/tokens.css. The colours themselves are not written here:
// the tests read them from the file.

const tokensCss = readFileSync(new URL('../../app/assets/css/tokens.css', import.meta.url), 'utf8')
const color = (name: string) => readColor(tokensCss, name)

/** Secondary text: harbor-navy at 78% opacity (text-harbor-navy/78) on its background. */
const muted = (background: string) => blendColors(color('harbor-navy'), color(background), 0.78)

describe('colour tokens', () => {
  it('are all written as #rrggbb, which the scripts can use as they are', () => {
    const colors = readColorTokens(tokensCss)
    expect(Object.keys(colors).length).toBeGreaterThan(0)
    for (const [name, value] of Object.entries(colors)) expect(value, `--color-${name}`).toMatch(/^#[0-9a-f]{6}$/i)
  })

  // [text, background]: every pair of text and background the site uses needs 4.5:1 (WCAG 2.x AA
  // for normal text), which also covers the focus ring (3:1).
  const pairs: [string, string][] = [
    ['harbor-navy', 'white'],
    ['harbor-navy', 'shore-cream'],
    ['harbor-navy', 'beacon-orange'],
    ['white', 'harbor-navy'],
    ['shore-cream', 'harbor-navy'],
    ['shore-cream', 'harbor-navy-deep'],
    ['beacon-orange', 'harbor-navy'],
    ['beacon-orange', 'harbor-navy-deep'],
  ]

  it.each(pairs)('%s on %s has a contrast of at least 4.5:1', (text, background) => {
    expect(contrastRatio(color(text), color(background))).toBeGreaterThanOrEqual(4.5)
  })

  it.each(['white', 'shore-cream'])('secondary text (harbor-navy at 78%%) on %s has a contrast of at least 4.5:1', (background) => {
    expect(contrastRatio(muted(background), color(background))).toBeGreaterThanOrEqual(4.5)
  })

  it('computes contrast like WCAG: black on white is 21:1, a colour on itself 1:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#777777')).toBe(1)
  })

  it('blends a colour over a background like opacity does', () => {
    expect(blendColors('#000000', '#FFFFFF', 1)).toBe('#000000')
    expect(blendColors('#000000', '#FFFFFF', 0)).toBe('#ffffff')
    expect(blendColors('#000000', '#FFFFFF', 0.5)).toBe('#808080')
  })
})

describe('font tokens', () => {
  it.each(['sans', 'display'])('--font-%s names a web font first and ends with system fonts', (token) => {
    const families = readFontFamilies(tokensCss, token)
    expect(families[0]).not.toMatch(/^(ui-|system-ui|sans-serif|serif)/)
    expect(families.at(-1)).toBe('sans-serif')
  })

  it('--font-display falls back to the body font for Thai letters', () => {
    expect(readFontFamilies(tokensCss, 'display')).toContain(readFontFamilies(tokensCss, 'sans')[0])
  })

  // The template's Thai fallback face was measured for another web font only (lesson G-043).
  it('define no font faces of their own', () => {
    expect(tokensCss).not.toMatch(/@font-face/)
    expect(tokensCss).not.toContain('Thai Fallback')
  })
})
