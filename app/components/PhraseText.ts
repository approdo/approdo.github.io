import { h } from 'vue'
import type { FunctionalComponent, VNodeArrayChildren } from 'vue'
import type { ThaiText } from '../types/content'
import { toPhraseParts } from '../utils/phrases'

/** The text with the first `accent` in it wrapped in <em>, or the text as it is. */
function withAccent(text: string, accent: string | undefined, used: { done: boolean }): VNodeArrayChildren {
  const start = accent && !used.done ? text.indexOf(accent) : -1
  if (!accent || start === -1) return [text]
  used.done = true
  const end = start + accent.length
  return [text.slice(0, start), h('em', accent), text.slice(end)].filter(child => child !== '')
}

/** The class of a phrase's span: see "Each phrase" below. */
const PHRASE_CLASS = 'inline-block max-w-full'

/** The class of a phrase's span with `inline`: see "In an underlined link" below. */
const INLINE_PHRASE_CLASS = 'whitespace-nowrap'

/**
 * Shows Thai text so that a line can break between two phrases but never inside one
 * (lesson G-007). For the phrases ['A', 'B ', 'C'] it renders:
 *
 *   <span><span class="inline-block max-w-full">A</span><wbr><span class="inline-block max-w-full">B</span> <span class="inline-block max-w-full">C</span></span>
 *
 * - Each phrase is an inline-block span without its trailing space. A phrase that fits on the line
 *   is never split, like `white-space: nowrap`. Only a phrase wider than its whole box (e.g. with
 *   the browser's text size set to 200% on a phone) wraps inside, instead of sticking out of the box
 *   and making the page scroll sideways (lesson G-069). Keep phrases short so this stays rare.
 * - The space after a phrase follows the span as a text node of its own, where the line may break.
 * - <wbr> marks where two phrases without a space between them may be split, so the break does
 *   not depend on the browser's Thai dictionary.
 * - One wrapper span holds all phrases, so they stay one run of text even when the parent is a
 *   flex or grid container (there, every child element becomes a separate box).
 * - A plain string is shown as it is, and the browser breaks it where it likes.
 * - `accent`: the first place where these words appear (inside one phrase) is wrapped in <em>.
 * - In an underlined link (or any text underlined on hover), pass `inline`: the browser draws no
 *   underline under an inline-block box, so there each phrase is an inline `white-space: nowrap` span
 *   instead. Such a phrase never wraps, so keep the phrases of a link short (a few words each).
 *
 * Use it inside the element that gives the text its meaning: <h2><PhraseText :text="..." /></h2>.
 *
 * It is a render function rather than a template because Vue's template compiler removes or merges
 * the whitespace between tags, and these spaces must come out exactly as they are in the data.
 * This also lets the unit tests render it in plain Node.
 */
const PhraseText: FunctionalComponent<{ text: ThaiText, accent?: string, inline?: boolean }> = ({ text, accent, inline }) => {
  const used = { done: false }
  if (typeof text === 'string') return h('span', withAccent(text, accent, used))

  const phraseClass = inline ? INLINE_PHRASE_CLASS : PHRASE_CLASS
  const children: VNodeArrayChildren = []
  for (const part of toPhraseParts(text)) {
    children.push(h('span', { class: phraseClass }, withAccent(part.text, accent, used)))
    if (part.space) children.push(part.space)
    if (part.wbr) children.push(h('wbr'))
  }
  return h('span', children)
}

PhraseText.props = {
  text: { type: [String, Array], required: true },
  accent: { type: String, required: false },
  inline: { type: Boolean, required: false },
}

export default PhraseText
