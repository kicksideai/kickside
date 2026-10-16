import { describe, it, expect } from 'vitest'
import { toMs, formatDate, formatDateTime, relativeTime } from './datetime'

const now = Date.UTC(2024, 0, 15, 12, 0, 0)
const ago = (ms: number): number => now - ms

describe('toMs', () => {
  it('scales unix seconds to ms via the <1e12 heuristic', () => {
    expect(toMs(1_700_000_000)).toBe(1_700_000_000_000)
  })
  it('keeps unix ms as-is', () => {
    expect(toMs(1_700_000_000_000)).toBe(1_700_000_000_000)
  })
  it('reads an all-digit string as unix seconds', () => {
    expect(toMs('1700000000')).toBe(1_700_000_000_000)
  })
  it('parses an RFC/ISO string via Date.parse', () => {
    expect(toMs('2024-01-15T12:00:00Z')).toBe(Date.UTC(2024, 0, 15, 12, 0, 0))
  })
  it('treats falsy and unparseable input as no date', () => {
    for (const v of [0, '', null, undefined, 'not-a-date']) expect(toMs(v as never)).toBeNull()
  })
})

describe('formatDate / formatDateTime', () => {
  it('returns empty for no date', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDateTime(undefined)).toBe('')
  })
  it('renders a non-empty string for a valid date', () => {
    expect(formatDate(1_700_000_000).length).toBeGreaterThan(0)
    expect(formatDateTime(1_700_000_000).length).toBeGreaterThan(0)
  })
})

describe('relativeTime — hub ladder (year granularity + suffix)', () => {
  const y = { maxUnit: 'year' as const, now }
  it('formats hub-style relative times', () => {
    expect(relativeTime(undefined, y)).toBe('')
    expect(relativeTime('not-a-date', y)).toBe('')
    expect(relativeTime(ago(30_000), y)).toBe('just now')
    expect(relativeTime(ago(5 * 60_000), y)).toBe('5m ago')
    expect(relativeTime(ago(3 * 3_600_000), y)).toBe('3h ago')
    expect(relativeTime(ago(2 * 86_400_000), y)).toBe('2d ago')
    expect(relativeTime(ago(60 * 86_400_000), y)).toBe('2mo ago')
    expect(relativeTime(ago(800 * 86_400_000), y)).toBe('2y ago')
  })
})

describe('relativeTime — inbox (day cap, no suffix)', () => {
  const d = { suffix: false, now }
  it('caps at days and omits the suffix', () => {
    expect(relativeTime(ago(30_000), d)).toBe('just now')
    expect(relativeTime(ago(5 * 60_000), d)).toBe('5m')
    expect(relativeTime(ago(3 * 3_600_000), d)).toBe('3h')
    expect(relativeTime(ago(400 * 86_400_000), d)).toBe('400d')
  })
})

describe('relativeTime — future branch (automation whenLabel)', () => {
  const f = { future: true, now }
  it('renders times ahead as "in N"', () => {
    expect(relativeTime(now + 30_000, f)).toBe('in <1m')
    expect(relativeTime(now + 5 * 60_000, f)).toBe('in 5m')
    expect(relativeTime(now + 3 * 3_600_000, f)).toBe('in 3h')
    expect(relativeTime(now + 2 * 86_400_000, f)).toBe('in 2d')
  })
})
