import type { MetadataRoute } from 'next'
import { GUIDE_SLUGS, LOCALES, SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap(locale => [
    { url: `${SITE_URL}/${locale}`, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${SITE_URL}/${locale}/gold`, changeFrequency: 'daily' as const, priority: .8 },
    { url: `${SITE_URL}/${locale}/opportunities`, changeFrequency: 'daily' as const, priority: .9 },
    { url: `${SITE_URL}/${locale}/about`, changeFrequency: 'monthly' as const, priority: .6 },
    ...GUIDE_SLUGS.map(slug => ({ url: `${SITE_URL}/${locale}/guides/${slug}`, changeFrequency: 'monthly' as const, priority: .7 })),
  ])
}
