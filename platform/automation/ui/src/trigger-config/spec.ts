// Trigger Spec v2 client model: the same shape (kickside.trigger:trigger_spec_schema,
// every field one the automation round gives a meaning) and the same source
// rules the kinds apply at install, so the WC gates a spec with the same
// accept/reject matrix before install ever runs.
// Mode words live in this module only; the UI surfaces "When" + "How often" +
// "History". The spec's `source` is a PORT ENTRY id and a port is one kind, so
// rules are the kinds' install rules:
//   1. no source        -> timer (schedule required; backfill rejected)
//   2. events port      -> watch (schedule rejected; explicit backfill required)
//   3. collection port  -> poll (explicit backfill and cadence required)

import type { IoFieldDef, IoSchema } from '@widgets/app/ports'

export const SPEC_VERSION = 2

export const SCHEDULE_TYPES = ['once', 'interval', 'ticker', 'cron'] as const
export type ScheduleType = (typeof SCHEDULE_TYPES)[number]

export interface TriggerSchedule {
  type: ScheduleType
  expression: string
}
export type TriggerBackfill = 'all' | 'none' | { since?: string; last_days?: number }

// Collection acquisition bounds (round.page_size, round.max_pages, round.max_items).
export interface TriggerPoll {
  page_size?: number
  max_pages_per_run?: number
  max_items_per_run?: number
}

// Per-item delivery retry delay (round delivery.retry_after_ms).
export interface TriggerDelivery {
  retry_after_ms?: number
}

// Normalized Trigger Spec v2 (kickside.trigger:trigger_spec_schema shape, with the
// install normalization applied: trimmed strings, declared overrides retained).
export interface TriggerSpec {
  v: 2
  source: string
  config: Record<string, unknown>
  filter: { expr: string }
  schedule: TriggerSchedule | null
  backfill: TriggerBackfill | null
  poll?: TriggerPoll
  delivery?: TriggerDelivery
}

export type TriggerMode = 'timer' | 'watch' | 'poll'

export interface SpecError {
  code: 'invalid_spec' | 'source_not_found'
  message: string
}

export interface SpecResolution {
  mode: TriggerMode
  spec: TriggerSpec
}

// One row of GET /api/v1/automations/sources — a source PORT descriptor. `id` is
// the port entry id; `binding` is the owning binding id (presentation only).
export interface SourceRow {
  id: string
  binding?: string
  surface?: string
  event?: string
  class?: string
  title?: string
  name?: string
  icon?: string
  description?: string
  provider?: string
  group?: string
  config_schema?: IoSchema
  output_schema?: unknown
  component?: { create_ui?: unknown; [k: string]: unknown }
}

// A source port folded to its machine kind — the client mirror of
// install-time source classification. A port is one kind, so hasTrigger/hasPull are
// mutually exclusive.
export interface SourceClassification {
  source: string
  triggerTypes: string[]
  hasTrigger: boolean
  hasPull: boolean
}

// One "When" catalog entry: a source port carrying classification plus the
// presentation/config surface.
export interface GroupedSource extends SourceClassification {
  id: string
  title: string
  icon: string
  group: string
  description: string
  provider: string
  class: string
  component?: SourceRow['component']
  outputSchema?: unknown
  // The port's config schema fields — the instance picker + option fields read this.
  fields: Record<string, IoFieldDef> | undefined
}

const SPEC_FIELDS = new Set(['v', 'source', 'config', 'schedule', 'backfill', 'filter', 'poll', 'delivery'])
const FILTER_FIELDS = new Set(['expr'])

function trim(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function isPositiveInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v > 0
}

function invalid(message: string): { error: SpecError } {
  return { error: { code: 'invalid_spec', message } }
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

// A source is classified by its port entry id (matched exactly). A port declares
// one surface, so events and collection are mutually exclusive.
export function classifySource(source: string, rows: SourceRow[]): SourceClassification | null {
  const triggerTypes: string[] = []
  let hasPull = false
  let found = false
  for (const row of rows) {
    if (String(row.id || '') !== source) continue
    found = true
    if (row.surface === 'events' && typeof row.event === 'string' && row.event) {
      triggerTypes.push(row.event)
    } else if (row.surface === 'collection') {
      hasPull = true
    }
  }
  if (!found) return null
  return { source, triggerTypes, hasTrigger: triggerTypes.length > 0, hasPull }
}

// groupSources folds catalog rows into one entry per source PORT (keyed by the
// port entry id). classFilter only gates which ports the picker OFFERS (a port
// stays when its class matches); classification always reads by port id so the
// client resolves exactly like install does.
export function groupSources(rows: SourceRow[], classFilter: string[] = []): GroupedSource[] {
  const byId = new Map<string, SourceRow[]>()
  for (const row of rows) {
    const id = String(row.id || '')
    if (!id) continue
    if (!byId.has(id)) byId.set(id, [])
    byId.get(id)!.push(row)
  }
  const out: GroupedSource[] = []
  for (const [id, group] of byId) {
    if (classFilter.length && !group.some(r => classFilter.includes(String(r.class || '')))) continue
    const cls = classifySource(id, group)!
    const first = group[0]
    let fields: Record<string, IoFieldDef> | undefined
    for (const row of group) {
      const f = row.config_schema as Record<string, IoFieldDef> | undefined
      if (!f) continue
      if (!fields) fields = {}
      for (const [key, def] of Object.entries(f)) {
        if (!(key in fields)) fields[key] = def
      }
    }
    out.push({
      ...cls,
      id,
      title: first.title || first.name || id,
      icon: first.icon || '',
      group: first.group || '',
      description: first.description || '',
      provider: first.provider || '',
      class: String(first.class || ''),
      component: first.component,
      outputSchema: first.output_schema,
      fields,
    })
  }
  return out
}

// ─── Spec normalization (shape checks before any source classification) ──────

function normalizeSchedule(raw: unknown): { out?: TriggerSchedule | null; error?: string } {
  if (raw == null) return { out: null }
  if (typeof raw !== 'object' || Array.isArray(raw)) return { error: 'How often must carry a schedule type and expression.' }
  const s = raw as Record<string, unknown>
  const stype = trim(s.type)
  if (!(SCHEDULE_TYPES as readonly string[]).includes(stype)) {
    return { error: 'How often must be one of: once, interval, ticker, cron.' }
  }
  const expression = trim(s.expression)
  if (!expression) return { error: 'How often needs an expression.' }
  for (const key of Object.keys(s)) {
    if (key !== 'type' && key !== 'expression') return { error: `How often has an unknown field: ${key}.` }
  }
  return { out: { type: stype as ScheduleType, expression } }
}

function normalizeBackfill(raw: unknown): { out?: TriggerBackfill | null; error?: string } {
  if (raw == null) return { out: null }
  if (raw === 'all' || raw === 'none') return { out: raw }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const b = raw as Record<string, unknown>
    const since = trim(b.since)
    const lastDays = b.last_days
    if (lastDays != null && !isPositiveInt(lastDays)) {
      return { error: 'History "last days" must be a positive whole number.' }
    }
    if (!since && lastDays == null) {
      return { error: 'History must be all, only new, a number of days, or a start date.' }
    }
    const out: TriggerBackfill = {}
    if (since) out.since = since
    if (lastDays != null) out.last_days = lastDays as number
    return { out }
  }
  return { error: 'History must be all, only new, a number of days, or a start date.' }
}

function optionalInteger(raw: unknown, name: string, minimum: number): { value?: number; error?: string } {
  if (raw == null) return {}
  if (typeof raw !== 'number' || !Number.isSafeInteger(raw) || raw < minimum) {
    return { error: `${name} must be an integer of at least ${minimum}.` }
  }
  return { value: raw }
}

function normalizePoll(raw: unknown): { out?: TriggerPoll; error?: string } {
  if (raw == null) return { out: {} }
  if (typeof raw !== 'object' || Array.isArray(raw)) return { error: 'Poll settings must be an object.' }
  const value = raw as Record<string, unknown>
  const allowed = new Set(['page_size', 'max_pages_per_run', 'max_items_per_run'])
  for (const key of Object.keys(value)) if (!allowed.has(key)) return { error: `Poll settings have an unknown field: ${key}.` }
  const out: TriggerPoll = {}
  for (const [key, label, minimum] of [
    ['page_size', 'Page size', 1],
    ['max_pages_per_run', 'Pages per run', 1],
    ['max_items_per_run', 'Items per run', 0],
  ] as const) {
    const parsed = optionalInteger(value[key], label, minimum)
    if (parsed.error) return { error: parsed.error }
    if (parsed.value !== undefined) out[key] = parsed.value
  }
  return { out }
}

function normalizeDelivery(raw: unknown): { out?: TriggerDelivery; error?: string } {
  if (raw == null) return {}
  if (typeof raw !== 'object' || Array.isArray(raw)) return { error: 'Delivery settings must be an object.' }
  const value = raw as Record<string, unknown>
  for (const key of Object.keys(value)) {
    if (key !== 'retry_after_ms') return { error: `Delivery settings have an unknown field: ${key}.` }
  }
  const retryAfter = optionalInteger(value.retry_after_ms, 'Delivery retry delay', 1)
  if (retryAfter.error) return { error: retryAfter.error }
  return { out: retryAfter.value !== undefined ? { retry_after_ms: retryAfter.value } : {} }
}

export function normalizeSpec(raw: unknown): { spec?: TriggerSpec; error?: string } {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: 'Trigger settings must be an object.' }
  }
  const s = raw as Record<string, unknown>
  if (s.v !== SPEC_VERSION) return { error: 'Trigger settings require v = 2.' }
  for (const k of Object.keys(s)) {
    if (!SPEC_FIELDS.has(k)) return { error: `Trigger settings have an unknown field: ${k}.` }
  }

  const filterRaw = s.filter
  if (filterRaw != null && (typeof filterRaw !== 'object' || Array.isArray(filterRaw))) {
    return { error: 'The event filter must be an object.' }
  }
  const filter = (filterRaw ?? {}) as Record<string, unknown>
  for (const k of Object.keys(filter)) {
    if (!FILTER_FIELDS.has(k)) return { error: `The event filter has an unknown field: ${k}.` }
  }
  if (filter.expr != null && typeof filter.expr !== 'string') {
    return { error: 'The filter expression must be text.' }
  }

  const schedule = normalizeSchedule(s.schedule)
  if (schedule.error) return { error: schedule.error }

  const backfill = normalizeBackfill(s.backfill)
  if (backfill.error) return { error: backfill.error }

  const poll = normalizePoll(s.poll)
  if (poll.error) return { error: poll.error }

  const delivery = normalizeDelivery(s.delivery)
  if (delivery.error) return { error: delivery.error }

  return {
    spec: {
      v: SPEC_VERSION,
      source: trim(s.source),
      config: (typeof s.config === 'object' && s.config && !Array.isArray(s.config))
        ? { ...(s.config as Record<string, unknown>) }
        : {},
      filter: { expr: trim(filter.expr) },
      schedule: schedule.out!,
      backfill: backfill.out!,
      poll: s.poll == null ? undefined : poll.out,
      delivery: delivery.out,
    },
  }
}

// ─── Resolution (rules 1-3, install parity) ─────────────────────────────────────

function resolveTimer(spec: TriggerSpec): { resolution?: SpecResolution; error?: SpecError } {
  if (spec.backfill != null) {
    return invalid('History imports a source\'s existing items — "On a schedule" has no source.')
  }
  if (!spec.schedule) {
    return invalid('How often is required — pick a schedule.')
  }
  if (spec.poll != null) return invalid('Poll settings apply only to a collection source.')
  return { resolution: { mode: 'timer', spec } }
}

function resolveWatch(spec: TriggerSpec): { resolution?: SpecResolution; error?: SpecError } {
  if (spec.schedule) {
    return invalid('This source runs on each incoming event — a schedule does not apply.')
  }
  if (spec.poll != null) return invalid('Poll settings apply only to a collection source.')
  // Thread events are durable history, so History is the cursor start position:
  // "All" replays from the start, "Only new" starts at the head. A time boundary
  // (days / since) is not expressible on an events source.
  const bf = spec.backfill
  if (bf == null) return invalid('History is required for this source — choose all or only new.')
  if (bf === 'all' || bf === 'none') return { resolution: { mode: 'watch', spec } }
  return invalid('This is an events source — History can be "All" (from the start) or "Only new".')
}

function resolvePoll(spec: TriggerSpec): { resolution?: SpecResolution; error?: SpecError } {
  if (spec.backfill == null) {
    return invalid('History is required for this source — choose all, only new, a number of days, or a start date.')
  }
  if (!spec.schedule) return invalid('How often is required for this source — pick a cadence.')
  return { resolution: { mode: 'poll', spec } }
}

export function resolveSpec(raw: unknown, rows: SourceRow[]): { resolution?: SpecResolution; error?: SpecError } {
  const norm = normalizeSpec(raw)
  if (norm.error || !norm.spec) return { error: { code: 'invalid_spec', message: norm.error || 'Invalid trigger settings.' } }
  const spec = norm.spec

  if (!spec.source) return resolveTimer(spec)

  const source = classifySource(spec.source, rows)
  if (!source) {
    return { error: { code: 'source_not_found', message: 'This source is not available.' } }
  }
  if (source.hasTrigger) return resolveWatch(spec)
  if (source.hasPull) return resolvePoll(spec)
  return invalid('This source announces no events and cannot be checked for items.')
}

// ─── Identity (echo guard) ────────────────────────────────────────────────────

// Key-order-stable JSON, so a spec echoed back through attribute serialization
// compares equal to the one this component emitted.
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const keys = Object.keys(value as Record<string, unknown>).sort()
  const body = keys
    .filter(k => (value as Record<string, unknown>)[k] !== undefined)
    .map(k => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
  return `{${body.join(',')}}`
}
