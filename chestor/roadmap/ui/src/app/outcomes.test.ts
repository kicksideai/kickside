import { describe, expect, it } from 'vitest'
import { initiative, outcome, roadmap } from './fixtures'
import { buildLedger, initiativeWeight, outcomeProgress, percent } from './outcomes'

describe('weighting', () => {
  it('counts done whole, active by its own progress, and the rest as nothing', () => {
    expect(initiativeWeight({ status: 'done', progress: 0 })).toBe(1)
    expect(initiativeWeight({ status: 'active', progress: 0.4 })).toBe(0.4)
    expect(initiativeWeight({ status: 'planned', progress: 0.9 })).toBe(0)
    expect(initiativeWeight({ status: 'idea', progress: 0.9 })).toBe(0)
  })

  it('clamps a progress value the model should never hold', () => {
    expect(initiativeWeight({ status: 'active', progress: 4 })).toBe(1)
    expect(initiativeWeight({ status: 'active', progress: Number.NaN })).toBe(0)
  })

  it('averages over the bets that still count and leaves dropped ones out', () => {
    const bets = [
      initiative('a', { status: 'done' }),
      initiative('b', { status: 'active', progress: 0.5 }),
      initiative('c', { status: 'planned' }),
      initiative('d', { status: 'dropped' }),
    ]
    expect(outcomeProgress(bets)).toBeCloseTo(0.5)
    expect(percent(outcomeProgress(bets))).toBe(50)
  })

  it('reads an outcome with no bets as zero rather than as complete', () => {
    expect(outcomeProgress([])).toBe(0)
  })
})

describe('buildLedger', () => {
  const state = roadmap({
    outcomes: [outcome('o1', 'A platform that does not break', 0), outcome('o2', 'Make it pay', 1)],
    initiatives: [
      initiative('a', { outcome_id: 'o1', status: 'done', start_period: '2026-Q4' }),
      initiative('b', { outcome_id: 'o1', status: 'planned', start_period: '2026-Q3' }),
      initiative('c', { outcome_id: 'o2', status: 'active', progress: 0.2 }),
      initiative('d', { outcome_id: '' }),
    ],
  })

  it('answers one card per outcome in roadmap order, bets ordered by date', () => {
    const cards = buildLedger(state)
    expect(cards[0].outcome?.id).toBe('o1')
    expect(cards[0].initiatives.map(i => i.id)).toEqual(['b', 'a'])
    expect(percent(cards[0].progress)).toBe(50)
  })

  it('files a bet with no outcome in its own trailing card', () => {
    const cards = buildLedger(state)
    expect(cards[cards.length - 1].outcome).toBeNull()
    expect(cards[cards.length - 1].initiatives.map(i => i.id)).toEqual(['d'])
  })

  it('files a bet pointing at an outcome that is gone as unfiled', () => {
    const orphan = roadmap({ outcomes: [], initiatives: [initiative('a', { outcome_id: 'gone' })] })
    const cards = buildLedger(orphan)
    expect(cards.length).toBe(1)
    expect(cards[0].outcome).toBeNull()
  })

  it('ranks by progress on request and keeps unfiled last', () => {
    const cards = buildLedger(state, { sortByProgress: true })
    expect(cards.map(c => c.outcome?.id ?? null)).toEqual(['o1', 'o2', null])
  })

  it('answers nothing at all for a roadmap with no outcomes and no bets', () => {
    expect(buildLedger(roadmap())).toEqual([])
  })
})
