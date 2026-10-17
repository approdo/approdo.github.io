<script setup lang="ts">
import { hero } from '~/data/hero'
import { site } from '~/data/site'
import { newTabAttributes } from '~/utils/links'
import { joinPhrases } from '~/utils/phrases'

const { t } = useI18n()
const { app } = useRuntimeConfig()
</script>

<template>
  <!-- A navy footer: the focus ring turns orange here (navy on navy would not show). -->
  <footer
    id="site-footer"
    class="bg-harbor-navy-deep py-9 text-[15px] text-shore-cream [&_:focus-visible]:outline-beacon-orange"
  >
    <div class="page-container grid gap-3">
      <a
        href="#top"
        class="inline-flex min-h-11 items-center gap-2.5 justify-self-start text-white no-underline"
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
      <p>{{ joinPhrases(hero.tagline) }}</p>
      <p>
        <a
          :href="site.line.url"
          v-bind="newTabAttributes(site.line.url)"
          class="text-white underline decoration-beacon-orange underline-offset-4"
        >{{ t('footer.lineLink', { name: site.line.name, id: site.line.id }) }}<span class="sr-only"> {{ t('newTab') }}</span></a>
      </p>
      <p>{{ site.copyright }}</p>
    </div>
  </footer>
</template>
