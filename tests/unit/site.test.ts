import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { site } from '../../app/data/site'
import { readFontFamilies } from '../../scripts/lib/tokens'

// Rules of app/data/site.ts, not its values (lesson G-018): they keep passing when a detail changes, and
// fail when one is missing or malformed.

const tokensCss = readFileSync(new URL('../../app/assets/css/tokens.css', import.meta.url), 'utf8')

describe('site.ts', () => {
  it('has the brand name, a description and the © line', () => {
    expect(site.name.trim()).not.toBe('')
    expect(site.description.trim()).not.toBe('')
    expect(site.copyright).toMatch(/^© \d{4} \S/)
  })

  it('has an absolute https site URL that ends with \'/\', whose path becomes the base URL', () => {
    const url = new URL(site.url)
    expect(url.protocol).toBe('https:')
    expect(url.pathname.endsWith('/')).toBe(true)
    expect(url.search + url.hash).toBe('')
  })

  it('turns English on only together with an English messages file', () => {
    const hasEnglishMessages = existsSync(new URL('../../i18n/locales/en.json', import.meta.url))
    expect(site.english).toBe(hasEnglishMessages)
  })

  it('downloads each font family named in tokens.css, in weights that are whole hundreds', () => {
    const familiesInTokens = [...readFontFamilies(tokensCss, 'sans'), ...readFontFamilies(tokensCss, 'display')]
    const entries = Object.entries(site.fontWeights)
    expect(entries.length).toBeGreaterThan(0)
    for (const [family, weights] of entries) {
      expect(familiesInTokens, family).toContain(family)
      expect(weights.length, family).toBeGreaterThan(0)
      expect(new Set(weights).size, `${family}: no repeats`).toBe(weights.length)
      for (const weight of weights) expect([100, 200, 300, 400, 500, 600, 700, 800, 900], family).toContain(weight)
    }
    // The first family of each font token is a web font that is downloaded.
    expect(Object.keys(site.fontWeights)).toContain(readFontFamilies(tokensCss, 'sans')[0])
    expect(Object.keys(site.fontWeights)).toContain(readFontFamilies(tokensCss, 'display')[0])
  })

  it('links LINE to an https line.me address, with a LINE ID and an account name', () => {
    expect(new URL(site.line.url).protocol).toBe('https:')
    expect(new URL(site.line.url).hostname).toBe('line.me')
    expect(site.line.id).toMatch(/^@\w+$/)
    expect(site.line.name.trim()).not.toBe('')
  })
})
