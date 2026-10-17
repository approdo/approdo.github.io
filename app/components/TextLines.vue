<script setup lang="ts">
import type { ThaiText } from '~/types/content'

/**
 * Lines of Thai text from app/data/: one line is a paragraph, several are a bulleted list with orange
 * dots (the parts the owner separated with ' · ', or the points of an answer). With `bullets` false,
 * several lines are paragraphs one under the other instead.
 */
withDefaults(defineProps<{
  lines: readonly ThaiText[]
  bullets?: boolean
}>(), {
  bullets: true,
})
</script>

<template>
  <p v-if="lines.length === 1">
    <PhraseText :text="lines[0]!" />
  </p>
  <!-- role="list": a list without list-style is no longer announced as a list in Safari. -->
  <ul
    v-else-if="bullets"
    role="list"
    class="grid gap-1"
  >
    <li
      v-for="(line, index) in lines"
      :key="index"
      class="relative pl-4.5 before:absolute before:top-[.65em] before:left-0.5 before:size-[7px] before:rounded-full before:bg-beacon-orange"
    >
      <PhraseText :text="line" />
    </li>
  </ul>
  <div v-else>
    <p
      v-for="(line, index) in lines"
      :key="index"
    >
      <PhraseText :text="line" />
    </p>
  </div>
</template>
