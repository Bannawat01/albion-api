import { expect, test } from 'bun:test'
import { watchlistStatus } from './watchlistStatus.ts'

const now = Date.parse('2026-10-09T10:00:00Z')

test('watchlist distinguishes new, stale, and absent reports', () => {
  const fresh = { sellMin: 100, buyMax: null, sellUpdatedAt: '2026-10-09T09:50:00', buyUpdatedAt: null }
  expect(watchlistStatus(fresh, '2026-10-09T09:00:00Z', now)).toEqual({ state: 'fresh', updated: true, latest: Date.parse('2026-10-09T09:50:00Z') })
  expect(watchlistStatus(fresh, undefined, now).updated).toBe(false)
  expect(watchlistStatus({ ...fresh, sellUpdatedAt: '2026-10-09T08:00:00' }, '2026-10-09T07:00:00Z', now)).toMatchObject({ state: 'stale', updated: true })
  expect(watchlistStatus(undefined, undefined, now)).toMatchObject({ state: 'missing', updated: false })
  expect(watchlistStatus({ ...fresh, sellUpdatedAt: null }, undefined, now).state).toBe('stale')
})
