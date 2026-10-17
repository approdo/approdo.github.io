<script setup lang="ts">
import { portfolio, screenshotFile, screenshotViews, workSection } from '~/data/portfolio'
import type { PageSpeedScores, PortfolioItem, ScreenshotView } from '~/types/content'
import { newTabAttributes } from '~/utils/links'

const { t } = useI18n()
const imageUrl = useImageUrl()

// The four scores in the order PageSpeed Insights shows them.
const scoreNames: (keyof PageSpeedScores)[] = ['performance', 'accessibility', 'bestPractices', 'seo']

/**
 * The <img> attributes of one screenshot of a website: the smallest file as src and, when there are
 * several files, all of them in srcset so the browser picks the one that fits the screen.
 */
function screenshot(item: PortfolioItem, view: ScreenshotView) {
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

/** Splits 'มือถือ · ค่ากลาง 5 รอบ' at ' · ' (each part is shown with its '·' in front, never at a line end). */
const dotParts = (text: string) => text.split(' · ')

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
      <!-- A row per website in app/data/portfolio.ts; from 1024px the second row has its pictures on the right. -->
      <div class="grid gap-10">
        <article
          v-for="(item, index) in portfolio"
          :key="item.id"
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
                loading="lazy"
                decoding="async"
                class="block aspect-[375/700] h-auto w-full object-cover object-top"
              >
            </div>
          </div>

          <div class="flex flex-col items-start gap-2.5">
            <p class="rounded-full bg-harbor-navy px-3 py-1 text-[14px] font-medium text-shore-cream">
              {{ item.label }}
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
              :class="isLatin(item.name) ? 'font-display text-[28px] font-semibold' : 'text-[26px]'"
            >
              {{ item.name }}
            </h3>
            <p class="text-harbor-navy/78">
              {{ item.description }}
            </p>

            <!-- The scores, captioned with the tool, how they were measured and when. -->
            <figure class="mt-1.5 w-full">
              <!-- Each score: the number on top, its name under it (two lines when it is long). -->
              <dl class="grid grid-cols-4 overflow-hidden rounded-sm border border-harbor-navy/14">
                <div
                  v-for="name in scoreNames"
                  :key="name"
                  class="relative flex flex-col-reverse justify-end border-l border-harbor-navy/14 px-1 pt-3 pb-2.5 text-center first:border-l-0"
                >
                  <span
                    class="absolute inset-x-[30%] top-0 h-0.75 rounded-b-[3px] bg-beacon-orange"
                    aria-hidden="true"
                  />
                  <dt class="font-display text-[12px] leading-[1.3] font-semibold text-harbor-navy/78">
                    {{ t(`work.score.${name}`) }}
                  </dt>
                  <dd class="font-display text-[30px] leading-[1.1] font-semibold">
                    {{ item.measurement.scores[name] }}
                  </dd>
                </div>
              </dl>
              <figcaption class="mt-2.5 text-[14px] text-harbor-navy/78">
                <span class="font-display font-semibold whitespace-nowrap">{{ item.measurement.tool }}</span>
                <template
                  v-for="part in dotParts(item.measurement.method)"
                  :key="part"
                >
                  {{ ' ' }}<span class="whitespace-nowrap">· {{ part }}</span>
                </template>
                {{ ' ' }}<span class="whitespace-nowrap">· <time :datetime="item.measurement.date">{{ t('work.measuredOn', { date: item.measurement.dateLabel }) }}</time></span>
              </figcaption>
            </figure>

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
      </div>
    </div>
  </section>
</template>
