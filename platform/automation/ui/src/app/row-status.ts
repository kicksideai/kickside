// Per-row status rendering, driven entirely by the type's declared
// public_state_schema against the row's materialized public_state. Every
// automation gets a status line, a pill, and its metrics for free — no per-type
// code, no second source of truth, and no fetch: the list row already carries
// the state these functions read.

import { relativeTime } from '@widgets/app/datetime'
import type { AutomationAvailability, AutomationStatus, PublicStateField } from './automation-types'
import { drivePill, type DriveStatus } from './drive-status'

export interface Metric { label: string; value: string; title?: string; icon?: string }

export type StatusKind = 'on' | 'off' | 'warn' | 'live' | 'done' | 'neutral'
export interface RowMessage { tone: 'success' | 'error'; text: string }
export interface StatusPill { kind: StatusKind; label: string }

// Fields the card face renders through its own chrome (the pill, the sub-line,
// the message strip) rather than as a generic metric.
const METRIC_SKIP = new Set(['status', 'enabled', 'last_error', 'last_run_at', 'next_run_at'])

function humanize(k: string): string {
  return k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
// Title-case a label so the card reads consistently (e.g. "Last interrupted" -> "Last Interrupted").
function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}
function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// Render one field's value: timestamps as relative time, enum-ish text capitalized,
// booleans as Yes/No; numeric values render as their coerced form.
function fieldDisplay(f: PublicStateField, v: number | string | boolean): string {
  if (f.type === 'boolean') return v === true ? 'Yes' : 'No'
  const s = String(v)
  if (f.key.endsWith('_at') || /^\d{4}-\d{2}-\d{2}T/.test(s)) return relativeTime(s, { future: true }) || s
  if (f.type === 'text') return capitalize(s)
  return s
}

// A raw portable key / UUID / ULID surfaces in a status field when the value is an
// item id (a skipped or failed item). It carries no meaning to the reader, so it
// renders as a truncated neutral chip with the full value kept in the title.
function isRawKeyValue(s: string): boolean {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return true // uuid
  if (/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(s)) return true // ulid
  // composite portable key: "<prefix>:<...>" whose tail is an opaque id.
  return /^[a-z][a-z0-9_-]*:[a-z0-9][a-z0-9:_-]*$/i.test(s) && /:[0-9a-f-]{6,}/i.test(s)
}
function keyDisplay(s: string): { text: string; title?: string } {
  if (!isRawKeyValue(s)) return { text: s }
  const head = s.length > 12 ? `${s.slice(0, 8)}…` : s
  return { text: head, title: s }
}

// Skip and drop reasons the sync engine records are raw transform, sink, and scope
// error strings (sync.lua failure_msg -> last_skip_reason / last_trigger_drop_reason).
// Map the enumerable classes to operator language; an unrecognized reason reads as a
// plain "Skipped" with the technical string kept in the tooltip.
const SKIP_REASON_COPY: Array<{ match: RegExp; text: string }> = [
  { match: /component_id not in scope|not in scope/i, text: 'Not part of this workspace' },
  { match: /transform output must be an object/i, text: 'Item format not recognized' },
  { match: /trigger events dropped/i, text: 'Incoming events were dropped' },
  { match: /requires dest_ref/i, text: 'Missing a destination reference' },
  { match: /does not declare sink operation|accepts source payloads only/i, text: 'Destination cannot accept this item' },
  { match: /sink write (returned a non-object|did not acknowledge)/i, text: 'Destination did not confirm the save' },
  { match: /(sink|source) resolve/i, text: 'Source or destination unavailable' },
]
function reasonCopy(raw: string): { text: string; title?: string } {
  const s = raw.trim()
  if (!s) return { text: '' }
  for (const rule of SKIP_REASON_COPY) {
    if (rule.match.test(s)) return { text: rule.text, title: s }
  }
  return { text: 'Skipped', title: s }
}

// A reason field carries a technical error string; a value that identifies a single
// offending item carries a raw id. Both belong in the row's disclosure rather than
// on the card face, where only counts and readable status stay.
function isReasonField(key: string): boolean {
  return /reason/i.test(key)
}
function isDetailField(f: PublicStateField, value: unknown): boolean {
  if (isReasonField(f.key)) return true
  if (/(^|_)item(_key)?$/i.test(f.key)) return true
  return typeof value === 'string' && isRawKeyValue(value)
}

function buildMetric(f: PublicStateField, v: number | string | boolean): Metric {
  const label = titleCase(f.label || humanize(f.key))
  if (isReasonField(f.key)) {
    const { text, title } = reasonCopy(String(v))
    return { label, value: text, title, icon: f.icon }
  }
  const { text, title } = keyDisplay(fieldDisplay(f, v))
  return { label, value: text, title, icon: f.icon }
}

// Split a row's status fields into the card-face metrics (counts, readable status)
// and the disclosure metrics (offending item ids, technical reasons), so the face
// never carries a raw id or a technical reason string.
export function collectMetrics(
  fields: PublicStateField[] | undefined,
  status: AutomationStatus | undefined,
  detail: boolean,
): Metric[] {
  const st = status as Record<string, unknown> | undefined
  if (!fields || !st) return []
  const out: Metric[] = []
  for (const f of fields) {
    if (!f?.key || METRIC_SKIP.has(f.key) || f.role === 'subtitle') continue
    const v = st[f.key] as number | string | boolean
    if (v === undefined || v === null || v === '') continue
    if (f.hidden) continue
    if (f.hide_zero && v === 0) continue
    if (isDetailField(f, v) !== detail) continue
    out.push(buildMetric(f, v))
  }
  return out
}

function statusValue(s?: AutomationStatus): string {
  return String(s?.status || '').toLowerCase()
}
export function isSuccessNotice(text?: string | null): boolean {
  return typeof text === 'string' && /\b(completed|succeeded|successfully)\b/i.test(text)
}
export function isTerminalStatus(s?: AutomationStatus): boolean {
  const status = statusValue(s)
  return status === 'completed' || status === 'failed'
}
export function isFailureStatus(s?: AutomationStatus): boolean {
  const status = statusValue(s)
  if (status === 'failed' || status === 'failing') return true
  return !!s?.last_error && !isSuccessNotice(s.last_error)
}
export function rowMessage(s?: AutomationStatus, availability?: AutomationAvailability): RowMessage | null {
  if (availability?.code === 'unavailable') return { tone: 'error', text: 'Its module is unavailable. Reinstall its module to use this automation.' }
  const text = typeof s?.last_error === 'string' ? s.last_error.trim() : ''
  if (!text) return null
  return isFailureStatus(s) ? { tone: 'error', text } : { tone: 'success', text }
}

// Status pill — the drive status of an automation the round drives, else the
// row's public state. Falls back to a neutral pill when the type exposes no
// status action to report one.
export function statusPill(s: AutomationStatus | undefined, hasStatusAction: boolean, drives?: DriveStatus | null, availability?: AutomationAvailability): StatusPill {
  if (availability?.code === 'unavailable') return { kind: 'warn', label: 'Unavailable' }
  const driven = drivePill(drives)
  if (driven) return driven
  if (!s) {
    return hasStatusAction ? { kind: 'neutral', label: '…' } : { kind: 'neutral', label: 'Installed' }
  }
  const status = statusValue(s)
  if (isFailureStatus(s)) return { kind: 'warn', label: status === 'failed' ? 'Failed' : 'Failing' }
  if (status === 'completed') return { kind: 'done', label: 'Completed' }
  if (status === 'paused' || s.enabled === false) return { kind: 'off', label: 'Paused' }
  if (status === 'running') return { kind: 'live', label: 'Running' }
  return { kind: 'on', label: 'Active' }
}

// The badge is a PrimeVue Tag, so the state maps to a severity the theme
// already paints - no KickSide colour class in between. 'warn' is the failure
// kind here and 'off' the merely-paused one, which is why they land on danger
// and warn rather than the other way round.
export function statusSeverity(kind: StatusKind): string {
  switch (kind) {
    case 'on': case 'live': case 'done': return 'success'
    case 'warn': return 'danger'
    case 'off': return 'warn'
    default: return 'secondary'
  }
}

// The row subtitle: the value of the public-state field the type declares with
// role subtitle (e.g. a data sync's "On upload completed" or "Every 15 min").
export function subtitleOf(fields: PublicStateField[] | undefined, status: AutomationStatus | undefined): string {
  const field = (fields || []).find(f => f?.role === 'subtitle')
  const value = field ? (status as Record<string, unknown> | undefined)?.[field.key] : undefined
  return typeof value === 'string' ? value.trim() : ''
}
