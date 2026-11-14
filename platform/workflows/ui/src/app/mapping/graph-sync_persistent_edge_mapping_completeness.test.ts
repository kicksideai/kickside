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




describe('persistent edge mapping completeness', () => {
  it('puts an unmapped-required count on the rebuilt edge and clears it after a complete transform', () => {
    const doc = emptyDoc()
    doc.nodes = {
      source: { id: 'source', title: 'Source', kind: 'block' } as never,
      target: {
        id: 'target', title: 'Target', kind: 'block',
        input_schema: {
          type: 'object', required: ['email', 'total'],
          properties: { email: { type: 'string' }, total: { type: 'number' } },
        },
      } as never,
    }
    doc.edges = { e1: { id: 'e1', source_id: 'source', target_id: 'target', transform: '{ email: output.email }' } }
    let edge = buildFlowData(doc).flowEdges[0]
    expect(edge.class).toContain('wf-edge--unmapped-required')
    expect((edge.data as { unmappedRequired: string[] }).unmappedRequired).toEqual(['total'])

    doc.edges.e1.transform = '{ email: output.email, total: output.total }'
    edge = buildFlowData(doc).flowEdges[0]
    expect(edge.class).not.toContain('wf-edge--unmapped-required')
    expect((edge.data as { unmappedRequired: string[] }).unmappedRequired).toEqual([])
  })

  it('uses the live Start config projection when deciding edge loudness', () => {
    const doc = emptyDoc()
    doc.nodes = {
      start: {
        id: 'start', title: 'Start', kind: 'start',
        config: {
          input_schema: {
            type: 'object', required: ['query'],
            properties: { query: { type: 'string' } },
          },
        },
        output_schema: { type: 'object', properties: {} },
      } as never,
      search: {
        id: 'search', title: 'Google Search', kind: 'block',
        input_schema: {
          type: 'object', required: ['search_term'],
          properties: { search_term: { type: 'string' } },
        },
      } as never,
    }
    doc.edges = { e1: { id: 'e1', source_id: 'start', target_id: 'search' } }
    const edge = buildFlowData(doc).flowEdges[0]
    expect(edge.class).toContain('wf-edge--unmapped-required')
    expect((edge.data as { unmappedRequired: string[] }).unmappedRequired).toEqual(['search_term'])
  })

  it('sees through a Branch to the upstream contract, as the compiler dissolves it', () => {
    const doc = emptyDoc()
    doc.nodes = {
      producer: {
        id: 'producer', title: 'Producer', kind: 'block',
        output_schema: {
          type: 'object',
          properties: { thread_id: { type: 'string' }, skipped: { type: 'boolean' } },
        },
      } as never,
      gate: { id: 'gate', title: 'Gate', kind: 'branch', config: { predicate: 'output.thread_id != nil' } } as never,
      consumer: {
        id: 'consumer', title: 'Consumer', kind: 'block',
        input_schema: {
          type: 'object', required: ['thread_id'],
          properties: { thread_id: { type: 'string' } },
        },
      } as never,
    }
    doc.edges = {
      e1: { id: 'e1', source_id: 'producer', target_id: 'gate' },
      e2: { id: 'e2', source_id: 'gate', source_port: 'true', target_id: 'consumer' },
    }
    const edge = buildFlowData(doc).flowEdges.find((e) => e.id === 'e2')!
    expect(edge.class).not.toContain('wf-edge--unmapped-required')
    expect((edge.data as { unmappedRequired: string[] }).unmappedRequired).toEqual([])
  })

  it('keeps a loaded callable edge loud while its declared contract is unavailable', () => {
    const doc = emptyDoc()
    doc.nodes = {
      start: { id: 'start', title: 'Start', kind: 'start', config: { input_schema: { type: 'object', properties: { query: { type: 'string' } } } } } as never,
      search: { id: 'search', title: 'Google Search', kind: 'block', ref: 'tools:google' } as never,
    }
    doc.edges = { e1: { id: 'e1', source_id: 'start', target_id: 'search' } }
    const edge = buildFlowData(doc).flowEdges[0]
    expect(edge.class).toContain('wf-edge--contract-unavailable')
    expect((edge.data as { contractUnavailable: boolean }).contractUnavailable).toBe(true)
  })

  // Editing diagnostics (the dashed warning styling + completeness badge) belong to edit
  // mode. A read-only run view shows run truth only — traversal and statuses — even on a
  // workflow with real mapping gaps.
  it('renders no unmapped-required warning while viewing a run, on the same edge that is loud in edit mode', () => {
    const doc = emptyDoc()
    doc.nodes = {
      source: { id: 'source', title: 'Source', kind: 'block' } as never,
      target: {
        id: 'target', title: 'Target', kind: 'block',
        input_schema: {
          type: 'object', required: ['email', 'total'],
          properties: { email: { type: 'string' }, total: { type: 'number' } },
        },
      } as never,
    }
    doc.edges = { e1: { id: 'e1', source_id: 'source', target_id: 'target', transform: '{ email: output.email }' } }
    const editEdge = buildFlowData(doc).flowEdges[0]
    expect(editEdge.class).toContain('wf-edge--unmapped-required')

    const runEdge = buildFlowData(doc, undefined, 'TB', undefined, true).flowEdges[0]
    expect(runEdge.class).not.toContain('wf-edge--unmapped-required')
    expect(runEdge.class).not.toContain('wf-edge--needs-map')
    expect((runEdge.data as { unmappedRequired: string[] }).unmappedRequired).toEqual([])
  })

  it('renders no contract-unavailable warning while viewing a run', () => {
    const doc = emptyDoc()
    doc.nodes = {
      start: { id: 'start', title: 'Start', kind: 'start', config: { input_schema: { type: 'object', properties: { query: { type: 'string' } } } } } as never,
      search: { id: 'search', title: 'Google Search', kind: 'block', ref: 'tools:google' } as never,
    }
    doc.edges = { e1: { id: 'e1', source_id: 'start', target_id: 'search' } }
    const runEdge = buildFlowData(doc, undefined, 'TB', undefined, true).flowEdges[0]
    expect(runEdge.class).not.toContain('wf-edge--contract-unavailable')
    expect((runEdge.data as { contractUnavailable: boolean }).contractUnavailable).toBe(false)
  })

  it('keeps traversal styling while viewing a run, suppressing only the mapping diagnostics', () => {
    const doc = emptyDoc()
    doc.nodes = {
      source: { id: 'source', title: 'Source', kind: 'block' } as never,
      target: {
        id: 'target', title: 'Target', kind: 'block',
        input_schema: { type: 'object', required: ['total'], properties: { total: { type: 'number' } } },
      } as never,
    }
    doc.edges = { e1: { id: 'e1', source_id: 'source', target_id: 'target' } }
    const run: RunState = { active: false, node: {}, edge: { e1: 'done' } }
    const edge = buildFlowData(doc, run, 'TB', undefined, true).flowEdges[0]
    expect(edge.class).toContain('wf-edge--done')
    expect(edge.class).not.toContain('wf-edge--unmapped-required')
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



