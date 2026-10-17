<script setup lang="ts">
import { site } from '~/data/site'
import { newTabAttributes } from '~/utils/links'

/**
 * A button to Approdo's LINE Official Account, the only way to contact it. Every LINE button on the
 * page is this component, so all of them lead to the one link in site.ts. It opens in a new tab.
 * The visible label is the slot; screen readers also hear that the link opens a new tab.
 */
withDefaults(defineProps<{
  size?: 'md' | 'sm'
  /** The button sits on a navy background (see BaseButton). */
  onNavy?: boolean
}>(), {
  size: 'md',
  onNavy: false,
})

const { t } = useI18n()
</script>

<template>
  <BaseButton
    :href="site.line.url"
    v-bind="newTabAttributes(site.line.url)"
    :size="size"
    :on-navy="onNavy"
  >
    <IconLine
      class="shrink-0"
      :class="size === 'sm' ? 'size-5' : 'size-5.5'"
    />
    <slot />
    <span class="sr-only">{{ t('newTab') }}</span>
  </BaseButton>
</template>
