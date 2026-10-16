import { describe, expect, it } from 'vitest'
import type { WorkflowSummary } from '../types'
import {
  mapWorkflowRows,
  rowLastRun,
  rowLocation,
  rowStatus,
  rowSubline,
  toWorkflowRow,
} from './workflow-row'

// A fixed clock so relative-time assertions are stable.
const NOW = Date.parse('2026-07-09T12:00:00Z')
const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString()

function wf(over: Partial<WorkflowSummary> = {}): WorkflowSummary {
  return { id: 'w1', title: 'My workflow', ...over }
}

describe('rowStatus', () => {
  it('shows the published version as a calm chip when there are no draft edits', () => {
    const s = rowStatus(wf({ published_version: 3, has_draft_changes: false }))
    expect(s).toMatchObject({ published: true, publishedVersion: 3, version: 'v3', hasDraft: false, label: 'v3', tone: 'published' })
  })

  it('marks a published version with unpublished edits as a draft chip (v3 · draft)', () => {
    const s = rowStatus(wf({ published_version: 3, has_draft_changes: true }))
    expect(s).toMatchObject({ published: true, version: 'v3', hasDraft: true, label: 'v3 · draft', tone: 'draft' })
  })

  it('reads an unpublished workflow as a plain Draft with no version', () => {
    const s = rowStatus(wf({}))
    expect(s).toMatchObject({ published: false, publishedVersion: 0, version: null, hasDraft: true, label: 'Draft', tone: 'draft' })
  })

  it('uses the server has_draft_changes field, not a client re-derivation', () => {
    // Published, edits present only per the server flag — the chip trusts it.
    expect(rowStatus(wf({ published_version: 1, has_draft_changes: true })).hasDraft).toBe(true)
    expect(rowStatus(wf({ published_version: 1, has_draft_changes: false })).hasDraft).toBe(false)
  })
})

describe('rowLastRun', () => {
  it('reads a completed run as an ok outcome with a relative time', () => {
    const r = rowLastRun(wf({ last_run: { run_id: 'r1', status: 'completed', started_at: minutesAgo(180) } }), NOW)
    expect(r).toMatchObject({ present: true, tone: 'ok', icon: 'tabler:circle-check', label: '3h ago', status: 'completed' })
    expect(r.title).toBe('Completed · 3h ago')
  })

  it('shows a failed last run as the real error outcome, never masked', () => {
    const r = rowLastRun(wf({ last_run: { run_id: 'r2', status: 'failed', error: 'boom', started_at: minutesAgo(5) } }), NOW)
    expect(r).toMatchObject({ present: true, tone: 'error', icon: 'tabler:alert-triangle', status: 'failed', cause: 'boom' })
    expect(r.title).toBe('Failed · 5m ago · boom')
  })

  it('carries no cause when the run succeeded or its failure records none', () => {
    expect(rowLastRun(wf({ last_run: { run_id: 'r5', status: 'completed', started_at: minutesAgo(5) } }), NOW).cause).toBe('')
    const bare = rowLastRun(wf({ last_run: { run_id: 'r6', status: 'failed', error: '', started_at: minutesAgo(5) } }), NOW)
    expect(bare.cause).toBe('')
    expect(bare.title).toBe('Failed · 5m ago')
  })

  it('reads a running run as a pending outcome', () => {
    const r = rowLastRun(wf({ last_run: { run_id: 'r3', status: 'running', started_at: minutesAgo(1) } }), NOW)
    expect(r).toMatchObject({ present: true, tone: 'pending', icon: 'tabler:loader-2' })
  })

  it('renders an explicit "No runs" when the workflow never ran', () => {
    const r = rowLastRun(wf({ last_run: null }), NOW)
    expect(r).toMatchObject({ present: false, label: 'No runs', icon: 'tabler:minus', status: '' })
  })

  it('falls back to the raw status label when a run carries no timestamp', () => {
    const r = rowLastRun(wf({ last_run: { run_id: 'r4', status: 'completed' } }), NOW)
    expect(r.label).toBe('Completed')
    expect(r.title).toBe('Completed')
  })
})

describe('rowSubline', () => {
  it('joins both counts when both carry information', () => {
    expect(rowSubline(6, 12)).toBe('6 steps · 12 runs')
  })

  it('drops a zero fragment — a workflow with runs but no steps reads "1 run", never "0 steps · 1 run"', () => {
    expect(rowSubline(0, 1)).toBe('1 run')
    expect(rowSubline(3, 0)).toBe('3 steps')
  })

  it('is empty when nothing is worth stating', () => {
    expect(rowSubline(0, 0)).toBe('')
  })

  it('singularizes each fragment', () => {
    expect(rowSubline(1, 1)).toBe('1 step · 1 run')
  })
})

describe('toWorkflowRow', () => {
  it('folds a summary into the full row model', () => {
    const row = toWorkflowRow(
      wf({
        id: 'wf-9',
        title: 'Lead intake',
        node_count: 6,
        run_count: 12,
        updated_at: minutesAgo(30),
        published_version: 2,
        has_draft_changes: true,
        last_run: { run_id: 'r9', status: 'completed', started_at: minutesAgo(90) },
      }),
      NOW,
    )
    expect(row).toMatchObject({
      id: 'wf-9',
      title: 'Lead intake',
      steps: 6,
      runs: 12,
      subline: '6 steps · 12 runs',
      updated: '30m ago',
    })
    expect(row.status.label).toBe('v2 · draft')
    expect(row.lastRun).toMatchObject({ tone: 'ok', label: '2h ago' })
  })

  it('reads "No edits" when the workflow was never touched', () => {
    expect(toWorkflowRow(wf({}), NOW).updated).toBe('No edits')
  })

  it('normalizes W18 labels onto the row (trimmed, de-duplicated)', () => {
    expect(toWorkflowRow(wf({ labels: [' Sales ', 'sales', 'Ops'] }), NOW).labels).toEqual(['Sales', 'Ops'])
  })

  it('defaults labels to an empty array when the summary carries none', () => {
    expect(toWorkflowRow(wf({}), NOW).labels).toEqual([])
  })

  it('maps the breadcrumb location onto a placed row', () => {
    const loc = toWorkflowRow(wf({ parent_name: 'Sales', breadcrumb: 'Sales' }), NOW).location
    expect(loc).toEqual({ present: true, label: 'Sales', title: 'In Sales' })
    // breadcrumb wins over parent_name when both are present.
    expect(rowLocation(wf({ parent_name: 'Old', breadcrumb: 'Sales / Q3' }))).toEqual({ present: true, label: 'Sales / Q3', title: 'In Sales / Q3' })
  })

  it('leaves the location absent (never a dash) when the row is unplaced', () => {
    expect(toWorkflowRow(wf({}), NOW).location).toEqual({ present: false, label: '', title: '' })
  })

  it('maps a list preserving order', () => {
    const rows = mapWorkflowRows([wf({ id: 'a' }), wf({ id: 'b' })], NOW)
    expect(rows.map((r) => r.id)).toEqual(['a', 'b'])
  })
})
