import { describe, expect, it } from 'vitest'
import { blockingScore, chainEdges, indexDependencies, rankByBlocking, traceSelection } from './trace'
import type { Dependency } from './types'

function dep(id: string, from: string, to: string, kind: Dependency['kind'] = 'requires'): Dependency {
  return { id, from_id: from, to_id: to, kind, note: '' }
}

// a → b → c, with d informing c.
const DEPS = [dep('d1', 'a', 'b'), dep('d2', 'b', 'c'), dep('d3', 'd', 'c', 'informs')]

describe('dependency index', () => {
  it('reads an edge as "to needs from, from unlocks to"', () => {
    const index = indexDependencies(DEPS)
    expect(index.needs.get('b')).toEqual(['a'])
    expect(index.unlocks.get('a')).toEqual(['b'])
  })

  it('leaves informs edges off the chain graph unless asked for all', () => {
    expect(indexDependencies(DEPS).needs.get('c')).toEqual(['b'])
    expect(indexDependencies(DEPS, 'all').needs.get('c')).toEqual(['b', 'd'])
  })
})

describe('traceSelection', () => {
  it('is direct by default', () => {
    const trace = traceSelection('b', indexDependencies(DEPS))
    expect([...trace.needs]).toEqual(['a'])
    expect([...trace.unlocks]).toEqual(['c'])
    expect(trace.chain.has('b')).toBe(true)
  })

  it('walks the whole build order when transitive', () => {
    const index = indexDependencies(DEPS)
    expect([...traceSelection('a', index, true).unlocks].sort()).toEqual(['b', 'c'])
    expect([...traceSelection('c', index, true).needs].sort()).toEqual(['a', 'b'])
  })

  it('answers an empty trace for no selection', () => {
    const trace = traceSelection(null, indexDependencies(DEPS))
    expect(trace.selected).toBe('')
    expect(trace.chain.size).toBe(0)
  })

  it('terminates on a cyclic edge set rather than looping', () => {
    const index = indexDependencies([dep('d1', 'a', 'b'), dep('d2', 'b', 'a')])
    expect([...traceSelection('a', index, true).unlocks].sort()).toEqual(['b'])
  })
})

describe('chainEdges', () => {
  it('returns only the edges touching the selection', () => {
    const trace = traceSelection('b', indexDependencies(DEPS))
    expect(chainEdges(DEPS, trace).map(e => e.id)).toEqual(['d1', 'd2'])
  })

  it('returns nothing without a selection', () => {
    expect(chainEdges(DEPS, traceSelection(null, indexDependencies(DEPS)))).toEqual([])
  })
})

describe('blocking score', () => {
  it('counts everything downstream on the requires graph', () => {
    const index = indexDependencies(DEPS)
    expect(blockingScore('a', index)).toBe(2)
    expect(blockingScore('c', index)).toBe(0)
  })

  it('ranks the heaviest blocker first', () => {
    expect(rankByBlocking(['a', 'b', 'c'], indexDependencies(DEPS))).toEqual([
      { id: 'a', score: 2 },
      { id: 'b', score: 1 },
      { id: 'c', score: 0 },
    ])
  })
})
