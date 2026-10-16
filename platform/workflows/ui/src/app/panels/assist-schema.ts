// Universal schema AI-assist client (W10.2). One backend endpoint, one pinned contract,
// generalized from the edge-assist pipeline: the user states an intent in plain words
// ("here I want a lead with email and company") and the endpoint drafts or edits a JSON
// schema in place. Every schema-entry surface reuses <wc-schema-editor>, which calls
// this — no per-surface reimplementations.
//
// Pinned contract:
//   POST /api/v1/workflows/assist/schema
//     { intent, current_schema?, context?: { surface?, sample? } }
//   -> { success, schema, notes? }
//
// Assist can be unavailable at runtime — disabled on a stack, or its model provider
// erroring. A 404, a non-JSON body, or a success:false is read as "assist unavailable" and
// degrades the affordance rather than fabricating a schema.

import { api } from '@wippy-fe/proxy'
import { httpStatus } from '../api/http-error'
import { ASSIST_UNAVAILABLE, humanizeAssistError } from './assist-error'

export interface SchemaAssistContext {
  surface?: string
  sample?: unknown
}

// The backend may make two bounded model attempts. Keep the browser budget slightly
// larger than that total, but never leave the editor in an endless drafting state.
export const SCHEMA_ASSIST_TIMEOUT_MS = 110_000

export type SchemaAssistResult =
  | { schema: Record<string, unknown>; notes?: string }
  | { error: string; unavailable?: boolean }

export function isSchemaAssistOk(r: SchemaAssistResult): r is { schema: Record<string, unknown>; notes?: string } {
  return 'schema' in r
}

const UNAVAILABLE = ASSIST_UNAVAILABLE
const DRAFT_FAILED = 'The assistant couldn’t draft a schema.'

export async function assistSchema(
  intent: string,
  currentSchema?: unknown,
  context: SchemaAssistContext = {},
  signal?: AbortSignal,
): Promise<SchemaAssistResult> {
  const payload: Record<string, unknown> = { intent }
  if (currentSchema !== undefined && currentSchema !== null) payload.current_schema = currentSchema
  const ctx: Record<string, unknown> = {}
  if (context.surface) ctx.surface = context.surface
  if (context.sample !== undefined) ctx.sample = context.sample
  if (Object.keys(ctx).length) payload.context = ctx

  let data: unknown
  try {
    data = (await api.post('/api/v1/workflows/assist/schema', payload, {
      timeout: SCHEMA_ASSIST_TIMEOUT_MS,
      signal,
    })).data
  } catch (e) {
    const code = String((e as { code?: unknown } | null)?.code || '')
    const name = String((e as { name?: unknown } | null)?.name || '')
    if (code === 'ERR_CANCELED' || name === 'CanceledError' || name === 'AbortError') {
      return { error: 'Draft cancelled.' }
    }
    if (httpStatus(e) === 404) return { error: UNAVAILABLE, unavailable: true }
    const body = (e as { response?: { data?: { error?: unknown; message?: unknown } } } | null)?.response?.data
    if (body) return { error: humanizeAssistError(body, e instanceof Error && e.message ? e.message : DRAFT_FAILED) }
    return { error: e instanceof Error && e.message ? e.message : DRAFT_FAILED }
  }
  // A non-object body (e.g. an SPA shell HTML string) is not a valid assist response —
  // read it as assist being unavailable here rather than fabricating a schema.
  if (!data || typeof data !== 'object') return { error: UNAVAILABLE, unavailable: true }
  const d = data as Record<string, unknown>
  if (d.success === false) return { error: humanizeAssistError(d, DRAFT_FAILED) }
  const schema = d.schema
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) return { error: 'The assistant returned no schema.' }
  return { schema: schema as Record<string, unknown>, notes: d.notes != null ? String(d.notes) : undefined }
}
