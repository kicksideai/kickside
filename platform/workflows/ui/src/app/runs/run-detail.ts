// The run inspector's testable core. Folds a node's raw dataflow data rows (from
// GET .../runs/{id}/nodes/{def}/data) into one NodeInspection the drawer renders:
// what the step received, what it produced, why it failed, its agent trace, and its
// timing. All pure — no Vue, no fetch — so the mapping is unit-tested against real run
// records, and the drawer stays a thin presentational shell.

import type { RunNodeDataRow } from '../api/api'
import { extractInputSample, extractOutputSample } from './run-samples'

// ── Error ───────────────────────────────────────────────────────────────────
// A failing node records its reason as a structured { code?, message? } object. Surface its
// code + message and keep the whole object for the details view; a payload that carries no
// message yields an honest "no detail" fallback rather than dressing nothing up as something.
export interface NodeErrorView {
  message: string
  code?: string
  detail?: unknown
  hasDetail: boolean
}

const BARE_FAILURE = /^(failed|failure|error|node failed|step failed)\.?$/i
const GENERIC_HEADLINE = 'This step failed.'

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function firstString(...values: unknown[]): string | undefined {
  for (const v of values) if (typeof v === 'string' && v.trim()) return v.trim()
  return undefined
}

// The newest error-bearing row: a dedicated node.error, or a node.result whose
// discriminator marks the error branch (result.error). Newest-last ordering.
function lastErrorRow(rows: RunNodeDataRow[]): RunNodeDataRow | undefined {
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i]
    if (r.type === 'node.error') return r
    if (r.type === 'node.result' && (r.discriminator || '').startsWith('result.error')) return r
  }
  return undefined
}

function errorFromContent(content: unknown): NodeErrorView {
  if (!isRecord(content)) return { message: GENERIC_HEADLINE, hasDetail: false }
  const code = firstString(content.code)
  const message = firstString(content.message)
  return { message: message || GENERIC_HEADLINE, code, detail: content, hasDetail: !!message }
}

// The failing node's error from its rows, or null when no error row is recorded.
export function extractNodeError(rows: RunNodeDataRow[]): NodeErrorView | null {
  const row = lastErrorRow(rows)
  if (!row) return null
  return errorFromContent(row.content)
}

// A run-level failure reduced to a human sentence plus an optional short code. The engine
// records the reason in several shapes: a plain sentence, a "Node [uuid] failed: <reason>"
// wrapper, a JSON-encoded { code, message } envelope, or a bare token ("Failed"). This is
// the one parser the run top-toast and the on-canvas failure strip both read, so neither
// ever renders a raw JSON object. `generic` marks the no-information fallback (a bare
// token / empty), which the strip suppresses and the toast shows as a plain sentence.
export interface RunErrorView {
  message: string
  code?: string
  generic: boolean
}

function tryJson(s: string): unknown {
  const t = s.trim()
  if (!(t.startsWith('{') || t.startsWith('['))) return undefined
  try { return JSON.parse(t) } catch { return undefined }
}

function runErrorFromRecord(o: Record<string, unknown>): RunErrorView {
  const code = firstString(o.code)
  const message = firstString(o.message)
  if (message && !BARE_FAILURE.test(message)) return { message, code, generic: false }
  return { message: GENERIC_HEADLINE, code, generic: true }
}

export function parseRunError(raw: unknown): RunErrorView {
  if (raw == null) return { message: '', generic: true }
  if (isRecord(raw)) return runErrorFromRecord(raw)
  const s = String(raw).trim()
  if (!s) return { message: '', generic: true }
  // Peel the engine's "Node [uuid] failed:" prefix, then re-inspect the remainder — it may
  // itself be a JSON envelope, a plain sentence, or a bare token.
  const m = s.match(/^Node\s+\[[^\]]+\]\s+failed:\s*(.*)$/i)
  const body = (m ? m[1] : s).trim()
  const parsed = tryJson(body)
  if (isRecord(parsed)) return runErrorFromRecord(parsed)
  if (!body || BARE_FAILURE.test(body)) return { message: GENERIC_HEADLINE, generic: true }
  return { message: body, generic: false }
}

// The engine's run-level error reduced to its human reason, dropping the uuid prefix and
// any JSON envelope. Empty when the reason carries no information — the caller then shows
// the honest fallback.
export function runFailureReason(runError: string | null | undefined): string {
  const view = parseRunError(runError)
  return view.generic ? '' : view.message
}

// ── Agent trace ─────────────────────────────────────────────────────────────
// An agent node emits an agent.action row per generation: { result, tool_calls }. The
// trace is what the model did — the tools it called — distinct from the produced value
// shown as Output. Present only on agent nodes.
export interface AgentAction {
  result: unknown
  toolCalls: unknown[]
  raw: unknown
}

export function extractAgentActions(rows: RunNodeDataRow[]): AgentAction[] {
  const out: AgentAction[] = []
  for (const r of rows) {
    if (r.type !== 'agent.action' || r.content == null) continue
    const c = r.content
    const rec = isRecord(c) ? c : {}
    out.push({
      result: 'result' in rec ? rec.result : undefined,
      toolCalls: Array.isArray(rec.tool_calls) ? rec.tool_calls : [],
      raw: c,
    })
  }
  return out
}

// ── Timing ──────────────────────────────────────────────────────────────────
export interface NodeTiming {
  startedAt?: string
  finishedAt?: string
  durationMs?: number
}

export function extractTiming(rows: RunNodeDataRow[]): NodeTiming {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let startIso: string | undefined
  let endIso: string | undefined
  for (const r of rows) {
    if (!r.created_at) continue
    const t = Date.parse(r.created_at)
    if (!Number.isFinite(t)) continue
    if (t < min) { min = t; startIso = r.created_at }
    if (t > max) { max = t; endIso = r.created_at }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return {}
  return { startedAt: startIso, finishedAt: endIso, durationMs: Math.max(0, max - min) }
}

// A compact duration: "820ms", "3.6s", "1m 4s".
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—'
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const totalSec = Math.round(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m ${sec}s`
}

// ── Payload rendering ───────────────────────────────────────────────────────
// A stable pretty string for any value; strings pass through as their own prose.
export function stringifyPayload(value: unknown): string {
  if (typeof value === 'string') return value
  try { return JSON.stringify(value, null, 2) } catch { return String(value) }
}

// Large payloads collapse to a leading slice with an expand affordance — the drawer
// never dumps thousands of lines as its primary presentation.
export interface TruncatedPayload {
  preview: string
  truncated: boolean
  totalLines: number
  hiddenLines: number
}

export function truncatePayload(text: string, maxLines = 40): TruncatedPayload {
  const lines = text.split('\n')
  if (lines.length <= maxLines) {
    return { preview: text, truncated: false, totalLines: lines.length, hiddenLines: 0 }
  }
  return {
    preview: lines.slice(0, maxLines).join('\n'),
    truncated: true,
    totalLines: lines.length,
    hiddenLines: lines.length - maxLines,
  }
}

// ── The fold ────────────────────────────────────────────────────────────────
export interface NodeInspection {
  input: unknown | null
  output: unknown | null
  error: NodeErrorView | null
  agentActions: AgentAction[]
  timing: NodeTiming
}

export interface BuildOptions {
  // The run failed at this node and no per-node error row was recorded — fall back to
  // the run-level reason so the drawer still says why, honestly.
  failed?: boolean
  runError?: string | null
}

export function buildNodeInspection(rows: RunNodeDataRow[], opts: BuildOptions = {}): NodeInspection {
  let error = extractNodeError(rows)
  if (!error && opts.failed) {
    const reason = runFailureReason(opts.runError)
    error = reason ? { message: reason, hasDetail: true } : { message: GENERIC_HEADLINE, hasDetail: false }
  }
  return {
    input: extractInputSample(rows),
    output: extractOutputSample(rows),
    error,
    agentActions: extractAgentActions(rows),
    timing: extractTiming(rows),
  }
}
