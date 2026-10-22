<script setup lang="ts">
import { demoAnchor, screenshotFile, screenshotViews } from '~/data/portfolio'
import type { SystemWork } from '~/types/content'
import { newTabAttributes } from '~/utils/links'
import { dotParts } from '~/utils/phrases'

/**
 * A piece of work with a live demo (the booking system) as a navy panel, the first of the work section
 * (design v1.1.0 §3.2): its texts and scores, then two phones side by side, the customer's side as a
 * screenshot and the shop's side as a clip, a button under each phone to try that side on the demo, and
 * how long the demo keeps what a visitor tries. From 1024px the texts are on the left. The hero's second
 * button leads here (#booking).
 */
const props = defineProps<{ item: SystemWork }>()

const { t } = useI18n()
const imageUrl = useImageUrl()

// The phones show the whole screen of a 390 × 844 phone, like the clip.
const phone = screenshotViews.phone

/** The screenshot of the customer's side: the smallest file as src, all of them in srcset. */
const customerShot = computed(() => {
  const files = phone.files.map(width => ({ url: imageUrl(screenshotFile(props.item.id, 'phone', width)), width }))
  return { src: files[0]!.url, srcset: files.map(({ url, width }) => `${url} ${width}w`).join(', ') }
})

// How wide the screenshot is drawn: below 640px half of the panel's inside (the page less 2 × 20px, the
// panel's padding 2 × 20px and the gap 14px) less the frame (2 × 7px); from 640px the phone is 230px wide.
const customerSizes = '(min-width: 640px) 216px, calc(50vw - 61px)'

/** The two buttons: try the demo as a customer (the work's url), and as the shop owner. */
const tryLinks = computed(() => [
  { href: props.item.url, label: props.item.demo.tryLabels.customer },
  { href: props.item.demo.ownerUrl, label: props.item.demo.tryLabels.owner },
])
</script>

<template>
  <article
    :id="demoAnchor"
    class="on-navy grid gap-6.5 rounded-lg bg-harbor-navy px-5 py-7 text-shore-cream sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:px-12 lg:pt-12 lg:pb-11"
    :aria-labelledby="`work-${item.id}-title`"
  >
    <div class="flex flex-col items-start gap-2.5">
      <p class="rounded-full bg-shore-cream px-3 py-1 text-[0.875rem] font-medium text-harbor-navy">
        <PhraseText :text="item.label" />
      </p>
      <p class="text-[0.9375rem] font-medium">
        <template
          v-for="(part, partIndex) in dotParts(item.kind)"
          :key="part"
        >
          <template v-if="partIndex > 0">
            {{ ' ' }}<span class="whitespace-nowrap">· {{ part }}</span>
          </template>
          <span
            v-else
            class="whitespace-nowrap"
          >{{ part }}</span>
        </template>
      </p>
      <h3
        :id="`work-${item.id}-title`"
        class="text-[1.625rem] text-white lg:text-[1.75rem]"
      >
        <PhraseText :text="item.name" />
      </h3>
      <p>
        <PhraseText :text="item.description" />
      </p>
      <WorkScores
        :measurement="item.measurement"
        on-navy
        class="mt-1.5"
      />
    </div>

    <div>
      <div class="grid grid-cols-2 justify-items-center gap-3.5 sm:gap-6">
        <figure class="flex w-full max-w-[230px] flex-col items-center">
          <div class="phone-frame w-full">
            <img
              :src="customerShot.src"
              :srcset="customerShot.srcset"
              :sizes="customerSizes"
              :width="phone.width"
              :height="phone.height"
              :alt="item.screenshotAlt.phone"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              class="block aspect-[390/844] h-auto w-full rounded-[23px] bg-white object-cover object-top"
            >
          </div>
          <figcaption class="mt-2.5 text-[0.9375rem] font-medium text-white">
            {{ item.demo.sides.customer }}
          </figcaption>
        </figure>
        <figure class="flex w-full max-w-[230px] flex-col items-center">
          <WorkClip
            :clip="item.demo.clip"
            :width="phone.width"
            :height="phone.height"
          />
          <figcaption class="mt-2.5 text-[0.9375rem] font-medium text-white">
            {{ item.demo.sides.owner }}
          </figcaption>
        </figure>
      </div>

      <!--
        One button under each phone from 640px; one under the other below. `:on-navy="true"`, not a bare
        `on-navy`: next to v-bind of an object, Vue merges attributes named on… as event listeners and drops
        an empty one.
      -->
      <div class="mt-4.5 grid gap-2.5 sm:mx-auto sm:max-w-[484px] sm:grid-cols-2">
        <BaseButton
          v-for="link in tryLinks"
          :key="link.href"
          :href="link.href"
          v-bind="newTabAttributes(link.href)"
          variant="outline"
          :on-navy="true"
          class="w-full"
        >
          {{ link.label }}<span aria-hidden="true">&nbsp;↗</span><span class="sr-only">{{ t('newTab') }}</span>
        </BaseButton>
      </div>
      <p class="mt-3.5 flex items-start gap-2 text-[0.9375rem] sm:justify-center">
        <IconClock class="mt-[3px] size-4.5 shrink-0 text-beacon-orange" />
        <PhraseText :text="item.demo.trialNote" />
      </p>
    </div>
  </article>
</template>
