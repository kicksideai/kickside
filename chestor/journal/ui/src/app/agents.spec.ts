import { describe, expect, it } from 'vitest'
import { agentDestination, agentSummary, graphPresenceLine, groupByLiveness, livenessOf, mergeAgents } from './agents'
import type { JournalCursor, WorkSpan } from './types'

const NOW = 1_700_000_000

const cursor = (id: string, extra: Partial<JournalCursor> = {}): JournalCursor => ({
  cursor_id: id,
  agent_id: id,
  origin: 'auto',
  state: 'active',
  last_seen_seq: 4,
  checkpoint_seq: 0,
  created_at: NOW - 1000,
  updated_at: NOW - 1000,
  ...extra,
})

const span = (id: string, extra: Partial<WorkSpan> = {}): WorkSpan => ({
  span_id: id,
  agent_id: 'schema',
  cursor_id: 'jc_schema',
  origin: 'auto',
  state: 'sealed',
  started_at: NOW - 900,
  last_activity_at: NOW - 300,
  started_seq: 1,
  last_seq: 9,
  fact_count: 3,
  duration_s: 600,
  ...extra,
})

describe('agent liveness', () => {
  it('reads an hour as the working session and a day as the working day', () => {
    expect(livenessOf(NOW - 60, NOW)).toBe('now')
    expect(livenessOf(NOW - 3600, NOW)).toBe('now')
    expect(livenessOf(NOW - 3601, NOW)).toBe('today')
    expect(livenessOf(NOW - 86400, NOW)).toBe('today')
    expect(livenessOf(NOW - 86401, NOW)).toBe('older')
  })
})

describe('journal-wide agent rail', () => {
  it('keeps one row when a cursor and a span name the same agent', () => {
    const rows = mergeAgents(
      [cursor('schema', { cursor_id: 'jc_schema', updated_at: NOW - 800 })],
      [span('sp_1'), span('sp_2', { fact_count: 4, last_activity_at: NOW - 120, last_seq: 21 })],
      NOW,
    )
    expect(rows).toHaveLength(1)
    const [agent] = rows
    expect(agent.id).toBe('schema')
    expect(agent.cursorId).toBe('jc_schema')
    expect(agent.factCount).toBe(7)
    expect(agent.lastActivityAt).toBe(NOW - 120)
    expect(agent.lastSeenSeq).toBe(21)
  })

  it('keeps a cursor that never named an agent, under its cursor id', () => {
    const rows = mergeAgents([cursor('jc_bare', { agent_id: '' })], [], NOW)
    expect(rows.map(row => row.id)).toEqual(['cursor:jc_bare'])
    expect(rows[0].agentId).toBe('')
    expect(rows[0].cursorId).toBe('jc_bare')
  })

  it('folds a span onto the nameless cursor it was opened for', () => {
    const rows = mergeAgents(
      [cursor('jc_bare', { agent_id: '' })],
      [span('sp_1', { agent_id: 'writer', cursor_id: 'jc_bare' })],
      NOW,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe('writer')
    expect(rows[0].label).toBe('Writer')
  })

  it('folds two rows into one when a later record bridges an agent to a cursor', () => {
    // The stores can show one writer under two names before anything states
    // that they are the same: a cursor read that never named an agent, and a
    // span read that never named the cursor. The record that names both is the
    // bridge, and what each name accumulated is one writer's work.
    const rows = mergeAgents(
      [cursor('jc_bare', { agent_id: '', cursor_id: 'jc_bare', updated_at: NOW - 400 })],
      [
        span('sp_named', { agent_id: 'writer', cursor_id: '', fact_count: 2, last_activity_at: NOW - 500, last_seq: 5 }),
        span('sp_bridge', { agent_id: 'writer', cursor_id: 'jc_bare', fact_count: 3, state: 'open', last_activity_at: NOW - 100, last_seq: 12 }),
      ],
      NOW,
    )
    expect(rows).toHaveLength(1)
    const [writer] = rows
    expect(writer.id).toBe('writer')
    expect(writer.agentId).toBe('writer')
    expect(writer.cursorId).toBe('jc_bare')
    expect(writer.factCount).toBe(5)
    expect(writer.openSpans).toBe(1)
    expect(writer.lastActivityAt).toBe(NOW - 100)
    expect(writer.lastSeenSeq).toBe(12)
  })

  it('calls an agent working only while one of its spans is open', () => {
    const [open, sealed] = mergeAgents([], [
      span('sp_open', { agent_id: 'ana', cursor_id: 'jc_ana', state: 'open', last_activity_at: NOW - 30 }),
      span('sp_done', { agent_id: 'bo', cursor_id: 'jc_bo', state: 'sealed', last_activity_at: NOW - 60 }),
    ], NOW)
    expect(open.working).toBe(true)
    expect(open.openSpans).toBe(1)
    expect(sealed.working).toBe(false)
    expect(sealed.openSpans).toBe(0)
  })

  it('says what an agent is working on, falling back to the checkpoint and then to a stated line', () => {
    const [stated, checkpointed, bare] = mergeAgents(
      [
        cursor('checkpointed', { updated_at: NOW - 200, checkpoint: { keys: ['plan'], entries: 1, headline: 'Held the migration plan' } }),
        cursor('bare', { updated_at: NOW - 300 }),
      ],
      [span('sp_1', { agent_id: 'stated', cursor_id: 'jc_stated', last_activity_at: NOW - 100, working_on: { text: 'Auditing typed slots', kind: 'task' }, last_fact: { seq: 9, event_id: 'evt-9', event_type: 'note', title: 'Slot audit begun', ts: NOW - 100 } })],
      NOW,
    )
    expect(stated.purpose).toBe('Auditing typed slots')
    expect(stated.headline).toBe('Slot audit begun')
    expect(checkpointed.purpose).toBe('Held the migration plan')
    expect(bare.purpose).toBe('Position tracked while working')
  })

  it('orders by last activity and settles ties on the name', () => {
    const rows = mergeAgents([
      cursor('bo', { updated_at: NOW - 500 }),
      cursor('ana', { updated_at: NOW - 500 }),
      cursor('cy', { updated_at: NOW - 10 }),
    ], [], NOW)
    expect(rows.map(row => row.id)).toEqual(['cy', 'ana', 'bo'])
  })

  it('tiers agents by liveness without dropping the older ones', () => {
    const rows = mergeAgents([
      cursor('live', { updated_at: NOW - 60 }),
      cursor('earlier', { updated_at: NOW - 7200 }),
      cursor('ancient', { updated_at: NOW - 30 * 86400 }),
    ], [], NOW)
    const groups = groupByLiveness(rows)
    expect(groups.now.map(row => row.id)).toEqual(['live'])
    expect(groups.today.map(row => row.id)).toEqual(['earlier'])
    expect(groups.older.map(row => row.id)).toEqual(['ancient'])
    expect(groups.now.length + groups.today.length + groups.older.length).toBe(rows.length)
    expect(agentSummary(groups)).toBe('1 now · 1 today · 1 older')
  })

  it('names only the tiers that hold anyone', () => {
    expect(agentSummary(groupByLiveness(mergeAgents([cursor('live', { updated_at: NOW })], [], NOW))))
      .toBe('1 now')
    expect(agentSummary(groupByLiveness([]))).toBe('')
  })
})

describe('graph presence line', () => {
  it('counts the agents that stood in a graph and how long ago the last one wrote', () => {
    expect(graphPresenceLine(3, NOW - 1200, NOW)).toBe('3 agents · 20m')
    expect(graphPresenceLine(1, NOW - 30, NOW)).toBe('1 agent · now')
    expect(graphPresenceLine(2, NOW - 2 * 86400, NOW)).toBe('2 agents · 2d')
  })

  it('says nothing about a graph nobody has stood in', () => {
    expect(graphPresenceLine(0, NOW - 60, NOW)).toBe('')
  })
})

describe('opening an agent', () => {
  const cursor = (extra: Partial<JournalCursor> = {}): JournalCursor => ({
    cursor_id: 'jc_1', agent_id: 'ana', origin: 'auto', state: 'active',
    last_seen_seq: 9, checkpoint_seq: 0, created_at: 1, updated_at: 2, ...extra,
  })
  const span = (extra: Partial<WorkSpan> = {}): WorkSpan => ({
    span_id: 'sp_1', agent_id: 'ana', cursor_id: 'jc_1', origin: 'auto', state: 'sealed',
    started_at: 1, last_activity_at: 5, ended_at: 5, started_seq: 1, last_seq: 4,
    fact_count: 3, duration_s: 4, ...extra,
  })

  it('lands on the record the agent stands on, in that record\'s own graph', () => {
    const positioned = cursor({ position: { graph_id: 'map', node_id: 'n7' } })
    expect(agentDestination({ agentId: 'ana' }, [positioned], [])).toEqual({ kind: 'node', graphId: 'map', nodeId: 'n7' })
  })

  it('falls back to the record the agent last touched', () => {
    const touched = cursor({ last_touch: { positions: [{ graph_id: 'cw', node_id: 'n2' }] } as JournalCursor['last_touch'] })
    expect(agentDestination({ cursorId: 'jc_1' }, [touched], [])).toEqual({ kind: 'node', graphId: 'cw', nodeId: 'n2' })
  })

  it('opens the task the latest span worked when no position is recorded', () => {
    const spans = [
      span({ span_id: 'sp_old', task_id: 't-old', last_activity_at: 3 }),
      span({ span_id: 'sp_new', task_id: 't-new', last_activity_at: 8 }),
    ]
    expect(agentDestination({ agentId: 'ana' }, [cursor()], spans)).toEqual({ kind: 'task', taskId: 't-new' })
  })

  it('answers the lanes when the agent left neither position nor task, never nothing', () => {
    expect(agentDestination({ agentId: 'ghost' }, [cursor()], [span()])).toEqual({ kind: 'lanes' })
  })
})
