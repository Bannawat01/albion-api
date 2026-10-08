'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  page: number
  totalPages: number
  isFetching?: boolean
  onChange: (page: number) => void
  hrefForPage?: (page: number) => string
  locale?: 'th' | 'en'
}

export default function PaginationControls({ page, totalPages, isFetching, onChange, hrefForPage, locale = 'en' }: Props) {
  const th = locale === 'th'
  const router = useRouter()
  const [jump, setJump] = useState(String(page))
  useEffect(() => setJump(String(page)), [page])
  const go = (next: number) => {
    if (!Number.isInteger(next) || next < 1 || next > totalPages || next === page || isFetching) return
    onChange(next)
    if (hrefForPage) router.push(hrefForPage(next))
  }

  return <nav aria-label={th ? 'เปลี่ยนหน้าสินค้า' : 'Item pages'} className="flex flex-col gap-3 border-t border-primary/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{th ? `หน้า ${page.toLocaleString()} จาก ${totalPages.toLocaleString()}` : `Page ${page.toLocaleString()} of ${totalPages.toLocaleString()}`}</span><span className="ml-2 hidden text-xs sm:inline">{th ? 'ใช้ช่องขวาเพื่อข้ามไปหน้าที่ต้องการ' : 'Jump to any page'}</span></p>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => go(page - 1)} disabled={page <= 1 || isFetching} className="nav-link min-h-11 justify-center disabled:cursor-not-allowed disabled:opacity-40" aria-label={th ? 'หน้าก่อนหน้า' : 'Previous page'}><ChevronLeft className="h-4 w-4" /><span>{th ? 'ก่อนหน้า' : 'Previous'}</span></button>
      <button type="button" onClick={() => go(page + 1)} disabled={page >= totalPages || isFetching} className="nav-link min-h-11 justify-center disabled:cursor-not-allowed disabled:opacity-40" aria-label={th ? 'หน้าถัดไป' : 'Next page'}><span>{th ? 'ถัดไป' : 'Next'}</span><ChevronRight className="h-4 w-4" /></button>
      <form onSubmit={event => { event.preventDefault(); go(Number(jump)) }} className="ml-0 flex items-center gap-2 sm:ml-2">
        <label htmlFor="page-jump" className="sr-only">{th ? 'ไปหน้าที่' : 'Go to page'}</label>
        <input id="page-jump" type="number" inputMode="numeric" min="1" max={totalPages} step="1" value={jump} onChange={event => setJump(event.target.value)} className="trade-control !h-11 !w-20 text-center" />
        <button type="submit" disabled={isFetching || !Number.isInteger(Number(jump)) || Number(jump) < 1 || Number(jump) > totalPages} className="nav-link min-h-11 justify-center border-primary/35 disabled:cursor-not-allowed disabled:opacity-40">{th ? 'ไป' : 'Go'}</button>
      </form>
    </div>
  </nav>
}
