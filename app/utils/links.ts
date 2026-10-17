/** Attributes that make a link open in a new tab. */
export interface NewTabAttributes {
  target?: '_blank'
  rel?: 'noopener'
}

/**
 * Returns the attributes for a link: links to other sites (http:// or https://), such as LINE and the
 * sample websites, open in a new tab, while links to this page (#contact) open in place.
 *
 * Use it with v-bind: <a :href="href" v-bind="newTabAttributes(href)">.
 */
export function newTabAttributes(href: string): NewTabAttributes {
  return /^https?:\/\//i.test(href) ? { target: '_blank', rel: 'noopener' } : {}
}
