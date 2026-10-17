<script setup lang="ts">
import { processSection, steps } from '~/data/process'
</script>

<template>
  <section
    id="process"
    class="section-padding"
    aria-labelledby="process-title"
  >
    <div class="page-container">
      <SectionHead
        section="process"
        :content="processSection"
        class="mb-8"
      />
      <!--
        The steps in order: one column, two from 640px, three from 1024px. The big number with its
        orange line is decoration; the ordered list already tells screen readers the order.
      -->
      <ol
        role="list"
        class="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4.5"
      >
        <li
          v-for="(step, index) in steps"
          :key="step.id"
          class="relative min-h-23 rounded-md border border-harbor-navy/14 bg-white py-5 pr-5 pl-21 lg:min-h-30 lg:pt-6.5 lg:pr-6 lg:pb-6 lg:pl-24"
        >
          <span
            class="absolute top-5 left-5 font-display text-[36px] leading-none font-semibold lg:top-6 lg:left-6 lg:text-[42px]"
            aria-hidden="true"
          >
            {{ String(index + 1).padStart(2, '0') }}
            <span class="mt-2 block h-1 w-7 rounded-full bg-beacon-orange" />
          </span>
          <h3 class="text-[20px]">
            <PhraseText :text="step.title" />
          </h3>
          <div class="mt-0.5 text-[16px] text-harbor-navy/78">
            <TextLines :lines="step.details" />
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
