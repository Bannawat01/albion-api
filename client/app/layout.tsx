import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from '../hooks/QueryProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import NavBar from '@/components/navBar'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Albion Market Ledger',
  description: 'Live Albion Online Asia market prices across every royal city.',
  icons: {
    icon: '/images/market-ledger-logo.png',
    apple: '/images/market-ledger-logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground flex flex-col min-h-screen font-sans antialiased">
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <NavBar />
              <main className="flex-1">{children}</main>
              <footer className="w-full bg-card/70 border-t border-primary/15 text-center px-4 py-6 mt-auto">
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
