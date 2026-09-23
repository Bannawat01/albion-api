import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/auth/', '/login'] },
    sitemap: 'https://www.albion-market-ai.online/sitemap.xml',
  }
}
