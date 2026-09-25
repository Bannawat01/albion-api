export const SITE_URL = 'https://www.albion-market-ai.online'
export const LOCALES = ['th', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const isLocale = (value: string): value is Locale => LOCALES.includes(value as Locale)
export const alternateLanguages = (path = '') => ({ th: `/th${path}`, en: `/en${path}`, 'x-default': `/th${path}` })
export const GUIDE_SLUGS = ['market-price-freshness', 'trade-route-profit-tax', 'black-market-asia', 'gold-premium-asia'] as const
export const POPULAR_ITEM_IDS = ['T4_BAG', 'T5_BAG', 'T6_BAG', 'T7_BAG', 'T4_CAPE', 'T5_CAPE', 'T6_CAPE', 'T4_METALBAR', 'T5_METALBAR', 'T6_METALBAR', 'T4_PLANKS', 'T5_PLANKS', 'T6_CLOTH', 'T6_LEATHER', 'T6_STONEBLOCK'] as const
export const POPULAR_ITEM_NAMES: Record<string, string> = {
  T4_BAG: "Adept's Bag", T5_BAG: "Expert's Bag", T6_BAG: "Master's Bag", T7_BAG: "Grandmaster's Bag",
  T4_CAPE: "Adept's Cape", T5_CAPE: "Expert's Cape", T6_CAPE: "Master's Cape",
  T4_METALBAR: 'Steel Bar', T5_METALBAR: 'Titanium Steel Bar', T6_METALBAR: 'Runite Steel Bar',
  T4_PLANKS: 'Pine Planks', T5_PLANKS: 'Cedar Planks', T6_CLOTH: 'Lavish Cloth',
  T6_LEATHER: 'Hardened Leather', T6_STONEBLOCK: 'Slate Block',
}
export const COPY = {
  th: { title: 'เช็คราคา Albion Online Asia ทุกเมือง', description: 'เช็คราคาไอเทม Albion Online Asia ที่ผู้เล่นรายงาน เปรียบเทียบราคาทุกเมือง ดูเวลาอัปเดต และหาเส้นทางซื้อขายพร้อมกำไรประมาณหลังหักภาษี', eyebrow: 'เครื่องมือราคาตลาด Asia สำหรับผู้เล่นไทย', lead: 'เช็คราคาไอเทม Albion Online Asia ทุกเมือง ดูว่าแต่ละราคามีผู้เล่นรายงานเมื่อไร แล้วเปรียบเทียบเมืองเพื่อวางแผนซื้อขาย ข้อมูลมาจาก Albion Online Data Project และอาจต่างจากราคาในเกม', search: 'ค้นหาราคาสินค้า', note: 'ราคาไม่ใช่ข้อมูลสดจากเกม โปรดตรวจเวลา Fresh/Old ก่อนซื้อขาย' },
  en: { title: 'Albion Online Asia Market Prices & Trade Routes', description: 'Check player-reported Albion Online Asia item prices in every city, compare update times, and estimate after-tax trade routes.', eyebrow: 'Asia Price & Trade Finder', lead: 'Check Albion Online Asia item prices by city, see when each price was reported, and compare markets before planning a trade. Reports come from the Albion Online Data Project and may differ from in-game prices.', search: 'Market search', note: 'Prices are not live game data. Check the Fresh/Old timestamp before trading.' },
} as const
