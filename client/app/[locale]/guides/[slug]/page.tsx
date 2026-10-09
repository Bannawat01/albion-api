import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GUIDE_SLUGS, alternateLanguages, breadcrumbJsonLd, faqJsonLd, isLocale, jsonLdScript } from '@/lib/seo'
import { guides, LAST_CHECKED } from '@/lib/guides'

export function generateStaticParams() { return ['th', 'en'].flatMap(locale => GUIDE_SLUGS.map(slug => ({ locale, slug }))) }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale) || !guides[locale][slug]) return {}
  const guide = guides[locale][slug]
  return { title: guide.title, description: guide.description, alternates: { canonical: `/${locale}/guides/${slug}`, languages: alternateLanguages(`/guides/${slug}`) }, openGraph: { title: guide.title, description: guide.description, url: `/${locale}/guides/${slug}` } }
}
export default async function GuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isLocale(locale) || !guides[locale][slug]) notFound()
  const g = guides[locale][slug]
  const schemas = [faqJsonLd(g.faq), breadcrumbJsonLd([{ name: 'Albion Market Ledger', path: `/${locale}` }, { name: locale === 'th' ? 'คู่มือ' : 'Guides', path: `/${locale}` }, { name: g.title, path: `/${locale}/guides/${slug}` }])]
  return <article className="container mx-auto max-w-3xl px-4 py-10" lang={locale}>
    {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }} />)}
    <p className="text-xs uppercase tracking-[.2em] text-primary">Albion Market Guide · Asia Server</p><h1 className="font-ledger mt-3 text-3xl font-bold text-gold-gradient sm:text-4xl">{g.title}</h1><p className="mt-4 text-lg leading-8 text-muted-foreground">{g.intro}</p>
    <p className="mt-4 text-xs text-muted-foreground">{locale === 'th' ? 'ตรวจข้อมูลล่าสุด' : 'Last checked'}: {LAST_CHECKED}</p>
    <p className="mt-2 text-xs text-muted-foreground">{locale === 'th' ? 'แหล่งข้อมูลราคา:' : 'Price data source:'} <a className="text-primary underline underline-offset-2" href="https://pow.albion-online-data.com/api" target="_blank" rel="noopener noreferrer">Albion Online Data Project API</a></p>
    {g.sections.map(section => <section key={section.title} className="ledger-panel mt-7 p-5"><h2 className="font-ledger text-xl font-semibold">{section.title}</h2><p className="mt-3 leading-7 text-muted-foreground">{section.body}</p></section>)}
    <section className="mt-8"><h2 className="font-ledger text-2xl font-semibold">FAQ</h2>{g.faq.map(item => <details key={item.q} className="market-details mt-3"><summary>{item.q}</summary><p className="pb-4 text-muted-foreground">{item.a}</p></details>)}</section>
    <Link href={g.href} className="nav-link nav-link-primary mt-8 inline-flex">{g.cta}</Link>
    <nav className="mt-8 border-t border-border pt-6" aria-label={locale === 'th' ? 'คู่มือที่เกี่ยวข้อง' : 'Related guides'}>
      <h2 className="font-ledger text-xl font-semibold">{locale === 'th' ? 'อ่านต่อ' : 'Read next'}</h2>
      <ul className="mt-3 flex flex-wrap gap-3">{GUIDE_SLUGS.filter(other => other !== slug).map(other => <li key={other}><Link className="text-primary underline underline-offset-2" href={`/${locale}/guides/${other}`}>{guides[locale][other].title}</Link></li>)}</ul>
    </nav>
  </article>
}
