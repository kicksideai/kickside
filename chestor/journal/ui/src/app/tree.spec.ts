import { describe, expect, it } from 'vitest'
import { isFolded, isSettled, treeRows } from './tree'
import type { GraphNode } from './types'

const n = (id: string, parent_id?: string, status?: string): GraphNode => ({ id, parent_id, status, kind: 'approach', label: id, child_count: 0, revision: 1, created_at: 1, updated_at: 1 })

describe('organization tree', () => {
  it('folds display without destroying or detaching descendants', () => {
    const nodes = [n('root'), n('failed', 'root', 'failed'), n('attempt', 'failed')]
    const rows = treeRows(nodes, new Set(['root', 'failed']))
    expect(rows.map(row => [row.node.id, row.depth])).toEqual([['root', 0], ['failed', 1], ['attempt', 2]])
    expect(isFolded(rows[1].node)).toBe(true)
  })

  it('treats completion as a reversible settled projection, not a folded failure', () => {
    const completed = n('done', undefined, 'done')
    expect(isSettled(completed)).toBe(true)
    expect(isFolded(completed)).toBe(false)
    expect(isSettled({ ...completed, status: 'active', revision: 2 })).toBe(false)
  })

  it('uses explicit graph order before labels at every level', () => {
    const nodes = [
      n('root'),
      { ...n('z-last-alphabetically', 'root'), metadata: { order: 1 } },
      { ...n('a-first-alphabetically', 'root'), attrs: { order: 2 } },
    ]
    const rows = treeRows(nodes, new Set(['root']))
    expect(rows.map(row => row.node.id)).toEqual(['root', 'z-last-alphabetically', 'a-first-alphabetically'])
  })
})
