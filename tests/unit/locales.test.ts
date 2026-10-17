import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { site } from '../../app/data/site'
import { homePaths, siteLocales } from '../../app/utils/locales'

// The languages follow the `english` switch in site.ts (nuxt.config.ts builds them with these helpers).

function readMessages(file: string) {
  return JSON.parse(readFileSync(new URL(`../../i18n/locales/${file}`, import.meta.url), 'utf8'))
}

/** Every key of a messages object, as dotted paths: { a: { b: '' } } gives ['a.b']. */
function keysOf(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) => (typeof value === 'object' && value !== null
    ? keysOf(value, `${prefix}${key}.`)
    : [`${prefix}${key}`]))
}

describe('siteLocales', () => {
  it('has Thai and English, with English pages under /en/, when English is on', () => {
    const locales = siteLocales(true)
    expect(locales.map(locale => locale.code)).toEqual(['th', 'en'])
    expect(homePaths(locales)).toEqual(['/', '/en/'])
  })

  it('has Thai only, with no /en/ page, when English is off', () => {
    const locales = siteLocales(false)
    expect(locales.map(locale => locale.code)).toEqual(['th'])
    expect(homePaths(locales)).toEqual(['/'])
  })

  it('names a messages file that exists for every language the site has', () => {
    for (const locale of siteLocales(site.english)) expect(() => readMessages(locale.file)).not.toThrow()
  })
})

describe('messages', () => {
  it('are all written, none of them empty', () => {
    const th = readMessages('th.json')
    const keys = keysOf(th)
    expect(keys.length).toBeGreaterThan(0)
    for (const key of keys) expect(key.split('.').reduce((value, part) => value[part], th).trim(), key).not.toBe('')
  })

  it('have no "@" or "|", which vue-i18n reads as a linked message or a plural form', () => {
    const th = readMessages('th.json')
    for (const key of keysOf(th)) expect(key.split('.').reduce((value, part) => value[part], th), key).not.toMatch(/[@|]/)
  })
})
