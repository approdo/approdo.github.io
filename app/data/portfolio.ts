import type { PortfolioItem, ScreenshotView, SectionHeading, SystemWork, WorkSample } from '../types/content'

export const workSection: SectionHeading = {
  heading: 'ผลงาน',
  intro: ['เปิดดูเว็บจริง', 'ได้ทั้งบนมือถือ', 'และคอม — ', 'คะแนนวัดด้วย ', 'PageSpeed Insights ', 'แบบมือถือ'],
  accent: 'PageSpeed Insights',
}

/**
 * The screenshots in public/images/work/, made by `npm run capture-portfolio`
 * (scripts/capture-portfolio.mjs) from the live URL of each piece of work: the window size of each view,
 * and the widths of the WebP files written for it (the page picks one with srcset). A piece of work has
 * the views named in its `screenshotAlt`.
 */
export const screenshotViews: Record<ScreenshotView, { width: number, height: number, files: readonly number[] }> = {
  desktop: { width: 1440, height: 900, files: [720, 1440] },
  mobile: { width: 375, height: 760, files: [375] },
  phone: { width: 390, height: 844, files: [260, 390] },
}

/** Path inside public/images/ of one screenshot file: screenshotFile('landing-page', 'desktop', 720). */
export function screenshotFile(id: string, view: ScreenshotView, width: number): string {
  return `work/${id}-${view}-${width}.webp`
}

/**
 * Every piece of work was made for a fictional brand, and says so (brand.md "## กฎ"). Two phrases, so
 * the words in brackets never break in the narrow navy panel (decision D-028).
 */
const SAMPLE_LABEL = ['ผลงานตัวอย่าง ', '(แบรนด์สมมติ)']

/**
 * Approdo's work so far, in the order of the page: the booking system first (decision D-015), then two
 * sample websites (decision D-004). The words of the booking system are the owner's, word for word
 * (brand.md "ข้อความบนเว็บที่เจ้าของเขียน (v1.1.0)" and the approved texts N3–N5 under it). Keep this
 * file free of runtime imports: the screenshot and clip scripts read it in plain Node.
 *
 * The scores are the medians of PageSpeed Insights mobile (lab) runs, read from the raw results in the
 * story repository:
 * - Booking-system: Demo-story/Booking-system/evidence/BK-012/psi/summary.json and run-1 – run-3.json.gz
 *   (3 runs, Performance 91 / 92 / 92, Lighthouse 13.5.0)
 * - Landing-page: Demo-story/Landing-page/evidence/LP-022/psi-v1.1/runs.md and run-1.json – run-5.json
 *   (5 runs, Performance 99 / 97 / 99 / 99 / 99, Lighthouse 13.5.0)
 * - Business-site: Demo-story/Business-site/evidence/BS-006/psi/runs.md and run-1.json – run-3.json
 *   (3 runs, Performance 93 / 96 / 96, Lighthouse 13.5.0)
 *
 * Landing-page moved from the author's GitHub account to the approdo organisation (task LP-029).
 * GitHub Pages does not redirect the old address, so the card links to the new one (task BR-008 B1).
 * The page itself did not change, so the scores and the screenshots, taken at the old address, still
 * show it.
 */
export const portfolio: PortfolioItem[] = [
  {
    id: 'booking-system',
    name: ['นวลไพล — ', 'ระบบจองคิว'],
    label: SAMPLE_LABEL,
    kind: 'ระบบเฉพาะงาน · จองคิว + หลังบ้าน',
    description: ['ลูกค้าเลือกบริการ ', 'หมอนวด ', 'และเวลาที่ว่างเอง ', 'ร้านดูคิว ', 'ยืนยัน ', 'และพักบริการ', 'ได้จากมือถือ'],
    url: 'https://approdo.github.io/Booking-system/',
    screenshotAlt: {
      phone: 'ภาพหน้าจอระบบจองคิวนวลไพล (แบรนด์สมมติ) ฝั่งลูกค้าบนมือถือ',
    },
    demo: {
      ownerUrl: 'https://approdo.github.io/Booking-system/admin/login/',
      tryLabels: { customer: 'ลองจองแบบลูกค้า', owner: 'ลองเป็นเจ้าของร้าน' },
      sides: { customer: 'ฝั่งลูกค้า', owner: 'ฝั่งร้าน' },
      clip: {
        video: 'videos/booking-system-owner.webm',
        poster: 'images/work/booking-system-owner-poster-300.webp',
        label: 'คลิปหลังบ้านระบบจองคิวนวลไพล (แบรนด์สมมติ) บนมือถือ: ยืนยันคิว แล้วพักบริการ',
        pause: 'หยุดคลิป',
        play: 'เล่นคลิป',
      },
      // The demo keeps what a visitor tries for 24 hours, then deletes it (decision D-019).
      trialNote: ['ข้อมูลที่ลอง', 'ใช้ได้ 24 ชั่วโมง ', 'แล้วระบบลบทิ้งเอง'],
    },
    measurement: {
      tool: 'PageSpeed Insights',
      method: 'มือถือ · ค่ากลาง 3 รอบ',
      date: '2026-10-18',
      dateLabel: '18 ต.ค. 2569',
      scores: { performance: 92, accessibility: 100, bestPractices: 100, seo: 100 },
    },
  },
  {
    id: 'landing-page',
    name: 'BrightPath Academy',
    label: SAMPLE_LABEL,
    kind: 'เว็บหน้าเดียว (Landing Page) · ภาษาไทย',
    description: 'ศูนย์ฝึกอบรมองค์กรและบริการจัดหาวิทยากร — มีฟอร์มขอใบเสนอราคา',
    url: 'https://approdo.github.io/Landing-page/',
    screenshotAlt: {
      desktop: 'ภาพหน้าจอเว็บ BrightPath Academy (แบรนด์สมมติ) บนคอม',
      mobile: 'ภาพหน้าจอเว็บ BrightPath Academy (แบรนด์สมมติ) บนมือถือ',
    },
    measurement: {
      tool: 'PageSpeed Insights',
      method: 'มือถือ · ค่ากลาง 5 รอบ',
      date: '2026-10-16',
      dateLabel: '16 ต.ค. 2569',
      scores: { performance: 99, accessibility: 100, bestPractices: 100, seo: 100 },
    },
  },
  {
    id: 'business-site',
    name: 'นวลไพล นวดไทย & สปา',
    label: SAMPLE_LABEL,
    kind: 'เว็บหลายหน้า · 5 หน้า · ไทย / อังกฤษ',
    description: 'ร้านนวดแผนไทยและสปา — บริการและราคา แกลเลอรี และหน้าติดต่อ',
    url: 'https://approdo.github.io/Business-site/',
    screenshotAlt: {
      desktop: 'ภาพหน้าจอเว็บนวลไพล นวดไทย & สปา (แบรนด์สมมติ) บนคอม',
      mobile: 'ภาพหน้าจอเว็บนวลไพล นวดไทย & สปา (แบรนด์สมมติ) บนมือถือ',
    },
    measurement: {
      tool: 'PageSpeed Insights',
      method: 'มือถือ · ค่ากลาง 3 รอบ',
      date: '2026-10-16',
      dateLabel: '16 ต.ค. 2569',
      scores: { performance: 96, accessibility: 100, bestPractices: 100, seo: 100 },
    },
  },
]

/** The work shown as a navy panel with its live demo: the booking system. */
export function isSystemWork(item: PortfolioItem): item is SystemWork {
  return 'demo' in item
}

/** The id of the panel of the booking system, where the hero's second button leads ('#booking'). */
export const demoAnchor = 'booking'

/**
 * The link under each package of the price list (by its id in app/data/pricing.ts) to a piece of work
 * made that way, and what in that sample costs extra (design v1.1.0 §3.4). The words are the owner's
 * approved texts N13 / N14 (brand.md). The address is the work's url above, written in one place only.
 */
export const pricingSamples: Readonly<Record<string, WorkSample>> = {
  'landing-page': {
    workId: 'landing-page',
    link: ['ดูตัวอย่าง: ', 'BrightPath ', 'Academy ', '(แบรนด์สมมติ)'],
    extra: ['ฟอร์มขอใบเสนอราคา', 'ในตัวอย่าง ', 'เป็นงานเพิ่ม'],
  },
  'multi-page': {
    workId: 'business-site',
    link: ['ดูตัวอย่าง: ', 'นวลไพล ', 'นวดไทย ', '& สปา ', '(แบรนด์สมมติ)'],
    extra: ['2 ภาษาในตัวอย่าง ', 'เป็นงานเพิ่ม'],
  },
  'custom-system': {
    workId: 'booking-system',
    link: ['ดูตัวอย่าง: ', 'นวลไพล — ', 'ระบบจองคิว ', '(แบรนด์สมมติ)'],
  },
}

/** The sample link of a package with the url of its work, or undefined for a package without one. */
export function sampleOf(planId: string): (WorkSample & { url: string }) | undefined {
  const sample = pricingSamples[planId]
  const work = sample && portfolio.find(item => item.id === sample.workId)
  return sample && work ? { ...sample, url: work.url } : undefined
}
