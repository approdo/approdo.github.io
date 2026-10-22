import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { hero } from '../../app/data/hero'
import { demoAnchor, isSystemWork, portfolio, sampleOf } from '../../app/data/portfolio'
import { plans } from '../../app/data/pricing'
import { site } from '../../app/data/site'
import { dotParts, joinPhrases } from '../../app/utils/phrases'

// The first piece of work, the booking system: its navy panel, the clip of the shop's side and the hero's
// button that leads to it (task BR-012, design v1.1.0 §3.1–3.3). Texts and links come from app/data/
// (lesson G-018); that they are the owner's words in brand.md is checked against brand.md itself by the
// story repository's Demo-story/Brand-site/evidence/BR-012/check-copy.mjs.

const messages = JSON.parse(readFileSync(new URL('../../i18n/locales/th.json', import.meta.url), 'utf8'))
const sitePath = new URL(site.url).pathname
const system = portfolio.find(isSystemWork)!
const { demo } = system
const MAX_CLIP_BYTES = 2 * 1024 * 1024

/** Opens the page and waits for Vue to take over the pre-rendered HTML (from then on the clip reacts). */
async function openPage(page: Page) {
  await page.goto('./')
  await page.waitForFunction(() => {
    const root = document.querySelector('#__nuxt')
    return root !== null && '__vue_app__' in root
  })
}

const panelOf = (page: Page) => page.locator(`#${demoAnchor}`)
const videoOf = (page: Page) => panelOf(page).locator('video')
const clipButtonOf = (page: Page) => panelOf(page).locator('button[data-state]')
const isPaused = (video: Locator) => video.evaluate(element => (element as HTMLVideoElement).paused)

/** The URLs of the clip that the page asks for. */
function clipRequests(page: Page) {
  const urls: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith('.webm')) urls.push(request.url())
  })
  return urls
}

/** Scrolls the clip to the middle of the window at once (no smooth scrolling while it is measured). */
async function scrollToClip(page: Page) {
  await videoOf(page).evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
}

async function scrollToTop(page: Page) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
}

/** The words of a link or button that are seen: without its screen-reader text and its hidden arrow. */
function visibleWords(element: Locator) {
  return element.evaluate((node) => {
    const copy = node.cloneNode(true) as HTMLElement
    copy.querySelectorAll('.sr-only, [aria-hidden="true"]').forEach(hidden => hidden.remove())
    return copy.textContent!.replace(/\s+/g, ' ').trim()
  })
}

// ---------------------------------------------------------------------------------------------
// The panel: texts, links, scores (AC1–AC3)
// ---------------------------------------------------------------------------------------------

test('#work holds every piece of work as an article, the booking system first as #booking; each says, in two phrases, that its brand is fictional (AC1)', async ({ page }) => {
  await openPage(page)
  const articles = page.locator('#work article')
  await expect(articles).toHaveCount(portfolio.length)
  await expect(articles.first()).toHaveAttribute('id', demoAnchor)
  await expect(page.locator(`#${demoAnchor}`)).toHaveCount(1)

  for (const [index, item] of portfolio.entries()) {
    const phrases = typeof item.label === 'string' ? [item.label] : item.label
    // The label: the element whose phrase spans hold the label's words, one span per phrase of the data.
    const label = articles.nth(index).locator('p').filter({ hasText: joinPhrases(item.label) }).first()
    await expect(label.locator('span.inline-block.max-w-full')).toHaveText(phrases.map(phrase => phrase.trim()))
    expect((await label.innerText()).replace(/\s+/g, ' ').trim(), `${item.id} label`).toBe(joinPhrases(item.label))
  }
})

test('the panel shows the work\'s texts and its two ways to try the demo, each opening the live demo in a new tab (AC2)', async ({ page }) => {
  await openPage(page)
  const panel = panelOf(page)
  await expect(panel.getByRole('heading', { level: 3 })).toHaveText(joinPhrases(system.name))
  await expect(panel.locator('p').filter({ hasText: dotParts(system.kind)[0]! }).first()).toHaveText(system.kind)
  await expect(panel.getByText(joinPhrases(system.description), { exact: true }).first()).toBeVisible()
  await expect(panel.getByText(joinPhrases(demo.trialNote), { exact: true }).first()).toBeVisible()
  await expect(panel.locator('figcaption').filter({ hasNotText: system.measurement.tool })).toHaveText([demo.sides.customer, demo.sides.owner])

  // The two buttons leave the site: the customer's side, then the shop's side, word for word from the data.
  const links = panel.locator('a[href]')
  await expect(links).toHaveCount(2)
  const expected = [[system.url, demo.tryLabels.customer], [demo.ownerUrl, demo.tryLabels.owner]] as const
  for (const [index, [href, label]] of expected.entries()) {
    const link = links.nth(index)
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener')
    expect(await visibleWords(link)).toBe(label)
    await expect(link.locator('.sr-only')).toHaveText(messages.newTab)
  }

  // The customer's side as a screenshot, the shop's side as a clip: both name the fictional brand.
  await expect(panel.locator('img')).toHaveAttribute('alt', system.screenshotAlt.phone)
  await expect(videoOf(page)).toHaveAttribute('aria-label', demo.clip.label)
})

test('the panel shows the scores of the data, with the tool, how they were measured and the date (AC3)', async ({ page }) => {
  await openPage(page)
  const figure = panelOf(page).locator('figure:has(dl)')
  const { scores, tool, method, date, dateLabel } = system.measurement
  await expect(figure.locator('dd')).toHaveText([scores.performance, scores.accessibility, scores.bestPractices, scores.seo].map(String))
  await expect(figure.locator('dt')).toHaveText(Object.values(messages.work.score) as string[])
  const caption = figure.locator('figcaption')
  await expect(caption).toContainText(tool)
  for (const part of dotParts(method)) await expect(caption).toContainText(part)
  await expect(caption.locator('time')).toHaveAttribute('datetime', date)
  await expect(caption.locator('time')).toContainText(dateLabel)
})

test('the customer\'s screenshot is a lazy WebP image with a srcset; nothing in <head> preloads the clip or its poster (AC12)', async ({ page }) => {
  await openPage(page)
  const image = panelOf(page).locator('img')
  for (const [name, value] of [['loading', 'lazy'], ['decoding', 'async'], ['fetchpriority', 'low']] as const) {
    await expect(image).toHaveAttribute(name, value)
  }
  await expect(image).toHaveAttribute('srcset', /\.webp \d+w, .+\.webp \d+w/)
  await expect(image).toHaveAttribute('sizes', /.+/)
  const preloads = await page.locator('head link[rel="preload"]').evaluateAll(links => links.map(link => link.getAttribute('href') ?? ''))
  // Control: the fonts are preloaded, so the list is not empty by accident.
  expect(preloads.length).toBeGreaterThan(0)
  expect(preloads.filter(href => /\.(?:webm|webp)$/.test(href))).toEqual([])
})

// ---------------------------------------------------------------------------------------------
// The clip (AC4–AC6, AC13)
// ---------------------------------------------------------------------------------------------

test.describe('the clip, for a visitor who does not ask for less motion', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } })

  test('is muted, loops, plays inline, downloads nothing before it plays and has its poster (AC4)', async ({ page, request }) => {
    await openPage(page)
    const video = videoOf(page)
    await expect(video).toHaveAttribute('muted', '')
    await expect(video).toHaveAttribute('loop', '')
    await expect(video).toHaveAttribute('playsinline', '')
    await expect(video).toHaveAttribute('preload', 'none')
    await expect(video).not.toHaveAttribute('autoplay')
    await expect(video).toHaveAttribute('src', `${sitePath}${demo.clip.video}`)
    await expect(video).toHaveAttribute('poster', `${sitePath}${demo.clip.poster}`)

    const poster = await request.get(new URL(`${sitePath}${demo.clip.poster}`, page.url()).href)
    expect(poster.status()).toBe(200)
    const clip = await request.get(new URL(`${sitePath}${demo.clip.video}`, page.url()).href)
    expect(clip.status()).toBe(200)
    expect((await clip.body()).length).toBeLessThanOrEqual(MAX_CLIP_BYTES)
  })

  test('lasts 10–15 s, and plays without sound (AC4)', async ({ page }) => {
    await openPage(page)
    await scrollToClip(page)
    const video = videoOf(page)
    await expect.poll(() => isPaused(video), { timeout: 2000 }).toBe(false)
    await page.waitForTimeout(1000)
    const playback = await video.evaluate((element) => {
      const media = element as HTMLVideoElement & { webkitAudioDecodedByteCount?: number }
      return { duration: media.duration, muted: media.muted, currentTime: media.currentTime, audioBytes: media.webkitAudioDecodedByteCount }
    })
    expect(playback.duration).toBeGreaterThanOrEqual(10)
    expect(playback.duration).toBeLessThanOrEqual(15)
    expect(playback.muted).toBe(true)
    expect(playback.currentTime).toBeGreaterThan(0)
    expect(playback.audioBytes).toBe(0)
  })

  test('is not downloaded while it is off screen, plays when scrolled to and pauses when scrolled away (AC5)', async ({ page }) => {
    const requests = clipRequests(page)
    await openPage(page)
    await page.waitForTimeout(1000)
    expect(requests).toEqual([])
    const video = videoOf(page)
    expect(await isPaused(video)).toBe(true)

    await scrollToClip(page)
    await expect.poll(() => isPaused(video), { timeout: 2000 }).toBe(false)
    expect(requests.length).toBeGreaterThan(0)

    await scrollToTop(page)
    await expect.poll(() => isPaused(video), { timeout: 2000 }).toBe(true)
    // Leaving the screen is not the visitor's choice: back on screen, it plays again.
    await scrollToClip(page)
    await expect.poll(() => isPaused(video), { timeout: 2000 }).toBe(false)
  })

  test('stops with Enter or Space on its button and stays stopped after scrolling away and back (AC5, WCAG 2.2.2)', async ({ page }) => {
    await openPage(page)
    await scrollToClip(page)
    const video = videoOf(page)
    const button = clipButtonOf(page)
    await expect(button).toHaveAttribute('aria-label', demo.clip.pause)

    for (const key of ['Enter', 'Space']) {
      await button.focus()
      await page.keyboard.press(key)
      await expect.poll(() => isPaused(video), { message: key }).toBe(true)
      await expect(button).toHaveAttribute('aria-label', demo.clip.play)
      await expect(button).toHaveAttribute('data-state', 'paused')

      await scrollToTop(page)
      await page.waitForTimeout(500)
      await scrollToClip(page)
      await page.waitForTimeout(1500)
      expect(await isPaused(video), `${key}: still stopped after scrolling away and back`).toBe(true)

      // The same key starts it again.
      await button.focus()
      await page.keyboard.press(key)
      await expect.poll(() => isPaused(video), { message: `${key} again` }).toBe(false)
      await expect(button).toHaveAttribute('aria-label', demo.clip.pause)
    }
  })

  test('its button says "เล่นคลิป" until the video really plays, then "หยุดคลิป" (AC13)', async ({ page }) => {
    // Hold the clip's download, so the video has been asked to play but cannot play yet.
    let release!: () => void
    const held = new Promise<void>(resolve => (release = resolve))
    await page.route('**/*.webm', async (route) => {
      await held
      await route.continue()
    })
    await openPage(page)
    const button = clipButtonOf(page)
    await expect(button).toBeVisible()
    await expect(button).toHaveAttribute('aria-label', demo.clip.play)

    await scrollToClip(page)
    await expect.poll(() => isPaused(videoOf(page))).toBe(false)
    await page.waitForTimeout(800)
    await expect(button).toHaveAttribute('aria-label', demo.clip.play)
    await expect(button).toHaveAttribute('data-state', 'paused')

    release()
    await expect(button).toHaveAttribute('aria-label', demo.clip.pause)
    await expect(button).toHaveAttribute('data-state', 'playing')
    await page.unroute('**/*.webm')
  })

  test('where the browser cannot play WebM, the poster stays and there is no button (AC13)', async ({ page }) => {
    // As an iPhone before iOS 17.4: no WebM, with or without a codec in the type.
    await page.addInitScript(() => {
      const canPlayType = HTMLMediaElement.prototype.canPlayType
      HTMLMediaElement.prototype.canPlayType = function (this: HTMLMediaElement, type: string) {
        return type.trim().toLowerCase().startsWith('video/webm') ? '' : canPlayType.call(this, type)
      }
    })
    const requests = clipRequests(page)
    await openPage(page)
    await scrollToClip(page)
    await page.waitForTimeout(1500)
    expect(await videoOf(page).evaluate(element => element.checkVisibility())).toBe(true)
    expect(await isPaused(videoOf(page))).toBe(true)
    await expect(clipButtonOf(page)).toBeHidden()
    await expect(panelOf(page).getByRole('button', { name: demo.clip.pause })).toHaveCount(0)
    expect(requests).toEqual([])
  })
})

test.describe('the clip, for a visitor who asks for less motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 375, height: 667 } })

  test('stays the still poster and downloads nothing when scrolled to; the visitor can still play it (AC6)', async ({ page }) => {
    const requests = clipRequests(page)
    const posterStatuses: number[] = []
    page.on('response', (response) => {
      if (response.url().endsWith(demo.clip.poster)) posterStatuses.push(response.status())
    })
    await openPage(page)
    await scrollToClip(page)
    await page.waitForTimeout(1500)
    const video = videoOf(page)
    expect(requests).toEqual([])
    expect(await isPaused(video)).toBe(true)
    // The video shows its poster, which has loaded.
    expect(await video.evaluate(element => element.checkVisibility())).toBe(true)
    expect(posterStatuses).toContain(200)

    const button = clipButtonOf(page)
    await expect(button).toHaveAttribute('aria-label', demo.clip.play)
    await button.click()
    await expect(button).toHaveAttribute('aria-label', demo.clip.pause)
    expect(requests.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------------------------
// The hero's way to the panel (AC7)
// ---------------------------------------------------------------------------------------------

for (const viewport of [{ width: 375, height: 667 }, { width: 1440, height: 900 }]) {
  test(`at ${viewport.width}×${viewport.height} the hero's button to the booking system is wholly in the first screen and leads to the panel (AC7)`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await openPage(page)
    const link = page.locator('#top').getByRole('link', { name: hero.tryBooking })
    await expect(link).toHaveCount(1)
    await expect(link).toHaveAttribute('href', `#${demoAnchor}`)
    expect(await visibleWords(link)).toBe(hero.tryBooking)
    expect((await link.innerText()).replace(/\s+/g, ' ').trim()).toBe(`${hero.tryBooking} ↓`)
    const box = (await link.boundingBox())!
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
  })
}

for (const width of [360, 375, 414, 768]) {
  test(`at ${width}px the hero's two buttons share one row`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await openPage(page)
    await page.evaluate(() => document.fonts.ready)
    const tops = await page.locator('#top a.rounded-full').evaluateAll(links => links.map(link => Math.round(link.getBoundingClientRect().top)))
    expect(tops).toHaveLength(2)
    expect(tops[0]).toBe(tops[1])
  })
}

// ---------------------------------------------------------------------------------------------
// The price cards' links to a sample of each package (AC11, design v1.1.0 §3.4)
// ---------------------------------------------------------------------------------------------

for (const width of [320, 375, 1024, 1440]) {
  test(`at ${width}px each price card links to its sample in a new tab, underlined under every word, each phrase on one line (AC11)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openPage(page)
    await page.evaluate(() => document.fonts.ready)
    const cards = page.locator('#pricing li:has(> h3)')
    await expect(cards).toHaveCount(plans.length)

    for (const [index, plan] of plans.entries()) {
      const sample = sampleOf(plan.id)
      const links = cards.nth(index).locator('a[href]')
      if (!sample) {
        await expect(links, plan.id).toHaveCount(0)
        continue
      }
      await expect(links, plan.id).toHaveCount(1)
      const link = links.first()
      await expect(link).toHaveAttribute('href', sample.url)
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener')
      expect(await visibleWords(link), plan.id).toBe(joinPhrases(sample.link))
      if (sample.extra) await expect(cards.nth(index).getByText(joinPhrases(sample.extra), { exact: true })).toBeVisible()

      const layout = await link.evaluate((element) => {
        // No underline is drawn under an inline-block box: every child of the link must be inline.
        const inlineBlocks = [...element.querySelectorAll('*')].filter(child => getComputedStyle(child).display === 'inline-block').length
        const phraseLines = [...element.querySelectorAll('.whitespace-nowrap')].map((phrase) => {
          const range = document.createRange()
          range.selectNodeContents(phrase)
          return new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top))).size
        })
        return { inlineBlocks, phraseLines, underline: getComputedStyle(element).textDecorationLine }
      })
      expect(layout.underline, plan.id).toBe('underline')
      expect(layout.inlineBlocks, plan.id).toBe(0)
      // Control: the link's phrases were found, one span per phrase of the data.
      expect(layout.phraseLines, plan.id).toHaveLength(typeof sample.link === 'string' ? 0 : sample.link.length)
      expect(layout.phraseLines.every(lines => lines === 1), `${plan.id}: ${layout.phraseLines}`).toBe(true)
    }
  })
}

// ---------------------------------------------------------------------------------------------
// The panel's layout at every width, also with longer texts (AC8, lesson G-070)
// ---------------------------------------------------------------------------------------------

/** Every element of the panel that sticks out of it, and how far (elements of screen readers only left out). */
function sticksOutOfPanel(page: Page) {
  return panelOf(page).evaluate((panel) => {
    const outer = panel.getBoundingClientRect()
    return [...panel.querySelectorAll('*')]
      .filter(element => element.checkVisibility() && !element.closest('.sr-only'))
      .flatMap((element) => {
        const box = element.getBoundingClientRect()
        // An element without a box of its own (<wbr>) has nothing to stick out.
        if (box.width === 0 && box.height === 0) return []
        const past = Math.max(outer.left - box.left, box.right - outer.right)
        return past > 0.5 ? [`${element.tagName.toLowerCase()} "${(element.textContent ?? '').trim().slice(0, 30)}" +${past.toFixed(1)}px`] : []
      })
  })
}

async function pageScrollsSideways(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
}

for (const width of [320, 360, 375, 390, 414, 768, 1024, 1440]) {
  test(`at ${width}px nothing of the panel sticks out of it, and the page does not scroll sideways`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openPage(page)
    await page.evaluate(() => document.fonts.ready)
    expect(await sticksOutOfPanel(page)).toEqual([])
    expect(await pageScrollsSideways(page)).toBe(false)
  })
}

test('at 320px the panel holds texts twice as long: its phrases wrap inside their box instead of sticking out (lesson G-070)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await openPage(page)
  await page.evaluate(() => document.fonts.ready)
  // Every phrase of the panel's texts written twice, with no space in between (one long word for the browser).
  const doubled = await panelOf(page).locator('span.inline-block.max-w-full').evaluateAll((phrases) => {
    for (const phrase of phrases) phrase.textContent = `${phrase.textContent}${phrase.textContent}`
    return phrases.length
  })
  // Control: the label, the name, the description and the line about the trial data were doubled.
  expect(doubled).toBeGreaterThan(10)
  expect(await sticksOutOfPanel(page)).toEqual([])
  expect(await pageScrollsSideways(page)).toBe(false)
})
