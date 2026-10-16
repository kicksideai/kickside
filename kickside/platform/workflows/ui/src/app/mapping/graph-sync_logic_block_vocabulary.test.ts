import { describe, expect, it } from 'vitest'
import type { Node as FlowNode } from '@vue-flow/core'
import { autoLayout, deriveContainers, containerAt, clampRegionFor, clampToRegion, nodeDimensionsFor } from './graph-sync'
import { buildFlowData, renderedHandles } from '../canvas/graph-projection'
import { FAILED_PORT_GUTTER, PORT_GAP, PORT_LABEL_MIN_WIDTH, PORT_NODE_MAX_WIDTH, PORT_ROW_GUTTER, PORT_ROW_HEIGHT, nodeDimensionsForPorts } from './node-geometry'
import { outPortsFor, kindDef, registerBlocks } from '../domain/node-policy'
import { emptyDoc } from './sync'
import type { WfDoc, LayoutPosition } from '../types'
import type { WfNodeData, WfNoteData } from '../domain/graph-data'
import type { RunState } from '../runs/run-overlay'

function docWith(node: Record<string, unknown>) {
  const doc = emptyDoc()
  const n = { id: 'n1', title: 'Step', ...node } as never
  doc.nodes = { n1: n }
  return doc
}





// Every edge must bind to a handle its endpoint card actually renders. A single dangling
// handle makes VueFlow drop the entire edges layer, so this is the load-bearing invariant.


describe('logic block vocabulary', () => {
  it('maps engine nouns to productized labels', () => {
    expect(kindDef('cycle').label).toBe('Loop')
    expect(kindDef('combine').label).toBe('Combine')
    expect(kindDef('branch').label).toBe('Condition')
    expect(kindDef('for_each').label).toBe('For each')
    expect(kindDef('flow').label).toBe('Workflow')
  })

  it('every kind opens its panel with a how-it-works sentence', () => {
    for (const k of ['block', 'branch', 'cycle', 'combine', 'for_each', 'flow'] as const) {
      expect(kindDef(k).blurb.length).toBeGreaterThan(10)
    }
  })

  it('branch arms are native while component outcomes come from declarations', () => {
    const ref = 'test.blocks:review'
    registerBlocks([{
      id: ref, label: 'Review',
      ports: [{ id: 'approve', label: 'Approve' }, { id: 'reject', label: 'Reject' }],
    }])
    expect(outPortsFor('branch').map((p) => p.id)).toEqual(['true', 'false'])
    expect(outPortsFor('block', ref).map((p) => p.id)).toEqual(['approve', 'reject'])
  })
})


// A container with a body chain and explicit positions, so derivation and geometry are
// exercised without dagre in the loop.
function containerDoc(): { doc: WfDoc; pos: Record<string, LayoutPosition> } {
  const doc = emptyDoc()
  doc.nodes = {
    loop: { id: 'loop', title: 'Loop', kind: 'cycle' } as never,
    a: { id: 'a', title: 'A', kind: 'block' } as never,
    b: { id: 'b', title: 'B', kind: 'block' } as never,
    done: { id: 'done', title: 'After', kind: 'block' } as never,
  }
  doc.edges = {
    e1: { id: 'e1', source_id: 'loop', target_id: 'a', source_port: 'body' } as never,
    e2: { id: 'e2', source_id: 'a', target_id: 'b' } as never,
    e3: { id: 'e3', source_id: 'loop', target_id: 'done', source_port: 'done' } as never,
  }
  const pos: Record<string, LayoutPosition> = {
    loop: { x: 0, y: 0 },
    a: { x: 0, y: 120 },
    b: { x: 0, y: 240 },
    done: { x: 400, y: 120 },
  }
  doc.positions = pos
  return { doc, pos }
}



