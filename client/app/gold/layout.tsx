import type { Metadata } from 'next'

export const metadata: Metadata = { alternates: { canonical: '/th/gold' }, robots: { index: false, follow: true } }
export default function GoldLayout({ children }: { children: React.ReactNode }) { return children }
