import { describe, expect, it } from 'vitest'
import { dependency, initiative, roadmap } from './fixtures'
import { strataBands, strataConnectors, strataEdges } from './strata'
import { indexDependencies, rankByBlocking, traceSelection } from './trace'
import type { Rect } from './types'

const state = roadmap({
  initiatives: [
    initiative('p1', { layer_id: 'platform', start_period: '2026-Q4' }),
    initiative('p2', { layer_id: 'platform', start_period: '2026-Q3' }),
    initiative('k1', { layer_id: 'kickside' }),
    initiative('c1', { layer_id: 'cloud', status: 'dropped' }),
  ],
})

describe('strataBands', () => {
  it('renders the highest layer first and the foundation last', () => {
    expect(strataBands(state).map(b => b.layer.id)).toEqual(['cloud', 'kickside', 'platform'])
  })

  it('orders a band by start period', () => {
    expect(strataBands(state)[2].initiatives.map(i => i.id)).toEqual(['p2', 'p1'])
  })

  it('hides dropped work unless it is asked for', () => {
    expect(strataBands(state)[0].initiatives).toEqual([])
    expect(strataBands(state, { includeDropped: true })[0].initiatives.map(i => i.id)).toEqual(['c1'])
  })

  it('orders a band by blocking rank when one is supplied', () => {
    const deps = [dependency('d1', 'p1', 'k1')]
    const rank = new Map(rankByBlocking(['p1', 'p2'], indexDependencies(deps)).map(r => [r.id, r.score]))
    expect(strataBands(state, { rank })[2].initiatives.map(i => i.id)).toEqual(['p1', 'p2'])
  })
})

describe('strataEdges', () => {
  const deps = [dependency('d1', 'a', 'b'), dependency('d2', 'c', 'b', 'informs')]

  it('draws the hard edges by default', () => {
    expect(strataEdges(deps).map(d => d.id)).toEqual(['d1'])
  })

  it('adds the soft edges on request', () => {
    expect(strataEdges(deps, { includeInforms: true }).map(d => d.id)).toEqual(['d1', 'd2'])
  })
})

describe('strataConnectors', () => {
  const rect = (id: string, y: number): Rect => ({ id, x: 0, y, width: 80, height: 26 })

  it('runs from the top of the lower pill to the bottom of the upper one', () => {
    const deps = [dependency('d1', 'p1', 'k1')]
    const rects = new Map([['p1', rect('p1', 100)], ['k1', rect('k1', 10)]])
    const [connector] = strataConnectors(deps, rects)
    expect(connector.d.startsWith('M40,100 C')).toBe(true)
    expect(connector.d.endsWith('40,36')).toBe(true)
  })

  it('marks the edges of the traced chain hot and leaves the rest cold', () => {
    const deps = [dependency('d1', 'p1', 'k1'), dependency('d2', 'p2', 'c1')]
    const rects = new Map([['p1', rect('p1', 100)], ['k1', rect('k1', 10)], ['p2', rect('p2', 100)], ['c1', rect('c1', 10)]])
    const chain = traceSelection('p1', indexDependencies(deps)).chain
    const drawn = strataConnectors(deps, rects, chain)
    expect(drawn.map(c => [c.id, c.hot])).toEqual([['d1', true], ['d2', false]])
  })
})
