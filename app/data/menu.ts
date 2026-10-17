/**
 * The sections the header menu links to, in this order. Each is the `id` of a section on the page
 * (app/components/*Section.vue), and its menu label is `nav.<id>` in i18n/locales/th.json.
 * The sections are numbered 01, 02, ... in this order too.
 *
 * To leave a section out of the site, remove it here and its component from app/pages/index.vue.
 */
export const menuSections = ['work', 'pricing', 'process', 'faq', 'contact'] as const

export type MenuSection = typeof menuSections[number]
