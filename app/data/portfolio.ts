import type { PortfolioItem, SectionHeading } from '../types/content'

export const workSection: SectionHeading = {
  heading: 'ผลงาน',
  intro: 'เปิดดูเว็บจริงได้ทั้งบนมือถือและคอม — คะแนนวัดด้วย PageSpeed Insights แบบมือถือ',
}

/** Every sample website was made for a fictional brand, and says so (brand.md "## กฎ"). */
const SAMPLE_LABEL = 'ผลงานตัวอย่าง (แบรนด์สมมติ)'

/**
 * Approdo's work so far: two sample websites (brand-site decision D-004). Keep this file free of
 * runtime imports: the screenshot script reads the URLs from it in plain Node.
 *
 * The scores are the medians of PageSpeed Insights mobile (lab) runs, read from the raw results in the
 * story repository:
 * - Landing-page: Demo-story/Landing-page/evidence/LP-022/psi-v1.1/runs.md and run-1.json – run-5.json
 *   (5 runs, Performance 99 / 97 / 99 / 99 / 99, Lighthouse 13.5.0)
 * - Business-site: Demo-story/Business-site/evidence/BS-006/psi/runs.md and run-1.json – run-3.json
 *   (3 runs, Performance 93 / 96 / 96, Lighthouse 13.5.0)
 *
 * The Landing-page URL is the one that is live when the site is built. When Landing-page moves to the
 * approdo organisation (task LP-029), its URL changes to https://approdo.github.io/Landing-page/ and
 * GitHub Pages does not redirect the old one: change `url` here then (task BR-008 B1).
 */
export const portfolio: PortfolioItem[] = [
  {
    id: 'landing-page',
    name: 'BrightPath Academy',
    label: SAMPLE_LABEL,
    kind: 'เว็บหน้าเดียว (Landing Page) · ภาษาไทย',
    description: 'ศูนย์ฝึกอบรมองค์กรและบริการจัดหาวิทยากร — มีฟอร์มขอใบเสนอราคา',
    url: 'https://0984043505frong.github.io/Landing-page/',
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
    measurement: {
      tool: 'PageSpeed Insights',
      method: 'มือถือ · ค่ากลาง 3 รอบ',
      date: '2026-10-16',
      dateLabel: '16 ต.ค. 2569',
      scores: { performance: 96, accessibility: 100, bestPractices: 100, seo: 100 },
    },
  },
]
