<script setup lang="ts">
import { allPlans, callToAction, launchOffer, launchTerms, plans, pricingSection, termsBoxes } from '~/data/pricing'
import { joinTexts } from '~/utils/phrases'

const { t } = useI18n()

// Every price and term on this section comes from app/data/pricing.ts, word for word.
const callToActionText = joinTexts([callToAction.ask, callToAction.reply])
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
      />
      <p class="inline-flex rounded-full bg-harbor-navy px-4 py-1.5 text-[15px] text-shore-cream">
        <PhraseText :text="launchOffer" />
      </p>

      <!-- A card per package: one column, three from 1024px. -->
      <ul
        role="list"
        class="mt-6 grid gap-4.5 lg:grid-cols-3"
      >
        <li
          v-for="plan in plans"
          :key="plan.id"
          class="rounded-lg border-t-6 border-beacon-orange bg-white p-6 shadow-card"
        >
          <h3 class="text-[23px]">
            {{ plan.name }}
          </h3>
          <p class="whitespace-nowrap text-harbor-navy/78">
            {{ plan.detail }}
          </p>
          <p class="mt-3 text-[32px] leading-[1.25] font-medium whitespace-nowrap">
            {{ plan.price }}
          </p>
          <p
            v-if="plan.duration"
            class="mt-3 inline-flex items-center gap-2 rounded-full bg-harbor-navy px-3 py-1 text-[15px] text-shore-cream"
          >
            <IconClock class="size-4 shrink-0" />
            <span class="sr-only">{{ t('pricing.duration') }}</span>
            <span class="whitespace-nowrap">{{ plan.duration }}</span>
          </p>
        </li>
      </ul>

      <div class="mt-6 rounded-md bg-white p-5">
        <p class="font-medium">
          {{ allPlans.label }}
        </p>
        <TextLines :lines="allPlans.items" />
      </div>

      <p class="mt-4 rounded-md bg-harbor-navy p-5 text-shore-cream">
        <strong class="font-medium text-beacon-orange">{{ launchTerms.label }}</strong>
        {{ ' ' }}
        <PhraseText :text="launchTerms.text" />
      </p>

      <!-- Terms of work from the owner's answers: one column, two from 1024px. -->
      <div class="mt-4 grid gap-3.5 lg:grid-cols-2">
        <div
          v-for="box in termsBoxes"
          :key="box.id"
          class="rounded-md bg-white p-5 text-harbor-navy/78"
        >
          <h3 class="mb-2 text-[18px] text-harbor-navy">
            <PhraseText :text="box.heading" />
          </h3>
          <TextLines :lines="box.lines" />
        </div>
      </div>

      <div class="mt-8 flex flex-wrap items-center gap-4">
        <p class="text-[19px] font-medium">
          <PhraseText :text="callToActionText" />
        </p>
        <LineButton>{{ t('line.quote') }}</LineButton>
      </div>
    </div>
  </section>
</template>
