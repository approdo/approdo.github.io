<script setup lang="ts">
import type { SystemDemo } from '~/types/content'

/**
 * The clip of the shop's side of a demo (a WebM file made by `npm run record-clip`) in a phone frame, with
 * a round play / pause button on the frame's edge (design v1.1.0 §3.3, decisions D-016 and D-021):
 *
 * - The video is muted and loops. It downloads nothing before it first plays (preload="none"); its poster,
 *   a frame of its first second, is shown until then and in its place.
 * - It plays by itself while at least half of it is on the screen, and pauses when it leaves, unless the
 *   visitor asks for less motion (prefers-reduced-motion): then it stays the still poster, and nothing is
 *   downloaded until the visitor presses play.
 * - The button says what the video really does: "เล่นคลิป" until the video is playing (its `playing`
 *   event), "หยุดคลิป" from then on. A visitor who stops the clip keeps it stopped, also after scrolling
 *   away and back (WCAG 2.2.2).
 * - The button is hidden in the pre-rendered page, in a browser that cannot play WebM (an iPhone before
 *   iOS 17.4) and after an error while loading: the poster is the clip there.
 */
defineProps<{
  clip: SystemDemo['clip']
  /** The size of the video in pixels, so the page keeps its room before the poster loads. */
  width: number
  height: number
}>()

const { app } = useRuntimeConfig()
const video = useTemplateRef<HTMLVideoElement>('video')

/** The browser can play the clip: the button shows. */
const canPlay = ref(false)
/** What the video is doing: 'playing' only between its `playing` and `pause` events. */
const state = ref<'paused' | 'playing'>('paused')
/** The visitor pressed "หยุดคลิป": the clip does not start by itself again. */
let stoppedByVisitor = false
let observer: IntersectionObserver | undefined

function play() {
  // A play() that the browser refuses leaves the button at "เล่นคลิป".
  video.value?.play().catch(() => {})
}

function toggle() {
  if (state.value === 'playing') {
    stoppedByVisitor = true
    video.value?.pause()
  }
  else {
    stoppedByVisitor = false
    play()
  }
}

function stopForGood() {
  canPlay.value = false
  observer?.disconnect()
}

onMounted(() => {
  const element = video.value
  if (!element || element.canPlayType('video/webm; codecs="vp8"') === '') return
  // The pre-rendered attribute already mutes it; a muted video may start without a click.
  element.muted = true
  canPlay.value = true

  const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  observer = new IntersectionObserver((entries) => {
    const entry = entries.at(-1)!
    const inView = entry.isIntersecting && entry.intersectionRatio >= 0.5
    if (inView && !stoppedByVisitor && !lessMotion.matches) play()
    // Leaving the screen is not the visitor's choice: the clip may start again when it comes back.
    else if (!inView && !element.paused) element.pause()
  }, { threshold: [0, 0.5] })
  observer.observe(element)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="relative w-full">
    <div class="phone-frame">
      <video
        ref="video"
        :src="`${app.baseURL}${clip.video}`"
        :poster="`${app.baseURL}${clip.poster}`"
        muted
        loop
        playsinline
        preload="none"
        :width="width"
        :height="height"
        :aria-label="clip.label"
        class="block aspect-[390/844] h-auto w-full rounded-[23px] bg-white object-cover object-top"
        @playing="state = 'playing'"
        @pause="state = 'paused'"
        @error="stopForGood"
      />
    </div>
    <button
      type="button"
      :hidden="!canPlay"
      :data-state="state"
      :aria-label="state === 'playing' ? clip.pause : clip.play"
      class="absolute -right-2.5 bottom-6 z-1 grid size-11 cursor-pointer place-items-center rounded-full border-2 border-harbor-navy bg-shore-cream text-harbor-navy shadow-phone transition-[color,background-color,border-color] duration-150 hover:bg-white"
      @click="toggle"
    >
      <IconPause
        v-if="state === 'playing'"
        class="size-4.5"
      />
      <IconPlay
        v-else
        class="size-4.5"
      />
    </button>
  </div>
</template>
