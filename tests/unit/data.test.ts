import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contactSection, onlyChannel } from '../../app/data/contact'
import { faqSection, faqs } from '../../app/data/faq'
import { hero } from '../../app/data/hero'
import { menuSections } from '../../app/data/menu'
import { portfolio, screenshotFile, screenshotViews, workSection } from '../../app/data/portfolio'
import { allPlans, callToAction, included, launchOffer, launchTerms, planDurations, plans, pricingSection, terms, termsBoxes } from '../../app/data/pricing'
import { processSection, steps } from '../../app/data/process'
import { site } from '../../app/data/site'
import type { ScreenshotView, SectionHeading, ThaiText } from '../../app/types/content'
import { joinPhrases } from '../../app/utils/phrases'

// Rules of the section data in app/data/, not its content (lesson G-018): no price, answer or score is
// written here, so a price change in app/data/pricing.ts never needs a test change.

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Thai text that shows as it is written: not empty, no space at either end, no double space, and in a
 * phrase list no empty phrase and no phrase that starts with a space (the space belongs at the end of
 * the phrase before it, lesson G-007).
 */
function expectThaiText(text: ThaiText, label: string) {
  const plain = joinPhrases(text)
  expect(plain.trim(), `${label}: not empty`).not.toBe('')
  expect(plain, `${label}: no space at either end`).toBe(plain.trim())
  expect(plain, `${label}: no double space`).not.toMatch(/ {2}/)
  if (typeof text !== 'string') {
    for (const phrase of text) {
      expect(phrase.trim(), `${label}: no empty phrase`).not.toBe('')
      expect(phrase, `${label}: "${phrase}" starts with a space`).not.toMatch(/^ /)
    }
  }
}

function expectLines(lines: readonly ThaiText[], label: string) {
  expect(lines.length, `${label}: at least one line`).toBeGreaterThan(0)
  lines.forEach((line, index) => expectThaiText(line, `${label} [${index}]`))
}

function expectHeading(section: SectionHeading, label: string) {
  expectThaiText(section.heading, `${label} heading`)
  if (section.intro) expectThaiText(section.intro, `${label} intro`)
  if (section.accent) {
    // The accent words are inside one phrase of the intro, so <PhraseText> can wrap them.
    const phrases = typeof section.intro === 'string' ? [section.intro] : [...section.intro ?? []]
    expect(phrases.some(phrase => phrase.includes(section.accent!)), `${label} accent "${section.accent}" in one phrase of the intro`).toBe(true)
  }
}

/** Width and height of a WebP file (lossy VP8, lossless VP8L or extended VP8X). */
function webpSize(file: Buffer) {
  expect(file.toString('ascii', 0, 4)).toBe('RIFF')
  expect(file.toString('ascii', 8, 12)).toBe('WEBP')
  const chunk = file.toString('ascii', 12, 16)
  if (chunk === 'VP8 ') return { width: file.readUInt16LE(26) & 0x3FFF, height: file.readUInt16LE(28) & 0x3FFF }
  if (chunk === 'VP8L') {
    const bits = file.readUInt32LE(21)
    return { width: (bits & 0x3FFF) + 1, height: ((bits >> 14) & 0x3FFF) + 1 }
  }
  if (chunk === 'VP8X') return { width: file.readUIntLE(24, 3) + 1, height: file.readUIntLE(27, 3) + 1 }
  throw new Error(`unknown WebP chunk ${chunk}`)
}

function expectUniqueIds(items: readonly { id: string }[], label: string) {
  expect(items.length, `${label}: at least one`).toBeGreaterThan(0)
  for (const { id } of items) expect(id, `${label} id`).toMatch(KEBAB_CASE)
  expect(new Set(items.map(item => item.id)).size, `${label}: ids are unique`).toBe(items.length)
}

describe('section headings', () => {
  it('are written', () => {
    expectHeading(workSection, 'work')
    expectHeading(pricingSection, 'pricing')
    expectHeading(processSection, 'process')
    expectHeading(faqSection, 'faq')
    expectHeading(contactSection, 'contact')
    expectThaiText(onlyChannel, 'contact: only channel')
  })
})

describe('hero', () => {
  it('has the tagline on one or more lines, the services line and the positioning', () => {
    expect(hero.tagline.length).toBeGreaterThan(0)
    hero.tagline.forEach((line, index) => expectThaiText(line, `tagline line ${index + 1}`))
    expectThaiText(hero.services, 'services')
    expectThaiText(hero.positioning, 'positioning')
  })
})

describe('pricing (the one file with prices and terms)', () => {
  it('has packages with unique ids, a name, what they cover and a price', () => {
    expectUniqueIds(plans, 'plans')
    for (const plan of plans) {
      for (const field of ['name', 'detail', 'price'] as const) expectThaiText(plan[field], `${plan.id} ${field}`)
      if (plan.duration !== undefined) expectThaiText(plan.duration, `${plan.id} duration`)
    }
  })

  it('gives a package a regular price only as "ปกติ" with an amount other than its launch price (decision D-017)', () => {
    const amount = (price: string) => price.match(/\d[\d,]*/)?.[0]
    for (const plan of plans) {
      if (plan.regularPrice === undefined) continue
      const label = `${plan.id} regular price`
      expectThaiText(plan.regularPrice, label)
      expect(plan.regularPrice, label).toContain('ปกติ')
      expect(amount(plan.regularPrice), `${label} has an amount`).toBeDefined()
      expect(amount(plan.regularPrice), `${label} is not the launch price`).not.toBe(amount(plan.price))
    }
  })

  it('writes a range with the en dash (U+2013), never a hyphen', () => {
    const texts = plans.flatMap(plan => [plan.detail, plan.price, plan.regularPrice ?? '', plan.duration ?? ''])
    for (const text of texts) expect(text, text).not.toMatch(/\d-\d/)
  })

  it('names one duration per package that has one', () => {
    expect(planDurations).toHaveLength(plans.filter(plan => plan.duration).length)
    planDurations.forEach((duration, index) => expectThaiText(duration, `duration ${index + 1}`))
  })

  it('lists what every package includes, each item once', () => {
    expectThaiText(allPlans.label, 'all plans label')
    expectLines(allPlans.items, 'all plans')
    expect([...allPlans.items].sort()).toEqual(Object.values(included).sort())
  })

  it('has the launch offer, its condition and the closing line', () => {
    expectThaiText(launchOffer, 'launch offer')
    expectThaiText(launchTerms.label, 'launch terms label')
    expectThaiText(launchTerms.text, 'launch terms')
    expectThaiText(callToAction.ask, 'call to action: ask')
    expectThaiText(callToAction.reply, 'call to action: reply')
  })

  it('has every answer of the owner as text that shows as written', () => {
    // One text each.
    expectThaiText(terms.balance, 'balance')
    expectThaiText(terms.dayCount, 'dayCount')
    expectThaiText(terms.laterEdits, 'laterEdits')
    expectThaiText(terms.extraCost.cases, 'extraCost.cases')
    expectThaiText(terms.extraCost.quote, 'extraCost.quote')
    expectThaiText(terms.ownership, 'ownership')
    // Several parts, one line each.
    expectLines(terms.hosting, 'hosting')
    expectLines(terms.content, 'content')
    expectLines(terms.revisions, 'revisions')
    expectLines(terms.payment, 'payment')
  })

  it('has terms boxes with unique ids, a heading and lines', () => {
    expectUniqueIds(termsBoxes, 'terms boxes')
    for (const box of termsBoxes) {
      expectThaiText(box.heading, `${box.id} heading`)
      expectLines(box.lines, box.id)
    }
  })
})

describe('process', () => {
  it('has steps with unique ids, a title and at least one line of details', () => {
    expectUniqueIds(steps, 'steps')
    for (const step of steps) {
      expectThaiText(step.title, `${step.id} title`)
      expectLines(step.details, step.id)
    }
  })
})

describe('faq', () => {
  it('has questions with unique ids, a question and an answer', () => {
    expectUniqueIds(faqs, 'faqs')
    for (const faq of faqs) {
      expectThaiText(faq.question, `${faq.id} question`)
      expectLines(faq.answer, `${faq.id} answer`)
    }
  })
})

describe('portfolio', () => {
  it('has websites with unique ids, texts, an https link and the label that the brand is fictional', () => {
    expectUniqueIds(portfolio, 'portfolio')
    for (const item of portfolio) {
      for (const field of ['name', 'label', 'kind', 'description'] as const) expectThaiText(item[field], `${item.id} ${field}`)
      // brand.md: every sample website says that its brand is fictional.
      expect(item.label, `${item.id} label`).toContain('แบรนด์สมมติ')
      expect(new URL(item.url).protocol, `${item.id} url`).toBe('https:')
      expect(item.url.endsWith('/'), `${item.id} url ends with '/'`).toBe(true)
    }
  })

  it('links every website at its address in the approdo organisation, on the domain of this site (task LP-029)', () => {
    // A site that moves to another GitHub account is not redirected: its old address answers 404, as the
    // Landing-page one under the author's account did after it moved to the organisation (task BR-008 B1).
    const siteUrl = new URL(site.url)
    for (const item of portfolio) {
      const url = new URL(item.url)
      expect(url.host, `${item.id} url`).toBe(siteUrl.host)
      expect(url.pathname, `${item.id} url is another site than this one`).not.toBe(siteUrl.pathname)
    }
  })

  it('has both screenshots of every website as WebP files at the widths in screenshotViews (npm run capture-portfolio)', () => {
    for (const item of portfolio) {
      for (const [view, { width, height, files }] of Object.entries(screenshotViews) as [ScreenshotView, typeof screenshotViews.desktop][]) {
        // brand.md: the alt text says that the brand is fictional too.
        expectThaiText(item.screenshotAlt[view], `${item.id} ${view} alt`)
        expect(item.screenshotAlt[view], `${item.id} ${view} alt`).toContain('แบรนด์สมมติ')
        expect(files.length, `${view} files`).toBeGreaterThan(0)
        for (const fileWidth of files) {
          const file = readFileSync(new URL(`../../public/images/${screenshotFile(item.id, view, fileWidth)}`, import.meta.url))
          // Each file is the window of `view` scaled to its width.
          expect(webpSize(file), `${item.id} ${view} ${fileWidth}`).toEqual({ width: fileWidth, height: Math.round(height * fileWidth / width) })
        }
      }
    }
  })

  it('names the tool, method and date of every score, and every score is a whole number from 0 to 100', () => {
    for (const { id, measurement } of portfolio) {
      expectThaiText(measurement.tool, `${id} tool`)
      expectThaiText(measurement.method, `${id} method`)
      expectThaiText(measurement.dateLabel, `${id} date label`)
      expect(measurement.date, `${id} date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(measurement.date)), `${id} date is a real date`).toBe(false)
      const scores = Object.values(measurement.scores)
      expect(scores).toHaveLength(4)
      for (const score of scores) expect(Number.isInteger(score) && score >= 0 && score <= 100, `${id} score ${score}`).toBe(true)
    }
  })
})

// That each menu entry is the id of a section on the page is checked in the browser (tests/e2e/sections.spec.ts).
describe('menu', () => {
  it('links to at least one section, each once, by an id in kebab-case', () => {
    expect(menuSections.length).toBeGreaterThan(0)
    expect(new Set(menuSections).size).toBe(menuSections.length)
    for (const id of menuSections) expect(id).toMatch(KEBAB_CASE)
  })
})
