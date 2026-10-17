<script setup lang="ts">
import { menuSections } from '~/data/menu'
import { site } from '~/data/site'

const { t } = useI18n()
const { app } = useRuntimeConfig()
</script>

<template>
  <!--
    A one-page site: below 1024px the header holds only the logo and the LINE button (no menu button —
    the sections follow each other on the page); from 1024px the menu sits between them. The keyboard
    goes through it in the order it is drawn: logo, menu, LINE button.
  -->
  <header
    id="site-header"
    class="sticky top-0 z-50 border-b border-harbor-navy/14 bg-white"
  >
    <div class="page-container flex h-17 items-center gap-6">
      <!-- The mark is Approdo's logo file for light backgrounds; the wordmark is text in Outfit. -->
      <a
        href="#top"
        class="mr-auto inline-flex min-h-11 min-w-0 items-center gap-2.5 text-harbor-navy no-underline"
        :aria-label="t('header.home', { name: site.name })"
      >
        <img
          :src="`${app.baseURL}images/brand/mark-on-light.svg`"
          alt=""
          width="26"
          height="38"
          class="h-9.5 w-auto shrink-0"
        >
        <span class="font-display text-[26px] leading-none font-semibold">{{ site.name }}</span>
      </a>

      <nav
        id="site-nav"
        class="hidden lg:block"
        :aria-label="t('header.navLabel')"
      >
        <ul
          role="list"
          class="flex gap-7.5"
        >
          <li
            v-for="section in menuSections"
            :key="section"
          >
            <a
              :href="`#${section}`"
              class="inline-flex min-h-11 items-center text-[16px] whitespace-nowrap text-harbor-navy no-underline decoration-beacon-orange decoration-3 underline-offset-8 hover:underline"
            >{{ t(`nav.${section}`) }}</a>
          </li>
        </ul>
      </nav>

      <LineButton size="sm">
        {{ t('line.chat') }}
      </LineButton>
    </div>
  </header>
</template>
