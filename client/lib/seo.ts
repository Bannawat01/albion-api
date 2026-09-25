export const SITE_URL = 'https://www.albion-market-ai.online'
export const LOCALES = ['th', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const isLocale = (value: string): value is Locale => LOCALES.includes(value as Locale)
export const alternateLanguages = (path = '') => ({ th: `/th${path}`, en: `/en${path}`, 'x-default': `/th${path}` })
export const GUIDE_SLUGS = ['market-price-freshness', 'trade-route-profit-tax', 'black-market-asia', 'gold-premium-asia'] as const
export const POPULAR_ITEM_IDS = ['T4_BAG', 'T5_BAG', 'T6_BAG', 'T7_BAG', 'T4_CAPE', 'T5_CAPE', 'T6_CAPE', 'T4_METALBAR', 'T5_METALBAR', 'T6_METALBAR', 'T4_PLANKS', 'T5_PLANKS', 'T6_CLOTH', 'T6_LEATHER', 'T6_STONEBLOCK'] as const
export const COPY = {
  th: { title: 'เช็คราคา Albion Online Asia ทุกเมือง', description: 'เช็คราคา Albion Online Asia ที่ผู้เล่นรายงาน เปรียบเทียบทุกเมือง ดูประวัติราคา และหาเส้นทางซื้อขายทำกำไรหลังหักภาษี', eyebrow: 'เครื่องมือราคาตลาด Asia สำหรับผู้เล่นไทย', lead: 'ค้นหาสินค้า เปรียบเทียบราคาทุกเมือง และวางแผนเส้นทางซื้อขายจากข้อมูลที่ผู้เล่นส่งผ่าน Albion Online Data Project', search: 'ค้นหาราคาสินค้า', note: 'ราคาไม่ใช่ข้อมูลสดจากเกม โปรดตรวจเวลา Fresh/Old ก่อนซื้อขาย' },
  en: { title: 'Albion Online Asia Market Prices & Trade Routes', description: 'Compare player-reported Albion Online Asia prices, check data freshness, and plan trade routes after tax across every major city.', eyebrow: 'Asia Price & Trade Finder', lead: 'Search items, compare every city, and plan trades with player-reported data from the Albion Online Data Project.', search: 'Market search', note: 'Prices are not live game data. Check the Fresh/Old timestamp before trading.' },
} as const
