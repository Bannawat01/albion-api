import { BarChart3, Database, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  { title: 'Live market data', text: 'Compare item and gold prices using community market data.', icon: BarChart3 },
  { title: 'Fast item search', text: 'Search the Albion catalog and compare royal city prices.', icon: Database },
  { title: 'Secure sign-in', text: 'Google OAuth 2.0 with PKCE protects account access.', icon: ShieldCheck },
]

export default function AboutPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">The Royal Continent</p>
        <h1 className="mt-3 text-4xl font-bold text-gold-gradient">Albion Market Ledger</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          A focused market companion for checking prices before your next trade route.
        </p>
      </header>
      <section className="grid gap-5 md:grid-cols-3">
        {features.map(({ title, text, icon: Icon }) => (
          <Card key={title} className="glass-card">
            <CardHeader>
              <Icon className="h-7 w-7 text-primary" />
              <CardTitle className="pt-3">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{text}</CardContent>
          </Card>
        ))}
      </section>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        Albion Online is a trademark of Sandbox Interactive GmbH. This community project is not affiliated with Sandbox Interactive.
      </p>
    </main>
  )
}
