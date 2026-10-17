import type { Site } from '../types/content'

/**
 * Everything about Approdo in one place: its name, the address of the site, the LINE Official
 * Account and the two switches. Colours and fonts are in app/assets/css/tokens.css; prices and
 * terms of work in app/data/pricing.ts.
 *
 * Approdo is a real brand: every fact here comes from its brand file,
 * Demo-story/_brand/approdo/brand.md in the story repository (brand-site decision D-003). LINE is
 * the only way to contact it: there is no phone number, e-mail address or map on the site.
 *
 * Besides the pages, this file is loaded by nuxt.config.ts, the Playwright configs and the scripts
 * in scripts/ (plain Node). Keep it free of runtime imports so that all of them can read it as it is.
 */
export const site: Site = {
  name: 'Approdo',
  // Phrases of brand.md: the tagline, then the services line.
  description: 'พาธุรกิจขึ้นฝั่งออนไลน์ — ออกแบบและพัฒนาเว็บไซต์ทุกรูปแบบ · รองรับมือถือ โหลดไว',

  // The organisation's main GitHub Pages site (repository approdo/approdo.github.io), served at the
  // root of the domain: the base path is '/' (decision D-002). The canonical, og:url and og:image links
  // start with this URL.
  url: 'https://approdo.github.io/',

  // Switches: Thai only, and a real brand site, not a demo.
  english: false,
  demoNotice: false,

  // IBM Plex Sans Thai for all text, Outfit for the wordmark and Latin display text (brand.md).
  fontWeights: {
    'IBM Plex Sans Thai': [400, 500],
    'Outfit': [600],
  },

  line: {
    name: 'Approdo - รับทำเว็บ',
    id: '@337jkdha',
    url: 'https://line.me/R/ti/p/%40337jkdha',
  },

  // The owner's answer to Q10 (brand.md "## เงื่อนไขงาน"), word for word. There is no company name or
  // registration number to show.
  copyright: '© 2026 Approdo',
}
