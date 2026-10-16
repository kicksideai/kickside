// Page fetchers behind wc-multiselect. Two sources answer the same PageRequest:
//
//  - a list endpoint: GET {source}?q=&limit=&cursor=&parent_id=, rows under
//    response-key (or a generic envelope key), next_cursor for the following
//    page, and an optional boolean `search` declaring server-side search. A row
//    without selectable/drillable flags is a plain selectable item.
//  - a connection's discovery: POST {discover-path} with {q, limit, cursor,
//    parent_id}. Rows are the provider's `resources`; their selectable and
//    drillable flags come from the envelope's `items` built from those same
//    rows, so a flag the provider leaves undeclared reads false exactly as the
//    connection API defines it.
import { api } from '@wippy-fe/proxy'
import type { FetchPage, Page, PageRequest, PickRow } from './resourcePager.ts'

type Row = Record<string, unknown>

export interface RowKeys {
  idKey: string
  labelKey: string
  descKey: string
  iconKey: string
  metaKey: string
  drillKey: string
}

export const GENERIC_ROW_KEYS = ['items', 'results', 'rows', 'data'] as const

function text(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return ''
}

// Pull the rows array off a list response. An explicit responseKey wins;
// otherwise only generic envelope keys are probed — a domain-specific key is the
// consumer's to declare.
export function rowsOf(data: unknown, responseKey: string): Row[] {
  if (!data || typeof data !== 'object') return []
  const body = data as Record<string, unknown>
  if (responseKey && Array.isArray(body[responseKey])) return body[responseKey] as Row[]
  for (const k of GENERIC_ROW_KEYS) {
    if (Array.isArray(body[k])) return body[k] as Row[]
  }
  return []
}

export function toPickRow(raw: Row, keys: RowKeys, flags: { selectable: boolean; drillable: boolean }): PickRow {
  const value = text(raw[keys.idKey])
  const drillId = text(raw[keys.drillKey])
  const label = text(raw[keys.labelKey]) || value || drillId
  return {
    value,
    drillId,
    label,
    description: text(raw[keys.descKey]),
    icon: text(raw[keys.iconKey]),
    meta: keys.metaKey ? text(raw[keys.metaKey]) : '',
    selectable: flags.selectable && value !== '',
    drillable: flags.drillable && drillId !== '',
    raw,
  }
}

function nextCursorOf(body: Record<string, unknown>): string | null {
  const c = body.next_cursor
  return typeof c === 'string' && c !== '' ? c : null
}

export function listSource(opts: { source: string; responseKey: string; pageSize: number; keys: RowKeys }): FetchPage {
  return async (request: PageRequest): Promise<Page> => {
    const params = new URLSearchParams()
    if (request.q) params.set('q', request.q)
    params.set('limit', String(opts.pageSize))
    if (request.cursor) params.set('cursor', request.cursor)
    if (request.parentId) params.set('parent_id', request.parentId)
    const sep = opts.source.includes('?') ? '&' : '?'
    const { data } = await api.get(`${opts.source}${sep}${params.toString()}`)
    const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
    const rows = rowsOf(body, opts.responseKey).map(raw => toPickRow(raw, opts.keys, {
      selectable: raw.selectable !== false,
      drillable: raw.drillable === true,
    }))
    return {
      rows,
      nextCursor: nextCursorOf(body),
      search: typeof body.search === 'boolean' ? body.search : undefined,
    }
  }
}

export class DiscoveryEnvelopeError extends Error {}

export function discoverySource(opts: { connectionId: string; discoverPath: string; pageSize: number; keys: RowKeys }): FetchPage {
  const url = opts.discoverPath.replace('{id}', encodeURIComponent(opts.connectionId))
  return async (request: PageRequest): Promise<Page> => {
    const payload: Record<string, unknown> = { limit: opts.pageSize }
    if (request.q) payload.q = request.q
    if (request.cursor) payload.cursor = request.cursor
    if (request.parentId) payload.parent_id = request.parentId
    const { data } = await api.post(url, payload)
    const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
    const resources = Array.isArray(body.resources) ? body.resources as Row[] : []
    const items = Array.isArray(body.items) ? body.items as Row[] : []
    if (items.length !== resources.length) {
      throw new DiscoveryEnvelopeError('The connection answered a discovery page whose items do not match its resources.')
    }
    const rows = resources.map((raw, i) => toPickRow(raw, opts.keys, {
      selectable: items[i].selectable === true,
      drillable: items[i].drillable === true,
    }))
    return { rows, nextCursor: nextCursorOf(body) }
  }
}
