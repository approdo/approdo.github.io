<script setup lang="ts">
import { site } from '~/data/site'
import { newTabAttributes } from '~/utils/links'

/**
 * A button to Approdo's LINE Official Account, the only way to contact it. Every LINE button on the
 * page is this component, so all of them lead to the one link in site.ts. It opens in a new tab.
 * The visible label is the slot; screen readers also hear that the link opens a new tab.
 */
const { t } = useI18n()
</script>

<template>
  <BaseButton
    :href="site.line.url"
    v-bind="newTabAttributes(site.line.url)"
  >
    <IconLine class="size-5 shrink-0" />
    <slot />
    <span class="sr-only">{{ t('newTab') }}</span>
  </BaseButton>
</template>
