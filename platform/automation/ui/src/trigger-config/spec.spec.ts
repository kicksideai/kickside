import { describe, expect, it } from 'vitest'
import { classifySource, groupSources, normalizeSpec, resolveSpec, stableStringify, type SourceRow } from './spec'

// The client mirror of platform/automation/src/trigger/resolver.lua (its accept/
// reject matrix lives in platform/automation/src/trigger/resolver_test.lua). This
// table replicates that matrix: every spec the resolver accepts resolves here to
// the same mode, and every spec it rejects gates here — same rejections, so a spec
// this component reports valid never bounces off install.
//
// Spec v2 shape: `source` is a PORT ENTRY id and a port is one kind, so
// classification is single-valued (events -> watch, collection -> poll). Rows carry
// `surface` ('events'|'collection'), `event` (events ports' event-type reference),
// `binding` (the owning binding, presentation only). classifySource / groupSources
// key on `row.id` only.

const WATCH_SOURCE = 'kickside.webhooks:webhook'
const WATCH_TYPE = 'kickside.webhooks.events:webhook.inbound'
const POLL_SOURCE = 'providers.fireflies:transcripts'
const POLL_BINDING = 'providers.fireflies:pull'
const ACME_SOURCE = 'providers.acme:mailbox'
const ACME_TYPE = 'providers.acme.events:mail.received'
const MULTI_EVENT_SOURCE = 'kickside.inbox:inbox'
const PORTLESS_SOURCE = 'providers.acme:portless'
const WATCH_OUTPUT_SCHEMA = { type: 'object', properties: { payload: { type: 'object' } } }

const CATALOG: SourceRow[] = [
  {
    id: WATCH_SOURCE, surface: 'events', event: WATCH_TYPE,
    class: 'kickside.webhooks', title: 'Webhook event received', group: 'Webhooks',
    config_schema: { thread_id: { picker: 'wc-component-picker', title: 'Webhook', detail: 'kickside-webhook-detail', delete_endpoint: '/api/v1/webhooks' } },
    output_schema: WATCH_OUTPUT_SCHEMA,
  },
  {
    id: POLL_SOURCE, binding: POLL_BINDING, surface: 'collection',
    class: 'providers.fireflies', title: 'Fireflies transcripts', group: 'Fireflies',
    config_schema: { connection_id: { picker: 'wc-connection-picker', title: 'Connection' } },
  },
  { id: ACME_SOURCE, surface: 'events', event: ACME_TYPE, class: 'providers.acme', title: 'Mail received' },
  { id: MULTI_EVENT_SOURCE, surface: 'events', event: 'kickside.inbox.events:item.created', class: 'kickside.inbox', title: 'Inbox item created' },
  { id: MULTI_EVENT_SOURCE, surface: 'events', event: 'kickside.inbox.events:item.updated', class: 'kickside.inbox', title: 'Inbox item updated' },
  { id: PORTLESS_SOURCE, title: 'Portless' },
]

const SCHEDULE = { type: 'interval', expression: '30m' }
interface Case {
  name: string
  spec: Record<string, unknown>
  mode?: 'timer' | 'watch' | 'poll'
  reject?: 'invalid_spec' | 'source_not_found'
  msg?: string
}

// One row per resolver rule / rejection (resolver_test.lua).
const MATRIX: Case[] = [
  // Rule 1 — no source -> timer.
  { name: 'timer with schedule', spec: { v: 2, schedule: SCHEDULE }, mode: 'timer' },
  { name: 'timer without schedule', spec: { v: 2 }, reject: 'invalid_spec' },
  { name: 'timer with backfill', spec: { v: 2, schedule: SCHEDULE, backfill: 'all' }, reject: 'invalid_spec' },
  { name: 'timer with backfill days', spec: { v: 2, schedule: SCHEDULE, backfill: { last_days: 7 } }, reject: 'invalid_spec' },
  { name: 'timer with cron schedule', spec: { v: 2, schedule: { type: 'cron', expression: '0 9 * * 1-5' } }, mode: 'timer' },

  // Spec shape (normalizeSpec parity).
  { name: 'missing v', spec: { schedule: SCHEDULE }, reject: 'invalid_spec' },
  { name: 'wrong v', spec: { v: 1, schedule: SCHEDULE }, reject: 'invalid_spec' },
  { name: 'bad schedule type', spec: { v: 2, schedule: { type: 'hourly', expression: '1h' } }, reject: 'invalid_spec' },
  { name: 'empty schedule expression', spec: { v: 2, schedule: { type: 'interval', expression: '  ' } }, reject: 'invalid_spec' },
  { name: 'filter not an object', spec: { v: 2, schedule: SCHEDULE, filter: 'x' }, reject: 'invalid_spec' },
  { name: 'expr not a string', spec: { v: 2, source: WATCH_SOURCE, filter: { expr: 5 } }, reject: 'invalid_spec' },
  { name: 'backfill empty object', spec: { v: 2, source: POLL_SOURCE, backfill: {} }, reject: 'invalid_spec' },
  { name: 'backfill zero last_days', spec: { v: 2, source: POLL_SOURCE, backfill: { last_days: 0 } }, reject: 'invalid_spec' },
  { name: 'backfill fractional last_days', spec: { v: 2, source: POLL_SOURCE, backfill: { last_days: 1.5 } }, reject: 'invalid_spec' },
  { name: 'backfill bad literal', spec: { v: 2, source: POLL_SOURCE, backfill: 'some' }, reject: 'invalid_spec' },

  // Retired fields (event_types / follow / limit) are now rejected as unknown.
  { name: 'unknown filter field event_types', spec: { v: 2, schedule: SCHEDULE, filter: { event_types: ['x'] } }, reject: 'invalid_spec', msg: 'unknown field' },
  { name: 'unknown top-level field follow', spec: { v: 2, source: WATCH_SOURCE, follow: false }, reject: 'invalid_spec', msg: 'unknown field' },
  { name: 'unknown top-level field limit', spec: { v: 2, source: POLL_SOURCE, limit: 50 }, reject: 'invalid_spec', msg: 'unknown field' },

  // Rule 2 — events port -> watch.
  { name: 'watch plain', spec: { v: 2, source: WATCH_SOURCE }, reject: 'invalid_spec' },
  { name: 'watch multi-event source', spec: { v: 2, source: MULTI_EVENT_SOURCE }, reject: 'invalid_spec' },
  { name: 'watch with expr', spec: { v: 2, source: WATCH_SOURCE, filter: { expr: 'item.ok' } }, reject: 'invalid_spec' },
  { name: 'watch with schedule', spec: { v: 2, source: WATCH_SOURCE, schedule: SCHEDULE }, reject: 'invalid_spec' },
  { name: 'watch with backfill all', spec: { v: 2, source: WATCH_SOURCE, backfill: 'all' }, mode: 'watch' },
  { name: 'watch with backfill last_days', spec: { v: 2, source: WATCH_SOURCE, backfill: { last_days: 7 } }, reject: 'invalid_spec' },
  { name: 'watch with backfill since', spec: { v: 2, source: WATCH_SOURCE, backfill: { since: '2026-01-01T00:00:00Z' } }, reject: 'invalid_spec' },
  { name: 'watch with backfill none', spec: { v: 2, source: WATCH_SOURCE, backfill: 'none' }, mode: 'watch' },

  // Rule 3 — collection port -> poll. Backfill is REQUIRED (no engine default).
  { name: 'poll requires backfill', spec: { v: 2, source: POLL_SOURCE }, reject: 'invalid_spec', msg: 'History' },
  { name: 'poll with backfill all', spec: { v: 2, source: POLL_SOURCE, backfill: 'all' }, reject: 'invalid_spec' },
  { name: 'poll with schedule and backfill', spec: { v: 2, source: POLL_SOURCE, schedule: SCHEDULE, backfill: 'none' }, mode: 'poll' },
  { name: 'poll with backfill since', spec: { v: 2, source: POLL_SOURCE, backfill: { since: '2026-01-01T00:00:00Z' } }, reject: 'invalid_spec' },
  { name: 'poll with backfill last_days', spec: { v: 2, source: POLL_SOURCE, backfill: { last_days: 7 } }, reject: 'invalid_spec' },
  { name: 'poll with backfill none', spec: { v: 2, source: POLL_SOURCE, backfill: 'none' }, reject: 'invalid_spec' },
  { name: 'poll with once schedule', spec: { v: 2, source: POLL_SOURCE, backfill: 'all', schedule: { type: 'once', expression: 'now' } }, mode: 'poll' },

  // Rule 4 — classification failures.
  { name: 'unknown source', spec: { v: 2, source: 'nope:nothing' }, reject: 'source_not_found' },
  { name: 'source addressed by its binding id', spec: { v: 2, source: POLL_BINDING }, reject: 'source_not_found' },
  { name: 'source with no usable ports', spec: { v: 2, source: PORTLESS_SOURCE }, reject: 'invalid_spec' },
]

describe('resolveSpec parity matrix', () => {
  for (const c of MATRIX) {
    it(c.name, () => {
      const res = resolveSpec(c.spec, CATALOG)
      if (c.reject) {
        expect(res.resolution).toBeUndefined()
        expect(res.error?.code).toBe(c.reject)
        expect(res.error?.message).toBeTruthy()
        if (c.msg) expect(res.error?.message).toContain(c.msg)
      } else {
        expect(res.error).toBeUndefined()
        expect(res.resolution?.mode).toBe(c.mode)
      }
    })
  }

  it('normalizes like the resolver: trims strings and fills defaults', () => {
    const { spec } = normalizeSpec({
      v: 2,
      source: `  ${WATCH_SOURCE}  `,
      filter: { expr: ' x ' },
    })
    expect(spec).toMatchObject({
      v: 2,
      source: WATCH_SOURCE,
      config: {},
      filter: { expr: 'x' },
      schedule: null,
      backfill: null,
    })
  })

  // Every field has a meaning on the automation round (A36): the schedule's
  // type and expression, the poll page size and pass bounds, the delivery retry
  // delay. Attempts, exhaustion, continuation, schedule timeouts and retries and
  // the trace context are not trigger settings.
  it('keeps the page size, pass bounds and retry delay the round applies', () => {
    const { spec, error } = normalizeSpec({
      v: 2,
      source: POLL_SOURCE,
      backfill: 'all',
      schedule: SCHEDULE,
      poll: { page_size: 25, max_pages_per_run: 4, max_items_per_run: 60 },
      delivery: { retry_after_ms: 1500 },
    })
    expect(error).toBeUndefined()
    expect(spec?.poll).toEqual({ page_size: 25, max_pages_per_run: 4, max_items_per_run: 60 })
    expect(spec?.delivery).toEqual({ retry_after_ms: 1500 })
  })

  it('rejects the fields the round gives no meaning', () => {
    const base = { v: 2, source: POLL_SOURCE, backfill: 'all' }
    expect(normalizeSpec({ ...base, schedule: { ...SCHEDULE, timeout_seconds: 30 } }).error)
      .toBe('How often has an unknown field: timeout_seconds.')
    expect(normalizeSpec({ ...base, schedule: { ...SCHEDULE, max_retries: 2 } }).error)
      .toBe('How often has an unknown field: max_retries.')
    expect(normalizeSpec({ ...base, schedule: SCHEDULE, poll: { continue_after_ms: 1000 } }).error)
      .toBe('Poll settings have an unknown field: continue_after_ms.')
    expect(normalizeSpec({ ...base, schedule: SCHEDULE, poll: { delivery: { retry_after_ms: 1 } } }).error)
      .toBe('Poll settings have an unknown field: delivery.')
    expect(normalizeSpec({ ...base, schedule: SCHEDULE, delivery: { max_attempts: 3 } }).error)
      .toBe('Delivery settings have an unknown field: max_attempts.')
    expect(normalizeSpec({ ...base, schedule: SCHEDULE, delivery: { on_exhausted: 'skip' } }).error)
      .toBe('Delivery settings have an unknown field: on_exhausted.')
    expect(normalizeSpec({ ...base, schedule: SCHEDULE, trace_context: { trace_id: 't' } }).error)
      .toBe('Trigger settings have an unknown field: trace_context.')
  })

  it('requires explicit watch backfill and cadence, rejects a time boundary', () => {
    const watch = resolveSpec({ v: 2, source: WATCH_SOURCE }, CATALOG)
    expect(watch.resolution).toBeUndefined()
    // "All" replays thread history through the watch machine.
    const watchAll = resolveSpec({ v: 2, source: WATCH_SOURCE, backfill: 'all' }, CATALOG)
    expect(watchAll.resolution?.mode).toBe('watch')
    expect(watchAll.resolution?.spec.backfill).toBe('all')
    // A time boundary is not expressible on an events source.
    const watchSince = resolveSpec({ v: 2, source: WATCH_SOURCE, backfill: { since: '2026-01-01T00:00:00Z' } }, CATALOG)
    expect(watchSince.resolution).toBeUndefined()
    expect(watchSince.error?.code).toBe('invalid_spec')
    // A collection source without backfill gates (History required).
    const pollNoBackfill = resolveSpec({ v: 2, source: POLL_SOURCE }, CATALOG)
    expect(pollNoBackfill.resolution).toBeUndefined()
    expect(pollNoBackfill.error?.code).toBe('invalid_spec')
    // With backfill but no cadence it remains unready; the owner must provide both.
    const poll = resolveSpec({ v: 2, source: POLL_SOURCE, backfill: 'all' }, CATALOG)
    expect(poll.resolution).toBeUndefined()
  })
})

describe('classifySource / groupSources', () => {
  it('classifies an events port by its entry id', () => {
    expect(classifySource(WATCH_SOURCE, CATALOG)).toEqual({
      source: WATCH_SOURCE,
      triggerTypes: [WATCH_TYPE],
      hasTrigger: true,
      hasPull: false,
    })
    expect(classifySource('missing', CATALOG)).toBeNull()
  })

  it('classifies a collection port without synthesizing cadence', () => {
    expect(classifySource(POLL_SOURCE, CATALOG)).toEqual({
      source: POLL_SOURCE,
      triggerTypes: [],
      hasTrigger: false,
      hasPull: true,
    })
  })

  it('does not match a port by its owning binding id', () => {
    expect(classifySource(POLL_BINDING, CATALOG)).toBeNull()
  })

  it('groups rows by port id with deduped trigger types', () => {
    const groups = groupSources(CATALOG)
    expect(groups.map(g => g.id)).toEqual([
      WATCH_SOURCE, POLL_SOURCE, ACME_SOURCE, MULTI_EVENT_SOURCE, PORTLESS_SOURCE,
    ])
    const inbox = groups.find(g => g.id === MULTI_EVENT_SOURCE)!
    expect(inbox.triggerTypes).toEqual(['kickside.inbox.events:item.created', 'kickside.inbox.events:item.updated'])
    expect(groups.find(g => g.id === WATCH_SOURCE)?.outputSchema).toBe(WATCH_OUTPUT_SCHEMA)
  })

  it('class filter gates the offering but keeps the full row set for classification', () => {
    const groups = groupSources(CATALOG, ['providers.acme'])
    expect(groups.map(g => g.id)).toEqual([ACME_SOURCE])
    expect(groups.find(g => g.id === ACME_SOURCE)?.hasTrigger).toBe(true)
  })

  it('merges port schema fields across rows, first declaration winning', () => {
    const rows: SourceRow[] = [
      { id: 'x', surface: 'events', event: 't.a', config_schema: { thread_id: { picker: 'wc-component-picker', title: 'A' } } },
      { id: 'x', surface: 'events', event: 't.b', config_schema: { thread_id: { picker: 'other', title: 'B' }, scope: { title: 'Scope' } } },
    ]
    const g = groupSources(rows)[0]
    expect(g.fields?.thread_id.title).toBe('A')
    expect(g.fields?.scope.title).toBe('Scope')
  })
})

describe('stableStringify', () => {
  it('is key-order independent so echoed values compare equal', () => {
    expect(stableStringify({ a: 1, b: { c: [1, 2], d: 'x' } }))
      .toBe(stableStringify({ b: { d: 'x', c: [1, 2] }, a: 1 }))
    expect(stableStringify({ a: 1 })).not.toBe(stableStringify({ a: 2 }))
  })
})
