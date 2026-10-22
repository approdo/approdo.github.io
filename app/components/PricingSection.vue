<script setup lang="ts">
import { sampleOf } from '~/data/portfolio'
import { allPlans, callToAction, launchOffer, launchTerms, plans, pricingSection, termsBoxes } from '~/data/pricing'
import { newTabAttributes } from '~/utils/links'
import { joinTexts } from '~/utils/phrases'

const { t } = useI18n()

// Every price and term on this section comes from app/data/pricing.ts, word for word.
const callToActionText = joinTexts([callToAction.ask, callToAction.reply])

// Each package with its sample, if it has one: a link to a piece of work made that way (app/data/portfolio.ts).
const cards = plans.map(plan => ({ plan, sample: sampleOf(plan.id) }))

/** A price with an amount in it is large; a price that is quoted per job (no number) is a size smaller. */
const hasAmount = (price: string) => /\d/.test(price)
</script>

<template>
  <section
    id="pricing"
    class="section-padding bg-shore-cream"
    aria-labelledby="pricing-title"
  >
    <div class="page-container">
      <SectionHead
        section="pricing"
        :content="pricingSection"
        class="mb-8"
      />
      <p class="mb-4.5 inline-flex items-center gap-2 rounded-full bg-harbor-navy px-3.5 py-1.5 text-[15px] font-medium text-white">
        <span
          class="size-2 shrink-0 rounded-full bg-beacon-orange"
          aria-hidden="true"
        />
        <PhraseText :text="launchOffer" />
      </p>

      <!-- A card per package: one column, three from 1024px (three at 768px would be too narrow). -->
      <ul
        role="list"
        class="grid gap-4.5 lg:grid-cols-3"
      >
        <li
          v-for="{ plan, sample } in cards"
          :key="plan.id"
          class="flex flex-col items-start gap-2 rounded-lg border-t-6 border-beacon-orange bg-white px-6 pt-6.5 pb-6 shadow-card"
        >
          <h3 class="text-[23px]">
            {{ plan.name }}
          </h3>
          <p class="-mt-1 text-[16px] whitespace-nowrap text-harbor-navy/78">
            {{ plan.detail }}
          </p>
          <p
            class="mt-2.5 leading-[1.25] font-medium"
            :class="hasAmount(plan.price) ? 'text-[32px] whitespace-nowrap' : 'text-[25px]'"
          >
            {{ plan.price }}
          </p>
          <!-- The regular price under the price, in the style of the line under the name (design BR-020). -->
          <p
            v-if="plan.regularPrice"
            class="-mt-1 text-[16px] whitespace-nowrap text-harbor-navy/78"
          >
            {{ plan.regularPrice }}
          </p>
          <p
            v-if="plan.duration"
            class="inline-flex items-center gap-1.5 rounded-full bg-harbor-navy px-3 py-1 text-[15px] font-medium text-shore-cream"
          >
            <IconClock class="size-4 shrink-0" />
            <span class="sr-only">{{ t('pricing.duration') }}</span>
            <span class="whitespace-nowrap">{{ plan.duration }}</span>
          </p>
          <!--
            Under a thin line, a link to a piece of work made as this package, and what in it costs extra
            (design v1.1.0 §3.4). The link is underlined, so its phrases are inline (`inline`): an underline
            is not drawn under inline-block boxes (lesson G-007).
          -->
          <div
            v-if="sample"
            class="mt-3 self-stretch border-t border-harbor-navy/14 pt-3.5"
          >
            <a
              :href="sample.url"
              v-bind="newTabAttributes(sample.url)"
              class="inline-block py-2.5 text-[1rem] leading-[1.6] font-medium underline decoration-1 underline-offset-[5px] hover:decoration-beacon-orange hover:decoration-[3px]"
            ><PhraseText
              :text="sample.link"
              inline
            /><span aria-hidden="true">&nbsp;↗</span><span class="sr-only">{{ t('newTab') }}</span></a>
            <p
              v-if="sample.extra"
              class="mt-0.5 flex items-start gap-2 text-[0.9375rem] text-harbor-navy/78"
            >
              <span
                class="mt-[3px] grid size-4.5 shrink-0 place-items-center rounded-full bg-harbor-navy font-display text-[0.8125rem] leading-none font-semibold text-shore-cream"
                aria-hidden="true"
              >+</span>
              <PhraseText :text="sample.extra" />
            </p>
          </div>
        </li>
      </ul>

      <!-- "ทุกแบบ:" and what every package includes, each with an orange tick. -->
      <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-md bg-white px-5.5 py-4.5">
        <p
          id="all-plans-label"
          class="font-medium"
        >
          {{ allPlans.label }}
        </p>
        <ul
          role="list"
          class="flex flex-wrap gap-x-5.5 gap-y-2"
          aria-labelledby="all-plans-label"
        >
          <li
            v-for="(item, index) in allPlans.items"
            :key="index"
            class="inline-flex items-center gap-2"
          >
            <span class="grid size-6 shrink-0 place-items-center rounded-full bg-beacon-orange text-harbor-navy">
              <IconCheck class="size-3.5" />
            </span>
            <PhraseText :text="item" />
          </li>
        </ul>
      </div>

      <p class="on-navy mt-3.5 rounded-md bg-harbor-navy px-5.5 py-4 text-shore-cream">
        <strong class="font-medium text-beacon-orange">{{ launchTerms.label }}</strong>
        {{ ' ' }}
        <PhraseText :text="launchTerms.text" />
      </p>

      <!-- Terms of work from the owner's answers: one column, two from 1024px. -->
      <div class="mt-3.5 grid gap-3.5 lg:grid-cols-2">
        <div
          v-for="box in termsBoxes"
          :key="box.id"
          class="rounded-md bg-white px-5.5 py-4.5 text-harbor-navy/78"
        >
          <h3 class="mb-1.5 text-[18px] text-harbor-navy">
            <PhraseText :text="box.heading" />
          </h3>
          <TextLines
            :lines="box.lines"
            :bullets="box.bullets"
          />
        </div>
      </div>

      <div class="mt-7 flex flex-wrap items-center gap-x-5.5 gap-y-3.5">
        <p class="text-[19px] font-medium">
          <PhraseText :text="callToActionText" />
        </p>
        <LineButton>{{ t('line.quote') }}</LineButton>
      </div>
    </div>
  </section>
</template>
