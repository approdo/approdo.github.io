<script setup lang="ts">
import { faqSection, faqs } from '~/data/faq'

const { t } = useI18n()
</script>

<template>
  <section
    id="faq"
    class="section-padding bg-shore-cream"
    aria-labelledby="faq-title"
  >
    <!-- From 1024px: heading on the left (it stays in view while the questions scroll), questions on the right. -->
    <div class="page-container grid gap-7 lg:grid-cols-[4fr_7fr] lg:items-start lg:gap-14">
      <SectionHead
        section="faq"
        :content="faqSection"
        class="lg:sticky lg:top-25"
      >
        <LineButton
          size="sm"
          class="mt-3"
        >
          {{ t('line.chat') }}
        </LineButton>
      </SectionHead>
      <!--
        Native <details>: each question opens and closes with a click, Enter or Space, without
        JavaScript. The questions marked `open` in app/data/faq.ts start open. They are not grouped
        with a shared name, which would keep only one of them open.
      -->
      <div class="grid gap-2.5">
        <details
          v-for="faq in faqs"
          :key="faq.id"
          :open="faq.open"
          class="group rounded-md border border-harbor-navy/14 bg-white"
        >
          <summary class="relative flex min-h-14 cursor-pointer list-none items-center rounded-md py-3.75 pr-14 pl-5 text-[18px] leading-normal font-medium decoration-beacon-orange decoration-2 underline-offset-6 hover:underline [&::-webkit-details-marker]:hidden">
            <!-- `inline`: the question is underlined on hover, and an underline skips inline-block phrases. -->
            <PhraseText
              :text="faq.question"
              inline
            />
            <!-- Plus when closed, minus when open. -->
            <span
              class="absolute top-1/2 right-4.5 grid size-6.5 -translate-y-1/2 place-items-center rounded-full bg-beacon-orange text-harbor-navy"
              aria-hidden="true"
            >
              <svg
                class="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
              >
                <path d="M6 12h12" />
                <path
                  class="group-open:hidden"
                  d="M12 6v12"
                />
              </svg>
            </span>
          </summary>
          <div class="px-5 pb-4.5 text-harbor-navy/78">
            <TextLines :lines="faq.answer" />
          </div>
        </details>
      </div>
    </div>
  </section>
</template>
