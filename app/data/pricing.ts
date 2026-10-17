import type { LabelledList, PricePlan, SectionHeading, TermsBox } from '../types/content'

/**
 * Prices and terms of work: the ONLY file with prices, the deposit, revision rounds, domain and
 * server costs. Every other part of the page (hero, process, FAQ) imports them from here, so a price
 * change is made once.
 *
 * Everything is word for word from the brand file, Demo-story/_brand/approdo/brand.md, in the story
 * repository (brand-site decisions D-003 and D-006):
 * - "## ราคา": the auto-reply of the LINE Official Account (keyword ราคา / แพ็กเกจ / สนใจ); the emoji
 *   and the circled numbers of the LINE message are left out.
 * - "## เงื่อนไขงาน": the owner's answers to questions Q1–Q9 (2026-10-17). An answer the owner wrote
 *   as several parts with ' · ' is a list here, one entry per part.
 *
 * Rules for editing: change no word, including the en dash in ranges (3–5, U+2013) and the comma in
 * 1,500. Thai text is a list of phrases where a line may break only between two phrases (lesson G-007);
 * joined, the phrases are the original text. Never split a price or a range across two phrases.
 */

export const pricingSection: SectionHeading = {
  heading: 'บริการและราคา',
}

// ---------------------------------------------------------------------------------------------
// brand.md "## ราคา"
// ---------------------------------------------------------------------------------------------

/** First line of the price list: the launch offer. */
export const launchOffer = ['ราคาเปิดตัว ', '5 ลูกค้าแรก']

/** The three packages, in the order of the price list. */
export const plans: PricePlan[] = [
  {
    id: 'landing-page',
    name: 'เว็บหน้าเดียว',
    detail: '(Landing Page)',
    price: 'เริ่มต้น 1,500 บาท',
    duration: '3–5 วัน',
  },
  {
    id: 'multi-page',
    name: 'เว็บหลายหน้า',
    detail: '(บริษัท / ร้านค้า 3–5 หน้า)',
    price: 'เริ่มต้น 3,500 บาท',
    duration: '7–10 วัน',
  },
  {
    id: 'custom-system',
    name: 'ระบบเฉพาะงาน',
    detail: '(จองคิว ฟอร์ม หลังบ้าน)',
    price: 'ประเมินราคาตามงาน',
  },
]

/** How long each package with a fixed time takes, e.g. ['เว็บหน้าเดียว ', '3–5 วัน']. */
export const planDurations = plans
  .filter(plan => plan.duration)
  .map(plan => [`${plan.name} `, plan.duration!])

/** What every package includes, one by one, so the process and the FAQ can name each of them. */
export const included = {
  mobile: 'รองรับมือถือ',
  launch: 'ขึ้นเว็บให้พร้อมใช้',
  revisions: 'แก้ 2 รอบ',
  deposit: 'มัดจำ 50%',
}

/** "ทุกแบบ:" and what every package includes, in the order of the price list. */
export const allPlans: LabelledList = {
  label: 'ทุกแบบ:',
  items: [included.mobile, included.launch, included.revisions, included.deposit],
}

/** The condition of the launch prices. */
export const launchTerms = {
  label: 'เงื่อนไขราคาเปิดตัว:',
  text: ['ขอรีวิว', 'หลังส่งงาน ', 'และขอโชว์เป็นผลงาน'],
}

/**
 * The closing line of the price list, in two parts: what to tell in the first LINE message (also
 * step 01 of the process) and the reply. Show the whole line with joinTexts([ask, reply]).
 */
export const callToAction = {
  ask: ['บอกประเภทธุรกิจ', 'กับสิ่งที่อยากได้'],
  reply: 'เดี๋ยวประเมินให้ครับ',
}

// ---------------------------------------------------------------------------------------------
// brand.md "## เงื่อนไขงาน": the owner's answers, Q1–Q9
// ---------------------------------------------------------------------------------------------

export const terms = {
  /**
   * Q1 — when the other 50% is paid. The answer starts at 'เมื่อลูกค้า'; 'ส่วนที่เหลือ 50% จ่าย' in
   * front of it are words of the question, which D-006 allows as a lead-in.
   */
  balance: ['ส่วนที่เหลือ 50% ', 'จ่าย', 'เมื่อลูกค้า', 'ตรวจงานผ่าน ', 'ก่อนขึ้นเว็บจริง'],

  /** Q2 — domain, hosting and putting the site online: four parts. */
  hosting: [
    ['ค่าทำเว็บ', 'รวมการขึ้นเว็บแล้ว ', 'ลงบน hosting ', 'ที่ลูกค้ามีอยู่ ', 'หรือเราตั้ง ', 'hosting ฟรี', 'ในชื่อลูกค้าให้'],
    ['โดเมนจด', 'ในชื่อลูกค้า ', 'ลูกค้าจ่ายเอง', 'ตามจริง ', '(.com ราว 450 บาท/ปี)'],
    ['ระบบที่มีหลังบ้าน', 'มีค่า server ', 'ตามจริง ', '0–169 บาท/เดือน'],
    ['มีบริการดูแลต่อ', 'รายปี / รายเดือน ', 'ทักไลน์สอบถาม'],
  ],

  /**
   * Q3 — how the working days are counted. Its first part, 'ตามลำดับนี้', confirmed the order of the
   * steps in app/data/process.ts and is not shown as text.
   */
  dayCount: ['เริ่มนับหลัง', 'ได้รับมัดจำ', 'และข้อมูลครบ ', 'นับเป็นวันทำการ'],

  /** Q4 — who prepares the texts and pictures of the client's site: two parts. */
  content: [
    ['ลูกค้าส่ง', 'ข้อความและรูป ', 'ช่วยเรียบเรียง', 'ข้อความให้ได้'],
    ['ไม่มีรูป', 'จะหารูปฟรี', 'ที่ใช้เชิงพาณิชย์ได้ให้'],
  ],

  /** Q5 — what counts as one round of revisions, and the price of more rounds: two parts. */
  revisions: [
    ['1 รอบ = ', 'รวมรายการแก้', 'ส่งมาครั้งเดียว'],
    ['รอบที่ 3 ขึ้นไป', 'รอบละ 300 บาท'],
  ],

  /** Q6 — small changes after the site is delivered. */
  laterEdits: ['แก้เล็ก ', '(ข้อความ / รูป / ', 'ราคา / เวลาเปิด) ', 'ฟรี ', '7 วันหลังส่งงาน ', 'หลังจากนั้น', 'ครั้งละ 200 บาท ', 'หรือใช้บริการดูแลต่อ'],

  /** Q7 — when a "starting from" price goes up: the cases, then (after ' — ') the promise. */
  extraCost: {
    cases: ['เกินจำนวนหน้า', 'ในแพ็กเกจ, ', '2 ภาษา, ', 'มีฟอร์มส่งข้อมูล, ', 'ให้เขียนข้อความทั้งหมด'],
    quote: ['ประเมินราคาให้', 'ก่อนเริ่มงานทุกครั้ง'],
  },

  /** Q8 — what the client owns and gets at hand-over. */
  ownership: ['ลูกค้าเป็นเจ้าของ', 'โดเมน ', 'ไฟล์เว็บ ', 'และข้อมูลทั้งหมด ', 'ส่งมอบไฟล์', 'และบัญชีให้ครบ'],

  /** Q9 — how to pay and which documents are issued: three parts. No account numbers on the site. */
  payment: ['โอนธนาคาร / พร้อมเพย์', 'ออกใบเสร็จรับเงินได้', 'ไม่ออกใบกำกับภาษี'],
}

/**
 * The two boxes of terms under the price list. The headings are short labels taken from the
 * questions (Q7, Q2); the lines are the answers above.
 */
export const termsBoxes: TermsBox[] = [
  {
    id: 'extra-cost',
    heading: 'ราคาเริ่มต้นเพิ่มเมื่อ',
    // The cases, then the promise on a line of its own.
    lines: [terms.extraCost.cases, ['— ', ...terms.extraCost.quote]],
    bullets: false,
  },
  {
    id: 'hosting',
    heading: 'ค่าโดเมน / hosting',
    lines: terms.hosting,
    bullets: true,
  },
]
