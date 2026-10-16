import { describe, expect, it } from 'vitest'
import { agentIdentity, mergePresence, STALE_AFTER_S, touchedNodeIds } from './presence'
import type { GraphEdge, GraphNode, JournalCursor } from './types'

const NOW = 1_700_000_000

const node = (id: string, kind = 'approach', extra: Partial<GraphNode> = {}): GraphNode => ({
  id, kind, label: id, child_count: 0, revision: 1, created_at: NOW, updated_at: NOW, ...extra,
})
const edge = (id: string, from: string, to: string, kind = 'supports'): GraphEdge => ({
  id, from, to, kind, revision: 1, created_at: NOW, updated_at: NOW,
})
const cursor = (id: string, extra: Partial<JournalCursor> = {}): JournalCursor => ({
  cursor_id: id,
  agent_id: id,
  origin: 'auto',
  state: 'active',
  last_seen_seq: 12,
  checkpoint_seq: 0,
  created_at: NOW,
  updated_at: NOW,
  ...extra,
})

describe('agent identity', () => {
  it('names a connection by its readable part and keeps two of them apart', () => {
    const left = agentIdentity('conn-left-3f1c2b7a-4d5e-4a6b-8c9d-0e1f2a3b4c5d')
    const right = agentIdentity('conn-right-9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d')
    expect(left.label).toBe('Conn left 3B4C5D')
    expect(right.label).toBe('Conn right 7B6C5D')
    expect(left.initials).not.toBe(right.initials)
    expect(left.initials).toMatch(/^[A-Z]{2}$/)
    expect(agentIdentity('conn-left-3f1c2b7a-4d5e-4a6b-8c9d-0e1f2a3b4c5d')).toEqual(left)
  })

  it('keeps a chosen name as the name and speaks its initials', () => {
    expect(agentIdentity('agent-schema', 'Schema researcher')).toEqual({
      label: 'Schema researcher', initials: 'SR', short: 'SCHEMA',
    })
    expect(agentIdentity('pin-agent').label).toBe('Pin agent')
  })

  it('still names a presence whose id says nothing at all', () => {
    const bare = agentIdentity('3f1c2b7a-4d5e-4a6b-8c9d-0e1f2a3b4c5d')
    expect(bare.label).toBe('Agent 3B4C5D')
    expect(bare.initials).toMatch(/^[A-Z]{2}$/)
  })
})

describe('presence merge', () => {
  const nodes = [
    node('binding-rules'),
    node('proof-activation'),
    node('agent-schema', 'agent', {
      label: 'Schema researcher',
      metadata: { purpose: 'Audit the typed slots', cursor_id: 'jc_schema' },
    }),
  ]
  const edges = [edge('e-pos', 'agent-schema', 'proof-activation', 'positioned_at')]

  it('keeps one pin when a cursor and a projected record are the same presence', () => {
    const merged = mergePresence(nodes, edges, [
      cursor('jc_schema', { origin: 'explicit', last_seen_seq: 44, agent_id: 'schema-agent' }),
    ], 'map', NOW)
    expect(merged).toHaveLength(1)
    const [agent] = merged
    expect(agent.source).toBe('both')
    expect(agent.label).toBe('Schema researcher')
    expect(agent.positionId).toBe('proof-activation')
    expect(agent.purpose).toBe('Audit the typed slots')
    expect(agent.lastSeenSeq).toBe(44)
    expect(agent.origin).toBe('explicit')
  })

  it('carries an automatic cursor that nothing projected, with no position', () => {
    const merged = mergePresence(nodes, edges, [
      cursor('jc_auto', { agent_id: 'conn-a-3f1c2b7a-4d5e-4a6b-8c9d-0e1f2a3b4c5d', updated_at: NOW - 30 }),
    ], 'map', NOW)
    expect(merged.map(agent => agent.source)).toEqual(['graph', 'cursor'])
    const tracked = merged[1]
    expect(tracked.id).toBe('cursor:jc_auto')
    expect(tracked.positionId).toBeUndefined()
    expect(tracked.lastSeenSeq).toBe(12)
    expect(tracked.origin).toBe('auto')
    expect(tracked.stale).toBe(false)
  })

  it('places an explicit cursor on the record it addresses inside this window', () => {
    const merged = mergePresence(nodes, edges, [
      cursor('jc_placed', { origin: 'explicit', position: { graph_id: 'map', node_id: 'binding-rules' } }),
      cursor('jc_elsewhere', { origin: 'explicit', position: { graph_id: 'history', node_id: 'binding-rules' } }),
    ], 'map', NOW)
    const placed = merged.find(agent => agent.cursorId === 'jc_placed')
    const elsewhere = merged.find(agent => agent.cursorId === 'jc_elsewhere')
    expect(placed?.positionId).toBe('binding-rules')
    expect(elsewhere?.positionId).toBeUndefined()
    expect(elsewhere?.positionLabel).toBe('binding-rules')
  })

  it('halos the record a watermark landed on, only when this window carries it', () => {
    const merged = mergePresence(nodes, edges, [
      cursor('jc_touch', {
        last_touch: {
          seq: 12, event_id: 'evt-1', title: 'Roll decision',
          positions: [{ graph_id: 'map', node_id: 'binding-rules', label: 'Binding rules' }],
        },
      }),
      cursor('jc_offscreen', {
        agent_id: 'other-agent',
        last_touch: {
          seq: 9, event_id: 'evt-2', title: 'Older decision',
          positions: [{ graph_id: 'map', node_id: 'not-in-window', label: 'Elsewhere' }],
        },
      }),
    ], 'map', NOW)
    const touched = merged.find(agent => agent.cursorId === 'jc_touch')
    const offscreen = merged.find(agent => agent.cursorId === 'jc_offscreen')
    expect(touched?.touchNodeId).toBe('binding-rules')
    expect(offscreen?.touchNodeId).toBeUndefined()
    expect(offscreen?.touchLabel).toBe('Elsewhere')
    expect([...touchedNodeIds(merged)]).toEqual(['binding-rules'])
  })

  it('dims an idle presence instead of dropping it, and keeps it out of the halo layer', () => {
    const merged = mergePresence([], [], [
      cursor('jc_idle', { updated_at: NOW - STALE_AFTER_S - 1, last_touch: {
        seq: 3, event_id: 'evt-3', positions: [{ graph_id: 'map', node_id: 'gone' }],
      } }),
      cursor('jc_live', { agent_id: 'live-agent', updated_at: NOW - 60 }),
    ], 'map', NOW)
    expect(merged.map(agent => agent.cursorId)).toEqual(['jc_live', 'jc_idle'])
    expect(merged[1].stale).toBe(true)
    expect(touchedNodeIds(merged).size).toBe(0)
  })
})
