import { describe, expect, it } from 'vitest'
import { removeBaseURL } from '../../app/utils/removeBaseURL'

describe('removeBaseURL', () => {
  const base = '/Site-starter/'

  it.each([
    ['/Site-starter/#faq', '/#faq'],
    ['/Site-starter/', '/'],
    ['/Site-starter', '/'],
    ['/Site-starter#faq', '/#faq'],
    ['/Site-starter?ref=menu', '/?ref=menu'],
    ['/Site-starter/en/#faq', '/en/#faq'],
  ])('removes the base URL from %j', (path, expected) => {
    expect(removeBaseURL(path, base)).toBe(expected)
  })

  it.each([
    '/',
    '/#faq',
    '/en/',
    '/Site-starters/',
  ])('keeps %j, which is not under the base URL', (path) => {
    expect(removeBaseURL(path, base)).toBe(path)
  })

  it('changes nothing when the site is served from the domain root', () => {
    expect(removeBaseURL('/Site-starter/#faq', '/')).toBe('/Site-starter/#faq')
  })
})
