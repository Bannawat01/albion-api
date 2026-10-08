import { expect, test } from 'bun:test'
import { validAnalyticsEvent } from './analyticsController'

const visitorId = '12345678-1234-1234-1234-123456789abc'

test('analytics accepts client download clicks and rejects unknown events', () => {
  expect(validAnalyticsEvent({ event: 'client_official_click', visitorId, path: '/th/contribute' })).toBe(true)
  expect(validAnalyticsEvent({ event: 'client_afm_click', visitorId, path: '/en/contribute' })).toBe(true)
  expect(validAnalyticsEvent({ event: 'client_unknown_click', visitorId, path: '/th/contribute' })).toBe(false)
})
