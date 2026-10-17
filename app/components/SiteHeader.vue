<script setup lang="ts">
import { menuSections } from '~/data/menu'
import { site } from '~/data/site'

const { t } = useI18n()
const { app } = useRuntimeConfig()

// Below 1024px the menu is a panel that the "menu" button opens under the header.
// From 1024px the whole menu sits in the header row and there is no button.
const { isOpen, toggle, close } = useMobileMenu()
const menuButton = useTemplateRef<HTMLButtonElement>('menuButton')

// Escape closes the open menu and puts the focus back on the menu button.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !isOpen.value) return
  close()
  menuButton.value?.focus()
}

// The open panel closes when the focus moves to an element outside the header, e.g. on Tab after
// the panel's last link. It stays open when the focus goes to no element at all (`relatedTarget`
// is null), e.g. after a tap on an empty part of the panel (lesson G-023).
function onFocusOut(event: FocusEvent) {
  const header = event.currentTarget as HTMLElement
  const nextFocus = event.relatedTarget
  if (isOpen.value && nextFocus instanceof Node && !header.contains(nextFocus)) close()
}

// Close the panel when the window gets wide enough for the full menu.
// 64rem is Tailwind's `lg` breakpoint (1024px), the one the template uses.
let desktopQuery: MediaQueryList | undefined

function onDesktopQueryChange(event: MediaQueryListEvent) {
  if (event.matches) close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  desktopQuery = window.matchMedia('(min-width: 64rem)')
  desktopQuery.addEventListener('change', onDesktopQueryChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  desktopQuery?.removeEventListener('change', onDesktopQueryChange)
  close()
})
</script>

<template>
  <header
    id="site-header"
    class="sticky top-0 z-50 border-b border-harbor-navy/14 bg-white"
    @focusout="onFocusOut"
  >
    <div class="page-container flex h-16 items-center gap-3">
      <!-- Named by its visible text, the wordmark. The mark is Approdo's logo file for light backgrounds. -->
      <a
        href="#top"
        class="mr-auto inline-flex min-h-11 min-w-0 items-center gap-2.5 text-harbor-navy no-underline"
        @click="close"
      >
        <img
          :src="`${app.baseURL}images/brand/mark-on-light.svg`"
          alt=""
          width="26"
          height="38"
          class="h-9.5 w-auto shrink-0"
        >
        <span class="font-display text-[26px] leading-none font-semibold">{{ site.name }}</span>
      </a>

      <!--
        The keyboard goes through the header in the order it is drawn, at every width (WCAG 2.4.3):
        - below 1024px: logo, menu button, then the menu it opens, so Tab after opening the menu
          goes straight to its first link (the panel is drawn under the header, out of this row);
        - from 1024px: logo, menu.
      -->
      <!-- The name stays the same whether the menu is open or closed; aria-expanded tells which. -->
      <button
        ref="menuButton"
        type="button"
        class="-mr-1.5 inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-sm text-harbor-navy transition-[background-color] duration-200 hover:bg-shore-cream lg:hidden"
        :aria-label="t('header.menuButton')"
        :aria-expanded="isOpen"
        aria-controls="site-nav"
        @click="toggle"
      >
        <IconX
          v-if="isOpen"
          class="size-6"
        />
        <IconMenu
          v-else
          class="size-6"
        />
      </button>

      <!-- In the open panel, pt-2 leaves room above the first link for its 6px focus ring (3px offset + 3px line). -->
      <nav
        id="site-nav"
        class="lg:static lg:mr-2 lg:block lg:max-h-none lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
        :class="isOpen
          ? 'fixed inset-x-0 top-16 z-49 max-h-[calc(100dvh-64px)] overflow-y-auto border-b border-harbor-navy/14 bg-white px-4 pt-2 pb-4 shadow-card'
          : 'hidden'"
        :aria-label="t('header.navLabel')"
      >
        <ul
          role="list"
          class="lg:flex lg:gap-6"
        >
          <li
            v-for="section in menuSections"
            :key="section"
          >
            <a
              :href="`#${section}`"
              class="flex min-h-14 items-center justify-between gap-4 border-b border-harbor-navy/14 text-[18px] whitespace-nowrap text-harbor-navy no-underline lg:min-h-11 lg:border-0 lg:text-[16px] lg:decoration-beacon-orange lg:decoration-3 lg:underline-offset-8 lg:hover:underline"
              @click="close"
            >
              {{ t(`nav.${section}`) }}
              <IconChevronRight class="size-5 shrink-0 text-harbor-navy/78 lg:hidden" />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <!-- Dims the page under the open mobile menu. A click on it closes the menu. -->
  <div
    v-if="isOpen"
    class="fixed inset-x-0 top-16 bottom-0 z-48 bg-harbor-navy-deep/50 lg:hidden"
    aria-hidden="true"
    @click="close"
  />
</template>
