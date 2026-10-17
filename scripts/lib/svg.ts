/**
 * Helpers for Approdo's logo files, for the brand-images script and the unit tests.
 *
 * The files of the brand kit (Demo-story/_brand/approdo/*.svg) carry a C2PA manifest in a <metadata>
 * element. It describes where the file came from and draws nothing, so the copies in
 * public/images/brand/ leave it out.
 *
 * Plain TypeScript without imports: Node 22.18+ runs it as it is (it strips the types), and
 * Vitest and `nuxt typecheck` read it like any other TypeScript file.
 */

/** The SVG text without its <metadata> elements; everything else stays exactly as written. */
export function removeMetadata(svg: string): string {
  return svg.replace(/<metadata>[\s\S]*?<\/metadata>/g, '')
}

/**
 * What an SVG file draws, to compare two files: the text without <metadata> and without any
 * whitespace. Two files with the same drawing give the same string.
 */
export function svgDrawing(svg: string): string {
  return removeMetadata(svg).replace(/\s+/g, '')
}
