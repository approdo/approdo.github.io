<script setup lang="ts">
import { contactSection, onlyChannel } from '~/data/contact'
import { callToAction } from '~/data/pricing'
import { site } from '~/data/site'
import { joinTexts } from '~/utils/phrases'

const { t } = useI18n()

const callToActionText = joinTexts([callToAction.ask, callToAction.reply])
</script>

<template>
  <!-- A navy section: the focus ring turns orange here (navy on navy would not show). -->
  <section
    id="contact"
    class="bg-harbor-navy py-16 text-shore-cream lg:py-22 [&_:focus-visible]:outline-beacon-orange"
    aria-labelledby="contact-title"
  >
    <div class="page-container [&_h2]:text-white">
      <SectionHead
        section="contact"
        :content="contactSection"
      />
      <p class="text-[19px] font-medium">
        <PhraseText :text="callToActionText" />
      </p>
      <p class="mt-4">
        {{ t('contact.account') }} <span class="whitespace-nowrap">{{ site.line.name }}</span>
        <span class="block font-display text-[24px] font-semibold text-beacon-orange">{{ site.line.id }}</span>
      </p>
      <LineButton class="mt-6">
        {{ t('line.addFriend') }}
      </LineButton>
      <p class="mt-4 text-[15px]">
        {{ onlyChannel }}
      </p>
    </div>
  </section>
</template>
