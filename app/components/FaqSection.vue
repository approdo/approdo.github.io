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
    <!-- From 1024px: heading left, questions right. -->
    <div class="page-container lg:grid lg:grid-cols-[4fr_7fr] lg:items-start lg:gap-14">
      <div>
        <SectionHead
          section="faq"
          :content="faqSection"
        />
        <LineButton class="mb-8">
          {{ t('line.chat') }}
        </LineButton>
      </div>
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
          <summary class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3.5 pr-4 pl-5 text-[18px] leading-normal font-medium [&::-webkit-details-marker]:hidden">
            <PhraseText :text="faq.question" />
            <IconChevronDown class="size-5 shrink-0 transition-[rotate] duration-200 group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div class="px-5 pb-5 text-harbor-navy/78">
            <TextLines :lines="faq.answer" />
          </div>
        </details>
      </div>
    </div>
  </section>
</template>
