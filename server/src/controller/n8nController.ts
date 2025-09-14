import { Elysia, t } from 'elysia'

// Simple rate limiter (in-memory) to avoid brute forcing the token
const rateState: Record<string, { count: number; ts: number }> = {}
const WINDOW_MS = 60_000
const MAX_REQ = 30

function rateLimit(ip: string) {
  const now = Date.now()
  const rec = rateState[ip]
  if (!rec || now - rec.ts > WINDOW_MS) {
    rateState[ip] = { count: 1, ts: now }
    return true
  }
  rec.count++
  if (rec.count > MAX_REQ) return false
  return true
}

export const n8nController = new Elysia({ prefix: '/webhook/n8n' })
  .get('/', () => ({ ok: true, message: 'n8n webhook base' }))
  .all('/:token', async ({ params, request, set, body, query, headers }) => {
    const expected = Bun.env.N8N_WEBHOOK_TOKEN
    if (!expected) {
      set.status = 500
      return { error: 'N8N_WEBHOOK_TOKEN not configured' }
    }

    // Basic rate limit
    const ip = (headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || (request as any).ip || 'unknown'
    if (!rateLimit(ip)) {
      set.status = 429
      return { error: 'Too many requests' }
    }

    if (params.token !== expected) {
      set.status = 401
      return { error: 'Invalid token' }
    }

    // Echo back minimal envelope for n8n to use
    return {
      ok: true,
      receivedAt: new Date().toISOString(),
      method: request.method,
      query,
      body: body ?? null
    }
  }, {
    params: t.Object({ token: t.String() })
  })

  // Optional: dedicated health ping used by n8n to verify connectivity
  .get('/:token/ping', ({ params, set }) => {
    const expected = Bun.env.N8N_WEBHOOK_TOKEN
    if (!expected) {
      set.status = 500
      return { error: 'N8N_WEBHOOK_TOKEN not configured' }
    }
    if (params.token !== expected) {
      set.status = 401
      return { error: 'Invalid token' }
    }
    return { ok: true, pong: true, time: Date.now() }
  }, {
    params: t.Object({ token: t.String() })
  })
