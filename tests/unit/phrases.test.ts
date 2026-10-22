import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import PhraseText from '../../app/components/PhraseText'
import type { ThaiText } from '../../app/types/content'
import { dotParts, joinPhrases, joinTexts, toPhraseParts } from '../../app/utils/phrases'

// A space after 'บริการครบ', none between the other phrases.
const heading = ['ร้านเล็ก', 'ใกล้บ้าน ', 'บริการครบ', 'ในที่เดียว']

function renderPhraseText(text: ThaiText, accent?: string, inline?: boolean) {
  return renderToString(createSSRApp({ render: () => h(PhraseText, { text, accent, inline }) }))
}

function textContent(html: string) {
  return html.replace(/<[^>]*>/g, '')
}

/** Counts the elements at the top level of an HTML fragment (<wbr> has no closing tag). */
function topLevelElementCount(html: string) {
  let depth = 0
  let count = 0
  for (const [, slash, name] of html.matchAll(/<(\/?)([a-z]+)[^>]*>/g)) {
    if (slash) depth--
    else {
      if (depth === 0) count++
      if (name !== 'wbr') depth++
    }
  }
  return count
}

describe('joinPhrases', () => {
  it('joins the phrases exactly as written, spaces included', () => {
    expect(joinPhrases(heading)).toBe('ร้านเล็กใกล้บ้าน บริการครบในที่เดียว')
  })

  it('adds nothing between phrases, and returns a plain string unchanged', () => {
    expect(joinPhrases(['A', 'B'])).toBe('AB')
    expect(joinPhrases('ข้อความ ธรรมดา')).toBe('ข้อความ ธรรมดา')
    expect(joinPhrases([])).toBe('')
  })
})

describe('dotParts', () => {
  it('splits a line at each " · " and keeps every other space in its part', () => {
    expect(dotParts('ระบบเฉพาะงาน · จองคิว + หลังบ้าน')).toEqual(['ระบบเฉพาะงาน', 'จองคิว + หลังบ้าน'])
    expect(dotParts('a · b · c')).toEqual(['a', 'b', 'c'])
  })

  it('returns a line without " · " as one part', () => {
    expect(dotParts('มือถือ')).toEqual(['มือถือ'])
    expect(dotParts('a·b')).toEqual(['a·b'])
  })
})

describe('joinTexts', () => {
  it('puts the separator at the end of each text but the last, so the line may break there', () => {
    expect(joinTexts([['ราคาเปิดตัว ', '5 ลูกค้าแรก'], '—', ['ขอรีวิว', 'หลังส่งงาน']]))
      .toEqual(['ราคาเปิดตัว ', '5 ลูกค้าแรก ', '— ', 'ขอรีวิว', 'หลังส่งงาน'])
  })

  it('gives the same text as joining the plain texts with the separator', () => {
    const texts = [['ก', 'ข '], 'ค', ['ง']]
    expect(joinPhrases(joinTexts(texts))).toBe(texts.map(text => joinPhrases(text)).join(' '))
    expect(joinPhrases(joinTexts(['a', 'b'], ' · '))).toBe('a · b')
  })

  it('returns a single text as its phrases, and nothing for no texts', () => {
    expect(joinTexts([['A', 'B']])).toEqual(['A', 'B'])
    expect(joinTexts([])).toEqual([])
  })
})

describe('toPhraseParts', () => {
  it('moves the space at the end of a phrase out of the phrase', () => {
    expect(toPhraseParts(['ใกล้บ้าน ', 'บริการครบ'])[0]).toEqual({ text: 'ใกล้บ้าน', space: ' ', wbr: false })
  })

  it('marks a break with <wbr> between phrases that have no space between them, but not after the last', () => {
    expect(toPhraseParts(heading)[0]).toEqual({ text: 'ร้านเล็ก', space: '', wbr: true })
    expect(toPhraseParts(heading).at(-1)).toEqual({ text: 'ในที่เดียว', space: '', wbr: false })
  })

  it('keeps spaces inside a phrase, where the line must not break', () => {
    expect(toPhraseParts(['เปิด 09:00–18:00 น.'])[0]!.text).toBe('เปิด 09:00–18:00 น.')
  })
})

describe('<PhraseText>', () => {
  it('puts each phrase in an unbreakable span, the space after the span and <wbr> where there is no space', async () => {
    expect(await renderPhraseText(heading)).toBe(
      '<span>'
      + '<span class="inline-block max-w-full">ร้านเล็ก</span><wbr>'
      + '<span class="inline-block max-w-full">ใกล้บ้าน</span> '
      + '<span class="inline-block max-w-full">บริการครบ</span><wbr>'
      + '<span class="inline-block max-w-full">ในที่เดียว</span>'
      + '</span>',
    )
  })

  it('with `inline`, for an underlined link, puts each phrase in an inline nowrap span instead', async () => {
    expect(await renderPhraseText(heading, undefined, true)).toBe(
      '<span>'
      + '<span class="whitespace-nowrap">ร้านเล็ก</span><wbr>'
      + '<span class="whitespace-nowrap">ใกล้บ้าน</span> '
      + '<span class="whitespace-nowrap">บริการครบ</span><wbr>'
      + '<span class="whitespace-nowrap">ในที่เดียว</span>'
      + '</span>',
    )
  })

  it('wraps all phrases in one element and shows the same text as joinPhrases', async () => {
    for (const inline of [false, true]) {
      const html = await renderPhraseText(heading, undefined, inline)
      expect(topLevelElementCount(html)).toBe(1)
      expect(textContent(html)).toBe(joinPhrases(heading))
    }
  })

  it('shows a plain string as one run of text that the browser may break anywhere', async () => {
    expect(await renderPhraseText('ข้อความ ธรรมดา')).toBe('<span>ข้อความ ธรรมดา</span>')
  })

  it('wraps the first place of the accent words in <em>, inside their phrase', async () => {
    expect(await renderPhraseText(['ร้านเล็ก ', 'ใกล้บ้านคุณ'], 'ใกล้บ้าน')).toBe(
      '<span><span class="inline-block max-w-full">ร้านเล็ก</span> '
      + '<span class="inline-block max-w-full"><em>ใกล้บ้าน</em>คุณ</span></span>',
    )
    expect(await renderPhraseText('a b a', 'a')).toBe('<span><em>a</em> b a</span>')
    expect(await renderPhraseText('a b', 'z')).toBe('<span>a b</span>')
  })
})
