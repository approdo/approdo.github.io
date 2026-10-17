<script setup lang="ts">
import { hero } from '~/data/hero'
import { site } from '~/data/site'
import { joinPhrases } from '~/utils/phrases'

// <html lang>, the canonical link and og:url. All of them start with site.url.
const i18nHead = useLocaleHead()

// @nuxtjs/i18n may write the home page URL without its last '/'; give the canonical link and og:url
// the URL that is served as it is (site.url ends with '/').
const siteUrlWithoutSlash = site.url.replace(/\/$/, '')
function withSlash<T>(url: T) {
  return url === siteUrlWithoutSlash ? site.url : url
}
const i18nLinks = computed(() => i18nHead.value.link?.map(link => ({ ...link, href: withSlash(link.href) })))
const i18nMeta = computed(() => i18nHead.value.meta?.map(meta => ({ ...meta, content: withSlash(meta.content) })))

useHead(() => ({
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: i18nLinks.value,
  meta: i18nMeta.value,
}))

// Title, description and the link preview. The preview image, og-image.png, is made by
// `npm run brand-images` and shows the logo and the tagline, so its alt text is the two of them.
// Open Graph needs an absolute URL; site.url already ends with the base path.
useSeoMeta({
  title: site.title,
  description: site.description,
  ogType: 'website',
  ogTitle: site.title,
  ogDescription: site.description,
  ogSiteName: site.name,
  ogImage: `${site.url}og-image.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: `${site.name} — ${joinPhrases(hero.tagline)}`,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
