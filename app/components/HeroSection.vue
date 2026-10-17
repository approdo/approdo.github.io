<script setup lang="ts">
import { hero } from '~/data/hero'
import { site } from '~/data/site'

const { t } = useI18n()
</script>

<template>
  <section
    id="top"
    class="bg-shore-cream py-14 lg:py-24"
    aria-labelledby="top-title"
  >
    <div class="page-container">
      <p class="inline-flex rounded-full bg-harbor-navy px-4 py-1.5 text-[15px] font-medium text-shore-cream">
        {{ site.line.name }}
      </p>
      <!-- The tagline, one line per entry of hero.tagline. -->
      <h1
        id="top-title"
        class="mt-5 text-[clamp(40px,8vw,68px)] leading-[1.2]"
      >
        <template
          v-for="line in hero.tagline"
          :key="line"
        >
          <span class="block">{{ line }}</span>
        </template>
      </h1>
      <p class="mt-5 text-[19px] font-medium">
        <PhraseText :text="hero.services" />
      </p>
      <p class="mt-2 text-harbor-navy/78">
        <PhraseText :text="hero.positioning" />
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <LineButton>{{ t('line.chat') }}</LineButton>
        <BaseButton
          href="#work"
          variant="outline"
        >
          {{ t('hero.seeWork') }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>
