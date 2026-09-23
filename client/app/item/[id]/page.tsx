import { redirect } from 'next/navigation'

export default async function ItemPricePage({ params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id).replace(/[^A-Za-z0-9_@]/g, '')
  redirect(`/th/item/${encodeURIComponent(id)}`)
}
