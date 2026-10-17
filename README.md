# Approdo — เว็บแบรนด์

เว็บของ **Approdo** รับทำเว็บ — "พาธุรกิจขึ้นฝั่งออนไลน์" ที่ https://approdo.github.io/ : ผลงาน ราคา ขั้นตอนการทำงาน คำถามที่พบบ่อย และปุ่มทักไลน์ (LINE OA เป็นช่องทางติดต่อเดียว)

หน้าเดียว ภาษาไทย — Nuxt 4 + Tailwind CSS 4 + `@nuxt/fonts`, build เป็นไฟล์ static ขึ้น GitHub Pages ที่รากของโดเมน (base path `/`). โครงเริ่มจาก template Site-starter

## ข้อมูลอยู่ที่ไหน

ข้อความทุกตัวมาจากไฟล์แบรนด์ของ Approdo — แก้ที่ไฟล์ข้อมูล ไม่แก้ใน component:

| ไฟล์ | มีอะไร |
|---|---|
| `app/data/site.ts` | ชื่อ, `title` + คำอธิบาย (ของ `<title>` / meta / ภาพตอนแชร์ลิงก์), `url` ของเว็บ, LINE OA, บรรทัด ©, น้ำหนักฟอนต์ |
| `app/data/pricing.ts` | **ราคาและเงื่อนไขงานทั้งหมด — ไฟล์เดียว** ตรงตัวอักษร (hero / ขั้นตอน / คำถาม import จากไฟล์นี้) |
| `app/data/hero.ts` | tagline, บริการ, ตำแหน่งแบรนด์ |
| `app/data/portfolio.ts` | ผลงาน (เว็บตัวอย่างของแบรนด์สมมติ) + คะแนน PageSpeed Insights พร้อมวันที่วัด + alt ของภาพหน้าจอ |
| `app/data/process.ts` / `faq.ts` | ขั้นตอนการทำงาน / คำถามที่พบบ่อย |
| `app/data/contact.ts`, `menu.ts` | หัวข้อส่วนติดต่อ / section ที่เมนูลิงก์ไป |
| `app/assets/css/tokens.css` | สี (Harbor Navy, Beacon Orange, Shore Cream, White), ฟอนต์ (IBM Plex Sans Thai, Outfit), มุมโค้ง, เงา |
| `public/images/brand/` | โลโก้ (ไฟล์จริงของแบรนด์ — ห้ามวาดใหม่) |
| `public/favicon.svg`, `apple-touch-icon.png`, `og-image.png` | ไอคอนแท็บ (= `mark.svg`), ไอคอนหน้าจอมือถือ 180×180, ภาพตอนแชร์ลิงก์ 1200×630 (ตัว A + "Approdo" + tagline) — สร้างจากโลโก้ด้วย `npm run brand-images` ไม่แก้มือ |
| `public/images/work/` | ภาพหน้าจอผลงาน (คอม + มือถือ, WebP) — สร้างด้วย `npm run capture-portfolio` |
| `public/images/line-qr.svg` | QR เพิ่มเพื่อน LINE OA — สร้างจาก `site.ts` ด้วย `npm run qr` (`npm run generate` สร้างใหม่ทุกครั้ง) |
| `i18n/locales/th.json` | ข้อความของปุ่ม / เมนู / ป้าย |

ข้อความไทยที่เป็น list เช่น `['บริการดี ', 'ใกล้บ้านคุณ']` = ขึ้นบรรทัดใหม่ได้เฉพาะระหว่างวลี ไม่ตัดกลางวลี; ช่องว่างระหว่างวลีใส่ท้ายวลีแรก

## คำสั่ง

ต้องมี Node 22.19 ขึ้นไป (`.nvmrc`)

| คำสั่ง | ทำอะไร |
|---|---|
| `npm ci` | ติดตั้ง dependency ตาม `package-lock.json` |
| `npx playwright install chromium` | ติดตั้ง Chromium ครั้งแรกครั้งเดียว (ใช้กับ e2e) |
| `npm run dev` | เปิดเว็บแบบแก้แล้วเห็นทันที |
| `npm run generate` | สร้าง QR ใหม่จากลิงก์ LINE แล้ว build เป็นไฟล์ static ลง `.output/public` (ต้องมี internet — ดาวน์โหลดฟอนต์) |
| `npm run qr` | สร้าง `public/images/line-qr.svg` จาก `site.line.url` (ไม่เรียกบริการ QR ภายนอก — หน้าเว็บโหลดไฟล์ของตัวเอง) |
| `npm run brand-images` | สร้าง `favicon.svg` / `apple-touch-icon.png` / `og-image.png` จากไฟล์โลโก้ใน `public/images/brand/` + สี / ฟอนต์ใน `tokens.css` + tagline (Chromium ของ Playwright, ต้องมี internet — โหลดฟอนต์จาก Google Fonts) — รันใหม่เมื่อโลโก้ / สี / tagline เปลี่ยน แล้วดูภาพก่อน commit |
| `npm run capture-portfolio` | ถ่ายภาพหน้าจอเว็บผลงานจาก URL ใน `portfolio.ts` (Chromium ของ Playwright, ปิด animation) → `public/images/work/` — รันใหม่เมื่อ URL เปลี่ยน แล้วดูภาพก่อน commit |
| `npm run preview` | เปิดผล build ที่ `http://localhost:4177/` |
| `npm run lint` / `npm run typecheck` | ตรวจรูปแบบโค้ด / type |
| `npm run test:unit` | unit test (Vitest) — กติกาของข้อมูล, contrast ของสีใน `tokens.css` |
| `npm run test:e2e` | e2e (Playwright) กับ preview ในเครื่อง port 4177 — รัน `npm run generate` ก่อน |
| `LIVE_URL=https://approdo.github.io/ npm run test:live` | e2e ชุดเดียวกันกับเว็บที่ขึ้นแล้ว |
| `npm run psi -- https://approdo.github.io/` | วัด PageSpeed Insights (mobile, 5 รอบ, median) ผลอยู่ใน `psi-results/` |
| `npm run check:site-url` | ตรวจ `site.url` ก่อน deploy |

ตรวจครบก่อน push (ทุกตัวต้อง exit 0):

```sh
npm run lint && npm run typecheck && npm run test:unit && npm run generate && npm run test:e2e
```

## deploy

workflow `.github/workflows/deploy.yml` ตรวจ lint / test / build ทุก push และ deploy `main` ขึ้น GitHub Pages (repo `approdo/approdo.github.io` → https://approdo.github.io/, Settings → Pages → Source = GitHub Actions)

repo นี้คุมรากของโดเมน `approdo.github.io`: ห้ามมี `robots.txt` ที่ `Disallow` และห้ามมีไฟล์ / โฟลเดอร์ชื่อเดียวกับ repo อื่นของ org (เช่น `Business-site/`) — จะบังเว็บนั้น

ไอคอนและโลโก้ LINE ที่ใช้: ดู [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)
