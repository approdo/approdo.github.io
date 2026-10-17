import type { Faq, SectionHeading } from '../types/content'
import { joinTexts } from '../utils/phrases'
import { included, launchOffer, launchTerms, planDurations, plans, terms } from './pricing'
import { hero } from './hero'

export const faqSection: SectionHeading = {
  heading: 'คำถามที่พบบ่อย',
  intro: ['ไม่เจอคำตอบที่ต้องการ ', 'ทักไลน์ถามได้เลยครับ'],
}

const customSystem = plans.find(plan => plan.id === 'custom-system')!

/**
 * The questions in the order a client asks them: before hiring, during the work, after hand-over.
 * The first two are open when the page loads. Every answer is put together from brand.md (via
 * app/data/hero.ts and app/data/pricing.ts); only the questions are written here.
 */
export const faqs: Faq[] = [
  {
    id: 'kinds',
    question: ['รับทำเว็บ', 'แบบไหนบ้าง'],
    answer: [joinTexts([hero.positioning, customSystem.detail, ['ทุกแบบ', `${included.mobile}ครับ`]])],
    open: true,
  },
  {
    id: 'duration',
    question: 'ใช้เวลากี่วัน',
    answer: [...planDurations, terms.dayCount],
    open: true,
  },
  {
    id: 'payment',
    question: ['ต้องจ่ายเงิน', 'ตอนไหน'],
    answer: [included.deposit, terms.balance],
  },
  {
    id: 'hosting',
    question: ['ค่าโดเมน / hosting ', 'รวมในราคาไหม'],
    answer: terms.hosting,
  },
  {
    id: 'revisions',
    question: 'แก้งานได้กี่รอบ',
    answer: [included.revisions, ...terms.revisions],
  },
  {
    id: 'later-edits',
    question: ['ส่งงานแล้ว', 'ขอแก้ข้อมูล', 'ทีหลังได้ไหม'],
    answer: [terms.laterEdits],
  },
  {
    id: 'hand-over',
    question: ['ส่งงานแล้ว', 'ได้อะไรบ้าง'],
    answer: [terms.ownership],
  },
  {
    id: 'launch-terms',
    question: ['ราคาเปิดตัว', 'มีเงื่อนไขอะไร'],
    answer: [joinTexts([launchOffer, '—', launchTerms.text])],
  },
]
