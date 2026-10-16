// The embed's testable core: the client-side input gate and the fold of a run detail into
// the honest render view (W13). All pure — no Vue, no fetch —
// so the state machine is verified against real live run records.

import type { RunRow } from '../api/api'
import { parseSchema } from '@widgets/app/ports'
import { runStatusLabel, runStatusTone, type RunTone } from '../runs/run-history'
import { runFailureReason } from '../runs/run-detail'

// ── Input gate ────────────────────────────────────────────────────────────────
// The Start schema's required fields that the payload does not supply. A field counts as
// supplied when its key is present and not null/blank — the same "fail closed on a missing
// contract field" intent the launch validates server-side, surfaced first as a directed
// message rather than a raw 400. Only presence of declared required keys is checked here;
// deep type validation stays with the server, which owns the canonical schema check.
export function missingRequiredFields(value: unknown, schema: unknown): string[] {
  const parsed = parseSchema(schema)
  const required = Array.isArray(parsed?.required) ? parsed?.required.map(String) : []
  if (!required.length) return []
  const obj = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  return required.filter((key) => {
    const v = obj[key]
    return v == null || (typeof v === 'string' && v.trim() === '')
  })
}

export interface InputGate {
  ok: boolean
  message: string
  missing: string[]
}

// Whether the payload may be launched, with a directed message when it may not. An empty
// payload against a no-required-field schema passes (the workflow runs with an empty input).
export function inputGate(value: unknown, schema: unknown): InputGate {
  const missing = missingRequiredFields(value, schema)
  if (!missing.length) return { ok: true, message: '', missing }
  const label = missing.length === 1 ? `the ${missing[0]} field` : `these fields: ${missing.join(', ')}`
  return { ok: false, message: `Provide ${label} before running.`, missing }
}

// ── Terminal detection ──────────────────────────────────────────────────────
const TERMINAL = new Set(['completed', 'complete', 'success', 'succeeded', 'failed', 'error', 'cancelled', 'canceled', 'terminated'])

export function isTerminalStatus(status: string | null | undefined): boolean {
  return TERMINAL.has(String(status || '').trim().toLowerCase())
}

// ── Run render view ─────────────────────────────────────────────────────────
export type RunPhase = 'running' | 'completed' | 'failed'

export interface RunView {
  phase: RunPhase
  tone: RunTone
  statusLabel: string
  // Present on a completed run: the Finish payload to render read-only.
  output: unknown
  hasOutput: boolean
  // A completed run's endpoint that has not yet attached its output (the run row arrived
  // before output_for_run resolved) — the surface says "completed, output pending" rather
  // than implying an empty result.
  outputPending: boolean
  // The failure reason, reduced to its human sentence; empty when the source recorded only
  // a bare token, in which case the surface shows the honest no-detail fallback.
  reason: string
  hasReason: boolean
}

// Fold a run detail (RunRow, from getRun — completed rows carry `output`) into the view the
// embed renders. Honest per W13: a completed run shows its output; a failed run shows the
// structured reason or the no-detail fallback; anything else is still running.
export function runView(run: RunRow): RunView {
  const tone = runStatusTone(run.status)
  const statusLabel = runStatusLabel(run.status)
  if (tone === 'error') {
    const reason = runFailureReason(run.error)
    return { phase: 'failed', tone, statusLabel, output: undefined, hasOutput: false, outputPending: false, reason, hasReason: !!reason }
  }
  if (tone === 'ok') {
    const hasOutput = run.output !== undefined
    return {
      phase: 'completed', tone, statusLabel,
      output: run.output, hasOutput, outputPending: !hasOutput,
      reason: '', hasReason: false,
    }
  }
  return { phase: 'running', tone, statusLabel, output: undefined, hasOutput: false, outputPending: false, reason: '', hasReason: false }
}
