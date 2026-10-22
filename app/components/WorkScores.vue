<script setup lang="ts">
import type { Measurement, PageSpeedScores } from '~/types/content'
import { dotParts } from '~/utils/phrases'

/**
 * The four PageSpeed Insights scores of a piece of work, captioned with the tool, how they were measured
 * and when. Where four score names do not fit side by side, the scores are two rows of two: below 25rem
 * (400px) on a website's card, below 40rem (640px) in the narrower navy panel of the booking system. With
 * `onNavy` (that panel) the lines and the text are light, and the sizes follow the visitor's text size (rem).
 *
 * The widths leave room for Linux, where Chromium sets each letter of these 12px names on whole pixels,
 * mostly wider than the font's own widths: 'Performance' takes 81px there and 72px on Windows. From 25rem
 * every name of a website's card stays more than 4px inside its cell on both (decision D-032). In a row of
 * four the columns share the width equally, but none gets narrower than its longest word: that changes
 * nothing where the names fit, and on Linux it widens the panel's first column by a few pixels from
 * 1024px, where the panel's text column is as narrow as a website's card on a 380px phone.
 */
const props = withDefaults(defineProps<{
  measurement: Measurement
  onNavy?: boolean
}>(), {
  onNavy: false,
})

const { t } = useI18n()

// The four scores in the order PageSpeed Insights shows them.
const scoreNames: (keyof PageSpeedScores)[] = ['performance', 'accessibility', 'bestPractices', 'seo']

const styles = computed(() => props.onNavy
  ? {
      list: 'grid-cols-2 border-shore-cream/30 sm:grid-cols-[repeat(4,minmax(min-content,1fr))]',
      // In two rows of two: no line left of the first score of a row, a line above the second row.
      score: 'border-shore-cream/30 max-sm:odd:border-l-0 max-sm:[&:nth-child(n+3)]:border-t',
      name: 'text-[0.75rem] text-shore-cream',
      number: 'text-[1.875rem] text-white',
      caption: 'text-[0.875rem] text-shore-cream',
    }
  : {
      list: 'grid-cols-2 border-harbor-navy/14 min-[25rem]:grid-cols-[repeat(4,minmax(min-content,1fr))]',
      score: 'border-harbor-navy/14 max-[25rem]:odd:border-l-0 max-[25rem]:[&:nth-child(n+3)]:border-t',
      name: 'text-[12px] text-harbor-navy/78',
      number: 'text-[30px]',
      caption: 'text-[14px] text-harbor-navy/78',
    })
</script>

<template>
  <figure class="w-full">
    <!-- Each score: the number on top, its name under it (two lines when it is long). -->
    <dl
      class="grid overflow-hidden rounded-sm border"
      :class="styles.list"
    >
      <div
        v-for="name in scoreNames"
        :key="name"
        class="relative flex flex-col-reverse justify-end border-l px-1 pt-3 pb-2.5 text-center first:border-l-0"
        :class="styles.score"
      >
        <span
          class="absolute inset-x-[30%] top-0 h-0.75 rounded-b-[3px] bg-beacon-orange"
          aria-hidden="true"
        />
        <dt
          class="font-display leading-[1.3] font-semibold"
          :class="styles.name"
        >
          {{ t(`work.score.${name}`) }}
        </dt>
        <dd
          class="font-display leading-[1.1] font-semibold"
          :class="styles.number"
        >
          {{ measurement.scores[name] }}
        </dd>
      </div>
    </dl>
    <figcaption
      class="mt-2.5"
      :class="styles.caption"
    >
      <span class="font-display font-semibold whitespace-nowrap">{{ measurement.tool }}</span>
      <template
        v-for="part in dotParts(measurement.method)"
        :key="part"
      >
        {{ ' ' }}<span class="whitespace-nowrap">· {{ part }}</span>
      </template>
      {{ ' ' }}<span class="whitespace-nowrap">· <time :datetime="measurement.date">{{ t('work.measuredOn', { date: measurement.dateLabel }) }}</time></span>
    </figcaption>
  </figure>
</template>
