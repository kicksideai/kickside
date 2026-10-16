import { describe, expect, it } from 'vitest'
import { ancestorLabel, ancestorPath, searchNodes } from './search'
import type { GraphNode, GraphTypeDef } from './types'

function node(id: string, name: string, extra: Partial<GraphNode> = {}): GraphNode {
  return { id, name, type: 'note', ...extra }
}

const TYPES = new Map<string, GraphTypeDef>([
  ['service', { id: 'service', title: 'Service' }],
  ['note', { id: 'note', title: 'Note' }],
])

describe('searchNodes', () => {
  const nodes = [
    node('a', 'Epicurean school'),
    node('b', 'Late Epicureans'),
    node('c', 'Stoics', { tags: ['epicurean-rival'] }),
    node('d', 'Gateway', { type: 'service' }),
    node('e', 'Unrelated'),
  ]

  it('ranks name prefix above word prefix above substring above tag', () => {
    const hits = searchNodes(nodes, 'epi', TYPES)
    expect(hits.map(h => h.node.id)).toEqual(['a', 'b', 'c'])
  })

  it('matches type titles', () => {
    const hits = searchNodes(nodes, 'serv', TYPES)
    expect(hits.map(h => h.node.id)).toEqual(['d'])
  })

  it('is case-insensitive and trims the query', () => {
    expect(searchNodes(nodes, '  EPIC ', TYPES).length).toBe(3)
  })

  it('returns nothing for an empty query', () => {
    expect(searchNodes(nodes, '', TYPES)).toEqual([])
    expect(searchNodes(nodes, '   ', TYPES)).toEqual([])
  })
})

describe('ancestorPath', () => {
  const byId = new Map<string, GraphNode>([
    ['root', node('root', 'Root')],
    ['mid', node('mid', 'Mid', { parent_id: 'root' })],
    ['leaf', node('leaf', 'Leaf', { parent_id: 'mid' })],
  ])

  it('walks root-first to the direct parent', () => {
    expect(ancestorPath(byId, 'leaf')).toEqual(['root', 'mid'])
    expect(ancestorPath(byId, 'root')).toEqual([])
  })

  it('renders a human breadcrumb', () => {
    expect(ancestorLabel(byId, 'leaf')).toBe('Root / Mid')
  })

  it('survives a parent cycle', () => {
    const cyclic = new Map<string, GraphNode>([
      ['x', node('x', 'X', { parent_id: 'y' })],
      ['y', node('y', 'Y', { parent_id: 'x' })],
    ])
    expect(ancestorPath(cyclic, 'x').length).toBeLessThanOrEqual(2)
  })
})
