import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Albion Market Ledger',
    short_name: 'Market Ledger',
    description: 'Albion Online Asia market prices and profitable trade routes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0c0a',
    theme_color: '#0d0c0a',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  }
}
