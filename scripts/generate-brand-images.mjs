// Makes the site's icons and link-preview image from Approdo's own logo files (lesson G-020):
//
//   public/favicon.svg           browser tab icon: mark.svg itself, the A on its navy square
//   public/apple-touch-icon.png  180×180 home-screen icon for iPhone and iPad: mark.svg rendered by Chromium
//   public/og-image.png          1200×630 preview shown when a link to the site is shared: the A of
//                                mark-on-dark.svg, the wordmark "Approdo" and the tagline on the navy gradient
//
// Nothing of the logo is drawn here. The A comes from the files in public/images/brand/, which are the
// brand kit's files (Demo-story/_brand/approdo/ in the story repository) without their <metadata>.
// The colours and fonts come from app/assets/css/tokens.css, the name from app/data/site.ts and the
// tagline from app/data/hero.ts, all of them from Approdo's brand file. The link preview shows the name
// and the tagline only, no other text.
//
// After changing a logo file, a colour, a font or the tagline, run `npm run brand-images`, look at the
// three files and commit them.
//
// The PNG files are rendered by the Chromium that the e2e tests use (@playwright/test; install it once
// with `npx playwright install chromium`). The link preview needs internet: its page loads the two web
// fonts from Google Fonts. Only this script does that; the site itself serves its own copy of the fonts.
import { readFile, stat, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
// Node 22.18+ strips TypeScript types on import, so this reads the same data as the site.
import { hero } from '../app/data/hero.ts'
import { site } from '../app/data/site.ts'
import { joinPhrases } from '../app/utils/phrases.ts'
import { removeMetadata } from './lib/svg.ts'
import { readColor, readFontFamilies } from './lib/tokens.ts'

const publicDir = new URL('../public/', import.meta.url)
const brandDir = new URL('images/brand/', publicDir)
const tokensCss = await readFile(new URL('../app/assets/css/tokens.css', import.meta.url), 'utf8')

const color = {
  // The brand's navy gradient (brand.md "## สี": Harbor Navy, #22366A -> #0F1A35).
  gradientFrom: readColor(tokensCss, 'harbor-navy-light'),
  gradientTo: readColor(tokensCss, 'harbor-navy-deep'),
  wordmark: readColor(tokensCss, 'white'),
  tagline: readColor(tokensCss, 'shore-cream'),
}

/** A web font of the site: the first family of a font token, in the boldest weight the site downloads. */
function webFont(token) {
  const family = readFontFamilies(tokensCss, token)[0]
  const weights = site.fontWeights[family]
  if (!weights) throw new Error(`site.fontWeights has no weights for "${family}", the first family of --font-${token}`)
  return { family, weight: Math.max(...weights) }
}

// The wordmark is set in Outfit 600 (--font-display), the tagline in IBM Plex Sans Thai 500 (--font-sans).
const wordmarkFont = webFont('display')
const taglineFont = webFont('sans')
const tagline = joinPhrases(hero.tagline)

// Google Fonts' CSS API, asked for the same families and weights as the site.
const GOOGLE_FONTS_CSS_API = 'https://fonts.googleapis.com/css2'
const fontStylesheet = `${GOOGLE_FONTS_CSS_API}?${[wordmarkFont, taglineFont]
  .map(font => `family=${encodeURIComponent(font.family).replaceAll('%20', '+')}:wght@${font.weight}`)
  .join('&')}&display=block`

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** An SVG file as a data: URL, so that Chromium draws it as an image, exactly like a browser shows the file. */
function svgDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

async function readLogo(file) {
  return removeMetadata(await readFile(new URL(file, brandDir), 'utf8'))
}

const mark = await readLogo('mark.svg')
const markOnDark = await readLogo('mark-on-dark.svg')

// ---------------------------------------------------------------------------------------------
// PNG files: small HTML pages rendered by Chromium.
// ---------------------------------------------------------------------------------------------
function htmlPage({ withFonts, styles, body }) {
  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
${withFonts ? `<link rel="stylesheet" href="${escapeHtml(fontStylesheet)}">` : ''}
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 100%; height: 100%; }
  ${styles}
</style>
</head>
<body>${body}</body>
</html>`
}

// iOS rounds the corners of home-screen icons itself, and fills transparent pixels with black.
// mark.svg is a full navy square, so it is used as it is, over the whole icon.
const appleTouchIcon = {
  file: 'apple-touch-icon.png',
  width: 180,
  height: 180,
  fonts: [],
  html: htmlPage({
    withFonts: false,
    styles: 'img { display: block; width: 180px; height: 180px; }',
    body: `<img src="${svgDataUrl(mark)}" alt="">`,
  }),
}

/** '#22366A' -> [34, 54, 106] */
function rgb(hex) {
  return [1, 3, 5].map(start => Number.parseInt(hex.slice(start, start + 2), 16))
}

/**
 * A script that paints the navy gradient on the page's <canvas>, pixel by pixel: an ellipse lit at
 * 50% across and 38% down (like mark.svg), from `from` in the middle to `to` at the farthest corner,
 * the shape of CSS radial-gradient(ellipse at 50% 38%, from, to).
 *
 * Chromium's own gradients are dithered: their noise makes the PNG about 330 kB, more than the
 * 300 kB that some apps (WhatsApp) accept for a link preview. Rounded, undithered colours compress
 * to a fraction of that, and the steps of 1/255 between them do not show.
 */
function gradientScript(from, to) {
  return `
    const canvas = document.querySelector('canvas')
    const { width, height } = canvas
    const context = canvas.getContext('2d')
    const pixels = context.createImageData(width, height)
    const from = ${JSON.stringify(rgb(from))}
    const to = ${JSON.stringify(rgb(to))}
    const centreX = width * 0.5
    const centreY = height * 0.38
    const radiusX = Math.max(centreX, width - centreX) * Math.SQRT2
    const radiusY = Math.max(centreY, height - centreY) * Math.SQRT2
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const t = Math.min(1, Math.hypot((x + 0.5 - centreX) / radiusX, (y + 0.5 - centreY) / radiusY))
        const index = (y * width + x) * 4
        for (let channel = 0; channel < 3; channel++) {
          pixels.data[index + channel] = Math.round(from[channel] + (to[channel] - from[channel]) * t)
        }
        pixels.data[index + 3] = 255
      }
    }
    context.putImageData(pixels, 0, 0)`
}

// Link preview, laid out like the brand's LINE and Facebook covers: the A next to the wordmark (the
// logo, brand.md "## โลโก้"), the tagline under them, all in the middle on the navy gradient, lit from
// above the middle like mark.svg. Nothing else: no services line, no waves.
const ogImage = {
  file: 'og-image.png',
  width: 1200,
  height: 630,
  maxBytes: 300 * 1024,
  // The logo and the tagline must leave 60px free on each side, also with a longer name or tagline.
  fitSelector: '.logo, .tagline',
  sideMargin: 60,
  fonts: [
    { ...wordmarkFont, text: site.name },
    { ...taglineFont, text: tagline },
  ],
  html: htmlPage({
    withFonts: true,
    styles: `
      body { display: grid; place-content: center; justify-items: center; gap: 36px; background: ${color.gradientTo}; }
      canvas { position: fixed; inset: 0; z-index: -1; }
      .logo { display: flex; align-items: center; gap: 36px; }
      .mark { display: block; height: 196px; }
      .wordmark {
        font: ${wordmarkFont.weight} 172px/1 "${wordmarkFont.family}", sans-serif;
        color: ${color.wordmark}; letter-spacing: -0.01em; white-space: nowrap;
      }
      .tagline {
        font: ${taglineFont.weight} 68px/1.4 "${taglineFont.family}", sans-serif;
        color: ${color.tagline}; white-space: nowrap;
      }
    `,
    body: `
      <canvas width="1200" height="630"></canvas>
      <script>${gradientScript(color.gradientFrom, color.gradientTo)}</script>
      <div class="logo">
        <img class="mark" src="${svgDataUrl(markOnDark)}" alt="">
        <span class="wordmark">${escapeHtml(site.name)}</span>
      </div>
      <p class="tagline">${escapeHtml(tagline)}</p>
    `,
  }),
}

/** Throws if a web font did not load, instead of saving an image in a fallback font. */
async function waitForFonts(page, fonts) {
  for (const { family, weight, text } of fonts) {
    const loaded = await page.evaluate(async ({ font, text }) => {
      await document.fonts.ready
      const faces = await document.fonts.load(font, text)
      return faces.length > 0 && faces.every(face => face.status === 'loaded')
    }, { font: `${weight} 16px "${family}"`, text })
    if (!loaded) {
      throw new Error(`The font "${family}" ${weight} did not load from Google Fonts. Check the internet connection, `
        + 'and that the first families of --font-sans and --font-display in tokens.css are Google fonts.')
    }
  }
}

/** Throws if a logo file did not load: the image would be saved without it. */
async function checkImagesLoaded(page, file) {
  const broken = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).length)
  if (broken > 0) throw new Error(`${file}: ${broken} logo image(s) did not load`)
}

/** Throws if the elements of image.fitSelector leave less than image.sideMargin free on the left or the right. */
async function checkFits(page, image) {
  const widest = await page.locator(image.fitSelector).evaluateAll(elements => Math.max(...elements.map(element => element.scrollWidth)))
  const room = image.width - 2 * image.sideMargin
  if (widest > room) throw new Error(`${image.file}: the content is ${widest}px wide, more than ${room}px; make the text smaller`)
}

async function renderPng(browser, image) {
  const page = await browser.newPage({ viewport: { width: image.width, height: image.height }, deviceScaleFactor: 1 })
  await page.setContent(image.html, { waitUntil: 'load' })
  await waitForFonts(page, image.fonts)
  await checkImagesLoaded(page, image.file)
  if (image.fitSelector) await checkFits(page, image)
  const png = await page.screenshot({ type: 'png' })
  await page.close()

  // A PNG of colour type 2 (RGB) has no alpha channel, so no pixel can be transparent.
  const colorType = png[25]
  if (colorType !== 2) throw new Error(`${image.file}: expected an RGB PNG without alpha (colour type 2), got ${colorType}`)
  if (image.maxBytes && png.length > image.maxBytes) throw new Error(`${image.file}: ${png.length} bytes, more than ${image.maxBytes}`)
  return png
}

async function save(file, content) {
  const url = new URL(file, publicDir)
  await writeFile(url, content)
  const { size } = await stat(url)
  console.log(`public/${file}  ${(size / 1024).toFixed(1)} kB`)
}

// The tab icon is the logo file itself: the A on its navy square, drawn by the browser at any size.
await save('favicon.svg', mark)

const browser = await chromium.launch()
try {
  for (const image of [appleTouchIcon, ogImage]) {
    await save(image.file, await renderPng(browser, image))
  }
}
finally {
  await browser.close()
}
