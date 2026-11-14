import { describe, expect, it } from 'vitest'
import { startNodeId, isLiveRunStatus, normalizeNodeStatus, runStateFromHeaders } from './run-overlay'
import type { WfDoc, WfNode, WfEdge } from '../types'
import { registerBlocks } from '../domain/node-policy'

function doc(nodes: WfNode[], edges: WfEdge[] = []): WfDoc {
  return {
    nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
    edges: Object.fromEntries(edges.map((e) => [e.id, e])),
    notes: {},
    positions: {},
    viewport: null, direction: 'TB',
    params: {}, labels: [],
    headSeq: 0,
    definitionEditSeq: 0,
    canUndo: false,
    canRedo: false,
  }
}
function node(id: string, kind: WfNode['kind'], ref?: string): WfNode {
  return { id, kind, title: id, ref }
}
function edge(id: string, source_id: string, target_id: string): WfEdge {
  return { id, source_id, target_id }
}

describe('startNodeId', () => {
  it('returns empty when there is no Start boundary node', () => {
    expect(startNodeId(doc([node('a', 'block')]))).toBe('')
  })

  it('returns the Start boundary node — the run entry point', () => {
    expect(startNodeId(doc([node('s', 'start'), node('a', 'block')]))).toBe('s')
  })

  it('ignores non-start nodes', () => {
    const d = doc([node('f', 'finish'), node('a', 'block'), node('s', 'start')])
    expect(startNodeId(d)).toBe('s')
  })
})

describe('normalizeNodeStatus', () => {
  it('folds engine statuses onto the five overlay states', () => {
    expect(normalizeNodeStatus('succeeded')).toBe('completed')
    expect(normalizeNodeStatus('ERROR')).toBe('failed')
    expect(normalizeNodeStatus('executing')).toBe('running')
    expect(normalizeNodeStatus('queued')).toBe('pending')
    expect(normalizeNodeStatus('mystery')).toBe('idle')
  })
})

describe('isLiveRunStatus', () => {
  it('keeps an opened running run live while treating terminal history as terminal', () => {
    expect(isLiveRunStatus('running')).toBe(true)
    expect(isLiveRunStatus('waiting')).toBe(true)
    expect(isLiveRunStatus('completed')).toBe(false)
    expect(isLiveRunStatus('CANCELED')).toBe(false)
  })
})

describe('runStateFromHeaders', () => {
  it('maps headers onto node states and lights the edge between them', () => {
    const d = doc([node('t', 'block'), node('a', 'block')], [edge('e', 't', 'a')])
    const state = runStateFromHeaders(
      d,
      [
        { engine_node_id: 'n1', def_node_id: 't', type: 'tool', status: 'completed', title: 't' },
        { engine_node_id: 'n2', def_node_id: 'a', type: 'agent', status: 'running', title: 'a' },
      ],
      'running',
    )
    expect(state.active).toBe(true)
    expect(state.node.t).toBe('completed')
    expect(state.node.a).toBe('running')
    expect(state.edge.e).toBe('active')
  })

  it('reads an explicitly declared person-wait capability without naming a component kind', () => {
    registerBlocks([{ id: 'test:block.review', label: 'Review', category: 'Human', waits: true }])
    const d = doc([node('t', 'block'), node('review', 'block', 'test:block.review')], [edge('e', 't', 'review')])
    const state = runStateFromHeaders(d, [
      { engine_node_id: 'n1', def_node_id: 't', type: 'tool', status: 'completed', title: 't' },
      { engine_node_id: 'n2', def_node_id: 'review', type: 'block', status: 'running', title: 'review' },
    ], 'running')
    expect(state.node.review).toBe('awaiting')
    expect(state.edge.e).toBe('active')
  })

  it('does not report awaiting on a terminal run', () => {
    registerBlocks([{ id: 'test:block.review', label: 'Review', waits: true }])
    const d = doc([node('h', 'block', 'test:block.review')])
    const state = runStateFromHeaders(
      d,
      [{ engine_node_id: 'n2', def_node_id: 'h', type: 'block', status: 'running', title: 'h' }],
      'failed',
    )
    expect(state.node.h).toBe('running')
  })

  it('leaves a non-human running node unchanged', () => {
    const d = doc([node('a', 'block')])
    const state = runStateFromHeaders(
      d,
      [{ engine_node_id: 'n1', def_node_id: 'a', type: 'tool', status: 'running', title: 'a' }],
      'running',
    )
    expect(state.node.a).toBe('running')
  })

  it('projects Start as accepted and keeps the live boundary edges active without fake headers', () => {
    const d = doc(
      [node('start', 'start'), node('work', 'block'), node('finish', 'finish')],
      [edge('in', 'start', 'work'), edge('out', 'work', 'finish')],
    )
    const state = runStateFromHeaders(d, [
      { engine_node_id: 'n1', def_node_id: 'work', type: 'tool', status: 'running', title: 'work' },
    ], 'running')
    expect(state.node).toMatchObject({ start: 'completed', work: 'running', finish: 'pending' })
    expect(state.edge.in).toBe('active')
    expect(state.edge.out).toBe('idle')
  })

  it('projects Finish from terminal success and completes both boundary edges', () => {
    const d = doc(
      [node('start', 'start'), node('work', 'block'), node('finish', 'finish')],
      [edge('in', 'start', 'work'), edge('out', 'work', 'finish')],
    )
    const state = runStateFromHeaders(d, [
      { engine_node_id: 'n1', def_node_id: 'work', type: 'tool', status: 'completed', title: 'work' },
    ], 'completed')
    expect(state.node).toMatchObject({ start: 'completed', work: 'completed', finish: 'completed' })
    expect(state.edge).toMatchObject({ in: 'done', out: 'done' })
  })

  it('projects Error from terminal failure and completes the failed producer route', () => {
    const d = doc(
      [node('start', 'start'), node('work', 'block'), node('error', 'error')],
      [edge('in', 'start', 'work'), edge('failed', 'work', 'error')],
    )
    const state = runStateFromHeaders(d, [
      { engine_node_id: 'n1', def_node_id: 'work', type: 'tool', status: 'failed', title: 'work' },
    ], 'failed', true)
    expect(state.node).toMatchObject({ start: 'completed', work: 'failed', error: 'failed' })
    expect(state.edge.in).toBe('done')
    expect(state.edge.failed).toBe('done')
  })

  it('does not invent an Error route for cancellation, termination, or an unrouted failure', () => {
    const d = doc([node('work', 'block'), node('error', 'error')], [edge('failed', 'work', 'error')])
    for (const status of ['cancelled', 'terminated', 'failed']) {
      const state = runStateFromHeaders(d, [
        { engine_node_id: 'n1', def_node_id: 'work', type: 'tool', status, title: 'work' },
      ], status, false)
      expect(state.node.error).toBe('idle')
      expect(state.edge.failed).toBe('idle')
    }
  })
})
