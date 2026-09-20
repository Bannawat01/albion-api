import ItemSearch from '@/components/ItemSearch'

export default function ItemPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Market Registry</p>
        <h1 className="mt-2 text-3xl font-bold text-gold-gradient">Albion Online Items</h1>
        <p className="mt-2 text-muted-foreground">Search items and compare live prices across every city.</p>
      </header>
      <ItemSearch />
    </main>
  )
}
