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

describe('declaration-owned Failed port is additive to success handles', () => {
  it('keeps the declared result handle and adds the declared failed handle', () => {
    const ref = 'test.blocks:failure_capable'
    registerBlocks([{ id: ref, label: 'Can fail', ports: [{ id: 'result', label: 'Done' }, { id: 'failed', label: 'Failed' }] }])
    const doc = docWith({ kind: 'block', ref, title: 'Can fail' })
    const flowNode = buildFlowData(doc).flowNodes[0]
    const data = flowNode.data as WfNodeData
    expect(data.failedPort).toBe(true)
    const handles = renderedHandles(data.outPorts, data.boundaryRole, data.failedPort)
    expect(handles.sources).toContain('result')
    expect(handles.sources).toContain('failed')
  })

  it('does not add Failed to structural nodes', () => {
    const doc = docWith({ kind: 'for_each', title: 'Fan out' })
    const data = buildFlowData(doc).flowNodes[0].data as WfNodeData
    const handles = renderedHandles(data.outPorts, data.boundaryRole, data.failedPort)
    expect(handles.sources).toEqual(['body', 'done'])
  })

  it('adds Failed to a nested Flow only when its Error boundary declares it', () => {
    const start = buildFlowData(docWith({ kind: 'start', title: 'Start' })).flowNodes[0].data as WfNodeData
    expect(start.failedPort).toBe(false)
    const noError = buildFlowData(docWith({ kind: 'flow', title: 'Flow', config: { flow_ref: { kind: 'flow', id: 'wf', version: 1 } }, child_interface: { output_schema: { type: 'object' } } })).flowNodes[0].data as WfNodeData
    expect(noError.failedPort).toBe(false)
    const withError = buildFlowData(docWith({ kind: 'flow', title: 'Flow', config: { flow_ref: { kind: 'flow', id: 'wf', version: 1 } }, child_interface: { output_schema: { type: 'object' }, error_schema: { type: 'object' } } })).flowNodes[0].data as WfNodeData
    expect(withError.failedPort).toBe(true)
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



