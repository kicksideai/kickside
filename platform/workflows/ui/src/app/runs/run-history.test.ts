import { describe, expect, it } from 'vitest'
import { relativeTime, runFailureCause, runStatus, runStatusLabel, runStatusTone, runVersionBadge, shortRunId, sortRunsNewestFirst } from './run-history'
import type { RunRow } from '../api/api'

function row(over: Partial<RunRow>): RunRow {
  return { run_id: 'r1', draft_ref: { kind: 'flow', id: 'w1', def_seq: 0 }, status: 'completed', ...over } as RunRow
}

describe('runStatus', () => {
  it('reads an active run the engine has parked on a signal as waiting', () => {
    const parked = row({ status: 'running', dataflow_status: 'waiting' })
    expect(runStatus(parked)).toBe('waiting')
    expect(runStatusLabel(runStatus(parked))).toBe('Waiting')
    expect(runStatusTone(runStatus(parked))).toBe('pending')
  })

  it('keeps the lifecycle status of a running or finished run', () => {
    expect(runStatus(row({ status: 'running', dataflow_status: 'running' }))).toBe('running')
    expect(runStatus(row({ status: 'running' }))).toBe('running')
    expect(runStatus(row({ status: 'completed', dataflow_status: 'waiting' }))).toBe('completed')
  })
})

describe('runStatusTone', () => {
  it('reads completed/success statuses as ok', () => {
    expect(runStatusTone('completed')).toBe('ok')
    expect(runStatusTone('Succeeded')).toBe('ok')
  })

  it('reads failed/cancelled/terminated statuses as error', () => {
    expect(runStatusTone('failed')).toBe('error')
    expect(runStatusTone('cancelled')).toBe('error')
    expect(runStatusTone('terminated')).toBe('error')
  })

  it('reads everything else — running, pending, unknown — as pending', () => {
    expect(runStatusTone('running')).toBe('pending')
    expect(runStatusTone('queued')).toBe('pending')
    expect(runStatusTone('')).toBe('pending')
  })
})

describe('runStatusLabel', () => {
  it('title-cases the leading letter', () => {
    expect(runStatusLabel('completed')).toBe('Completed')
    expect(runStatusLabel('failed')).toBe('Failed')
  })

  it('falls back to Pending for an empty status', () => {
    expect(runStatusLabel('')).toBe('Pending')
    expect(runStatusLabel('   ')).toBe('Pending')
  })
})

describe('sortRunsNewestFirst', () => {
  it('orders by started_at descending', () => {
    const rows = [
      row({ run_id: 'a', started_at: '2024-01-01T00:00:00Z' }),
      row({ run_id: 'b', started_at: '2024-01-03T00:00:00Z' }),
      row({ run_id: 'c', started_at: '2024-01-02T00:00:00Z' }),
    ]
    expect(sortRunsNewestFirst(rows).map((r) => r.run_id)).toEqual(['b', 'c', 'a'])
  })

  it('falls back to finished_at when started_at is absent', () => {
    const rows = [
      row({ run_id: 'a', started_at: null, finished_at: '2024-01-01T00:00:00Z' }),
      row({ run_id: 'b', started_at: null, finished_at: '2024-01-05T00:00:00Z' }),
    ]
    expect(sortRunsNewestFirst(rows).map((r) => r.run_id)).toEqual(['b', 'a'])
  })

  it('breaks equal timestamps by run_id so ordering stays stable', () => {
    const rows = [
      row({ run_id: 'aaa', started_at: '2024-01-01T00:00:00Z' }),
      row({ run_id: 'zzz', started_at: '2024-01-01T00:00:00Z' }),
    ]
    expect(sortRunsNewestFirst(rows).map((r) => r.run_id)).toEqual(['zzz', 'aaa'])
  })

  it('does not mutate the input array', () => {
    const rows = [row({ run_id: 'a', started_at: '2024-01-01T00:00:00Z' }), row({ run_id: 'b', started_at: '2024-01-02T00:00:00Z' })]
    const copy = [...rows]
    sortRunsNewestFirst(rows)
    expect(rows).toEqual(copy)
  })
})

describe('relativeTime', () => {
  const now = Date.parse('2024-06-01T12:00:00Z')

  it('reads "—" for an absent or unparseable timestamp', () => {
    expect(relativeTime(null, now)).toBe('—')
    expect(relativeTime(undefined, now)).toBe('—')
    expect(relativeTime('not a date', now)).toBe('—')
  })

  it('reads seconds, minutes, hours and days in the right bucket', () => {
    expect(relativeTime(new Date(now - 2000).toISOString(), now)).toBe('just now')
    expect(relativeTime(new Date(now - 30000).toISOString(), now)).toBe('30s ago')
    expect(relativeTime(new Date(now - 5 * 60000).toISOString(), now)).toBe('5m ago')
    expect(relativeTime(new Date(now - 3 * 3600000).toISOString(), now)).toBe('3h ago')
    expect(relativeTime(new Date(now - 2 * 86400000).toISOString(), now)).toBe('2d ago')
  })

  it('falls back to a plain date once older than a month', () => {
    const old = new Date(now - 45 * 86400000)
    expect(relativeTime(old.toISOString(), now)).toBe(old.toLocaleDateString())
  })
})

describe('shortRunId', () => {
  it('truncates a long id to 8 characters', () => {
    expect(shortRunId('abcdefgh12345')).toBe('abcdefgh')
  })

  it('leaves a short id untouched', () => {
    expect(shortRunId('abc')).toBe('abc')
  })
})

describe('runVersionBadge', () => {
  it('labels a positive version as a published vN chip', () => {
    expect(runVersionBadge(1)).toEqual({ label: 'v1', kind: 'published', title: 'Ran published version 1' })
    expect(runVersionBadge(3).label).toBe('v3')
    expect(runVersionBadge(3).kind).toBe('published')
  })

  it('labels version 0 as a draft run, never a version number', () => {
    const b = runVersionBadge(0)
    expect(b.kind).toBe('draft')
    expect(b.label).toBe('Draft run')
    expect(b.label).not.toMatch(/^v/)
    expect(b.title).toContain('not a published version')
  })

  it('treats an absent version as a draft run', () => {
    expect(runVersionBadge(undefined).kind).toBe('draft')
    expect(runVersionBadge(null).label).toBe('Draft run')
  })
})

describe('runFailureCause', () => {
  it('reads the persisted engine cause of a failed run as its human reason', () => {
    expect(runFailureCause(row({ status: 'failed', error: 'Node [0190a3c1-7e1f-7a00-8000-000000000001] failed: {"code":"NORTHWIND_STOCK_MISSING","message":"Northwind stock is missing"}' })))
      .toBe('Northwind stock is missing')
  })

  it('carries no cause for a failure without information or a run that did not fail', () => {
    expect(runFailureCause(row({ status: 'failed', error: 'failed' }))).toBe('')
    expect(runFailureCause(row({ status: 'failed', error: null }))).toBe('')
    expect(runFailureCause(row({ status: 'completed', error: 'stale reason' }))).toBe('')
  })
})
