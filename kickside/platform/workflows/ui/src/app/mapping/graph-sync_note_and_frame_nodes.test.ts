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



describe('note and frame nodes', () => {
  it('maps a plain note to wfNote and a frame to wfFrame, frame behind regular steps', () => {
    const doc = emptyDoc()
    doc.notes = {
      note1: { id: 'note1', text: 'hi', kind: 'note' },
      frame1: { id: 'frame1', text: 'Zone', kind: 'frame', color: 'slate' },
    }
    const { flowNodes } = buildFlowData(doc)
    const note = flowNodes.find((n) => n.id === 'note1')!
    const frame = flowNodes.find((n) => n.id === 'frame1')!
    expect(note.type).toBe('wfNote')
    expect(frame.type).toBe('wfFrame')
    expect(frame.zIndex).toBe(0)
    expect((frame.data as WfNoteData).color).toBe('slate')
  })

  it('opens a frame at the larger default size when unset, and honors a saved layout size', () => {
    const doc = emptyDoc()
    doc.notes = { f1: { id: 'f1', text: '', kind: 'frame' }, f2: { id: 'f2', text: '', kind: 'frame' } }
    doc.positions = { f2: { x: 0, y: 0, width: 640, height: 400 } }
    const { flowNodes } = buildFlowData(doc)
    const unset = flowNodes.find((n) => n.id === 'f1')!.data as WfNoteData
    const saved = flowNodes.find((n) => n.id === 'f2')!.data as WfNoteData
    expect(unset.width).toBe(420)
    expect(unset.height).toBe(280)
    expect(saved.width).toBe(640)
    expect(saved.height).toBe(400)
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



