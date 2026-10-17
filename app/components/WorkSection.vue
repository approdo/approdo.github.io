<script setup lang="ts">
import { portfolio, workSection } from '~/data/portfolio'
import type { PageSpeedScores } from '~/types/content'
import { newTabAttributes } from '~/utils/links'

const { t } = useI18n()

// The four scores in the order PageSpeed Insights shows them.
const scoreNames: (keyof PageSpeedScores)[] = ['performance', 'accessibility', 'bestPractices', 'seo']
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
      />
      <!-- A card per website in app/data/portfolio.ts. -->
      <div class="grid gap-10 lg:grid-cols-2">
        <article
          v-for="item in portfolio"
          :key="item.id"
          class="rounded-lg bg-shore-cream p-6"
        >
          <p class="inline-flex rounded-full bg-harbor-navy px-3 py-1 text-[14px] text-shore-cream">
            {{ item.label }}
          </p>
          <p class="mt-3 text-[15px] text-harbor-navy/78">
            {{ item.kind }}
          </p>
          <h3 class="mt-1 text-[26px]">
            {{ item.name }}
          </h3>
          <p class="mt-2 text-harbor-navy/78">
            {{ item.description }}
          </p>
          <dl
            class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
            :aria-label="t('work.scoresLabel', { tool: item.measurement.tool })"
          >
            <div
              v-for="name in scoreNames"
              :key="name"
              class="flex flex-col-reverse items-center rounded-sm bg-white px-2 py-3 text-center"
            >
              <dt class="font-display text-[12px] font-semibold">
                {{ t(`work.score.${name}`) }}
              </dt>
              <dd class="font-display text-[30px] leading-[1.1] font-semibold">
                {{ item.measurement.scores[name] }}
              </dd>
            </div>
          </dl>
          <p class="mt-3 text-[14px] text-harbor-navy/78">
            <span class="whitespace-nowrap">{{ item.measurement.tool }}</span>
            · {{ item.measurement.method }} ·
            <time
              :datetime="item.measurement.date"
              class="whitespace-nowrap"
            >{{ t('work.measuredOn', { date: item.measurement.dateLabel }) }}</time>
          </p>
          <BaseButton
            :href="item.url"
            v-bind="newTabAttributes(item.url)"
            variant="outline"
            class="mt-5"
          >
            {{ t('work.open') }}
            <span aria-hidden="true">↗</span>
            <span class="sr-only">{{ t('newTab') }}</span>
          </BaseButton>
        </article>
      </div>
    </div>
  </section>
</template>
