<script setup lang="ts">
import { contactSection, onlyChannel } from '~/data/contact'
import { callToAction } from '~/data/pricing'
import { site } from '~/data/site'
import { joinTexts } from '~/utils/phrases'

const { t } = useI18n()
const imageUrl = useImageUrl()

const callToActionText = joinTexts([callToAction.ask, callToAction.reply])
</script>

<template>
  <section
    id="contact"
    class="on-navy relative overflow-hidden bg-harbor-navy py-16 text-shore-cream lg:py-22"
    aria-labelledby="contact-title"
  >
    <!-- A soft orange light in the top right corner, like the beacon of the logo. -->
    <span
      class="pointer-events-none absolute -top-50 -right-40 size-130 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-beacon-orange)_22%,transparent),transparent_65%)]"
      aria-hidden="true"
    />
    <!-- From 1024px the QR code sits on the right, for visitors who opened the page on a computer. -->
    <div class="page-container relative grid items-center gap-7.5 lg:grid-cols-[1fr_auto]">
      <div>
        <SectionHead
          section="contact"
          :content="contactSection"
          on-navy
        />
        <p class="mt-2.5 text-[19px] font-medium">
          <PhraseText :text="callToActionText" />
        </p>
        <p class="mt-5 flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <span class="font-medium text-white">{{ t('contact.account') }} <span class="whitespace-nowrap">{{ site.line.name }}</span></span>
          <span class="font-display text-[24px] leading-[1.3] font-semibold text-beacon-orange">{{ site.line.id }}</span>
        </p>
        <LineButton
          on-navy
          class="mt-5.5"
        >
          {{ t('line.addFriend') }}
        </LineButton>
        <p class="mt-3 text-[15px]">
          {{ onlyChannel }}
        </p>
      </div>
      <!--
        The QR code holds the same LINE link as the buttons. It is made at build time from site.ts
        (scripts/generate-line-qr.mjs), so no QR service is called. Below 1024px it is not shown: on a
        phone the button opens LINE directly, and the lazy image is not even downloaded.
      -->
      <figure class="hidden w-67 justify-self-end rounded-lg bg-white px-5.5 pt-5.5 pb-4.5 text-center text-harbor-navy lg:block">
        <img
          :src="imageUrl('line-qr.svg')"
          :alt="t('contact.qrAlt', { id: site.line.id })"
          width="200"
          height="200"
          loading="lazy"
          class="mx-auto block size-50"
        >
        <figcaption class="mt-3 text-[15px] font-medium">
          {{ t('contact.qrCaption') }}
        </figcaption>
      </figure>
    </div>
  </section>
</template>
