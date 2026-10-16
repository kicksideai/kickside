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



describe('edge handle binding', () => {
  function docWithEdge(edge: Record<string, unknown>, aKind = 'block') {
    const doc = emptyDoc()
    doc.nodes = {
      a: { id: 'a', title: 'A', kind: aKind } as never,
      b: { id: 'b', title: 'B', kind: 'block' } as never,
    }
    doc.edges = { e1: { id: 'e1', source_id: 'a', target_id: 'b', ...edge } as never }
    return doc
  }

  it('binds a plain edge to the layout default in/out handles so VueFlow renders it', () => {
    const tb = buildFlowData(docWithEdge({}), undefined, 'TB').flowEdges[0]
    expect(tb.sourceHandle).toBe('out-bottom')
    expect(tb.targetHandle).toBe('in-top')
    expect(tb.focusable).toBe(true)
    expect(tb.ariaLabel).toBe('Connection from A to B')
    const lr = buildFlowData(docWithEdge({}), undefined, 'LR').flowEdges[0]
    expect(lr.sourceHandle).toBe('out-right')
    expect(lr.targetHandle).toBe('in-left')
  })

  it('binds a branch edge to its canonical true/false source port', () => {
    const t = buildFlowData(docWithEdge({ source_port: 'true' }, 'branch'), undefined, 'TB').flowEdges[0]
    expect(t.sourceHandle).toBe('true')
    const f = buildFlowData(docWithEdge({ source_port: 'false' }, 'branch'), undefined, 'TB').flowEdges[0]
    expect(f.sourceHandle).toBe('false')
  })

  it('keeps an unknown branch port renderable without treating it as an outcome', () => {
    const edge = buildFlowData(docWithEdge({ source_port: 'unknown' }, 'branch'), undefined, 'TB').flowEdges[0]
    expect(edge.sourceHandle).toBe('true')
    expect(edge.targetHandle).toBe('in-top')
  })
})


// Every edge must bind to a handle its endpoint card actually renders. A single dangling
// handle makes VueFlow drop the entire edges layer, so this is the load-bearing invariant.




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



