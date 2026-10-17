import { describe, expect, it } from 'vitest'
import { newTabAttributes } from '../../app/utils/links'

describe('newTabAttributes', () => {
  it('opens links to other sites in a new tab', () => {
    expect(newTabAttributes('https://example.com/')).toEqual({ target: '_blank', rel: 'noopener' })
    expect(newTabAttributes('http://example.com/')).toEqual({ target: '_blank', rel: 'noopener' })
  })

  it('opens links to this page in place', () => {
    expect(newTabAttributes('#contact')).toEqual({})
    expect(newTabAttributes('/')).toEqual({})
  })
})
