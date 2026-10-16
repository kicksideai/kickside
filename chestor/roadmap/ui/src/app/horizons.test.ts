import { describe, expect, it } from 'vitest'
import { initiative, roadmap } from './fixtures'
import { buildHorizons, horizonOf, NEXT_REACH, scheduleFor } from './horizons'

const CURRENT = '2026-Q3'

describe('horizonOf', () => {
  it('reads done and dropped as past whatever their dates say', () => {
    expect(horizonOf({ status: 'done', start_period: '2027-Q4' }, CURRENT, 'quarter')).toBe('past')
    expect(horizonOf({ status: 'dropped', start_period: '' }, CURRENT, 'quarter')).toBe('past')
  })

  it('reads work started or starting now as now', () => {
    expect(horizonOf({ status: 'active', start_period: '2026-Q2' }, CURRENT, 'quarter')).toBe('now')
    expect(horizonOf({ status: 'planned', start_period: CURRENT }, CURRENT, 'quarter')).toBe('now')
  })

  it('reads the next-reach window as next and beyond it as later', () => {
    expect(horizonOf({ status: 'planned', start_period: '2026-Q4' }, CURRENT, 'quarter')).toBe('next')
    expect(horizonOf({ status: 'planned', start_period: '2027-Q1' }, CURRENT, 'quarter')).toBe('next')
    expect(horizonOf({ status: 'planned', start_period: '2027-Q2' }, CURRENT, 'quarter')).toBe('later')
    expect(NEXT_REACH).toBe(2)
  })

  it('reads an unscheduled idea as later', () => {
    expect(horizonOf({ status: 'idea', start_period: '' }, CURRENT, 'quarter')).toBe('later')
  })

  it('applies the same rule to months', () => {
    expect(horizonOf({ status: 'planned', start_period: '2026-10' }, '2026-09', 'month')).toBe('next')
    expect(horizonOf({ status: 'planned', start_period: '2026-12' }, '2026-09', 'month')).toBe('later')
  })
})

describe('buildHorizons', () => {
  const state = roadmap({
    initiatives: [
      initiative('a', { layer_id: 'platform', status: 'active', start_period: '2026-Q3' }),
      initiative('b', { layer_id: 'kickside', start_period: '2026-Q4' }),
      initiative('c', { layer_id: 'kickside', start_period: '', status: 'idea' }),
      initiative('d', { layer_id: 'cloud', status: 'done', start_period: '2026-Q3' }),
    ],
  })

  it('answers three open columns, grouped by layer in roadmap order', () => {
    const columns = buildHorizons(state)
    expect(columns.map(c => c.horizon)).toEqual(['now', 'next', 'later'])
    expect(columns[0].groups.map(g => g.layer.id)).toEqual(['platform'])
    expect(columns[1].groups[0].initiatives.map(i => i.id)).toEqual(['b'])
    expect(columns[2].groups[0].initiatives.map(i => i.id)).toEqual(['c'])
  })

  it('counts each column and leaves shipped work out unless asked', () => {
    const columns = buildHorizons(state)
    expect(columns.map(c => c.count)).toEqual([1, 1, 1])
    const withPast = buildHorizons(state, { includePast: true })
    expect(withPast.length).toBe(4)
    expect(withPast[3].groups[0].initiatives.map(i => i.id)).toEqual(['d'])
  })

  it('leaves a layer with nothing in a column out of that column', () => {
    expect(buildHorizons(state)[0].groups.length).toBe(1)
  })
})

describe('scheduleFor', () => {
  it('answers the period ordinal a card must start at to sit in a horizon', () => {
    const current = 2026 * 4 + 2
    expect(scheduleFor('now', CURRENT, 'quarter')).toBe(current)
    expect(scheduleFor('next', CURRENT, 'quarter')).toBe(current + 1)
    expect(scheduleFor('later', CURRENT, 'quarter')).toBe(current + 3)
    expect(scheduleFor('past', CURRENT, 'quarter')).toBeNull()
  })
})
