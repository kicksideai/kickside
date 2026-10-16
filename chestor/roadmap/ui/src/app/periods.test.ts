import { describe, expect, it } from 'vitest'
import {
  comparePeriods, formatPeriod, isPeriod, parsePeriod, periodChoices, periodIndex,
  periodLabel, periodLongLabel, periodRange, shiftPeriod, unitsPerYear,
} from './periods'

describe('period keys', () => {
  it('parses quarter and month keys', () => {
    expect(parsePeriod('2026-Q3', 'quarter')).toEqual({ year: 2026, unit: 3 })
    expect(parsePeriod('2026-09', 'month')).toEqual({ year: 2026, unit: 9 })
  })

  it('refuses a key of the other kind or an out-of-range unit', () => {
    expect(parsePeriod('2026-09', 'quarter')).toBeNull()
    expect(parsePeriod('2026-Q3', 'month')).toBeNull()
    expect(parsePeriod('2026-Q5', 'quarter')).toBeNull()
    expect(parsePeriod('2026-13', 'month')).toBeNull()
    expect(isPeriod('', 'quarter')).toBe(false)
  })

  it('indexes and formats as inverses', () => {
    expect(periodIndex('2026-Q3', 'quarter')).toBe(2026 * 4 + 2)
    expect(formatPeriod(periodIndex('2026-Q3', 'quarter') as number, 'quarter')).toBe('2026-Q3')
    expect(formatPeriod(periodIndex('2026-09', 'month') as number, 'month')).toBe('2026-09')
    expect(unitsPerYear('month')).toBe(12)
  })

  it('shifts across a year boundary', () => {
    expect(shiftPeriod('2026-Q4', 1, 'quarter')).toBe('2027-Q1')
    expect(shiftPeriod('2026-Q1', -1, 'quarter')).toBe('2025-Q4')
    expect(shiftPeriod('2026-12', 1, 'month')).toBe('2027-01')
    expect(shiftPeriod('nonsense', 1, 'month')).toBeNull()
  })

  it('compares by ordinal, not by string', () => {
    expect(comparePeriods('2026-Q4', '2027-Q1', 'quarter')).toBeLessThan(0)
    expect(comparePeriods('2026-Q3', '2026-Q3', 'quarter')).toBe(0)
  })

  it('builds the visible window from origin and column count', () => {
    expect(periodRange('2026-Q3', 5, 'quarter')).toEqual(['2026-Q3', '2026-Q4', '2027-Q1', '2027-Q2', '2027-Q3'])
    expect(periodRange('2026-11', 3, 'month')).toEqual(['2026-11', '2026-12', '2027-01'])
    expect(periodRange('bad', 3, 'quarter')).toEqual([])
    expect(periodRange('2026-Q3', 0, 'quarter')).toEqual(['2026-Q3'])
  })

  it('labels for the column head and the inspector', () => {
    expect(periodLabel('2026-Q3', 'quarter')).toBe('Q3 ’26')
    expect(periodLabel('2026-09', 'month')).toBe('Sep ’26')
    expect(periodLongLabel('2026-Q3', 'quarter')).toBe('Q3 2026')
    expect(periodLabel('', 'quarter')).toBe('—')
  })

  it('offers a padded choice list around the window', () => {
    const choices = periodChoices('2026-Q3', 2, 'quarter', 1)
    expect(choices).toEqual(['2026-Q2', '2026-Q3', '2026-Q4', '2027-Q1'])
  })
})
