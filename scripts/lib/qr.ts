/**
 * QR codes for the site, drawn as SVG at build time (scripts/generate-line-qr.mjs), so the page never
 * asks an outside QR service for an image.
 *
 * The modules come from qrcode-generator (MIT licence, a devDependency: its code is not shipped with
 * the site). The SVG is written here, so its colours, quiet zone and size are under our control.
 *
 * TypeScript that Node 22.18+ runs as it is (it strips the types), like scripts/lib/tokens.ts.
 */
import qrcode from 'qrcode-generator'

/** The quiet zone that QR readers need around the code: 4 modules on every side (ISO/IEC 18004). */
export const QUIET_ZONE = 4

/**
 * The modules of the QR code for `text`: modules[row][column] is true for a dark module.
 * Error correction level M (about 15% of the code can be damaged); the smallest version that fits.
 */
export function qrModules(text: string): boolean[][] {
  const code = qrcode(0, 'M')
  code.addData(text, 'Byte')
  code.make()
  const size = code.getModuleCount()
  return Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => code.isDark(row, column)))
}

export interface QrSvgOptions {
  /** Colour of the dark modules, #rrggbb. */
  color: string
  /** Colour of the light modules and the quiet zone, #rrggbb. */
  background: string
  /** A comment written at the top of the file. */
  comment?: string
}

/** Size in pixels that the SVG file gives itself (8px per module); the page sets its own size. */
const PIXELS_PER_MODULE = 8

/**
 * The QR code as an SVG file: one unit per module, the quiet zone included in the viewBox, so the
 * image can be shown at any size. Each run of dark modules in a row is one rectangle of the path.
 */
export function qrSvg(modules: readonly (readonly boolean[])[], { color, background, comment }: QrSvgOptions): string {
  const side = modules.length + 2 * QUIET_ZONE
  const runs: string[] = []
  modules.forEach((row, rowIndex) => {
    let column = 0
    while (column < row.length) {
      if (!row[column]) {
        column++
        continue
      }
      const start = column
      while (column < row.length && row[column]) column++
      runs.push(`M${start + QUIET_ZONE} ${rowIndex + QUIET_ZONE}h${column - start}v1h-${column - start}z`)
    }
  })

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${side * PIXELS_PER_MODULE}" height="${side * PIXELS_PER_MODULE}" viewBox="0 0 ${side} ${side}" shape-rendering="crispEdges">`,
    ...(comment ? [`<!-- ${comment.replaceAll('--', '- -')} -->`] : []),
    `<rect width="${side}" height="${side}" fill="${background}"/>`,
    `<path fill="${color}" d="${runs.join('')}"/>`,
    '</svg>',
    '',
  ].join('\n')
}
