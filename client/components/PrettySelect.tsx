'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'

type Option = { value: string; label: string }

export default function PrettySelect({ label, value, options, onChange, disabled = false }: { label: string; value: string; options: Option[]; onChange: (value: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selectedIndex = options.findIndex(option => option.value === value)
  const selected = options[selectedIndex] ?? options[0]

  const show = (index = Math.max(0, selectedIndex)) => {
    if (!disabled && options.length) {
      setActiveIndex(index)
      setOpen(true)
    }
  }
  const close = (restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) requestAnimationFrame(() => trigger.current?.focus())
  }

  useEffect(() => {
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  useEffect(() => {
    if (disabled || !options.length || selectedIndex < 0) setOpen(false)
  }, [disabled, options, selectedIndex])

  useEffect(() => { if (open) list.current?.focus() }, [open])

  const handleKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); close(true); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      if (!open) return show(event.key === 'ArrowUp' || event.key === 'End' ? options.length - 1 : 0)
      setActiveIndex(current => event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
      return
    }
    if (open && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onChange(options[activeIndex].value)
      close(true)
    }
  }

  return <div ref={root} className="relative">
    <button ref={trigger} type="button" className="trade-control flex items-center justify-between gap-2 text-left" aria-label={label} aria-haspopup="listbox" aria-controls={listId} aria-expanded={open} disabled={disabled} onClick={() => open ? close() : show()} onKeyDown={handleKey}>
      <span className="min-w-0 truncate">{selected?.label}</span><ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-primary transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div ref={list} id={listId} tabIndex={-1} className="absolute inset-x-0 top-[calc(100%+.35rem)] z-40 max-h-60 overflow-auto rounded-xl border border-primary/35 bg-card p-1.5 shadow-2xl shadow-black/60 focus:outline-none" role="listbox" aria-label={label} aria-activedescendant={`${listId}-${activeIndex}`} onKeyDown={handleKey}>
      {options.map((option, index) => <button id={`${listId}-${index}`} key={option.value} tabIndex={-1} type="button" role="option" aria-selected={option.value === value} className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none ${index === activeIndex ? 'bg-primary/10 text-primary' : ''} ${option.value === value ? 'font-semibold text-primary' : 'text-foreground'}`} onPointerMove={() => setActiveIndex(index)} onClick={() => { onChange(option.value); close(true) }}>
        <span>{option.label}</span>{option.value === value && <Check aria-hidden="true" className="h-4 w-4" />}
      </button>)}
    </div>}
  </div>
}
