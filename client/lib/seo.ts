export const SITE_URL = 'https://www.albion-market-ai.online'
export const LOCALES = ['th', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const isLocale = (value: string): value is Locale => LOCALES.includes(value as Locale)
export const alternateLanguages = (path = '') => ({ th: `/th${path}`, en: `/en${path}`, 'x-default': `/th${path}` })
export const GUIDE_SLUGS = ['market-price-freshness', 'trade-route-profit-tax', 'black-market-asia', 'gold-premium-asia'] as const
export const COPY = {
  th: { title: 'ราคา Albion Online Asia วันนี้ – เช็คราคาทุกเมือง', description: 'เช็คราคาล่าสุดที่ผู้เล่นรายงานจากทุกเมืองบน Albion Online Asia ดูความสดของข้อมูล และหาเส้นทางซื้อขายหลังหักภาษี', eyebrow: 'เครื่องมือราคาตลาด Asia สำหรับผู้เล่นไทย', lead: 'ค้นหาสินค้า เปรียบเทียบราคาทุกเมือง และวางแผนเส้นทางซื้อขายจากข้อมูลที่ผู้เล่นส่งผ่าน Albion Online Data Project', search: 'ค้นหาราคาสินค้า', note: 'ราคาไม่ใช่ข้อมูลสดจากเกม โปรดตรวจเวลา Fresh/Old ก่อนซื้อขาย' },
  en: { title: 'Albion Online Asia Market Prices & Trade Routes', description: 'Compare player-reported Albion Online Asia prices, check data freshness, and plan trade routes after tax across every major city.', eyebrow: 'Asia Price & Trade Finder', lead: 'Search items, compare every city, and plan trades with player-reported data from the Albion Online Data Project.', search: 'Market search', note: 'Prices are not live game data. Check the Fresh/Old timestamp before trading.' },
} as const
