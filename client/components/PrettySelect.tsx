'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

type Option = { value: string; label: string }

export default function PrettySelect({ label, value, options, onChange, disabled = false }: { label: string; value: string; options: Option[]; onChange: (value: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const selected = options.find(option => option.value === value) ?? options[0]

  useEffect(() => {
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  return <div ref={root} className="relative">
    <button type="button" className="trade-control flex items-center justify-between gap-2 text-left" aria-label={label} aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
      <span className="min-w-0 truncate">{selected?.label}</span><ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-primary transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="absolute inset-x-0 top-[calc(100%+.35rem)] z-40 max-h-60 overflow-auto rounded-xl border border-primary/35 bg-card p-1.5 shadow-2xl shadow-black/60" role="listbox" aria-label={label}>
      {options.map(option => <button key={option.value} type="button" role="option" aria-selected={option.value === value} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${option.value === value ? 'bg-primary/15 font-semibold text-primary' : 'text-foreground'}`} onClick={() => { onChange(option.value); setOpen(false) }}>
        <span>{option.label}</span>{option.value === value && <Check aria-hidden="true" className="h-4 w-4" />}
      </button>)}
    </div>}
  </div>
}
