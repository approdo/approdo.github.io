<script setup lang="ts">
import type { ThaiText } from '~/types/content'

/**
 * Lines of Thai text from app/data/: one line is a paragraph, several are a bulleted list
 * (the parts the owner separated with ' · ', or the points of an answer).
 */
defineProps<{
  lines: readonly ThaiText[]
}>()
</script>

<template>
  <p v-if="lines.length === 1">
    <PhraseText :text="lines[0]!" />
  </p>
  <ul
    v-else
    class="grid list-disc gap-1 pl-5 marker:text-beacon-orange"
  >
    <li
      v-for="(line, index) in lines"
      :key="index"
    >
      <PhraseText :text="line" />
    </li>
  </ul>
</template>
