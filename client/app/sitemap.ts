import type { MetadataRoute } from 'next'
import { API_BASE_URL } from '@/api/config'
import { GUIDE_SLUGS, LOCALES, SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = LOCALES.flatMap(locale => [
    { url: `${SITE_URL}/${locale}`, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${SITE_URL}/${locale}/gold`, changeFrequency: 'daily' as const, priority: .8 },
    { url: `${SITE_URL}/${locale}/opportunities`, changeFrequency: 'daily' as const, priority: .9 },
    { url: `${SITE_URL}/${locale}/about`, changeFrequency: 'monthly' as const, priority: .6 },
    ...GUIDE_SLUGS.map(slug => ({ url: `${SITE_URL}/${locale}/guides/${slug}`, changeFrequency: 'monthly' as const, priority: .7 })),
  ])
  try {
    const response = await fetch(`${API_BASE_URL}/api/items`, { next: { revalidate: 86400 } })
    if (!response.ok) return staticPaths
    const data = await response.json() as { items?: { uniqueName: string }[] }
    return [...staticPaths, ...(data.items || []).flatMap(item => LOCALES.map(locale => ({ url: `${SITE_URL}/${locale}/item/${encodeURIComponent(item.uniqueName)}`, changeFrequency: 'daily' as const, priority: .5 })))]
  } catch { return staticPaths }
}
