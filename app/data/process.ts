import type { ProcessStep, SectionHeading } from '../types/content'
import { callToAction, included, planDurations, terms } from './pricing'

export const processSection: SectionHeading = {
  heading: 'ขั้นตอนการทำงาน',
}

/**
 * The six steps, in the order the owner confirmed (brand.md "## เงื่อนไขงาน", Q3: 'ตามลำดับนี้').
 * Money, days and revision rounds come from app/data/pricing.ts; the words here are only the short
 * titles of the steps that are not in the price list.
 */
export const steps: ProcessStep[] = [
  {
    id: 'contact',
    title: 'ทักไลน์',
    details: [callToAction.ask],
  },
  {
    id: 'quote',
    title: 'ประเมินราคา',
    details: [terms.extraCost.quote],
  },
  {
    id: 'deposit',
    title: included.deposit,
    details: terms.payment,
  },
  {
    id: 'build',
    title: 'ทำเว็บ',
    details: [...planDurations, terms.dayCount, ...terms.content],
  },
  {
    id: 'revisions',
    title: included.revisions,
    details: terms.revisions,
  },
  {
    id: 'launch',
    title: included.launch,
    details: [terms.balance],
  },
]
