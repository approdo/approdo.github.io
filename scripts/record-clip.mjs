// Records the clip of the shop's side of the booking system, shown in the second phone of its panel in
// the "ผลงาน" section:
//
//   public/videos/booking-system-owner.webm                   VP8, no sound, 390×844, 10–15 seconds
//   public/images/work/booking-system-owner-poster-300.webp   a frame of its first second, 300px wide
//
// (the paths are `demo.clip` of the booking system in app/data/portfolio.ts). It records the live demo in
// a phone window, the way a shop owner uses it:
//
//   1. before recording: opens the back office's login page and signs in with the demo account that the
//      page shows ("เข้าด้วยบัญชีทดลอง"). This makes one sandbox: the demo's own copy of the sample data
//      for this browser, which the demo deletes after 24 hours;
//   2. recording: the list of bookings with the one that waits for confirmation, "ยืนยัน", the tab
//      "บริการ", then "รับจอง" of the first service switched off, and a still screen to end on, so the
//      loop starts again cleanly.
//
// That is three writes on the live demo, in one sandbox (brand-site decision D-016; the demo allows a few
// new sandboxes per IP address only: Booking-system decisions D-008 / D-012). Run it again only when the
// back office changes, and not within two minutes of the last run.
//
//   npm run record-clip               record the clip and write the two files above
//   npm run record-clip -- --rehearse write nothing on the demo: record the login page and the customer's
//                                     page instead (every request other than GET, HEAD or OPTIONS is
//                                     aborted), to try the recording, the cut and the poster
//
// It prints every response of the demo's API with its time, method, path and status (never a token), and
// keeps the raw recording and that log in clip-raw/, which is not committed.
//
// Needs the Chromium of the e2e tests and the ffmpeg that Playwright uses for videos
// (`npx playwright install chromium ffmpeg`; another ffmpeg with VP8 can be named in the FFMPEG
// environment variable). ffmpeg cuts the recording and takes the poster's frame; Chromium encodes the
// poster as WebP, as it does the screenshots (scripts/capture-portfolio.mjs).
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
// Node 22.18+ strips TypeScript types on import, so this reads the same data as the site.
import { isSystemWork, portfolio, screenshotViews } from '../app/data/portfolio.ts'

const rehearse = process.argv.includes('--rehearse')

const work = portfolio.find(isSystemWork)
if (!work) throw new Error('app/data/portfolio.ts has no work with a demo')
const { demo } = work
// The clip has the size of the phone screenshot next to it: 390 × 844.
const { width, height } = screenshotViews.phone
// The page is drawn at twice that size; Chromium's screen recording scales it down to the window, which
// gives the text smoother edges than drawing it at 1x.
const PIXEL_RATIO = 2
// How long the clip stays on each screen, in ms: long enough to read it in a phone the size of a thumb.
const HOLD = { list: 2000, confirmed: 1800, services: 1500, end: 2600 }
// The demo answers in 1–2 s, so the clip is 10–15 s long; a slower answer shortens the still at the end.
const MIN_SECONDS = 10
const MAX_SECONDS = 14.8
const MIN_END_SECONDS = 1
const POSTER_WIDTH = 300
const POSTER_AT_SECONDS = 0.5
const WEBP_QUALITY = 0.8
const MAX_BYTES = 2 * 1024 * 1024

const projectDir = new URL('../', import.meta.url)
const rawDir = new URL(rehearse ? 'clip-raw/rehearsal/' : 'clip-raw/', projectDir)
// A rehearsal writes its clip and poster next to the raw recording, never into public/.
const videoFile = rehearse ? new URL('clip.webm', rawDir) : new URL(`public/${demo.clip.video}`, projectDir)
const posterFile = rehearse ? new URL('poster.webp', rawDir) : new URL(`public/${demo.clip.poster}`, projectDir)

/** The ffmpeg that Playwright installs to record videos, or the one in the FFMPEG environment variable. */
function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG
  const browsersDir = process.env.PLAYWRIGHT_BROWSERS_PATH ?? {
    win32: join(process.env.LOCALAPPDATA ?? '', 'ms-playwright'),
    darwin: join(homedir(), 'Library', 'Caches', 'ms-playwright'),
  }[process.platform] ?? join(homedir(), '.cache', 'ms-playwright')
  const folder = readdirSync(browsersDir).filter(name => name.startsWith('ffmpeg-')).sort().at(-1)
  const program = folder && readdirSync(join(browsersDir, folder)).find(name => /^ffmpeg-(linux|mac|win64)/.test(name))
  if (!program) throw new Error('No ffmpeg: run `npx playwright install ffmpeg`, or set FFMPEG')
  return join(browsersDir, folder, program)
}

const FFMPEG = findFfmpeg()

function ffmpeg(args) {
  const result = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${result.stderr || result.error}`)
}

/**
 * A round mark where the page is tapped, like the "show taps" option of a phone's screen recorder, so the
 * clip shows what was pressed. It runs in the recorded page only, over the page, and takes no clicks.
 */
function showTaps() {
  addEventListener('pointerdown', (event) => {
    const mark = document.createElement('div')
    Object.assign(mark.style, {
      position: 'fixed',
      left: `${event.clientX - 22}px`,
      top: `${event.clientY - 22}px`,
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      background: 'rgb(22 35 74 / 0.25)',
      border: '2px solid rgb(255 255 255 / 0.9)',
      boxShadow: '0 0 0 1px rgb(22 35 74 / 0.45)',
      pointerEvents: 'none',
      zIndex: '2147483647',
      transition: 'opacity 0.4s ease-out 0.3s, transform 0.4s ease-out 0.3s',
    })
    document.documentElement.append(mark)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      mark.style.opacity = '0'
      mark.style.transform = 'scale(1.3)'
    }))
    setTimeout(() => mark.remove(), 1200)
  }, { capture: true })
}

/** Waits until the demo's page has started in the browser and has shown its data. */
async function waitForApp(page) {
  await page.waitForFunction(() => '__vue_app__' in (document.querySelector('#__nuxt') ?? {}), null, { timeout: 30_000 })
  await page.locator('main .skeleton').first().waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {})
  await page.evaluate(() => document.fonts.ready)
}

const siteHost = new URL(work.url).host
const log = {
  mode: rehearse ? 'rehearsal (read only)' : 'recording',
  startedAtUtc: new Date().toISOString(),
  sandboxCreatedAtUtc: null,
  // Every response of the demo's API (any host other than the site's): time, method, path, status.
  api: [],
  // Responses with a status of 400 or more, from any host, and errors of the pages.
  errors: [],
  blocked: [],
  marks: {},
}

/** Logs the API calls and the errors of a page. */
function watch(page) {
  page.on('response', (response) => {
    const request = response.request()
    const url = new URL(response.url())
    if (response.status() >= 400) log.errors.push(`${response.status()} ${request.method()} ${url.host}${url.pathname}`)
    if (url.host !== siteHost && url.protocol.startsWith('http')) {
      log.api.push({ t: new Date().toISOString(), method: request.method(), path: url.pathname, status: response.status() })
    }
  })
  page.on('pageerror', error => log.errors.push(`page error: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') log.errors.push(`console: ${message.text()}`)
  })
}

const phone = { viewport: { width, height }, isMobile: true, hasTouch: true, locale: 'th-TH', timezoneId: 'Asia/Bangkok' }

/** Signs in with the demo account on the login page, in a context that is not recorded; returns its storage. */
async function signIn(browser) {
  const context = await browser.newContext({ ...phone, deviceScaleFactor: 1 })
  const page = await context.newPage()
  watch(page)
  await page.goto(demo.ownerUrl, { waitUntil: 'networkidle' })
  await waitForApp(page)
  await page.getByRole('button', { name: 'เข้าด้วยบัญชีทดลอง' }).click()
  await page.waitForURL(url => url.pathname.endsWith('/admin/today/'), { timeout: 30_000 })
  log.sandboxCreatedAtUtc = new Date().toISOString()
  await waitForApp(page)
  // The sandbox and session live in the page's storage: the recorded context starts with them.
  const storageState = await context.storageState()
  await context.close()
  return storageState
}

/** The owner's clip: confirm the booking that waits, then switch off "รับจอง" of the first service. */
async function recordOwner(page, at) {
  await page.goto(new URL('../bookings/', demo.ownerUrl).href, { waitUntil: 'networkidle' })
  await waitForApp(page)
  const waiting = page.locator('main li[data-code]').filter({ has: page.getByRole('button', { name: 'ยืนยัน', exact: true }) }).first()
  const code = await waiting.getAttribute('data-code', { timeout: 30_000 })
  const card = page.locator(`main li[data-code="${code}"]`)
  await card.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.waitForTimeout(600)
  log.marks.list = at()
  await page.waitForTimeout(HOLD.list)

  await card.getByRole('button', { name: 'ยืนยัน', exact: true }).click()
  await card.getByText('ยืนยันแล้ว', { exact: true }).first().waitFor({ timeout: 30_000 })
  log.marks.confirmed = at()
  await page.waitForTimeout(HOLD.confirmed)

  await page.getByRole('navigation', { name: 'เมนูหลังบ้าน' }).getByRole('link', { name: 'บริการ', exact: true }).click()
  await page.waitForURL(url => url.pathname.endsWith('/admin/services/'), { timeout: 30_000 })
  await waitForApp(page)
  log.marks.services = at()
  await page.waitForTimeout(HOLD.services)

  const service = page.getByRole('switch', { name: /^รับจอง / }).first()
  log.marks.service = await service.evaluate(element => element.closest('li')?.querySelector('h3')?.textContent?.trim())
  await service.click()
  await page.getByText('ปิดชั่วคราว', { exact: true }).first().waitFor({ timeout: 30_000 })
  log.marks.paused = at()
  await page.waitForTimeout(HOLD.end)
  log.marks.end = at()
}

/** A rehearsal that writes nothing: the login page, then the customer's page. */
async function recordRehearsal(page, at) {
  await page.goto(demo.ownerUrl, { waitUntil: 'networkidle' })
  await waitForApp(page)
  log.marks.list = at()
  await page.waitForTimeout(HOLD.list)
  // The demo account's button would write (a sandbox): tap the e-mail field instead, to see the tap mark.
  await page.locator('input').first().click()
  await page.waitForTimeout(HOLD.confirmed)
  await page.goto(work.url, { waitUntil: 'networkidle' })
  await waitForApp(page)
  log.marks.services = at()
  // As long as the owner's clip, which also waits for the demo's answers.
  await page.waitForTimeout(HOLD.services + HOLD.end + 3000)
  log.marks.end = at()
}

/** Encodes a PNG as a WebP file `targetWidth` wide, in the browser (no image library needed). */
async function toWebp(browser, png, targetWidth) {
  const page = await browser.newPage()
  try {
    const base64 = await page.evaluate(async ({ dataUrl, targetWidth, quality }) => {
      const image = new Image()
      image.src = dataUrl
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = Math.round(image.naturalHeight * targetWidth / image.naturalWidth)
      const context = canvas.getContext('2d')
      context.imageSmoothingQuality = 'high'
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const webp = canvas.toDataURL('image/webp', quality)
      if (!webp.startsWith('data:image/webp;base64,')) throw new Error('This browser cannot encode WebP')
      return webp.slice('data:image/webp;base64,'.length)
    }, { dataUrl: `data:image/png;base64,${png.toString('base64')}`, targetWidth, quality: WEBP_QUALITY })
    return Buffer.from(base64, 'base64')
  }
  finally {
    await page.close()
  }
}

/** The length of a video file in seconds, as Chromium reads it. */
async function durationOf(browser, file) {
  const page = await browser.newPage()
  try {
    const data = (await readFile(file)).toString('base64')
    return await page.evaluate(async (base64) => {
      const video = document.createElement('video')
      video.muted = true
      video.src = `data:video/webm;base64,${base64}`
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = () => reject(new Error('Chromium cannot read the clip'))
      })
      return video.duration
    }, data)
  }
  finally {
    await page.close()
  }
}

await rm(rawDir, { recursive: true, force: true })
await mkdir(rawDir, { recursive: true })
await mkdir(dirname(fileURLToPath(videoFile)), { recursive: true })
await mkdir(dirname(fileURLToPath(posterFile)), { recursive: true })
const browser = await chromium.launch()
try {
  const storageState = rehearse ? undefined : await signIn(browser)

  const context = await browser.newContext({
    ...phone,
    deviceScaleFactor: PIXEL_RATIO,
    storageState,
    recordVideo: { dir: fileURLToPath(rawDir), size: { width, height } },
  })
  if (rehearse) {
    await context.route('**/*', (route) => {
      const request = route.request()
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method())) return route.continue()
      log.blocked.push(`${request.method()} ${new URL(request.url()).pathname}`)
      return route.abort()
    })
  }
  await context.addInitScript(showTaps)
  const page = await context.newPage()
  // The recording starts with the page: times in the clip are counted from here.
  const recordingStart = Date.now()
  const at = () => Number(((Date.now() - recordingStart) / 1000).toFixed(2))
  watch(page)
  await (rehearse ? recordRehearsal(page, at) : recordOwner(page, at))
  const video = page.video()
  await context.close()
  const raw = new URL('recording.webm', rawDir)
  await rename(await video.path(), raw)

  // The clip: from the first still screen to the end (at most MAX_SECONDS, with the last screen shown
  // for at least MIN_END_SECONDS), scaled to the phone's size, without sound.
  const start = log.marks.list
  const end = Math.min(log.marks.end, start + MAX_SECONDS)
  if (end - start < MIN_SECONDS) throw new Error(`Only ${end - start} s from the list to the end`)
  if (!rehearse && end - log.marks.paused < MIN_END_SECONDS) throw new Error('The demo answered too slowly: the last screen would not show long enough')
  const length = Number((end - start).toFixed(2))
  ffmpeg([
    '-ss', String(start), '-i', fileURLToPath(raw), '-t', String(length), '-an',
    '-vf', `scale=${width}:${height}:flags=lanczos`,
    '-c:v', 'libvpx', '-crf', '10', '-b:v', '1M', '-qmin', '0', '-qmax', '40', '-deadline', 'good', '-cpu-used', '0',
    '-g', '600', '-pix_fmt', 'yuv420p', fileURLToPath(videoFile),
  ])
  log.cut = { startSeconds: start, lengthSeconds: length }

  // The poster: a frame of the clip's first second, as WebP.
  const frame = new URL('poster-frame.png', rawDir)
  ffmpeg(['-ss', String(POSTER_AT_SECONDS), '-i', fileURLToPath(videoFile), '-frames:v', '1', fileURLToPath(frame)])
  await writeFile(posterFile, await toWebp(browser, await readFile(frame), POSTER_WIDTH))

  const clipBytes = (await stat(videoFile)).size
  log.files = {
    raw: { name: 'recording.webm', bytes: (await stat(raw)).size },
    clip: { name: rehearse ? 'clip.webm' : demo.clip.video, bytes: clipBytes, durationSeconds: await durationOf(browser, videoFile) },
    poster: { name: rehearse ? 'poster.webp' : demo.clip.poster, bytes: (await stat(posterFile)).size },
  }
  const problems = [
    ...log.errors,
    ...(log.files.clip.durationSeconds < 10 || log.files.clip.durationSeconds > 15 ? [`the clip is ${log.files.clip.durationSeconds} s long, not 10–15 s`] : []),
    ...(clipBytes > MAX_BYTES ? [`the clip is ${clipBytes} bytes, over 2 MB`] : []),
  ]
  if (problems.length > 0) {
    log.problems = problems
    process.exitCode = 1
  }
}
catch (error) {
  log.problems = [`stopped: ${error.message.split('\n')[0]}`]
  process.exitCode = 1
}
finally {
  // The log is written whatever happened: it is the record of what was written on the live demo.
  await browser.close()
  log.finishedAtUtc = new Date().toISOString()
  await writeFile(new URL('record-log.json', rawDir), `${JSON.stringify(log, null, 2)}\n`)
  console.log(JSON.stringify(log, null, 2))
}
