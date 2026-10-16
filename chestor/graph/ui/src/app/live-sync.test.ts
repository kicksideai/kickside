import { describe, expect, it } from 'vitest'
import { setPosition } from './commands'
import {
  forgetPendingRevision,
  projectionTopic,
  reconcilePendingLayouts,
  rememberPendingLayouts,
  type PendingLayouts,
} from './live-sync'
import type { GraphState } from './types'

function state(x: number, y = 20): GraphState {
  return {
    nodes: [{ id: 'node-1', type: 'note', name: 'Node' }],
    edges: [],
    materials: [],
    schema: { node_types: [], edge_types: [], material_types: [] },
    layout: { positions: { 'node-1': { x, y } } },
    settings: {},
  }
}

describe('graph live synchronization', () => {
  it('subscribes to committed projection state, never the raw thread', () => {
    expect(projectionTopic('thread-1', 'chestor.graph')).toBe('kickside.thread.thread-1.projection.chestor.graph')
  })

  it('keeps the latest local drag over an older committed projection', () => {
    const pending: PendingLayouts = new Map()
    rememberPendingLayouts(pending, [setPosition('node-1', 310, 220)], 1)

    const reconciled = reconcilePendingLayouts(state(100), pending, true)

    expect(reconciled.layout.positions['node-1']).toMatchObject({ x: 310, y: 220 })
    expect(pending.has('node-1')).toBe(true)
  })

  it('acknowledges a drag only when the committed projection reaches it', () => {
    const pending: PendingLayouts = new Map()
    rememberPendingLayouts(pending, [setPosition('node-1', 310, 220)], 1)

    const reconciled = reconcilePendingLayouts(state(310, 220), pending, true)

    expect(reconciled.layout.positions['node-1']).toMatchObject({ x: 310, y: 220 })
    expect(pending.size).toBe(0)
  })

  it('does not let an older failed save erase a newer drag', () => {
    const pending: PendingLayouts = new Map()
    rememberPendingLayouts(pending, [setPosition('node-1', 100, 20)], 1)
    rememberPendingLayouts(pending, [setPosition('node-1', 420, 260)], 2)

    forgetPendingRevision(pending, 1)

    expect(pending.get('node-1')).toMatchObject({ revision: 2, position: { x: 420, y: 260 } })
  })

  it('drops pending layout when the node was deleted', () => {
    const pending: PendingLayouts = new Map()
    rememberPendingLayouts(pending, [setPosition('node-1', 310, 220)], 1)
    const deleted = { ...state(100), nodes: [] }

    const reconciled = reconcilePendingLayouts(deleted, pending, true)

    expect(reconciled.layout.positions['node-1']).toBeUndefined()
    expect(pending.size).toBe(0)
  })
})
