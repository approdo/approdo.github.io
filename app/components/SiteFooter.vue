<script setup lang="ts">
import { hero } from '~/data/hero'
import { site } from '~/data/site'
import { newTabAttributes } from '~/utils/links'
import { joinPhrases } from '~/utils/phrases'

const { t } = useI18n()
const { app } = useRuntimeConfig()

// "LINE OA: Approdo - รับทำเว็บ (@337jkdha)": may break only between the label, the name and the ID.
const lineLinkText = [`${t('contact.account')} `, `${site.line.name} `, `(${site.line.id})`]
</script>

<template>
  <!--
    Below 1024px everything is stacked: logo, tagline, LINE link, © line. From 1024px one row:
    logo | tagline · LINE link | © line.
  -->
  <footer
    id="site-footer"
    class="on-navy bg-harbor-navy-deep pt-8.5 pb-9.5 text-[15px] text-shore-cream"
  >
    <div class="page-container grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-7">
      <a
        href="#top"
        class="inline-flex min-h-11 items-center gap-2.5 justify-self-start text-white no-underline"
        :aria-label="t('header.home', { name: site.name })"
      >
        <img
          :src="`${app.baseURL}images/brand/mark-on-dark.svg`"
          alt=""
          width="22"
          height="32"
          class="h-8 w-auto shrink-0"
        >
        <span class="font-display text-[22px] leading-none font-semibold">{{ site.name }}</span>
      </a>
      <p class="grid gap-3 lg:block">
        <span>{{ joinPhrases(hero.tagline) }}</span>
        <span
          class="hidden lg:inline"
          aria-hidden="true"
        >{{ ' · ' }}</span>
        <a
          :href="site.line.url"
          v-bind="newTabAttributes(site.line.url)"
          class="inline-flex min-h-11 items-center justify-self-start text-white underline decoration-beacon-orange underline-offset-4 hover:decoration-2"
        ><PhraseText
          :text="lineLinkText"
          inline
        /><span class="sr-only"> {{ t('newTab') }}</span></a>
      </p>
      <p>{{ site.copyright }}</p>
    </div>
  </footer>
</template>
