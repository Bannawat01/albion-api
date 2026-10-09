export const SITE_URL = 'https://www.albion-market-ai.online'
export const LOCALES = ['th', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const isLocale = (value: string): value is Locale => LOCALES.includes(value as Locale)
export const alternateLanguages = (path = '') => ({ th: `/th${path}`, en: `/en${path}`, 'x-default': `/th${path}` })
export const GUIDE_SLUGS = ['market-price-freshness', 'trade-route-profit-tax', 'black-market-asia', 'gold-premium-asia'] as const
const SEO_TIERS = ['T4', 'T5', 'T6', 'T7', 'T8'] as const
const SEO_BASES = ['ORE', 'WOOD', 'HIDE', 'FIBER', 'ROCK', 'METALBAR', 'PLANKS', 'CLOTH', 'LEATHER', 'STONEBLOCK', 'BAG', 'CAPE']
const SEO_EXTRA = [
  'T3_MOUNT_HORSE', 'T4_MOUNT_HORSE', 'T5_MOUNT_ARMORED_HORSE', 'T4_MOUNT_OX', 'T5_MOUNT_OX', 'T6_MOUNT_OX', 'T7_MOUNT_OX', 'T8_MOUNT_OX',
  'T4_POTION_HEAL', 'T6_POTION_HEAL', 'T4_POTION_ENERGY', 'T6_POTION_ENERGY',
  'T4_MAIN_SWORD', 'T5_MAIN_SWORD', 'T6_MAIN_SWORD', 'T4_2H_CLAYMORE', 'T5_2H_CLAYMORE', 'T6_2H_CLAYMORE',
  'T4_MAIN_CURSEDSTAFF', 'T5_MAIN_CURSEDSTAFF', 'T6_MAIN_CURSEDSTAFF', 'T4_2H_BOW', 'T5_2H_BOW', 'T6_2H_BOW',
  'T4_ARMOR_LEATHER_SET1', 'T5_ARMOR_LEATHER_SET1', 'T6_ARMOR_LEATHER_SET1', 'T4_ARMOR_CLOTH_SET1', 'T5_ARMOR_CLOTH_SET1', 'T6_ARMOR_CLOTH_SET1',
  'T4_ARMOR_PLATE_SET1', 'T5_ARMOR_PLATE_SET1', 'T6_ARMOR_PLATE_SET1',
]
// Programmatic SEO: every ID here becomes an indexable /{locale}/item/{id} landing page in sitemap.ts.
export const POPULAR_ITEM_IDS: readonly string[] = [...new Set([...SEO_TIERS.flatMap(tier => SEO_BASES.map(base => `${tier}_${base}`)), ...SEO_EXTRA])]
export type ItemGroup = 'bag' | 'cape' | 'mount' | 'potion' | 'weapon' | 'armor' | 'material'
export function itemGroup(id: string): ItemGroup {
  if (id.includes('_BAG')) return 'bag'
  if (id.includes('_CAPE')) return 'cape'
  if (id.includes('_MOUNT_')) return 'mount'
  if (id.includes('_POTION_')) return 'potion'
  if (/_(MAIN|2H|OFF)_/.test(id)) return 'weapon'
  if (id.includes('_ARMOR_') || id.includes('_HEAD_') || id.includes('_SHOES_')) return 'armor'
  return 'material'
}
export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: `${SITE_URL}${item.path}` })),
})
export const faqJsonLd = (faq: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
})
// Escape "<" so JSON-LD embedded in a <script> tag can never close the tag early.
export const jsonLdScript = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
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
