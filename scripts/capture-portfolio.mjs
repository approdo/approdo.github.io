// Takes the screenshots of the sample websites shown in the "ผลงาน" section:
//
//   public/images/work/<id>-desktop-<width>.webp   the top of the page in a 1440×900 window
//   public/images/work/<id>-mobile-<width>.webp    the top of the page in a 375×760 phone window
//
// The URLs, window sizes and file widths come from app/data/portfolio.ts. Run it with
// `npm run capture-portfolio` whenever a URL there changes (e.g. after Landing-page moves to the
// approdo organisation), look at the files and commit them. The script only reads the websites.
//
// It uses the Chromium of the e2e tests (@playwright/test; install it once with
// `npx playwright install chromium`). Animations are turned off (reduced motion), so counters and
// fade-ins are captured in their final state. Chromium also encodes the WebP files (canvas.toDataURL),
// so no image library is needed.
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
// Node 22.18+ strips TypeScript types on import, so this reads the same data as the site.
import { portfolio, screenshotFile, screenshotViews } from '../app/data/portfolio.ts'

const imagesDir = new URL('../public/images/', import.meta.url)
const WEBP_QUALITY = 0.8

/** Resizes a PNG screenshot to each width in `widths` and encodes it as WebP, in the browser. */
async function toWebpFiles(page, png, widths) {
  return page.evaluate(async ({ dataUrl, widths, quality }) => {
    const image = new Image()
    image.src = dataUrl
    await image.decode()
    return widths.map((width) => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = Math.round(image.naturalHeight * width / image.naturalWidth)
      const context = canvas.getContext('2d')
      context.imageSmoothingQuality = 'high'
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const webp = canvas.toDataURL('image/webp', quality)
      if (!webp.startsWith('data:image/webp;base64,')) throw new Error('This browser cannot encode WebP')
      return webp.slice('data:image/webp;base64,'.length)
    })
  }, { dataUrl: `data:image/png;base64,${png.toString('base64')}`, widths, quality: WEBP_QUALITY })
}

const browser = await chromium.launch()
try {
  const encoder = await browser.newPage()
  await mkdir(new URL('work/', imagesDir), { recursive: true })

  for (const item of portfolio) {
    for (const [view, { width, height, files }] of Object.entries(screenshotViews)) {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 1,
        isMobile: view === 'mobile',
        hasTouch: view === 'mobile',
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      const response = await page.goto(item.url, { waitUntil: 'networkidle' })
      if (!response?.ok()) throw new Error(`${item.url} answered ${response?.status()}`)
      await page.evaluate(async () => {
        document.documentElement.style.scrollbarWidth = 'none'
        await document.fonts.ready
      })
      // Let late images and the last layout settle.
      await page.waitForTimeout(800)
      const png = await page.screenshot({ type: 'png' })
      await context.close()

      const encoded = await toWebpFiles(encoder, png, files)
      for (const [index, fileWidth] of files.entries()) {
        const file = screenshotFile(item.id, view, fileWidth)
        const data = Buffer.from(encoded[index], 'base64')
        await writeFile(new URL(file, imagesDir), data)
        console.log(`public/images/${file}  ${(data.length / 1024).toFixed(0)} KiB  (${item.url})`)
      }
    }
  }
}
finally {
  await browser.close()
}
