import { describe, expect, it } from 'vitest'
import { acceptedEdgeIntentPlan, sourceOffersFailureRoute } from './edge-intent-plan'
import type { PendingEdge } from './canvas-connect'
import type { WfDoc } from '../types'
import { CMD } from '../types'
import { registerBlocks } from '../domain/node-policy'

const failingBlock = 'test.blocks:search'

function doc(): WfDoc {
  return {
    nodes: {
      search: { id: 'search', kind: 'block', ref: failingBlock, title: 'Search', config: {}, output_schema: { type: 'object', properties: { score: { type: 'number' } } } },
      finish: { id: 'finish', kind: 'finish', title: 'Finish', input_schema: { type: 'object' } },
    },
    edges: { edge: { id: 'edge', source_id: 'search', target_id: 'finish', source_port: 'result', target_port: 'in', transform: '{ result: output }' } },
    notes: {}, positions: { search: { x: 0, y: 0 }, finish: { x: 200, y: 200 } }, viewport: null, direction: 'TB',
    params: {}, labels: [], headSeq: 0, definitionEditSeq: 0, canUndo: false, canRedo: false,
  }
}

const pending: PendingEdge = {
  id: 'edge', sourceId: 'search', targetId: 'finish',
  sourceSchema: { type: 'object', properties: { score: { type: 'number' } } },
  targetSchema: { type: 'object' }, sourceRoot: 'output', sourceFailureAvailable: true, unresolved: [],
}

describe('acceptedEdgeIntentPlan', () => {
  registerBlocks([{ id: failingBlock, label: 'Search', ports: [{ id: 'result', label: 'Done' }, { id: 'failed', label: 'Failed' }] }])
  it('applies mapping through the existing edge transform command', () => {
    const plan = acceptedEdgeIntentPlan(doc(), pending, { kind: 'mapping', transform: '{ value: output.score }', summary: '' })!
    expect(plan.commands).toEqual([{ type: CMD.EDGE_UPDATE, body: { id: 'edge', transform: '{ value: output.score }' } }])
  })

  it('inserts a visible canonical Condition and never authors an edge condition', () => {
    const ids = ['condition-1', 'into-condition', 'true-route']
    const plan = acceptedEdgeIntentPlan(doc(), pending, {
      kind: 'condition', predicate: 'output.score > 50', summary: 'Continue for high scores.',
    }, () => ids.shift()!)!

    expect(plan.commands.map((command) => command.type)).toEqual([
      CMD.EDGE_REMOVE, CMD.NODE_ADD, CMD.EDGE_ADD, CMD.EDGE_ADD, CMD.LAYOUT_SET_POSITION,
    ])
    expect(plan.commands[1].body).toMatchObject({
      id: 'condition-1', kind: 'branch', title: 'Condition', config: { predicate: 'output.score > 50' },
    })
    expect(plan.commands[2].body).toMatchObject({ source_id: 'search', target_id: 'condition-1', source_port: 'result' })
    expect(plan.commands[3].body).toMatchObject({ source_id: 'condition-1', target_id: 'finish', source_port: 'true', transform: '{ result: output }' })
    expect(plan.select).toEqual({ kind: 'node', id: 'condition-1' })
  })

  it('turns the existing route into a Failed-port route and clears a success transform', () => {
    const d = doc()
    expect(sourceOffersFailureRoute(d, 'search')).toBe(true)
    const plan = acceptedEdgeIntentPlan(d, pending, {
      kind: 'failure_route', available: true, source_port: 'failed', summary: 'Route errors.',
    })!
    expect(plan.commands).toEqual([
      { type: CMD.EDGE_UPDATE, body: { id: 'edge', source_port: 'failed', transform: '' } },
    ])
  })

  it('refuses an unavailable Failed route and keeps insert-node as a non-mutating suggestion', () => {
    const d = doc()
    d.nodes.search.kind = 'branch'
    expect(acceptedEdgeIntentPlan(d, pending, {
      kind: 'failure_route', available: false, source_port: 'failed', summary: 'Unavailable.',
    })).toBeNull()
    expect(acceptedEdgeIntentPlan(d, pending, {
      kind: 'insert_node', block_id: 'signal', block_title: 'Wait for', summary: 'Add a wait.',
    })?.commands).toEqual([])
  })
})
