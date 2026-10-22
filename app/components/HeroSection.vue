<script setup lang="ts">
import { hero } from '~/data/hero'
import { demoAnchor } from '~/data/portfolio'
import { included, launchOffer, plans } from '~/data/pricing'
import { site } from '~/data/site'

const { t } = useI18n()
const { app } = useRuntimeConfig()

// The line under the prices in the ticket: two things every package includes. The '·' starts the
// second phrase, so it never hangs at the end of a line (lesson G-007).
const ticketFooter = [`${included.mobile} `, `· ${included.revisions}`]

/** A price with a number stays on one line; "ประเมินราคาตามงาน" (quoted per job) may wrap. */
const hasAmount = (price: string) => /\d/.test(price)
</script>

<template>
  <section
    id="top"
    class="relative overflow-hidden bg-shore-cream pt-11 pb-30 lg:pt-18 lg:pb-[150px]"
    aria-labelledby="top-title"
  >
    <!-- One column; from 1024px the text on the left and the price ticket on the right. -->
    <div class="page-container relative z-1 grid items-center gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] lg:gap-16">
      <div>
        <p class="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[15px] font-medium">
          <span
            class="size-2 shrink-0 rounded-full bg-beacon-orange ring-4 ring-beacon-orange/25"
            aria-hidden="true"
          />
          <span class="whitespace-nowrap">{{ site.line.name }}</span>
        </p>
        <!-- The tagline, one line per entry of hero.tagline; an orange wave under the last one. -->
        <h1
          id="top-title"
          class="mt-4.5 text-[40px] leading-[1.2] sm:text-[52px] lg:text-[68px]"
        >
          <span
            v-for="(line, index) in hero.tagline"
            :key="line"
            class="block"
          >
            <span
              v-if="index === hero.tagline.length - 1"
              class="relative inline-block"
            >{{ line }}<svg
              class="absolute inset-x-0 -bottom-2.5 h-4 w-full"
              viewBox="0 0 300 16"
              preserveAspectRatio="none"
              aria-hidden="true"
            ><path
              d="M4 10 C 50 2 90 2 130 9 S 220 15 296 6"
              fill="none"
              stroke="var(--color-beacon-orange)"
              stroke-width="5"
              stroke-linecap="round"
            /></svg></span>
            <template v-else>{{ line }}</template>
          </span>
        </h1>
        <p class="mt-6.5 text-[17px] font-medium lg:text-[19px]">
          <PhraseText :text="hero.services" />
        </p>
        <p class="mt-2 text-harbor-navy/78">
          <PhraseText :text="hero.positioning" />
        </p>
        <!--
          LINE, and the way to the booking system's panel in the work section. Below 640px the two buttons
          are narrower and closer, so they keep one row from 360px and the hero keeps its height.
        -->
        <div class="mt-7 flex flex-wrap gap-2 sm:gap-3">
          <LineButton class="max-sm:px-4">
            {{ t('line.chat') }}
          </LineButton>
          <BaseButton
            :href="`#${demoAnchor}`"
            variant="outline"
            class="max-sm:px-4"
          >
            {{ hero.tryBooking }}<span aria-hidden="true">&nbsp;↓</span>
          </BaseButton>
        </div>
      </div>

      <!-- The launch prices as a ferry ticket, from app/data/pricing.ts. -->
      <aside
        class="on-navy relative rounded-lg bg-harbor-navy px-6 pt-6.5 pb-5.5 text-shore-cream shadow-ticket"
        aria-labelledby="ticket-title"
      >
        <!-- The two punched holes of the ticket. -->
        <span
          class="absolute top-18 -left-3.25 size-6.5 rounded-full bg-shore-cream"
          aria-hidden="true"
        />
        <span
          class="absolute top-18 -right-3.25 size-6.5 rounded-full bg-shore-cream"
          aria-hidden="true"
        />
        <div class="flex items-center gap-2.5 border-b-2 border-dashed border-shore-cream/30 pb-5.5">
          <img
            :src="`${app.baseURL}images/brand/mark-on-dark.svg`"
            alt=""
            width="23"
            height="34"
            class="h-8.5 w-auto shrink-0"
          >
          <p
            id="ticket-title"
            class="text-[18px] font-medium text-white"
          >
            <PhraseText :text="launchOffer" />
          </p>
        </div>
        <ol role="list">
          <li
            v-for="plan in plans"
            :key="plan.id"
            class="grid gap-x-3.5 gap-y-0.5 border-b border-shore-cream/14 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto]"
          >
            <span class="font-medium text-white">{{ plan.name }} <span class="whitespace-nowrap">{{ plan.detail }}</span></span>
            <!--
              The price, then the regular price as one phrase: on the price's line while it fits, else on
              the next line. From 1024px the regular price is a line of its own under the price, and the
              price cell spans the duration's row, so the ticket keeps its height (design BR-020).
            -->
            <span
              class="lg:text-right"
              :class="{ 'lg:row-span-2': plan.regularPrice }"
            >
              <span
                class="font-medium text-beacon-orange"
                :class="{ 'whitespace-nowrap': hasAmount(plan.price) }"
              >{{ plan.price }}</span>
              <template v-if="plan.regularPrice">
                {{ ' ' }}<span class="text-[15px] whitespace-nowrap lg:mt-0.5 lg:block">{{ plan.regularPrice }}</span>
              </template>
            </span>
            <span
              v-if="plan.duration"
              class="col-span-full text-[15px] whitespace-nowrap lg:col-1"
            >{{ plan.duration }}</span>
          </li>
        </ol>
        <div class="flex flex-wrap items-center justify-between gap-x-3 pt-3.5 text-[15px]">
          <PhraseText :text="ticketFooter" />
          <a
            href="#pricing"
            class="inline-flex min-h-11 items-center whitespace-nowrap text-white underline decoration-beacon-orange underline-offset-4 hover:decoration-2"
          >{{ t('hero.details') }}<span aria-hidden="true">&nbsp;↓</span></a>
        </div>
      </aside>
    </div>

    <!-- The shore: a white wave with an orange line where the cream hero meets the page. -->
    <svg
      class="absolute inset-x-0 -bottom-px h-[90px] w-full lg:h-[120px]"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 64 C 240 30 520 40 760 62 S 1220 92 1440 50 V120 H0 Z"
        fill="var(--color-white)"
      />
      <path
        d="M0 64 C 240 30 520 40 760 62 S 1220 92 1440 50"
        fill="none"
        stroke="var(--color-beacon-orange)"
        stroke-width="3"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </section>
</template>
