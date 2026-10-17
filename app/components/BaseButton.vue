<script setup lang="ts">
/**
 * The site's button. With `href` it renders a link (#section or another site); without, a
 * <button type="button">. Other attributes (target, rel, aria-label) pass through to the element.
 */
type ButtonVariant = 'primary' | 'outline'

const props = withDefaults(defineProps<{
  href?: string
  /** 'primary' (orange, the LINE buttons) for the main call to action of a group, 'outline' for the others. */
  variant?: ButtonVariant
}>(), {
  href: undefined,
  variant: 'primary',
})

const tag = computed(() => (props.href ? 'a' : 'button'))

// Only the button's own colours fade, not the focus ring (lesson G-015): Tailwind's ready-made class
// for fading colours also fades `outline-color`, so the ring would first show in the text colour.
// The orange button has navy text: white on orange is not readable (brand.md).
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-beacon-orange bg-beacon-orange text-harbor-navy hover:border-harbor-navy hover:bg-harbor-navy hover:text-white',
  outline: 'border-harbor-navy bg-transparent text-harbor-navy hover:bg-harbor-navy hover:text-white',
}
</script>

<template>
  <component
    :is="tag"
    :href="href"
    :type="href ? undefined : 'button'"
    class="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full border-2 px-6 text-[17px] leading-none font-medium whitespace-nowrap no-underline transition-[color,background-color,border-color] duration-150"
    :class="variantClasses[variant]"
  >
    <slot />
  </component>
</template>
