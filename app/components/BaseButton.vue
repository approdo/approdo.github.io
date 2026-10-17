<script setup lang="ts">
/**
 * The site's button. With `href` it renders a link (#section or another site); without, a
 * <button type="button">. Other attributes (target, rel, aria-label) pass through to the element.
 */
type ButtonVariant = 'primary' | 'outline'
type ButtonSize = 'md' | 'sm'

const props = withDefaults(defineProps<{
  href?: string
  /** 'primary' (orange, the LINE buttons) for the main call to action of a group, 'outline' for the others. */
  variant?: ButtonVariant
  /** 'md' (52px high) in the page, 'sm' (44px) in the header, the questions and the website cards. */
  size?: ButtonSize
  /** The button sits on a navy background: a primary button turns cream on hover instead of navy. */
  onNavy?: boolean
}>(), {
  href: undefined,
  variant: 'primary',
  size: 'md',
  onNavy: false,
})

const tag = computed(() => (props.href ? 'a' : 'button'))

const sizeClasses: Record<ButtonSize, string> = {
  md: 'min-h-13 px-7 text-[18px]',
  sm: 'min-h-11 px-5 text-[16px]',
}

// The orange button has navy text: white on orange is not readable (brand.md). The outline button is
// used on light backgrounds only.
const variantClasses = computed(() => {
  if (props.variant === 'outline') return 'border-harbor-navy bg-transparent text-harbor-navy hover:bg-harbor-navy hover:text-white'
  const hover = props.onNavy
    ? 'hover:border-shore-cream hover:bg-shore-cream hover:text-harbor-navy'
    : 'hover:border-harbor-navy hover:bg-harbor-navy hover:text-white'
  return `border-beacon-orange bg-beacon-orange text-harbor-navy ${hover}`
})
</script>

<template>
  <!--
    Only the button's own colours fade, not the focus ring (lesson G-015): Tailwind's ready-made class
    for fading colours also fades `outline-color`, so the ring would first show in the text colour.
  -->
  <component
    :is="tag"
    :href="href"
    :type="href ? undefined : 'button'"
    class="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full border-2 leading-none font-medium whitespace-nowrap no-underline transition-[color,background-color,border-color] duration-150"
    :class="[sizeClasses[size], variantClasses]"
  >
    <slot />
  </component>
</template>
