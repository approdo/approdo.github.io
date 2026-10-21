/**
 * Shapes of the site data in app/data/.
 *
 * Every data file is checked against these types, so a missing or misspelled field fails
 * `npm run typecheck` before it can reach the page.
 *
 * The site is in Thai only (site.english is false): the data holds Thai text and nothing else.
 */

/** Codes of the languages the i18n setup knows (app/utils/locales.ts). This site uses Thai only. */
export type LocaleCode = 'th' | 'en'

/**
 * Thai text whose line breaks are controlled (lesson G-007).
 *
 * - A string: the browser may break the line anywhere its Thai dictionary allows.
 * - A list of phrases: the line may break only between two phrases, never inside one.
 *   The phrases are joined exactly as written, so a space between two phrases goes at
 *   the end of the first one: ['เปิดทุกวัน ', '09:00–18:00 น.'].
 *
 * Show it with the <PhraseText> component. Where plain text is needed (<title>, meta tags,
 * aria-label), use joinPhrases() from app/utils/phrases.ts.
 */
export type ThaiText = string | readonly string[]

/** The site's LINE Official Account: the only way to contact Approdo. */
export interface LineAccount {
  /** Display name of the account, e.g. 'Approdo - รับทำเว็บ'. */
  name: string
  /** LINE ID, e.g. '@337jkdha'. */
  id: string
  /** The "add friend / open chat" link. Every LINE button and the QR code lead here. */
  url: string
}

export interface Site {
  /** Brand name: header, footer, link preview and the og-image.png made by `npm run brand-images`. */
  name: string
  /** The page's <title> and the title of the link preview (og:title). It starts with the brand name. */
  title: string
  /** One or two sentences for search results and link previews (meta description). */
  description: string
  /**
   * Absolute URL of the live site, ending with '/'. Its path becomes the Nuxt base URL
   * ('/' for a site at the root of its own domain, '/<repo>/' for a GitHub Pages project site).
   */
  url: string
  /**
   * true: Thai pages plus English pages under /en/. This site has no English texts and no
   * i18n/locales/en.json, so it stays false.
   */
  english: boolean
  /** true: the footer says that this is a demo website. The brand site is real, so it stays false. */
  demoNotice: boolean
  /**
   * Weights of each web font that are downloaded, by family. The families themselves are named in
   * app/assets/css/tokens.css (--font-sans, --font-display); only these weights are used on the page.
   */
  fontWeights: Readonly<Record<string, readonly number[]>>
  line: LineAccount
  /** The © line of the footer, word for word. */
  copyright: string
}

// ---------------------------------------------------------------------------------------------
// Content of the page sections: one file per section in app/data/
// ---------------------------------------------------------------------------------------------

/** The heading of a section (an <h2>) and an optional sentence under it. */
export interface SectionHeading {
  heading: ThaiText
  intro?: ThaiText
  /** Words of the intro shown in the display font, e.g. a product name: 'PageSpeed Insights'. */
  accent?: string
}

/** app/data/hero.ts: the first screen of the page. */
export interface HeroContent {
  /** The page's <h1>, one line per entry: the brand's tagline. */
  tagline: readonly string[]
  /** What Approdo offers. */
  services: ThaiText
  /** What kinds of websites it makes. */
  positioning: ThaiText
}

/** app/data/pricing.ts: one package of the price list. */
export interface PricePlan {
  /** Unique, in kebab-case; used as the key of the list. */
  id: string
  name: string
  /** What the package covers, in brackets as in the price list: '(Landing Page)'. */
  detail: string
  /** The price exactly as written in the price list (a starting price, or that it is quoted per job). */
  price: string
  /**
   * The regular price written after a launch price in the price list, with its brackets: '(ปกติ 1,500)'.
   * It is shown right after the price as one phrase, never split (lesson G-007). Not every package has one.
   */
  regularPrice?: string
  /** How long the work takes, e.g. '3–5 วัน'. Not every package has one. */
  duration?: string
}

/** A short list with a label in front of it, e.g. 'ทุกแบบ:' and what every package includes. */
export interface LabelledList {
  label: string
  items: readonly ThaiText[]
}

/** A box of terms under the price list: a heading and its lines. */
export interface TermsBox {
  id: string
  heading: ThaiText
  lines: readonly ThaiText[]
  /** true: the lines are a bulleted list; false: each line is a paragraph of its own. */
  bullets: boolean
}

/** app/data/process.ts: one step of the way Approdo works. */
export interface ProcessStep {
  id: string
  title: ThaiText
  /** One entry = a sentence; several = a bulleted list. */
  details: readonly ThaiText[]
}

/** app/data/faq.ts: one question and its answer. */
export interface Faq {
  id: string
  question: ThaiText
  /** One entry = a sentence; several = a bulleted list. */
  answer: readonly ThaiText[]
  /** Open when the page loads. */
  open?: boolean
}

/** The four category scores of a PageSpeed Insights (Lighthouse) report, 0–100. */
export interface PageSpeedScores {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

/** The two screenshots of a sample website: on a computer and on a phone. */
export type ScreenshotView = 'desktop' | 'mobile'

/** app/data/portfolio.ts: one website shown as Approdo's work. */
export interface PortfolioItem {
  id: string
  /** Name of the (fictional) brand the website was made for. */
  name: string
  /** The label that says the brand is fictional (brand.md: every sample must say so). */
  label: string
  /** Kind of website, e.g. 'เว็บหน้าเดียว (Landing Page) · ภาษาไทย'. */
  kind: string
  description: string
  /** The live website; it opens in a new tab. */
  url: string
  /**
   * Alt texts of the two screenshots of the website (made by `npm run capture-portfolio`), which say
   * that the brand is fictional.
   */
  screenshotAlt: Record<ScreenshotView, string>
  /** How the scores were measured. */
  measurement: {
    tool: string
    /** Strategy and runs, e.g. 'มือถือ · ค่ากลาง 5 รอบ'. */
    method: string
    /** ISO date of the measurement, e.g. '2026-10-16'. */
    date: string
    /** The same date as shown on the page, e.g. '16 ต.ค. 2569'. */
    dateLabel: string
    scores: PageSpeedScores
  }
}
