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
      />
      <!-- The steps in order: one column, two from 640px, three from 1024px. -->
      <ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(step, index) in steps"
          :key="step.id"
          class="rounded-md border border-harbor-navy/14 bg-white p-5"
        >
          <p
            class="font-display text-[36px] leading-none font-semibold"
            aria-hidden="true"
          >
            {{ String(index + 1).padStart(2, '0') }}
          </p>
          <h3 class="mt-3 text-[20px]">
            <PhraseText :text="step.title" />
          </h3>
          <div class="mt-2 text-[16px] text-harbor-navy/78">
            <TextLines :lines="step.details" />
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
