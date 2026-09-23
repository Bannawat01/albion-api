'use client'

import { createApiUrl } from '@/api'

const VISITOR_KEY = 'albion-market-anonymous-id-v1'

export function track(event: 'page_view' | 'search' | 'history_open' | 'route_open' | 'watchlist_add' | 'share' | 'aodp_click' | 'donate_click') {
  try {
    let visitorId = localStorage.getItem(VISITOR_KEY)
    if (!visitorId) {
      visitorId = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, visitorId)
    }
    const payload = JSON.stringify({ event, visitorId, path: location.pathname })
    if (!navigator.sendBeacon?.(createApiUrl('/analytics/event'), new Blob([payload], { type: 'application/json' }))) {
      fetch(createApiUrl('/analytics/event'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {})
    }
  } catch {}
}
