import Elysia from 'elysia'
import { connectToDatabase } from '../configs/database'

const EVENTS = new Set(['page_view', 'search', 'history_open', 'route_open', 'watchlist_add', 'share', 'aodp_click', 'donate_click', 'opportunities_view', 'opportunity_filter', 'opportunity_open'])
const ID_RE = /^[a-f0-9-]{20,64}$/i
const BOT_RE = /bot|crawler|spider|slurp|google-inspectiontool|lighthouse/i

export const isBotUserAgent = (userAgent = '') => BOT_RE.test(userAgent)

export function validAnalyticsEvent(body: unknown): body is { event: string; visitorId: string; path?: string } {
  const value = body as Record<string, unknown>
  return !!value && EVENTS.has(String(value.event)) && ID_RE.test(String(value.visitorId)) && String(value.path || '').length <= 200
}

const saveEvent = async ({ body, request, set }: { body: unknown; request: Request; set: { status?: number | string } }) => {
    if (isBotUserAgent(request.headers.get('user-agent') || '')) {
      set.status = 204
      return
    }
    if (!validAnalyticsEvent(body)) {
      set.status = 400
      return { success: false }
    }
    const event = body as { event: string; visitorId: string; path?: string }
    await connectToDatabase.getDb().collection('analytics_events').insertOne({
      event: event.event,
      visitorId: event.visitorId,
      path: event.path || '/',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    })
    set.status = 204
}

export const analyticsController = new Elysia({ prefix: '/api' })
  .post('/events', saveEvent)
  .post('/analytics/event', saveEvent)
  .get('/analytics/weekly', async ({ request, set }) => {
    const key = Bun.env.ANALYTICS_KEY
    if (!key || request.headers.get('x-analytics-key') !== key) {
      set.status = 404
      return { message: 'Not found' }
    }
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const rows = await connectToDatabase.getDb().collection('analytics_events').find(
      { createdAt: { $gte: since } },
      { projection: { _id: 0, event: 1, visitorId: 1, createdAt: 1 } }
    ).toArray()
    const users = new Map<string, Set<string>>()
    const counts: Record<string, number> = {}
    for (const row of rows) {
      counts[row.event] = (counts[row.event] || 0) + 1
      const days = users.get(row.visitorId) || new Set<string>()
      days.add(row.createdAt.toISOString().slice(0, 10))
      users.set(row.visitorId, days)
    }
    const activeUsers = users.size
    const returningUsers = [...users.values()].filter(days => days.size >= 2).length
    const engaged = new Set(rows.filter(row => row.event === 'watchlist_add' || row.event === 'route_open').map(row => row.visitorId)).size
    return {
      periodDays: 7,
      activeUsers,
      returningUsers,
      returningRate: activeUsers ? Math.round(returningUsers / activeUsers * 1000) / 10 : 0,
      searchesPerUser: activeUsers ? Math.round((counts.search || 0) / activeUsers * 10) / 10 : 0,
      watchlistOrRouteRate: activeUsers ? Math.round(engaged / activeUsers * 1000) / 10 : 0,
      events: counts,
    }
  })
