// Pure formatting/sorting for the runs panel — no API calls, no Vue. The panel lists
// past runs (RunRow, from listRuns) newest-first with a status badge and a relative
// time; this module is the testable core of that read, kept separate from the
// components that fetch and render it.

import type { RunRow } from '../api/api'
import { runFailureReason } from './run-detail'

export type RunTone = 'ok' | 'error' | 'pending'

// The engine's run status vocabulary folded onto a display tone. Unknown/absent
// statuses read as 'pending' rather than guessing at success or failure.
export function runStatusTone(status: string): RunTone {
  const s = status.toLowerCase()
  if (s === 'completed' || s === 'complete' || s === 'success' || s === 'succeeded') return 'ok'
  if (s === 'failed' || s === 'error' || s === 'cancelled' || s === 'canceled' || s === 'terminated') return 'error'
  return 'pending'
}

// The status a run shows: its lifecycle status, except that an active run the engine has
// parked on a signal (an Await or other wait) reads as "waiting" rather than "running".
export function runStatus(run: Pick<RunRow, 'status' | 'dataflow_status'>): string {
  if (runStatusTone(run.status) === 'pending' && run.dataflow_status === 'waiting') return 'waiting'
  return run.status
}

// The human reason a failed run records, or empty when the run did not fail or its
// failure carries no information.
export function runFailureCause(run: Pick<RunRow, 'status' | 'error'>): string {
  return runStatusTone(run.status) === 'error' ? runFailureReason(run.error) : ''
}

// A Title Case label for the raw status string, or "Pending" when absent.
export function runStatusLabel(status: string): string {
  const s = status.trim()
  if (!s) return 'Pending'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Newest-first by start time (falling back to finish time), with the run id as a
// stable tiebreak so equal-timestamp rows don't reorder between renders.
export function sortRunsNewestFirst(rows: RunRow[]): RunRow[] {
  return [...rows].sort((a, b) => {
    const ta = Date.parse(a.started_at || a.finished_at || '') || 0
    const tb = Date.parse(b.started_at || b.finished_at || '') || 0
    if (tb !== ta) return tb - ta
    return b.run_id.localeCompare(a.run_id)
  })
}

// A short relative-time phrase ("just now", "5m ago", "3h ago", "2d ago"), falling
// back to a plain date once it's more than a month old. "—" when absent/unparseable.
export function relativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return '—'
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return '—'
  const diffSec = Math.round((now - t) / 1000)
  if (diffSec < 5) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return new Date(t).toLocaleDateString()
}

// The leading segment of a run id, for a compact display — never the full identifier.
export function shortRunId(runId: string): string {
  return runId.length > 8 ? runId.slice(0, 8) : runId
}

export type RunVersionKind = 'published' | 'draft'

export interface RunVersionBadge {
  label: string
  kind: RunVersionKind
  title: string
}

// A run records the immutable published version it pinned. A positive version ran that
// frozen version ("v3"); version 0 ran the unpublished draft canvas (a simulation), so it
// reads as a distinct "Draft run" rather than a version number — the UI never implies a
// draft run executed a published version.
export function runVersionBadge(version: number | null | undefined): RunVersionBadge {
  const v = Number(version) || 0
  if (v > 0) return { label: `v${v}`, kind: 'published', title: `Ran published version ${v}` }
  return { label: 'Draft run', kind: 'draft', title: 'Ran your current draft — not a published version' }
}
