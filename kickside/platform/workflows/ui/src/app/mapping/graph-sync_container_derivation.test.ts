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

describe('container derivation', () => {
  it('closes the body over the body-port subgraph and never over the done branch', () => {
    const { doc, pos } = containerDoc()
    const { containers, parentOf } = deriveContainers(doc, pos)
    expect(containers).toHaveLength(1)
    expect(containers[0].id).toBe('loop')
    expect(containers[0].members.sort()).toEqual(['a', 'b'])
    expect(parentOf.a).toBe('loop')
    expect(parentOf.b).toBe('loop')
    // `done` is reached through the done port, not the body — it stays out of the box.
    expect(parentOf.done).toBeUndefined()
  })

  it('assigns a shared step to exactly one container (single-parent, deterministic by id)', () => {
    const doc = emptyDoc()
    doc.nodes = {
      p2: { id: 'p2', title: 'P2', kind: 'for_each' } as never,
      p1: { id: 'p1', title: 'P1', kind: 'for_each' } as never,
      shared: { id: 'shared', title: 'S', kind: 'block' } as never,
    }
    doc.edges = {
      e1: { id: 'e1', source_id: 'p1', target_id: 'shared', source_port: 'body' } as never,
      e2: { id: 'e2', source_id: 'p2', target_id: 'shared', source_port: 'body' } as never,
    }
    doc.positions = { p1: { x: 0, y: 0 }, p2: { x: 300, y: 0 }, shared: { x: 0, y: 120 } }
    const { containers, parentOf } = deriveContainers(doc, doc.positions)
    // p1 sorts before p2, so p1 wins the shared step; p2 draws no box.
    expect(parentOf.shared).toBe('p1')
    const claimed = containers.filter((c) => c.members.includes('shared'))
    expect(claimed).toHaveLength(1)
    expect(claimed[0].id).toBe('p1')
  })

  it('draws a box that fully encloses every member', () => {
    const { doc, pos } = containerDoc()
    const [c] = deriveContainers(doc, pos).containers
    for (const id of c.members) {
      const p = pos[id]
      expect(p.x).toBeGreaterThanOrEqual(c.box.x)
      expect(p.y).toBeGreaterThanOrEqual(c.box.y)
      expect(p.x).toBeLessThanOrEqual(c.box.x + c.box.width)
      expect(p.y).toBeLessThanOrEqual(c.box.y + c.box.height)
    }
  })

  it('buildFlowData emits one click-through box node per container', () => {
    const { doc } = containerDoc()
    const box = buildFlowData(doc).flowNodes.find((n) => n.id === '__box_loop')!
    expect(box.type).toBe('wfContainer')
    expect(box.zIndex).toBe(0)
    expect(box.selectable).toBe(false)
    expect(box.class).toBe('wf-container-node')
    expect(box.style).toMatchObject({ pointerEvents: 'none' })
  })
})


