import { removeBaseURL } from '~/utils/removeBaseURL'

/**
 * Guard against a Nuxt bug in the small router it uses when there is no pages/ directory
 * (lesson G-008).
 *
 * On `popstate` (Back/Forward, or a click on an in-page link such as #faq) that router calls
 * `router.replace()` with the full path, base URL included, and then adds the base URL again:
 * /Site-starter/#faq becomes /Site-starter/Site-starter/#faq, which does not exist.
 * Here the base URL is removed first, so the address bar keeps the right URL.
 *
 * This template has pages/ (the language routes need it), so it uses the full vue-router, where
 * paths never contain the base URL and this plugin changes nothing. It stays as a guard for a client
 * site that drops pages/. Fixed upstream in https://github.com/nuxt/nuxt/pull/36034 (not in
 * Nuxt 4.5.2): remove this plugin after upgrading to a Nuxt release that includes that fix.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { baseURL } = useRuntimeConfig().app
  const replace = router.replace.bind(router)

  router.replace = to => replace(typeof to === 'string' ? removeBaseURL(to, baseURL) : to)
})
