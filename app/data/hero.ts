import type { HeroContent } from '../types/content'

// The first screen of the page, from brand.md "## ชื่อและข้อความ": the tagline as the page's <h1>
// (two lines), the services line and the brand's positioning. The prices next to it come from
// app/data/pricing.ts. Thai lines are lists of phrases: a line may break only between two of them
// (lesson G-007).
export const hero: HeroContent = {
  tagline: ['พาธุรกิจ', 'ขึ้นฝั่งออนไลน์'],
  services: ['ออกแบบและพัฒนาเว็บไซต์ทุกรูปแบบ ', '· รองรับมือถือ โหลดไว'],
  positioning: ['ไม่จำกัดแค่ ', 'Landing Page — ', 'มีเว็บหน้าเดียว ', 'เว็บหลายหน้า ', 'และระบบเฉพาะงาน'],
}
