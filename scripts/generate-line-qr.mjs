// Makes the QR code of Approdo's LINE Official Account: public/images/line-qr.svg.
//
// The link is site.line.url in app/data/site.ts, the same link as every LINE button on the page; the
// colours are Harbor Navy on white from app/assets/css/tokens.css. `npm run generate` runs this script
// before it builds the site, so the QR code on the live site always holds the current link. The file
// is also committed, so `npm run dev` shows it too. Visitors' browsers never call a QR service.
//
// Run it on its own with `npm run qr`.
import { readFile, writeFile } from 'node:fs/promises'
// Node 22.18+ strips TypeScript types on import, so this reads the same data as the site.
import { site } from '../app/data/site.ts'
import { QUIET_ZONE, qrModules, qrSvg } from './lib/qr.ts'
import { readColor } from './lib/tokens.ts'

const outputFile = new URL('../public/images/line-qr.svg', import.meta.url)
const tokensCss = await readFile(new URL('../app/assets/css/tokens.css', import.meta.url), 'utf8')

const modules = qrModules(site.line.url)
const svg = qrSvg(modules, {
  color: readColor(tokensCss, 'harbor-navy'),
  background: readColor(tokensCss, 'white'),
  comment: `QR code of ${site.line.url}. Made by scripts/generate-line-qr.mjs: change app/data/site.ts, not this file.`,
})

await writeFile(outputFile, svg)
console.log(`Wrote public/images/line-qr.svg: ${modules.length}×${modules.length} modules + a quiet zone of ${QUIET_ZONE}, for ${site.line.url}`)
