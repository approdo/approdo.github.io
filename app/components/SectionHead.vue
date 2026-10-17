<script setup lang="ts">
import type { MenuSection } from '~/data/menu'
import { menuSections } from '~/data/menu'
import type { SectionHeading } from '~/types/content'

/**
 * The number, the <h2> and the sentence under it of a page section. The <h2> gets the id
 * '<section>-title', so the section names itself: <section id="faq" aria-labelledby="faq-title">.
 * The number (01, 02, ...) is the section's place in the header menu (app/data/menu.ts).
 */
const props = defineProps<{
  section: MenuSection
  content: SectionHeading
}>()

const number = computed(() => String(menuSections.indexOf(props.section) + 1).padStart(2, '0'))
</script>

<template>
  <div class="mb-8 max-w-[40em]">
    <p
      class="font-display text-[16px] font-semibold tracking-[.1em]"
      aria-hidden="true"
    >
      {{ number }}
    </p>
    <h2
      :id="`${section}-title`"
      class="mt-1 text-[clamp(30px,5vw,40px)] leading-[1.3]"
    >
      <PhraseText :text="content.heading" />
    </h2>
    <p
      v-if="content.intro"
      class="mt-2 text-harbor-navy/78"
    >
      <PhraseText :text="content.intro" />
    </p>
  </div>
</template>
