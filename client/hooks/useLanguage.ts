'use client'

import { useEffect, useState } from 'react'

type Language = 'th' | 'en'
const KEY = 'albion-market-language-v1'
const EVENT = 'albion-language-change'

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('th')
  useEffect(() => {
    const refresh = () => setLanguage(localStorage.getItem(KEY) === 'en' ? 'en' : 'th')
    refresh()
    window.addEventListener(EVENT, refresh)
    return () => window.removeEventListener(EVENT, refresh)
  }, [])
  const toggle = () => {
    localStorage.setItem(KEY, language === 'th' ? 'en' : 'th')
    window.dispatchEvent(new Event(EVENT))
  }
  return { language, toggle, th: language === 'th' }
}
