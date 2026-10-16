import { describe, expect, it } from 'vitest'
import { buildFlowData, parseHandles } from './graph-sync'
import type { GraphState } from './types'

// Regression fixture captured from the live backend (GET /workspace/graphs/{id}).
// Notable real-world shapes: handles as a JSON STRING inside properties, Lua
// empty-table-as-array (properties: [], meta: []), children nested in the tree.
const LIVE: GraphState = {
  nodes: [
    {
      id: '5b060344-a378-494f-8dbb-6676a521a048',
      type: 'database',
      name: 'Orders DB',
      description: 'Stores **orders** and `items`',
      status: 'draft',
      sort_order: 0,
      tags: [],
      properties: {
        width: 320,
        handles: '[{"id":"top","type":"target","side":"top"},{"id":"bottom","type":"source","side":"bottom"},{"id":"left","type":"target","side":"left"},{"id":"right","type":"source","side":"right"},{"id":"top-2","type":"target","side":"top"}]',
        _port_top: 3,
        animation: 'pulse',
        accent: '#a78bfa',
        style: 'dashed',
      },
      layout: { x: 90, y: 80, width: 320, height: 84, pinned: false },
      materials: [
        {
          id: '712c33ad-995e-4a63-a0c5-5e8137f5fe4d',
          target_type: 'node',
          target_id: '5b060344-a378-494f-8dbb-6676a521a048',
          kind: 'reference',
          title: 'Material',
          source: { type: 'inline' },
          meta: {},
          sort_order: 0,
        },
      ],
      children: [
        {
          id: '687966a2-002b-43e6-8dc9-618058bc4b0b',
          type: 'cache',
          name: 'New child',
          status: 'active',
          parent_id: '5b060344-a378-494f-8dbb-6676a521a048',
          properties: [] as unknown as Record<string, unknown>,
          tags: [],
          sort_order: 0,
          materials: [],
          children: [],
          child_count: 0,
        },
      ],
      child_count: 1,
    },
  ],
  edges: [],
  materials: [],
  schema: {
    node_types: [{ id: 'database', title: 'Database', color: '#f59e0b' }],
    edge_types: [],
    material_types: [{ id: 'reference', title: 'Reference', display: 'badge' }],
  },
  layout: { positions: {}, viewport: { x: 0, y: 0, zoom: 1 } },
  settings: {},
}

describe('live payload regressions', () => {
  it('parses handles persisted as a JSON string', () => {
    const node = LIVE.nodes[0]
    const handles = parseHandles(node.properties?.handles)
    expect(handles).toHaveLength(5)
    expect(handles.filter(h => h.side === 'top')).toHaveLength(2)
  })

  it('flowNodeData carries all persisted handles to the canvas node', () => {
    const { flowNodes } = buildFlowData(LIVE, new Set(), undefined)
    const fn = flowNodes.find(n => (n.data as { label?: string }).label === 'Orders DB')!
    expect((fn.data as { handles: unknown[] }).handles).toHaveLength(5)
  })

  it('tolerates Lua empty-table-as-array properties on children', () => {
    const { flowNodes } = buildFlowData(LIVE, new Set(['5b060344-a378-494f-8dbb-6676a521a048']), undefined)
    const child = flowNodes.find(n => (n.data as { label?: string }).label === 'New child')
    expect(child).toBeTruthy()
    expect((child!.data as { handles: unknown[] }).handles).toHaveLength(4)
  })
})
