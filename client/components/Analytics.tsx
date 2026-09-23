'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/analytics'

export default function Analytics() {
  const pathname = usePathname()
  useEffect(() => track('page_view'), [pathname])
  return null
}
