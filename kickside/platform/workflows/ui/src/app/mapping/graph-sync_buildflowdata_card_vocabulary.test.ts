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


describe('buildFlowData card vocabulary', () => {
  it('renders the human kind label, never the raw kind string', () => {
    const { flowNodes } = buildFlowData(docWith({ kind: 'branch', title: 'Route' }))
    const data = flowNodes[0].data as WfNodeData
    expect(data.kindLabel).toBe('Condition')
    expect(data.kindLabel).not.toBe('branch')
  })

  it('carries the ref for the tooltip but exposes no subtitle line', () => {
    const { flowNodes } = buildFlowData(docWith({ kind: 'block', title: 'Post', ref: 'kickside.channel.sink:post', ref_label: 'Channel post' }))
    const data = flowNodes[0].data as WfNodeData
    expect(data.ref).toBe('Channel post')
    expect('subtitle' in data).toBe(false)
  })

  it('makes graph steps keyboard-focusable with a human accessible name', () => {
    const node = buildFlowData(docWith({ kind: 'branch', title: 'Route' })).flowNodes[0]
    expect(node.focusable).toBe(true)
    expect(node.ariaLabel).toBe('Condition step: Route')
  })

  it('gives a branch two named out-ports (True/False) and a plain step one default port', () => {
    const branch = buildFlowData(docWith({ kind: 'branch', title: 'Branch' })).flowNodes[0].data as WfNodeData
    expect(branch.outPorts.map((p) => p.label)).toEqual(['True', 'False'])
    const tool = buildFlowData(docWith({ kind: 'block', title: 'X' })).flowNodes[0].data as WfNodeData
    expect(tool.outPorts).toHaveLength(1)
    expect(tool.outPorts[0].id).toBe('')
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



