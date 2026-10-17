import tailwindcss from '@tailwindcss/vite'
import { site } from './app/data/site'
import { homePaths, siteLocales } from './app/utils/locales'

// The site is served at the root of https://approdo.github.io/ (base path '/', decision D-002). The
// path is taken from the site URL and set here on purpose, not through NUXT_APP_BASE_URL: Git Bash on
// Windows rewrites environment values that start with '/' into Windows paths (lesson G-001).
const siteUrl = new URL(site.url)
const baseURL = siteUrl.pathname

// Thai only: site.english is false, so there are no /en/ pages and no hreflang links.
const locales = siteLocales(site.english)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxtjs/i18n'],
  components: [
    // Icon components go by their file name (IconMenu), without the folder prefix (IconsIconMenu).
    { path: '~/components/icons', pathPrefix: false },
    '~/components',
  ],
  devtools: { enabled: true },
  app: {
    baseURL,
    head: {
      link: [
        // Nuxt does not add the base URL to files in public/, so join it by hand (lesson G-020).
        // Without the apple-touch-icon link, iOS looks for the icon at the root of the domain,
        // outside the site's sub-path. Both files come from `npm run brand-images`.
        { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
        { rel: 'apple-touch-icon', href: `${baseURL}apple-touch-icon.png` },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  experimental: {
    // Static pages without data fetching: skip the separate _payload.json request.
    payloadExtraction: false,
  },
  compatibilityDate: '2026-09-27',
  nitro: {
    prerender: {
      // Write the page of every language, whether or not some page links to it.
      routes: homePaths(locales),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    // `npm run typecheck` also checks the tests, the scripts' TypeScript helpers and the test runner configs.
    nodeTsConfig: {
      include: ['../tests/**/*', '../scripts/**/*.ts', '../vitest.config.ts', '../playwright.config.ts', '../playwright.live.config.ts'],
    },
  },
  eslint: {
    // Also check formatting (2-space indent, single quotes, no semicolons).
    config: { stylistic: true },
  },
  fonts: {
    // The fonts are named in app/assets/css/tokens.css (--font-sans, --font-display); @nuxt/fonts
    // finds them there, downloads them at build time and serves them from this site, so visitors never
    // connect to Google Fonts. Only the weights in site.ts are downloaded, per family, to keep the
    // font files small: IBM Plex Sans Thai 400 and 500, Outfit 600.
    defaults: {
      styles: ['normal'],
      subsets: ['thai', 'latin'],
      preload: true,
    },
    families: Object.entries(site.fontWeights).map(([name, weights]) => ({ name, weights: [...weights] })),
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'th',
    locales,
    // A static site has no server to redirect by the browser's language: every visitor gets the
    // language of the URL they opened and switches with the button in the header.
    detectBrowserLanguage: false,
    // Links end with '/', like the folders that `nuxt generate` writes (en/index.html),
    // so static hosts serve them without a redirect.
    trailingSlash: true,
    // Origin for the absolute URLs in the hreflang links; the base path is added by the router.
    baseUrl: siteUrl.origin,
  },
})
