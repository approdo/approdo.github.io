<script setup lang="ts">
import type { MenuSection } from '~/data/menu'
import { menuSections } from '~/data/menu'
import type { SectionHeading } from '~/types/content'

/**
 * The number, the <h2> and the sentence under it of a page section. The <h2> gets the id
 * '<section>-title', so the section names itself: <section id="faq" aria-labelledby="faq-title">.
 * The number (01, 02, ...) is the section's place in the header menu (app/data/menu.ts), with a short
 * orange line after it. The slot goes under the sentence (the FAQ puts its LINE button there).
 *
 * It has no outer margin: the section sets the space under it (class="mb-8").
 */
const props = withDefaults(defineProps<{
  section: MenuSection
  content: SectionHeading
  /** On a navy background: the number and the heading are white. */
  onNavy?: boolean
}>(), {
  onNavy: false,
})

const number = computed(() => String(menuSections.indexOf(props.section) + 1).padStart(2, '0'))
</script>

<template>
  <div class="max-w-[46em]">
    <p
      class="mb-3 inline-flex items-center gap-3 font-display text-[16px] leading-none font-semibold tracking-[.1em]"
      :class="{ 'text-white': onNavy }"
      aria-hidden="true"
    >
      {{ number }}
      <span class="h-1 w-10 rounded-full bg-beacon-orange" />
    </p>
    <h2
      :id="`${section}-title`"
      class="text-[30px] lg:text-[40px]"
      :class="{ 'text-white': onNavy }"
    >
      <PhraseText :text="content.heading" />
    </h2>
    <!-- Words in `accent` (a product name) are in the display font, as on the website cards. -->
    <p
      v-if="content.intro"
      class="mt-2.5 text-harbor-navy/78 [&_em]:font-display [&_em]:font-semibold [&_em]:not-italic"
    >
      <PhraseText
        :text="content.intro"
        :accent="content.accent"
      />
    </p>
    <slot />
  </div>
</template>
