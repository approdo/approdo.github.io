<script setup lang="ts">
import { isSystemWork, portfolio, screenshotFile, screenshotViews, workSection } from '~/data/portfolio'
import type { WebsiteWork } from '~/types/content'
import { newTabAttributes } from '~/utils/links'
import { dotParts, joinPhrases } from '~/utils/phrases'

const { t } = useI18n()
const imageUrl = useImageUrl()

/**
 * The <img> attributes of one screenshot of a website: the smallest file as src and, when there are
 * several files, all of them in srcset so the browser picks the one that fits the screen.
 */
function screenshot(item: WebsiteWork, view: keyof WebsiteWork['screenshotAlt']) {
  const { width, height, files } = screenshotViews[view]
  const urls = files.map(fileWidth => ({ url: imageUrl(screenshotFile(item.id, view, fileWidth)), width: fileWidth }))
  return {
    src: urls[0]!.url,
    srcset: urls.length > 1 ? urls.map(({ url, width }) => `${url} ${width}w`).join(', ') : undefined,
    width,
    height,
    alt: item.screenshotAlt[view],
  }
}

// How wide the computer screenshot is drawn: the frame's width less its padding (16px each side,
// 24px from 1024px, where the frame takes 7 of the 12 columns of the card row).
const desktopSizes = '(min-width: 1024px) 575px, (min-width: 640px) calc(100vw - 96px), calc(100vw - 72px)'

// How wide the phone screenshot is drawn: 26% of the picture box (22% from 1024px), at most 150px, less
// its 5px frame on each side. At 375px that is 77px, so a phone (DPR 2) takes the 188px file.
const mobileSizes = '(min-width: 1024px) 127px, (min-width: 640px) 140px, calc(26vw - 20px)'

/** A name written in Latin letters only ('BrightPath Academy') is set in the display font. */
const isLatin = (text: string) => /^[ -~]+$/.test(text)
</script>

<template>
  <section
    id="work"
    class="section-padding"
    aria-labelledby="work-title"
  >
    <div class="page-container">
      <SectionHead
        section="work"
        :content="workSection"
        class="mb-8"
      />
      <!--
        The work in app/data/portfolio.ts, in order: the booking system as a navy panel, then a row per
        website; from 1024px every second row has its pictures on the right.
      -->
      <div class="grid gap-10">
        <template
          v-for="(item, index) in portfolio"
          :key="item.id"
        >
          <WorkPanel
            v-if="isSystemWork(item)"
            :item="item"
          />
          <article
            v-else
            class="grid items-center gap-5.5 lg:gap-12"
            :class="index % 2 === 0 ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'"
            :aria-labelledby="`work-${item.id}-title`"
          >
            <!-- Screenshots of the live website: on a computer, and on a phone in front of it. -->
            <div
              class="relative rounded-lg bg-shore-cream px-4 pt-4 pb-9 lg:px-6 lg:pt-6 lg:pb-12"
              :class="{ 'lg:order-2': index % 2 === 1 }"
            >
              <div class="overflow-hidden rounded-sm border border-harbor-navy/14 shadow-device">
                <img
                  v-bind="screenshot(item, 'desktop')"
                  :sizes="desktopSizes"
                  loading="lazy"
                  decoding="async"
                  class="block aspect-[16/10] h-auto w-full object-cover object-top"
                >
              </div>
              <div class="absolute right-4.5 bottom-3 w-[26%] max-w-[150px] overflow-hidden rounded-[18px] border-5 border-harbor-navy bg-harbor-navy shadow-phone lg:right-6.5 lg:bottom-4 lg:w-[22%]">
                <img
                  v-bind="screenshot(item, 'mobile')"
                  :sizes="mobileSizes"
                  loading="lazy"
                  decoding="async"
                  class="block aspect-[375/700] h-auto w-full object-cover object-top"
                >
              </div>
            </div>

            <div class="flex flex-col items-start gap-2.5">
              <p class="rounded-full bg-harbor-navy px-3 py-1 text-[14px] font-medium text-shore-cream">
                <PhraseText :text="item.label" />
              </p>
              <p class="text-[15px] font-medium">
                <template
                  v-for="(part, partIndex) in dotParts(item.kind)"
                  :key="part"
                >
                  <template v-if="partIndex > 0">
                    {{ ' ' }}<span class="whitespace-nowrap">· {{ part }}</span>
                  </template>
                  <span
                    v-else
                    class="whitespace-nowrap"
                  >{{ part }}</span>
                </template>
              </p>
              <h3
                :id="`work-${item.id}-title`"
                :class="isLatin(joinPhrases(item.name)) ? 'font-display text-[28px] font-semibold' : 'text-[26px]'"
              >
                <PhraseText :text="item.name" />
              </h3>
              <p class="text-harbor-navy/78">
                <PhraseText :text="item.description" />
              </p>

              <!-- The scores, captioned with the tool, how they were measured and when. -->
              <WorkScores
                :measurement="item.measurement"
                class="mt-1.5"
              />

              <BaseButton
                :href="item.url"
                v-bind="newTabAttributes(item.url)"
                variant="outline"
                size="sm"
                class="mt-1.5"
              >
                {{ t('work.open') }}
                <span aria-hidden="true">↗</span>
                <span class="sr-only">{{ t('newTab') }}</span>
              </BaseButton>
            </div>
          </article>
        </template>
      </div>
    </div>
  </section>
</template>
