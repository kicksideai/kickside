// Pure list-row model for the workflow list table — no API calls, no Vue. Folds a
// WorkflowSummary (the list read, which already carries last_run) into the fields the
// dense table renders: a version/draft status chip, a last-run outcome, and relative
// timestamps. Honest data only: the draft marker rides the server's has_draft_changes
// field, and a failed last run reads as the real outcome. Kept separate from the
// component so the mapping is unit-tested without a DOM.

import type { WorkflowSummary } from '../types'
import { normalizeLabels } from '../domain/workflow-labels'
import { relativeTime, runFailureCause, runStatusLabel, runStatusTone, type RunTone } from '../runs/run-history'

// The published version + draft state, folded into one status chip. A published
// workflow shows its frozen version ("v3"); has_draft_changes marks unpublished edits
// on top of it. An unpublished workflow is a plain Draft with no version.
export interface WorkflowRowStatus {
  published: boolean
  publishedVersion: number
  // "v3" for a published version, null when unpublished (nothing to pin yet).
  version: string | null
  // Unpublished, or published-with-unpublished-edits — the "draft*" case.
  hasDraft: boolean
  // One-line label: "v3 · draft" / "v3" / "Draft".
  label: string
  // Chip tone token: a clean published version reads calm, everything with a live
  // draft reads as the draft tone.
  tone: 'published' | 'draft'
}

// The last run's outcome, for the "Last run" column. tone/icon come from the engine's
// real status; a workflow that never ran reads as an explicit "No runs", never a guess.
export interface WorkflowRowLastRun {
  present: boolean
  tone: RunTone
  icon: string
  // Relative time of the run, or "No runs" when absent.
  label: string
  // The raw engine status (empty when absent).
  status: string
  // The failed run's recorded reason; empty when the run did not fail or recorded none.
  cause: string
  // Hover text, e.g. "Failed · 3h ago · Stock is missing".
  title: string
}

// The workspace location shown in the list's Location column: the immediate parent
// container's name. Absent (present:false) when the workflow is unplaced/root or the parent
// is not readable — the cell renders nothing then, never a placeholder dash.
export interface WorkflowRowLocation {
  present: boolean
  // The parent container name (breadcrumb), empty when absent.
  label: string
  // Hover text ("In <name>"), empty when absent.
  title: string
}

export interface WorkflowRow {
  id: string
  title: string
  steps: number
  runs: number
  // Flat organization labels (W18), normalized from the list read.
  labels: string[]
  // Workspace placement, from the backend's access-checked list enrichment.
  location: WorkflowRowLocation
  // The row's meta sub-line: only the fragments that carry information. A zero count is
  // dropped rather than rendered (no "0 steps"), so a fresh workflow reads clean and the
  // "0 steps · 1 run" contradiction never appears. Empty when nothing is worth stating.
  subline: string
  status: WorkflowRowStatus
  lastRun: WorkflowRowLastRun
  // Relative time of the last edit, or "No edits".
  updated: string
}

const LAST_RUN_ICON: Record<RunTone, string> = {
  ok: 'tabler:circle-check',
  error: 'tabler:alert-triangle',
  pending: 'tabler:loader-2',
}

// The row's meta sub-line, folded from step and run counts. Only non-zero fragments are
// emitted, joined with a middot; both-zero yields an empty string. This is what removes
// the "0 steps · 1 run" contradiction — a zero count states nothing, so it is omitted.
export function rowSubline(steps: number, runs: number): string {
  const parts: string[] = []
  if (steps > 0) parts.push(`${steps} step${steps === 1 ? '' : 's'}`)
  if (runs > 0) parts.push(`${runs} run${runs === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

export function rowStatus(wf: WorkflowSummary): WorkflowRowStatus {
  const v = Number(wf.published_version) || 0
  if (v > 0) {
    const hasDraft = wf.has_draft_changes === true
    return {
      published: true,
      publishedVersion: v,
      version: `v${v}`,
      hasDraft,
      label: hasDraft ? `v${v} · draft` : `v${v}`,
      tone: hasDraft ? 'draft' : 'published',
    }
  }
  return { published: false, publishedVersion: 0, version: null, hasDraft: true, label: 'Draft', tone: 'draft' }
}

export function rowLocation(wf: WorkflowSummary): WorkflowRowLocation {
  const name = (wf.breadcrumb || wf.parent_name || '').trim()
  if (!name) return { present: false, label: '', title: '' }
  return { present: true, label: name, title: `In ${name}` }
}

export function rowLastRun(wf: WorkflowSummary, now: number = Date.now()): WorkflowRowLastRun {
  const run = wf.last_run
  if (!run || !run.status) {
    return { present: false, tone: 'pending', icon: 'tabler:minus', label: 'No runs', status: '', cause: '', title: 'No runs yet' }
  }
  const tone = runStatusTone(run.status)
  const when = run.started_at || run.finished_at || null
  const rel = relativeTime(when, now)
  const statusText = runStatusLabel(run.status)
  const cause = runFailureCause(run)
  return {
    present: true,
    tone,
    icon: LAST_RUN_ICON[tone],
    label: when ? rel : statusText,
    status: run.status,
    cause,
    title: [statusText, when ? rel : '', cause].filter(Boolean).join(' · '),
  }
}

export function toWorkflowRow(wf: WorkflowSummary, now: number = Date.now()): WorkflowRow {
  const steps = Number(wf.node_count) || 0
  const runs = Number(wf.run_count) || 0
  return {
    id: wf.id,
    title: wf.title,
    steps,
    runs,
    labels: normalizeLabels(wf.labels),
    location: rowLocation(wf),
    subline: rowSubline(steps, runs),
    status: rowStatus(wf),
    lastRun: rowLastRun(wf, now),
    updated: wf.updated_at ? relativeTime(wf.updated_at, now) : 'No edits',
  }
}

export function mapWorkflowRows(list: WorkflowSummary[], now: number = Date.now()): WorkflowRow[] {
  return list.map((wf) => toWorkflowRow(wf, now))
}

// The rendered list sequence. Flat view is one row per workflow; grouped view interleaves a
// header before each label's rows, so a single table template renders both.
export type ListItem =
  | { kind: 'header'; key: string; header: string; empty: boolean; count: number }
  | { kind: 'row'; key: string; row: WorkflowRow }
