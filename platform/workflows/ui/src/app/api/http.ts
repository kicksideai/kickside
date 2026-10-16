// Shared client core for the workflow definition API. The success-envelope get/post
// wrappers, small record/interface coercions, and the human-readable error mapper every
// domain client builds on. Every call routes through the authenticated proxy; the server
// enforces authorization. Errors are surfaced with the server's own message where present
// (validation copy is already human) and never masked with fake data.

import { api } from '@wippy-fe/proxy'
import type { WorkflowSummary } from '../types'

type ErrorPayload = { error?: unknown; code?: unknown; message?: unknown; details?: unknown }

function record(value: unknown): ErrorPayload | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ErrorPayload : null
}

// API failures carry { code, message, details? }, either directly or inside the standard
// response envelope. Never stringify an object: that would leak `[object Object]` into UI.
export function payloadErrorMessage(value: unknown, fallback = ''): string {
  const body = record(value)
  if (!body) return fallback
  if (typeof body.message === 'string' && body.message.trim()) return body.message.trim()
  const nested = record(body.error)
  if (nested && typeof nested.message === 'string' && nested.message.trim()) return nested.message.trim()
  if (typeof body.error === 'string' && body.error.trim()) return body.error.trim()
  if (nested && typeof nested.code === 'string' && nested.code.trim()) return nested.code.trim()
  if (typeof body.code === 'string' && body.code.trim()) return body.code.trim()
  return fallback
}

export function serverMessage(e: unknown): string {
  const data = e as { response?: { data?: unknown }; data?: unknown; message?: string } | null
  const fromBody = payloadErrorMessage(data?.response?.data) || payloadErrorMessage(data?.data)
  if (fromBody) return fromBody
  if (e instanceof Error && e.message && e.message !== '[object Object]' && !/^request failed/i.test(e.message) && !/status code/i.test(e.message)) return e.message
  return ''
}

export function humanError(e: unknown, fallback: string): string {
  const s = serverMessage(e)
  if (!s) return fallback
  if (/nothing to undo/i.test(s)) return 'Nothing to undo.'
  if (/nothing to redo/i.test(s)) return 'Nothing to redo.'
  // The write API surfaces this as a bare code; the friendly message rides alongside it
  // in the body, so translate the code the FE actually receives.
  if (/boundary_node_remove_refused/i.test(s)) return 'Start, Finish, and Error steps are locked and can’t be deleted.'
  return s
}

export async function post(path: string, body: unknown): Promise<Record<string, unknown>> {
  const { data } = await api.post(path, body)
  if (data && data.success === false) throw new Error(payloadErrorMessage(data, 'request failed'))
  return data as Record<string, unknown>
}

export async function get(path: string): Promise<Record<string, unknown>> {
  const { data } = await api.get(path)
  if (data && data.success === false) throw new Error(payloadErrorMessage(data, 'request failed'))
  return data as Record<string, unknown>
}

export function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {}
}

export function asInterface(v: unknown): WorkflowSummary['interface'] {
  const r = asRecord(v)
  if (!Object.keys(r).length) return null
  return {
    input_schema: r.input_schema,
    output_schema: r.output_schema,
    error_schema: r.error_schema,
    input_count: r.input_count != null ? Number(r.input_count) : undefined,
    output_count: r.output_count != null ? Number(r.output_count) : undefined,
    error_count: r.error_count != null ? Number(r.error_count) : undefined,
    input_keys: Array.isArray(r.input_keys) ? r.input_keys.map(String) : undefined,
    output_keys: Array.isArray(r.output_keys) ? r.output_keys.map(String) : undefined,
    error_keys: Array.isArray(r.error_keys) ? r.error_keys.map(String) : undefined,
  }
}
