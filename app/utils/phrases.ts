import type { ThaiText } from '../types/content'

/** One phrase of a phrase list, split the way <PhraseText> renders it. */
export interface PhrasePart {
  /** The phrase without the space at its end. It goes inside an `inline-block max-w-full` span (see PhraseText.ts). */
  text: string
  /** The space at the end of the phrase ('' if none). It goes after the span, as a text node of its own. */
  space: string
  /** True if a <wbr> goes after the span: the next phrase follows with no space in between. */
  wbr: boolean
}

/**
 * Joins Thai text into plain text, exactly as written in app/data/.
 * Use it where no markup is possible: <title>, meta tags and aria-label.
 */
export function joinPhrases(text: ThaiText): string {
  return typeof text === 'string' ? text : text.join('')
}

/**
 * Joins several Thai texts into one list of phrases, with `separator` between two texts.
 * The separator goes at the end of a text's last phrase, so the line may break there.
 *
 * joinTexts([['ราคาเปิดตัว ', '5 ลูกค้าแรก'], '—', ['ขอรีวิว', 'หลังส่งงาน']]) returns
 * ['ราคาเปิดตัว ', '5 ลูกค้าแรก ', '— ', 'ขอรีวิว', 'หลังส่งงาน']
 */
export function joinTexts(texts: readonly ThaiText[], separator = ' '): string[] {
  return texts.flatMap((text, index) => {
    const phrases = typeof text === 'string' ? [text] : [...text]
    const isLast = index === texts.length - 1
    if (isLast || phrases.length === 0) return phrases
    return [...phrases.slice(0, -1), `${phrases.at(-1)}${separator}`]
  })
}

/**
 * Splits a list of phrases for rendering (lesson G-007):
 * - the space at the end of a phrase is taken out of the phrase, so the line can break there;
 * - between two phrases with no space, a <wbr> marks where the line may break.
 *
 * toPhraseParts(['A', 'B ', 'C']) returns
 * [{ text: 'A', space: '', wbr: true }, { text: 'B', space: ' ', wbr: false }, { text: 'C', space: '', wbr: false }]
 */
export function toPhraseParts(phrases: readonly string[]): PhrasePart[] {
  return phrases.map((phrase, index) => {
    const text = phrase.replace(/ +$/, '')
    const space = phrase.slice(text.length)
    const isLast = index === phrases.length - 1
    return { text, space, wbr: space === '' && !isLast }
  })
}
