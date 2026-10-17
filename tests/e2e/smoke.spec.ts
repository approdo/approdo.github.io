import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { hero } from '../../app/data/hero'
import { site } from '../../app/data/site'
import { joinPhrases } from '../../app/utils/phrases'

// The home page at the site path (the root of the domain for Approdo). Everything is read from
// app/data/, so these tests keep passing when a detail changes.

const sitePath = new URL(site.url).pathname

/** The URL on the test server of a file the page refers to, also for absolute site URLs (og:image). */
function serverUrl(page: Page, href: string) {
  return new URL(href.replace(site.url, sitePath), page.url()).href
}

/** Collects console errors, uncaught page errors and failed responses while the page loads (lesson G-011). */
function watchForErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', error => errors.push(`page error: ${error.message}`))
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
  })
  return errors
}

test('the home page loads at the site path in Thai, with its title, tagline and © line, and no errors', async ({ page }) => {
  const errors = watchForErrors(page)
  const response = await page.goto('./', { waitUntil: 'networkidle' })

  expect(response?.status()).toBe(200)
  expect(new URL(page.url()).pathname).toBe(sitePath)
  await expect(page.locator('html')).toHaveAttribute('lang', 'th')
  await expect(page).toHaveTitle(site.title)
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('h1')).toHaveText(joinPhrases(hero.tagline))
  await expect(page.locator('#site-footer')).toContainText(site.copyright)

  expect(errors).toEqual([])
})

test('a real brand site: no demo line, no phone or e-mail link (decision D-003)', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#site-demo-notice')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText('เว็บไซต์ตัวอย่าง')
  await expect(page.locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0)
})

test('every file that <head> refers to is under the site path and is served (lesson G-020)', async ({ page, request }) => {
  await page.goto('./')
  const hrefs = await page.locator('head').evaluate(head => [
    ...[...head.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="stylesheet"], link[rel="modulepreload"], link[rel="preload"]')]
      .map(link => link.getAttribute('href') ?? ''),
    ...[...head.querySelectorAll('script[src]')].map(script => script.getAttribute('src') ?? ''),
    head.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
  ])

  // At least the icon, the home-screen icon, the link preview, one stylesheet and one script.
  expect(hrefs.length).toBeGreaterThanOrEqual(5)
  for (const href of hrefs) {
    expect(href.startsWith(sitePath) || href.startsWith(site.url), href).toBe(true)
    const response = await request.get(serverUrl(page, href))
    expect(response.status(), href).toBe(200)
  }
})

test('the canonical link and og:url are the site URL', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', site.url)
  await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', site.url)
})

test('search results and link previews get the title, the description and the preview image', async ({ page }) => {
  await page.goto('./')
  const head = page.locator('head')
  const meta = (attribute: 'name' | 'property', value: string) => head.locator(`meta[${attribute}="${value}"]`)

  await expect(meta('name', 'description')).toHaveAttribute('content', site.description)
  await expect(meta('property', 'og:title')).toHaveAttribute('content', site.title)
  await expect(meta('property', 'og:description')).toHaveAttribute('content', site.description)
  await expect(meta('property', 'og:type')).toHaveAttribute('content', 'website')
  // Absolute, at the root of the live site: apps that show the preview fetch it from there.
  await expect(meta('property', 'og:image')).toHaveAttribute('content', `${site.url}og-image.png`)
  await expect(meta('property', 'og:image:width')).toHaveAttribute('content', '1200')
  await expect(meta('property', 'og:image:height')).toHaveAttribute('content', '630')
  await expect(meta('property', 'og:image:alt')).toHaveAttribute('content', new RegExp(`^${site.name} — \\S`))
  await expect(meta('name', 'twitter:card')).toHaveAttribute('content', 'summary_large_image')

  // One of each, so that no app has to choose between two values.
  for (const [attribute, value] of [['name', 'description'], ['property', 'og:title'], ['property', 'og:image']] as const) {
    await expect(meta(attribute, value), value).toHaveCount(1)
  }
})

test('the home-screen icon is the logo mark.svg as Chromium draws it at 180×180 (task BR-004)', async ({ page }) => {
  await page.goto('./')
  const iconHref = await page.locator('head link[rel="apple-touch-icon"]').getAttribute('href')
  expect(iconHref).toBe(`${sitePath}apple-touch-icon.png`)

  // Both images are drawn on canvases of the same size and compared pixel by pixel. A pixel differs
  // when one of its colour channels is more than 16 (of 255) away from the logo's.
  const result = await page.evaluate(async ({ iconUrl, logoUrl, otherLogoUrl }) => {
    async function pixelsOf(url: string) {
      const image = new Image(180, 180)
      image.src = url
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = 180
      canvas.height = 180
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0, 180, 180)
      return { natural: [image.naturalWidth, image.naturalHeight], data: context.getImageData(0, 0, 180, 180).data }
    }
    function shareOfDifferentPixels(a: Uint8ClampedArray, b: Uint8ClampedArray) {
      let different = 0
      for (let index = 0; index < a.length; index += 4) {
        const channels = [0, 1, 2].map(channel => Math.abs(a[index + channel]! - b[index + channel]!))
        if (Math.max(...channels) > 16) different++
      }
      return different / (a.length / 4)
    }
    const icon = await pixelsOf(iconUrl)
    const logo = await pixelsOf(logoUrl)
    const otherLogo = await pixelsOf(otherLogoUrl)
    return {
      iconSize: icon.natural,
      share: shareOfDifferentPixels(icon.data, logo.data),
      controlShare: shareOfDifferentPixels(icon.data, otherLogo.data),
    }
  }, {
    iconUrl: `${sitePath}apple-touch-icon.png`,
    logoUrl: `${sitePath}images/brand/mark.svg`,
    otherLogoUrl: `${sitePath}images/brand/mark-on-light.svg`,
  })

  expect(result.iconSize).toEqual([180, 180])
  expect(result.share).toBeLessThanOrEqual(0.05)
  // Control: the same comparison with another logo file (no navy square) finds most pixels different.
  expect(result.controlShare).toBeGreaterThan(0.5)
})

test('an in-page link and Back keep the URL under the site path, never doubled (lesson G-008)', async ({ page }) => {
  await page.goto('./')
  // Wait for Vue to take over the page: the router's first navigation would otherwise replace the
  // URL and drop a hash set before it (a race that shows up when the whole suite runs in parallel).
  await page.waitForFunction(() => {
    const root = document.querySelector('#__nuxt')
    return root !== null && '__vue_app__' in root
  })
  const pageUrl = page.url()

  // A hash change goes through the router like a click on an in-page link.
  await page.evaluate(() => {
    location.hash = 'site-footer'
  })
  await expect(page).toHaveURL(`${pageUrl}#site-footer`)

  await page.goBack()
  await expect(page).toHaveURL(pageUrl)
  expect(new URL(page.url()).pathname).toBe(sitePath)
})

test('the site is in Thai only: no English pages and no hreflang link to English', async ({ page, request }) => {
  expect(site.english).toBe(false)
  // Relative to the base URL of the config, which ends with the site path.
  const response = await request.get('./en/')
  expect(response.status()).toBe(404)

  await page.goto('./')
  const hreflangs = await page.locator('head link[rel="alternate"][hreflang]').evaluateAll(links => links.map(link => link.getAttribute('hreflang')))
  expect(hreflangs).not.toContain('en')
})
