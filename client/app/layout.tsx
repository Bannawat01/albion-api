import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from '../hooks/QueryProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import NavBar from '@/components/navBar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Analytics from '@/components/Analytics'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.albion-market-ai.online'),
  applicationName: 'Albion Market Ledger',
  title: {
    default: 'ราคา Albion Online Asia วันนี้ | Albion Market Ledger',
    template: '%s | Albion Market Ledger',
  },
  description: 'เช็กราคา Albion Online Asia ทุกเมือง ดูประวัติราคา ปริมาณซื้อขาย และหาเส้นทางซื้อขายทำกำไร อัปเดตจากข้อมูลผู้เล่น',
  keywords: ['Albion Online market', 'Albion Asia price', 'ราคา Albion Online', 'ตลาด Albion', 'Albion trade route'],
  verification: { other: { 'msvalidate.01': '7E2B98BB58F4B63AE79EC39D08F4D4D6' } },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    alternateLocale: 'en_US',
    siteName: 'Albion Market Ledger',
    title: 'ราคา Albion Online Asia วันนี้',
    description: 'เปรียบเทียบราคาทุกเมือง ดูประวัติราคา และหาเส้นทางทำกำไรบน Asia Server',
    url: '/',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Albion Market Ledger' }],
  },
  twitter: {
    card: 'summary',
    title: 'ราคา Albion Online Asia วันนี้',
    description: 'เปรียบเทียบราคาทุกเมืองและหาเส้นทางทำกำไรบน Asia Server',
    images: ['/icon.png'],
  },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/icon.png', type: 'image/png', sizes: '512x512' }],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.webmanifest',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Albion Market Ledger',
  alternateName: 'Albion Market Asia',
  url: 'https://www.albion-market-ai.online/th',
  inLanguage: ['th', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.albion-market-ai.online/th?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const applicationData = {
  '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Albion Market Ledger',
  url: 'https://www.albion-market-ai.online/th', applicationCategory: 'GameApplication', operatingSystem: 'Any',
  description: 'Asia price and trade finder using player-reported Albion Online market data.', inLanguage: ['th', 'en'], isAccessibleForFree: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="dark">
      <head><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationData) }} /></head>
      <body className="bg-background text-foreground flex min-h-screen flex-col pb-16 font-sans antialiased md:pb-0">
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <NavBar />
              <Analytics />
              <main className="flex-1">{children}</main>
              <footer className="mt-auto w-full border-t border-primary/15 bg-card/60 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">&copy; 2026 Albion Market Ledger · Asia Server</p>
                <p className="text-xs text-muted-foreground/80 mt-2">
                  Powered by <a href="https://www.albion-online-data.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-2">Albion Online Data API</a>
                  <span className="mx-1.5">|</span>
                  <a href="https://wiki.albiononline.com/wiki/API:Render_service" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline underline-offset-2">Albion Online Render Service</a>
                </p>
              </footer>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
