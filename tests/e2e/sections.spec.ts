import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
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

function menuButton(page: Page) {
  return page.getByRole('button', { name: messages.header.menuButton, exact: true })
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
    const stop = await page.evaluate(() => {
      const focused = document.activeElement
      if (!(focused instanceof HTMLElement) || !focused.closest('#site-header')) return null
      return {
        name: focused.getAttribute('aria-label') ?? focused.textContent!.trim(),
        left: focused.getBoundingClientRect().left,
      }
    })
    if (!stop) break
    stops.push(stop)
  }
  return stops
}

/** The focused element's focus ring (outline offset + width) fits inside the open menu panel, which clips its overflow. */
function ringFitsInPanel(link: Locator) {
  return link.evaluate((element) => {
    const style = getComputedStyle(element)
    const ring = Number.parseFloat(style.outlineOffset) + Number.parseFloat(style.outlineWidth)
    const box = element.getBoundingClientRect()
    const panel = element.closest('#site-nav')!
    // The visible area of the panel: inside its borders.
    const panelBox = panel.getBoundingClientRect()
    const top = panelBox.top + panel.clientTop
    const left = panelBox.left + panel.clientLeft
    return box.top - ring >= top && box.left - ring >= left
      && box.bottom + ring <= top + panel.clientHeight && box.right + ring <= left + panel.clientWidth
  })
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
// Header menu
// ---------------------------------------------------------------------------------------------

for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 }]) {
  test.describe(`menu at ${viewport.width}px`, () => {
    test.use({ viewport })

    test('the menu button opens and closes the panel; Escape closes it and puts the focus back on the button', async ({ page }) => {
      await openPage(page)
      const button = menuButton(page)
      const panel = page.locator('#site-nav')
      await expect(button).toHaveAttribute('aria-expanded', 'false')
      await expect(panel).toBeHidden()

      await button.click()
      await expect(button).toHaveAttribute('aria-expanded', 'true')
      await expect(panel).toBeVisible()
      await expect(page.locator('html')).toHaveClass(/\bmenu-open\b/)
      await button.click()
      await expect(panel).toBeHidden()

      await button.click()
      await page.keyboard.press('Escape')
      await expect(button).toHaveAttribute('aria-expanded', 'false')
      await expect(panel).toBeHidden()
      await expect(button).toBeFocused()
      await expect(page.locator('html')).not.toHaveClass(/\bmenu-open\b/)
    })

    test('from the keyboard, Tab after opening the menu goes through its links in order; Shift+Tab and Escape go back to the button (WCAG 2.4.3)', async ({ page }) => {
      await openPage(page)
      const button = menuButton(page)
      const panel = page.locator('#site-nav')
      await button.focus()
      await page.keyboard.press('Enter')
      await expect(panel).toBeVisible()

      for (const section of menuSections) {
        await page.keyboard.press('Tab')
        const link = menuLink(page, section)
        await expect(link).toBeFocused()
        await expect(panel).toBeVisible()
        expect(await ringFitsInPanel(link), `focus ring of "${section}" inside the panel`).toBe(true)
      }

      for (const section of [...menuSections].reverse().slice(1)) {
        await page.keyboard.press('Shift+Tab')
        await expect(menuLink(page, section)).toBeFocused()
      }
      await page.keyboard.press('Shift+Tab')
      await expect(button).toBeFocused()
      await expect(panel).toBeVisible()

      // Tab past the last link leaves the header: the panel closes and the focus goes on to the page.
      for (let index = 0; index <= menuSections.length; index++) await page.keyboard.press('Tab')
      await expect(panel).toBeHidden()
      await expect(button).toHaveAttribute('aria-expanded', 'false')

      // Escape from a link inside the menu closes it and puts the focus back on the button.
      await button.focus()
      await page.keyboard.press('Enter')
      await page.keyboard.press('Tab')
      await expect(menuLink(page, menuSections[0]!)).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      await expect(button).toBeFocused()
    })

    test('with the menu closed, Tab goes through the header from left to right: logo, menu button', async ({ page }) => {
      await openPage(page)
      const stops = await headerTabStops(page)
      expect(stops.map(stop => stop.name)).toEqual([site.name, messages.header.menuButton])
      const lefts = stops.map(stop => stop.left)
      expect(lefts).toEqual([...lefts].sort((a, b) => a - b))
    })

    test('each menu link closes the panel and brings its section below the header; Back keeps the URL under the site path (lesson G-008)', async ({ page }) => {
      await openPage(page)
      const pageUrl = page.url()
      for (const section of menuSections) {
        await menuButton(page).click()
        await menuLink(page, section).click()
        await expect(page).toHaveURL(`${pageUrl}#${section}`)
        await expect(page.locator('#site-nav')).toBeHidden()
        await expectBelowHeader(page, page.locator(`#${section} h2`))
      }

      await page.goBack()
      await expect(page).toHaveURL(`${pageUrl}#${menuSections.at(-2)}`)
      expect(new URL(page.url()).pathname).toBe(sitePath)
    })
  })
}

test.describe('menu at 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the whole menu sits in the header with no menu button, and its links work the same', async ({ page }) => {
    await openPage(page)
    const pageUrl = page.url()
    await expect(menuButton(page)).toBeHidden()
    for (const section of menuSections) await expect(menuLink(page, section)).toBeVisible()

    for (const section of menuSections) {
      await menuLink(page, section).click()
      await expect(page).toHaveURL(`${pageUrl}#${section}`)
      await expectBelowHeader(page, page.locator(`#${section} h2`))
    }
    await page.goBack()
    expect(new URL(page.url()).pathname).toBe(sitePath)
  })

  test('Tab goes through the header from left to right: logo, menu links', async ({ page }) => {
    await openPage(page)
    const stops = await headerTabStops(page)
    expect(stops.map(stop => stop.name)).toEqual([site.name, ...menuSections.map(section => messages.nav[section])])
    const lefts = stops.map(stop => stop.left)
    expect(lefts).toEqual([...lefts].sort((a, b) => a - b))
  })
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
