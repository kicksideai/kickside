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
describe('no edge binds to a dangling handle', () => {
  function handlesFor(node: FlowNode): { sources: string[]; targets: string[] } {
    const d = node.data as WfNodeData
    return renderedHandles(d.outPorts, d.boundaryRole, d.failedPort)
  }

  it('resolves a stored port an unregistered ext-kind node does not render to a handle it does', () => {
    // An extension kind (research) that never registered: kindDef falls back so the node
    // renders default handles, yet its stored edges name result/failed ports. Pre-fix
    // those pass straight through as dangling handles; the fix must fall them back.
    const doc = emptyDoc()
    doc.nodes = {
      start: { id: 'start', title: 'Start', kind: 'start' } as never,
      research: { id: 'research', title: 'Research', kind: 'block', ref: 'test.blocks:missing' } as never,
      done: { id: 'done', title: 'Done', kind: 'finish' } as never,
      failed: { id: 'failed', title: 'Failed', kind: 'error' } as never,
    }
    doc.edges = {
      e0: { id: 'e0', source_id: 'start', target_id: 'research' } as never,
      e1: { id: 'e1', source_id: 'research', target_id: 'done', source_port: 'result' } as never,
      e2: { id: 'e2', source_id: 'research', target_id: 'failed', source_port: 'failed' } as never,
    }
    const { flowNodes, flowEdges } = buildFlowData(doc)
    expect(flowEdges).toHaveLength(3)
    const byId = new Map(flowNodes.map((n) => [n.id, n]))
    for (const e of flowEdges) {
      const src = byId.get(e.source as string)!
      const tgt = byId.get(e.target as string)!
      expect(handlesFor(src).sources).toContain(e.sourceHandle)
      expect(handlesFor(tgt).targets).toContain(e.targetHandle)
    }
  })

  it('passes a named port straight through once its Block is registered', () => {
    const ref = 'test.blocks:research'
    registerBlocks([{ id: ref, label: 'Research', ports: [{ id: 'result', label: 'Result' }, { id: 'failed', label: 'Failed' }] }])
    const doc = emptyDoc()
    doc.nodes = {
      research: { id: 'research', title: 'Research', kind: 'block', ref } as never,
      done: { id: 'done', title: 'Done', kind: 'finish' } as never,
    }
    doc.edges = { e1: { id: 'e1', source_id: 'research', target_id: 'done', source_port: 'result' } as never }
    const e = buildFlowData(doc).flowEdges[0]
    expect(e.sourceHandle).toBe('result')
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



