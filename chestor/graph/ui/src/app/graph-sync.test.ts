import { describe, expect, it } from 'vitest'
import {
  colorFor, autoLayout, buildFlowData, buildFlowEdge, flattenGraph, isPortalStub, nodeBadges, panelMaterialCount,
  parseHandles, typeMap, DEFAULT_HANDLES,
} from './graph-sync'
import type { GraphState } from './types'

function fixture(): GraphState {
  return {
    nodes: [
      {
        id: 'a', type: 'system', name: 'A',
        materials: [{ id: 'm1', target_type: 'node', target_id: 'a', kind: 'ref', title: 'Doc' }],
        children: [{ id: 'a1', type: 'service', name: 'A1' }],
      },
      { id: 'b', type: 'service', name: 'B' },
    ],
    edges: [{ id: 'e1', type: 'sync', source_id: 'a', target_id: 'b' }],
    materials: [],
    schema: {
      node_types: [
        { id: 'system', title: 'System', color: '#111111' },
        { id: 'service', title: 'Service', color: '#222222' },
      ],
      edge_types: [{ id: 'sync', title: 'Sync', color: '#333333', animated: false }],
      material_types: [{ id: 'ref', title: 'Ref', display: 'badge', targets: ['node'] }],
    },
    layout: { positions: { a: { x: 10, y: 20 }, b: { x: 300, y: 20 } } },
    settings: {},
  }
}

describe('flattenGraph', () => {
  it('flattens nested children and indexes by parent', () => {
    const flat = flattenGraph(fixture().nodes)
    expect(flat.nodes.map(n => n.id).sort()).toEqual(['a', 'a1', 'b'])
    expect(flat.nodeById.get('a1')?.parent_id).toBe('a')
    expect((flat.childrenByParent.get('') || []).map(n => n.id)).toEqual(['a', 'b'])
    expect((flat.childrenByParent.get('a') || []).map(n => n.id)).toEqual(['a1'])
  })
})

describe('typeMap', () => {
  it('keys defs by id', () => {
    const m = typeMap(fixture().schema.node_types)
    expect(m.get('system')?.title).toBe('System')
  })
})

describe('buildFlowData', () => {
  it('renders roots as leaf nodes when collapsed', () => {
    const { flowNodes, flowEdges } = buildFlowData(fixture(), new Set(), undefined)
    expect(flowNodes.map(n => n.id).sort()).toEqual(['a', 'b'])
    const a = flowNodes.find(n => n.id === 'a')!
    expect(a.data.hasChildren).toBe(true)
    expect(a.data.childCount).toBe(1)
    expect(a.data.badges.map((x: any) => x.text)).toEqual(['Doc'])
    // edge between two visible nodes is included
    expect(flowEdges.map(e => e.id)).toEqual(['e1'])
  })

  it('expands a parent into a boundary with child nodes', () => {
    const { flowNodes } = buildFlowData(fixture(), new Set(['a']), undefined)
    const boundary = flowNodes.find(n => n.id === 'a')!
    expect(boundary.type).toBe('boundary')
    const child = flowNodes.find(n => n.id === 'a1')!
    expect(child.parentNode).toBe('a')
    expect(child.extent).toBe('parent')
  })

  it('scopes to viewRoot when drilled in', () => {
    const { flowNodes } = buildFlowData(fixture(), new Set(), 'a')
    expect(flowNodes.map(n => n.id)).toEqual(['a1'])
  })

  it('hides edges whose endpoints are not both visible', () => {
    const { flowEdges } = buildFlowData(fixture(), new Set(), 'a')
    expect(flowEdges).toHaveLength(0)
  })

  it('rolls a collapsed child edge up to its group node', () => {
    const st = fixture()
    // relation from the child a1 out to top-level b
    st.edges = [{ id: 'e2', type: 'sync', source_id: 'a1', target_id: 'b' }]
    const { flowEdges } = buildFlowData(st, new Set(), undefined) // 'a' collapsed
    expect(flowEdges).toHaveLength(1)
    // a1 rolls up to its visible ancestor 'a'; edge is drawn a -> b
    expect(flowEdges[0].source).toBe('a')
    expect(flowEdges[0].target).toBe('b')
    expect(flowEdges[0].data?.aggregated).toBe(true)
  })

  it('keeps the child-level edge when the group is expanded', () => {
    const st = fixture()
    st.edges = [{ id: 'e2', type: 'sync', source_id: 'a1', target_id: 'b' }]
    const { flowEdges } = buildFlowData(st, new Set(['a']), undefined) // 'a' expanded
    expect(flowEdges).toHaveLength(1)
    expect(flowEdges[0].id).toBe('e2')
    expect(flowEdges[0].source).toBe('a1')
    expect(flowEdges[0].target).toBe('b')
  })

  it('dedupes parallel rolled-up relations of the same type into one edge', () => {
    const st = fixture()
    // second child under 'a', two edges of the same type both rolling a -> b
    st.nodes[0].children!.push({ id: 'a2', type: 'service', name: 'A2' })
    st.edges = [
      { id: 'e2', type: 'sync', source_id: 'a1', target_id: 'b' },
      { id: 'e3', type: 'sync', source_id: 'a2', target_id: 'b' },
    ]
    const { flowEdges } = buildFlowData(st, new Set(), undefined)
    expect(flowEdges).toHaveLength(1)
    // the summary carries both underlying relations as provenance
    expect(flowEdges[0].data?.count).toBe(2)
    expect(flowEdges[0].data?.members.map((m: any) => m.id).sort()).toEqual(['e2', 'e3'])
  })

  it('routes a child edge to an outside node through a portal stub when drilled in', () => {
    const st = fixture()
    st.edges = [{ id: 'e2', type: 'sync', source_id: 'a1', target_id: 'b' }]
    const { flowNodes, flowEdges } = buildFlowData(st, new Set(), 'a') // inside group 'a'
    const portal = flowNodes.find(n => n.id === 'portal:b')!
    expect(portal.type).toBe('portalNode')
    expect(portal.data.portal).toBe(true)
    expect(portal.data.portalTarget).toBe('b')
    expect(portal.data.label).toBe('B')
    expect(flowEdges).toHaveLength(1)
    expect(flowEdges[0].source).toBe('a1')
    expect(flowEdges[0].target).toBe('portal:b')
    expect(flowEdges[0].data?.portal).toBe(true)
    expect(flowEdges[0].data?.members[0].targetId).toBe('b')
  })

  it('mints portal stubs as inert signposts: no drag, no selection, no connections', () => {
    const st = fixture()
    st.edges = [{ id: 'e2', type: 'sync', source_id: 'a1', target_id: 'b' }]
    const { flowNodes } = buildFlowData(st, new Set(), 'a')
    const portal = flowNodes.find(n => n.id === 'portal:b')!
    expect(portal.draggable).toBe(false)
    expect(portal.selectable).toBe(false)
    expect(portal.connectable).toBe(false)
    const real = flowNodes.find(n => n.id === 'a1')!
    expect(real.draggable).toBeUndefined()
    expect(real.selectable).toBeUndefined()
  })

  it('isPortalStub recognizes only the portal id namespace', () => {
    expect(isPortalStub('portal:b')).toBe(true)
    expect(isPortalStub('b')).toBe(false)
    expect(isPortalStub('my-portal:b')).toBe(false)
  })

  it('drops edges with both endpoints outside the drilled-in view', () => {
    const { flowNodes, flowEdges } = buildFlowData(fixture(), new Set(), 'a') // only a1 rendered
    expect(flowNodes.some(n => n.id.startsWith('portal:'))).toBe(false)
    expect(flowEdges).toHaveLength(0)
  })
})

describe('buildFlowEdge', () => {
  it('applies routing, stroke and animation from properties over type defaults', () => {
    const edgeTypes = typeMap(fixture().schema.edge_types)
    const e = buildFlowEdge({ id: 'e', type: 'sync', source_id: 'a', target_id: 'b', properties: { routing: 'step', stroke: '#abcdef', animated: true, sourceHandle: 'right' } }, edgeTypes)
    expect(e.type).toBe('step')
    expect(e.animated).toBe(true)
    expect((e.style as any).stroke).toBe('#abcdef')
    expect(e.sourceHandle).toBe('right')
  })
  it('uses canonical strokeWidth from the edge type definition', () => {
    const edgeTypes = typeMap([{ id: 'sync', title: 'Sync', strokeWidth: 3 }])
    const e = buildFlowEdge({ id: 'e', type: 'sync', source_id: 'a', target_id: 'b' }, edgeTypes)
    expect((e.style as any).strokeWidth).toBe(3)
  })
  it('renders bidirectional edges with arrows at both ends', () => {
    const edgeTypes = typeMap(fixture().schema.edge_types)
    const e = buildFlowEdge({ id: 'e', type: 'sync', source_id: 'a', target_id: 'b', properties: { direction: 'bidirectional' } }, edgeTypes)
    expect((e as any).markerStart?.type).toBe((e as any).markerEnd?.type)
  })
  it('keeps directed edges one-way by default', () => {
    const edgeTypes = typeMap(fixture().schema.edge_types)
    const e = buildFlowEdge({ id: 'e', type: 'sync', source_id: 'a', target_id: 'b' }, edgeTypes)
    expect((e as any).markerStart).toBeUndefined()
  })
})

describe('material display helpers', () => {
  const mats = [
    { id: 'x', target_type: 'node' as const, kind: 'ref' },
    { id: 'y', target_type: 'node' as const, kind: 'note' },
  ]
  const mt = typeMap([
    { id: 'ref', title: 'Ref', display: 'badge' },
    { id: 'note', title: 'Note', display: 'panel' },
  ])
  it('badges only for badge/both display', () => {
    expect(nodeBadges(mats, mt).map(b => b.kind)).toEqual(['ref'])
  })
  it('panel count for panel/both display', () => {
    expect(panelMaterialCount(mats, mt)).toBe(1)
  })
})

describe('parseHandles', () => {
  it('returns defaults for empty', () => {
    expect(parseHandles(undefined)).toBe(DEFAULT_HANDLES)
  })
  it('parses the persisted JSON-string form (port editor writes JSON.stringify)', () => {
    const h = parseHandles(JSON.stringify([{ id: 'r1', type: 'source', side: 'right' }]))
    expect(h).toHaveLength(1)
    expect(h[0].side).toBe('right')
  })
  it('accepts an array directly', () => {
    const arr = [{ id: 't', type: 'target' as const, side: 'top' as const }]
    expect(parseHandles(arr)).toBe(arr)
  })
})

describe('autoLayout', () => {
  it('produces integer positions for every visible root', () => {
    const pos = autoLayout(fixture(), 'TB', undefined)
    expect(Object.keys(pos).sort()).toEqual(['a', 'b'])
    for (const p of Object.values(pos)) {
      expect(Number.isInteger(p.x)).toBe(true)
      expect(Number.isInteger(p.y)).toBe(true)
    }
  })
  it('ranks connected nodes on different axes (TB spreads y)', () => {
    const pos = autoLayout(fixture(), 'TB', undefined)
    // a -> b edge means b ranks below a
    expect(pos.b.y).toBeGreaterThan(pos.a.y)
  })
  it('returns empty for an empty view', () => {
    expect(autoLayout({ ...fixture(), nodes: [] }, 'TB', undefined)).toEqual({})
  })
})

describe('unconfigured graph colors', () => {
  it('inherits the host accent rather than assigning a fixed brand', () => {
    expect(colorFor(new Map(), 'service')).toBe('var(--p-primary-color)')
  })
})

it('reports malformed persisted node ports instead of replacing them with defaults', () => {
  expect(() => parseHandles('{broken')).toThrow('Node ports are unavailable.')
})
