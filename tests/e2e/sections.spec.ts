import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import jsQR from 'jsqr'
import type { Locator, Page } from '@playwright/test'
import { faqs } from '../../app/data/faq'
import { menuSections } from '../../app/data/menu'
import { portfolio } from '../../app/data/portfolio'
import { plans, termsBoxes } from '../../app/data/pricing'
import { steps } from '../../app/data/process'
import { site } from '../../app/data/site'

// The page: its sections, the LINE links, the header menu and the questions. Texts, counts and links
// come from app/data/ and the messages file (lesson G-018), so the tests keep passing when content changes.

const sitePath = new URL(site.url).pathname
const messages = JSON.parse(readFileSync(new URL('../../i18n/locales/th.json', import.meta.url), 'utf8'))

// In-page links jump instead of gliding, so positions can be read right after a click (lesson G-023).
test.use({ reducedMotion: 'reduce' })

/** Opens the page and waits for Vue to take over the pre-rendered HTML (from then on buttons react). */
async function openPage(page: Page) {
  await page.goto('./')
  await page.waitForFunction(() => {
    const root = document.querySelector('#__nuxt')
    return root !== null && '__vue_app__' in root
  })
}

function menuLink(page: Page, section: string) {
  return page.locator('#site-nav').getByRole('link', { name: messages.nav[section], exact: true })
}

/**
 * Presses Tab from the top of the page and lists the header's stops, left edge first, until the focus
 * leaves the header (the first stop, the skip link, is outside it and is left out).
 */
async function headerTabStops(page: Page) {
  const stops: { name: string, left: number }[] = []
  await page.keyboard.press('Tab')
  for (let index = 0; index < 20; index++) {
    await page.keyboard.press('Tab')
    const stop = await page.evaluate((newTab) => {
      const focused = document.activeElement
      if (!(focused instanceof HTMLElement) || !focused.closest('#site-header')) return null
      return {
        // The LINE button also says, to screen readers only, that it opens a new tab.
        name: focused.getAttribute('aria-label') ?? focused.textContent!.replace(newTab, '').trim(),
        left: focused.getBoundingClientRect().left,
      }
    }, messages.newTab as string)
    if (!stop) break
    stops.push(stop)
  }
  return stops
}

/** The element is in the window and its top is not under the sticky header (lesson G-023). */
async function expectBelowHeader(page: Page, target: Locator) {
  await expect(target).toBeInViewport()
  const top = (await target.boundingBox())!.y
  const header = (await page.locator('#site-header').boundingBox())!
  expect(top).toBeGreaterThanOrEqual(header.y + header.height - 1)
}

test('has the header, every section in order and the footer, with unique ids', async ({ page }) => {
  await openPage(page)
  expect(await page.locator('#__nuxt :is(#site-header, main, #site-footer)').evaluateAll(elements => elements.map(element => element.id)))
    .toEqual(['site-header', 'main', 'site-footer'])
  // The menu lists the sections in page order; the hero comes first and has no menu entry.
  expect(await page.locator('#main section[id]').evaluateAll(sections => sections.map(section => section.id)))
    .toEqual(['top', ...menuSections])
  const ids = await page.locator('[id]').evaluateAll(elements => elements.map(element => element.id))
  expect(ids.length).toBe(new Set(ids).size)
})

test('shows every website, package, terms box, step and question in the data', async ({ page }) => {
  await openPage(page)
  await expect(page.locator('#work article')).toHaveCount(portfolio.length)
  await expect(page.locator('#pricing li h3')).toHaveCount(plans.length)
  await expect(page.locator('#pricing div > h3')).toHaveCount(termsBoxes.length)
  await expect(page.locator('#process ol > li')).toHaveCount(steps.length)
  await expect(page.locator('#faq details')).toHaveCount(faqs.length)
  for (const [index, faq] of faqs.entries()) {
    await expect(page.locator('#faq details').nth(index)).toHaveJSProperty('open', Boolean(faq.open))
  }
})

test('every LINE link leads to the LINE account in site.ts and opens in a new tab', async ({ page }) => {
  await openPage(page)
  const lineLinks = page.locator('a[href*="line.me"]')
  // At least the hero and the contact section.
  expect(await lineLinks.count()).toBeGreaterThanOrEqual(2)
  for (const link of await lineLinks.all()) {
    await expect(link).toHaveAttribute('href', site.line.url)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener')
  }
})

test('every website card links to its site in a new tab', async ({ page }) => {
  await openPage(page)
  for (const [index, item] of portfolio.entries()) {
    const link = page.locator('#work article').nth(index).locator(`a[href="${item.url}"]`)
    await expect(link).toHaveCount(1)
    await expect(link).toHaveAttribute('target', '_blank')
  }
})

for (const width of [375, 768, 1440]) {
  test(`nothing is wider than a ${width}px window`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openPage(page)
    await page.evaluate(() => document.fonts.ready)
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })
}

// ---------------------------------------------------------------------------------------------
// Prices: the regular price after each launch price, in the hero's ticket and on the price cards
// (decision D-017, design BR-020). 320px and 1024px are where the ticket is narrowest.
// ---------------------------------------------------------------------------------------------

const plansWithRegularPrice = plans.filter(plan => plan.regularPrice)

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`at ${width}px the ticket and the cards show each regular price after its launch price, on one line and in the box`, async ({ page }) => {
    test.skip(plansWithRegularPrice.length === 0, 'no package has a regular price')
    await page.setViewportSize({ width, height: 900 })
    await openPage(page)
    await page.evaluate(() => document.fonts.ready)

    const places = [['ticket', page.locator('#top aside ol > li')], ['card', page.locator('#pricing li:has(> h3)')]] as const
    for (const [place, rows] of places) {
      await expect(rows, place).toHaveCount(plans.length)
      for (const [index, plan] of plans.entries()) {
        if (!plan.regularPrice) continue
        const label = `${place} ${plan.id}`
        const row = rows.nth(index)
        const regularPrice = row.getByText(plan.regularPrice, { exact: true })
        await expect(regularPrice, label).toHaveCount(1)
        await expect(regularPrice, label).toBeVisible()
        // Words, not a struck-through number: it is the price after the launch offer, not a cancelled one.
        await expect(regularPrice, label).toHaveCSS('text-decoration-line', 'none')

        // Read in the order of the price list: launch price, regular price, duration.
        const text = (await row.innerText()).replace(/\s+/g, ' ')
        const positions = [plan.price, plan.regularPrice, plan.duration ?? ''].filter(part => part).map(part => text.indexOf(part))
        expect(Math.min(...positions), `${label}: ${text}`).toBeGreaterThanOrEqual(0)
        expect(positions, `${label}: ${text}`).toEqual([...positions].sort((a, b) => a - b))

        const layout = await regularPrice.evaluate((element) => {
          const range = document.createRange()
          range.selectNodeContents(element)
          const lineTops = new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top)))
          // The ticket row or the card: the box the regular price must stay inside.
          const box = element.closest('li')!
          const style = getComputedStyle(box)
          const contentRight = box.getBoundingClientRect().right - Number.parseFloat(style.paddingRight) - Number.parseFloat(style.borderRightWidth)
          const rect = element.getBoundingClientRect()
          return { lines: lineTops.size, overflow: rect.right - contentRight, width: rect.width }
        })
        expect(layout.lines, `${label}: lines`).toBe(1)
        expect(layout.overflow, `${label}: px out of the box`).toBeLessThanOrEqual(1)
        if (place === 'ticket') {
          // From 1024px the regular price sits under the launch price in the same column; being narrower,
          // it leaves the column as wide as before, and the package name beside it keeps its room.
          const launchPrice = (await row.getByText(plan.price, { exact: true }).boundingBox())!
          expect(layout.width, `${label}: narrower than the launch price`).toBeLessThanOrEqual(launchPrice.width)
        }
      }
    }
  })
}

// ---------------------------------------------------------------------------------------------
// Header: logo and LINE button at every width, the menu from 1024px (no menu button on phones)
// ---------------------------------------------------------------------------------------------

const homeLabel = (messages.header.home as string).replace('{name}', site.name)

for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 }]) {
  test.describe(`header at ${viewport.width}px`, () => {
    test.use({ viewport })

    test('holds the logo and the LINE button only, in that order for the keyboard', async ({ page }) => {
      await openPage(page)
      await expect(page.locator('#site-nav')).toBeHidden()
      await expect(page.locator('#site-header button')).toHaveCount(0)
      await expect(page.locator('#site-header a[href*="line.me"]')).toBeVisible()
      const stops = await headerTabStops(page)
      expect(stops.map(stop => stop.name)).toEqual([homeLabel, messages.line.chat])
    })

    test('the hero links bring their section below the header; Back keeps the URL under the site path (lesson G-008)', async ({ page }) => {
      await openPage(page)
      const pageUrl = page.url()
      const hero = page.locator('#top')
      for (const [name, section] of [[messages.hero.seeWork, 'work'], [messages.hero.details, 'pricing']] as const) {
        await hero.getByRole('link', { name }).click()
        await expect(page).toHaveURL(`${pageUrl}#${section}`)
        await expectBelowHeader(page, page.locator(`#${section} h2`))
      }
      await page.goBack()
      await expect(page).toHaveURL(`${pageUrl}#work`)
      expect(new URL(page.url()).pathname).toBe(sitePath)
    })
  })
}

test.describe('header at 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('Tab goes through the header from left to right: logo, menu links, LINE button', async ({ page }) => {
    await openPage(page)
    const stops = await headerTabStops(page)
    expect(stops.map(stop => stop.name)).toEqual([homeLabel, ...menuSections.map(section => messages.nav[section]), messages.line.chat])
    const lefts = stops.map(stop => stop.left)
    expect(lefts).toEqual([...lefts].sort((a, b) => a - b))
  })

  test('each menu link brings its section below the header; Back keeps the URL under the site path (lesson G-008)', async ({ page }) => {
    await openPage(page)
    const pageUrl = page.url()
    for (const section of menuSections) await expect(menuLink(page, section)).toBeVisible()

    for (const section of menuSections) {
      await menuLink(page, section).click()
      await expect(page).toHaveURL(`${pageUrl}#${section}`)
      await expectBelowHeader(page, page.locator(`#${section} h2`))
    }
    await page.goBack()
    await expect(page).toHaveURL(`${pageUrl}#${menuSections.at(-2)}`)
    expect(new URL(page.url()).pathname).toBe(sitePath)
  })
})

// ---------------------------------------------------------------------------------------------
// Work, QR code and what the page loads
// ---------------------------------------------------------------------------------------------

/** Scrolls through the whole page, so that every lazy image that comes into view starts loading. */
async function scrollThroughPage(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      window.scrollTo(0, y)
      await new Promise(resolve => requestAnimationFrame(resolve))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
}

/** The image has loaded from the server (not a broken image). */
function isLoaded(image: Locator) {
  return image.evaluate(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)
}

test('every website card has its label once, screenshots that say the brand is fictional, and its scores with tool and date', async ({ page }) => {
  await openPage(page)
  await scrollThroughPage(page)
  for (const [index, item] of portfolio.entries()) {
    const card = page.locator('#work article').nth(index)
    await expect(card.getByText(item.label, { exact: true })).toHaveCount(1)
    await expect(card.getByRole('heading', { level: 3 })).toHaveText(item.name)

    const images = card.locator('img')
    await expect(images).toHaveCount(2)
    for (const image of await images.all()) {
      await expect(image).toHaveAttribute('loading', 'lazy')
      await expect(image).toHaveAttribute('width', /^\d+$/)
      await expect(image).toHaveAttribute('height', /^\d+$/)
      await expect(image).toHaveAttribute('alt', /แบรนด์สมมติ/)
      expect(await isLoaded(image)).toBe(true)
    }

    const scores = card.locator('figure')
    for (const score of Object.values(item.measurement.scores)) await expect(scores.locator('dd', { hasText: String(score) }).first()).toBeVisible()
    await expect(scores.locator('figcaption')).toContainText(item.measurement.tool)
    await expect(scores.locator('time')).toHaveAttribute('datetime', item.measurement.date)
    await expect(scores.locator('time')).toContainText(item.measurement.dateLabel)
  }
})

test.describe('QR code at 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('is shown at 200×200 and reads back as the LINE link, with a reader other than the one that made it', async ({ page }) => {
    await openPage(page)
    const qr = page.locator('#contact img[src$="line-qr.svg"]')
    await qr.scrollIntoViewIfNeeded()
    await expect(qr).toBeVisible()
    await expect(qr).toHaveAttribute('alt', new RegExp(site.line.id))
    await expect.poll(() => isLoaded(qr)).toBe(true)
    const box = (await qr.boundingBox())!
    expect([Math.round(box.width), Math.round(box.height)]).toEqual([200, 200])

    // The image as the browser draws it, read with jsQR (the code was made with qrcode-generator).
    const pixels = await qr.evaluate((img) => {
      const canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 200
      const context = canvas.getContext('2d')!
      context.drawImage(img as HTMLImageElement, 0, 0, 200, 200)
      return Array.from(context.getImageData(0, 0, 200, 200).data)
    })
    expect(jsQR(Uint8ClampedArray.from(pixels), 200, 200)?.data).toBe(site.line.url)
  })
})

for (const width of [375, 768]) {
  test(`the QR code is not shown at ${width}px, where the LINE button opens the app`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openPage(page)
    await expect(page.locator('#contact img[src$="line-qr.svg"]')).toBeHidden()
  })
}

test('the page asks no other site for anything while it loads and scrolls: no QR service, no font host (lesson G-011)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const requested: string[] = []
  page.on('request', request => requested.push(request.url()))
  await openPage(page)
  await scrollThroughPage(page)
  const pageHost = new URL(page.url()).host
  // Control: the page's own files were seen, including the QR code and the screenshots.
  expect(requested.some(url => url.endsWith('line-qr.svg'))).toBe(true)
  expect(requested.some(url => url.endsWith('.webp'))).toBe(true)
  expect(requested.filter(url => new URL(url).host !== pageHost)).toEqual([])
})

for (const width of [375, 1440]) {
  test(`at ${width}px no phrase that must stay on one line sticks out of its box (lesson G-007)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openPage(page)
    await page.evaluate(() => document.fonts.ready)
    const phrases = page.locator('.whitespace-nowrap')
    // Control: there are such phrases to check.
    expect(await phrases.count()).toBeGreaterThan(10)
    const sticking = await phrases.evaluateAll(elements => elements
      .filter(element => element.checkVisibility())
      .flatMap((element) => {
        // The box the phrase flows in: its nearest ancestor that is not inline.
        let box = element.parentElement!
        while (getComputedStyle(box).display.startsWith('inline')) box = box.parentElement!
        const style = getComputedStyle(box)
        const right = box.getBoundingClientRect().right - Number.parseFloat(style.paddingRight) - Number.parseFloat(style.borderRightWidth)
        const overflow = element.getBoundingClientRect().right - right
        return overflow > 1 ? [`${element.textContent!.trim()} +${overflow.toFixed(1)}px`] : []
      }))
    expect(sticking).toEqual([])
  })
}

test('no box waiting for the owner\'s answer is left on the page', async ({ page }) => {
  await openPage(page)
  await expect(page.locator('body')).not.toContainText('รอข้อมูลจากเจ้าของ')
})

test('the keyboard opens and closes a question', async ({ page }) => {
  await openPage(page)
  const question = page.locator('#faq details').last()
  const isOpen = () => question.evaluate(details => (details as HTMLDetailsElement).open)
  const wasOpen = await isOpen()

  await question.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect.poll(isOpen).toBe(!wasOpen)
  await page.keyboard.press('Space')
  await expect.poll(isOpen).toBe(wasOpen)
})
