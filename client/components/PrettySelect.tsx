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

  return <div ref={root} className="pretty-select">
    <button type="button" className="trade-control" aria-label={label} aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
      <span>{selected?.label}</span><ChevronDown aria-hidden="true" />
    </button>
    {open && <div className="pretty-select-menu" role="listbox" aria-label={label}>
      {options.map(option => <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false) }}>
        <span>{option.label}</span>{option.value === value && <Check aria-hidden="true" />}
      </button>)}
    </div>}
  </div>
}
