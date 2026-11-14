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



describe('boundary + Flow rendering', () => {
  it('marks a boundary node pinned with its role and a one-sided port layout', () => {
    const start = buildFlowData(docWith({ kind: 'start', title: 'Start', config: { input_schema: { type: 'object' } } })).flowNodes[0].data as WfNodeData
    expect(start.pinned).toBe(true)
    expect(start.boundaryRole).toBe('start')

    const finish = buildFlowData(docWith({ kind: 'finish', title: 'Finish' })).flowNodes[0].data as WfNodeData
    expect(finish.pinned).toBe(true)
    expect(finish.boundaryRole).toBe('finish')

    const error = buildFlowData(docWith({ kind: 'error', title: 'Error' })).flowNodes[0].data as WfNodeData
    expect(error.boundaryRole).toBe('error')
  })

  it('honours a server-decorated pinned/boundary marker even on a non-boundary kind', () => {
    const n = buildFlowData(docWith({ kind: 'block', title: 'X', pinned: true, boundary: { role: 'start', pinned: true } })).flowNodes[0].data as WfNodeData
    expect(n.pinned).toBe(true)
  })

  it('leaves an ordinary step unpinned with no boundary role', () => {
    const tool = buildFlowData(docWith({ kind: 'block', title: 'X' })).flowNodes[0].data as WfNodeData
    expect(tool.pinned).toBe(false)
    expect(tool.boundaryRole).toBeUndefined()
  })

  it('gives an exact Flow Finished/Failed ports and a nested interface summary', () => {
    const data = buildFlowData(docWith({
      kind: 'flow',
      title: 'Qualify',
      ref: 'wf_child',
      config: { flow_ref: { kind: 'flow', id: 'wf_child', version: 2 } },
      child_interface: { input_schema: { type: 'object', properties: { lead: {} } }, output_schema: { type: 'object', properties: { score: {} } }, error_schema: { type: 'object', properties: { message: {} } } },
    })).flowNodes[0].data as WfNodeData
    expect(data.outPorts.map((p) => p.id)).toEqual(['result'])
    expect(data.outPorts.map((p) => p.label)).toEqual(['Finished'])
    expect(data.failedPort).toBe(true)
    expect(data.sub).toContain('lead')
    expect(data.sub).toContain('score')
    expect(data.sub).toContain('→')
  })

  it('derives the Flow summary from the frozen node schemas when undecorated', () => {
    const data = buildFlowData(docWith({
      kind: 'flow',
      title: 'Qualify',
      ref: 'wf_child',
      config: { flow_ref: { kind: 'flow', id: 'wf_child', version: 2 } },
      input_schema: { type: 'object', properties: { a: {} } },
      output_schema: { type: 'object', properties: { b: {} } },
    })).flowNodes[0].data as WfNodeData
    expect(data.outPorts.map((p) => p.id)).toEqual(['result'])
    expect(data.failedPort).toBe(false)
    expect(data.sub).toContain('a')
    expect(data.sub).toContain('b')
  })

  it('leaves an unbound Flow as a plain single-port step', () => {
    const data = buildFlowData(docWith({ kind: 'flow', title: 'Flow' })).flowNodes[0].data as WfNodeData
    expect(data.outPorts).toHaveLength(1)
    expect(data.outPorts[0].id).toBe('')
    expect(data.sub).toBeUndefined()
  })

  it('flags a Start boundary node as pinned with its boundary role', () => {
    const start = buildFlowData(docWith({ kind: 'start', title: 'Start' })).flowNodes[0].data as WfNodeData
    expect(start.boundaryRole).toBe('start')
    expect(start.pinned).toBe(true)
  })

  it('keeps boundary contracts editable while pinning their position', () => {
    const data = buildFlowData(docWith({ kind: 'start', title: 'Start' })).flowNodes[0].data as WfNodeData
    expect(data.pinned).toBe(true)
    expect(data.boundaryRole).toBe('start')
  })
})
