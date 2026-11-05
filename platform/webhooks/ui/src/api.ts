import { ref } from 'vue'
import { api, host } from '@wippy-fe/proxy'
import { errMsg as baseErrMsg } from '@widgets/app/errMsg'
import { friendlyError } from './app/labels'
import type { WebhookRow, MintedWebhook } from './types'

interface ApiError {
  response?: { data?: { error?: unknown }; status?: number }
  message?: string
}

// Resolve a user-facing message from a thrown api error, routing 401s through the
// host's auth handler. Falls back to the supplied default.
export function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === 'object') {
    const ax = e as ApiError
    if (ax.response?.status === 401) host.handleError('auth-expired', ax as Record<string, unknown>)
  }
  return baseErrMsg(e, fallback)
}

export async function fetchWebhooks(): Promise<WebhookRow[]> {
  try {
    const rows: WebhookRow[] = []
    let cursor: string | undefined
    do {
      const path = '/api/v1/webhooks' + (cursor ? '?cursor=' + encodeURIComponent(cursor) : '')
      const { data } = await api.get(path)
      if (!data?.success) throw new Error(data?.error || 'failed to load webhooks')
      rows.push(...data.webhooks)
      cursor = data.next_cursor
    } while (cursor)
    return rows
  } catch (e) {
    throw new Error(errMsg(e, 'could not load webhooks'))
  }
}

// One webhook by id (== its thread/component id). The list is the only read API, so
// the row is resolved from it. Returns null when the id is not among the caller's
// webhooks.
export async function fetchWebhook(id: string): Promise<WebhookRow | null> {
  const rows = await fetchWebhooks()
  return rows.find(r => r.webhook_id === id) || null
}

export interface CreateArgs {
  label?: string
  // The JSON Schema each inbound payload is validated against. Persisted as the
  // webhook instance's item_schema; an empty object accepts any object.
  schema?: Record<string, unknown>
}

export async function createWebhook(args: CreateArgs): Promise<MintedWebhook> {
  try {
    const { data } = await api.post('/api/v1/webhooks', args)
    if (!data?.success || !data.webhook) throw new Error(data?.error || 'create failed')
    return data.webhook as MintedWebhook
  } catch (e) {
    throw new Error(errMsg(e, 'could not create webhook'))
  }
}

export async function revokeWebhook(id: string): Promise<void> {
  try {
    const { data } = await api.post('/api/v1/webhooks/' + encodeURIComponent(id) + '/revoke', {})
    if (!data?.success) throw new Error(data?.error || 'revoke failed')
  } catch (e) {
    throw new Error(errMsg(e, 'could not revoke webhook'))
  }
}

export async function deleteWebhook(id: string): Promise<void> {
  try {
    const { data } = await api.delete('/api/v1/webhooks/' + encodeURIComponent(id))
    if (!data?.success) throw new Error(data?.error || 'delete failed')
  } catch (e) {
    throw new Error(friendlyError(errMsg(e, 'could not delete webhook')))
  }
}

export async function updateWebhook(id: string, patch: { label?: string; schema?: Record<string, unknown> }): Promise<WebhookRow> {
  try {
    const { data } = await api.patch('/api/v1/webhooks/' + encodeURIComponent(id), patch)
    if (!data?.success || !data.webhook) throw new Error(data?.error || 'update failed')
    return data.webhook as WebhookRow
  } catch (e) {
    throw new Error(errMsg(e, 'could not update webhook'))
  }
}

// PUBLIC_API_URL is the app's configured public base. It is served as an ES module at
// /api/public/env/public.js — the same module the app bootstrap imports — so the
// value is read once from there and cached. It is reactive so any view calling
// ingressUrl re-renders once the base resolves.
const publicApiBase = ref('')
let publicEnvRequested = false
async function ensurePublicApiBase(): Promise<void> {
  if (publicEnvRequested) return
  publicEnvRequested = true
  try {
    // A runtime-built specifier so the bundler leaves this as a live import of the
    // app-served env module (the same one the app bootstrap imports) rather than
    // trying to resolve it at build time.
    const spec = '/api/public/env/' + 'public.js'
    const mod = await import(/* @vite-ignore */ spec) as Record<string, unknown>
    const env = mod.default as Record<string, unknown> | undefined
    const base = env && typeof env.PUBLIC_API_URL === 'string' ? env.PUBLIC_API_URL : ''
    if (base) publicApiBase.value = base.replace(/\/+$/, '')
  } catch {
    // env module unavailable — ingressUrl falls back to the browser origin.
  }
}

// The public ingress URL for a webhook. The list endpoint returns no URL (only the
// mint response does), so the page derives it from the id — the same path
// create_webhook.lua builds: /api/public/hooks/{id}. The base is the configured
// PUBLIC_API_URL (correct behind a proxy/tunnel), falling back to the browser origin
// when that env is absent.
export function ingressUrl(webhookId: string): string {
  ensurePublicApiBase()
  const path = '/api/public/hooks/' + webhookId
  const base = publicApiBase.value || window.location.origin
  try {
    return new URL(path, base).toString()
  } catch {
    return path
  }
}
