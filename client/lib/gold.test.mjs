import { expect, test } from 'bun:test'
import { goldTime, goldDayChange, goldCost } from './gold.ts'

test('gold timestamps without offsets are UTC', () => {
  expect(goldTime('2026-10-08T20:00:00')).toBe(Date.parse('2026-10-08T20:00:00Z'))
  expect(goldTime('2026-10-08T20:00:00+07:00')).toBe(Date.parse('2026-10-08T20:00:00+07:00'))
})

test('24-hour comparison needs a nearby observation', () => {
  expect(goldDayChange([{ price: 100, timestamp: '2026-10-07T20:00:00' }, { price: 110, timestamp: '2026-10-08T20:00:00' }])).toEqual({ amount: 10, percent: 10 })
  expect(goldDayChange([{ price: 100, timestamp: '2026-10-07T10:00:00' }, { price: 110, timestamp: '2026-10-08T20:00:00' }])).toBeNull()
  expect(goldDayChange([])).toBeNull()
})

test('gold estimate accepts positive whole amounts only', () => {
  expect(goldCost('100', 14279)).toBe(1427900)
  for (const amount of ['', '0', '-1', '1.5', '1000001', 'abc']) expect(goldCost(amount, 14279)).toBeNull()
})
