// Workflow definition lifecycle: list, create, delete, state read, command apply, and the
// undo/redo edit stream — plus the tool argument-schema read a tool node's config form uses.

import { api } from '@wippy-fe/proxy'
import type { ApplyResult, WorkflowSummary } from '../types'
import type { Command } from './commands'
import { normalizeLabels } from '../domain/workflow-labels'
import { asInterface, asRecord, get, post, payloadErrorMessage } from './http'

export async function listWorkflows(options: { filter?: 'published' } = {}): Promise<WorkflowSummary[]> {
  const rows: Record<string, unknown>[] = []
  let offset: number | undefined = 0
  do {
    const params = new URLSearchParams()
    if (options.filter === 'published') params.set('published', 'true')
    params.set('fields', 'labels,head_seq,interface,published_interface,published_def_seq,has_draft_changes,parent_id,parent_name,breadcrumb,last_run,node_count,run_count')
    params.set('limit', '100')
    params.set('offset', String(offset))
    const data = await get(`/api/v1/workflows?${params}`)
    if (!Array.isArray(data.workflows)) throw new Error('The server returns no workflow page.')
    rows.push(...data.workflows as Record<string, unknown>[])
    const next = data.next_offset
    if (next != null && (typeof next !== 'number' || !Number.isSafeInteger(next) || next <= offset)) {
      throw new Error('The server returns an invalid workflow offset.')
    }
    offset = next == null ? undefined : next as number
  } while (offset !== undefined)
  return (rows as Record<string, unknown>[]).map((r) => {
    const lastRun = asRecord(r.last_run)
    return {
      id: String(r.id || ''),
      title: String(r.title || 'Untitled Workflow'),
      status: r.status != null ? String(r.status) : undefined,
      labels: normalizeLabels(r.labels),
      updated_at: r.updated_at != null ? String(r.updated_at) : undefined,
      node_count: r.node_count != null ? Number(r.node_count) : undefined,
      run_count: r.run_count != null ? Number(r.run_count) : undefined,
      head_seq: r.head_seq != null ? Number(r.head_seq) : undefined,
      interface: asInterface(r.interface),
      published_version: r.published_version != null ? Number(r.published_version) : undefined,
      published_def_seq: r.published_def_seq != null ? Number(r.published_def_seq) : undefined,
      published_interface: asInterface(r.published_interface),
      has_draft_changes: r.has_draft_changes === true,
      // Placement is present only on placed, actor-readable rows; a root or access-filtered
      // parent leaves all three absent (never a fabricated location).
      parent_id: r.parent_id != null ? String(r.parent_id) : undefined,
      parent_name: r.parent_name != null ? String(r.parent_name) : undefined,
      breadcrumb: r.breadcrumb != null ? String(r.breadcrumb) : undefined,
      last_run: Object.keys(lastRun).length ? {
        run_id: String(lastRun.run_id || ''),
        status: String(lastRun.status || ''),
        error: lastRun.error != null ? String(lastRun.error) : null,
        started_at: lastRun.started_at != null ? String(lastRun.started_at) : null,
        finished_at: lastRun.finished_at != null ? String(lastRun.finished_at) : null,
      } : null,
    }
  })
}

export async function createWorkflow(title: string, parentId?: string): Promise<string> {
  const data = await post('/api/v1/workflows', { title, parent_id: parentId || undefined })
  const id = String(data.flow_id || '')
  if (!id) throw new Error('the server did not return a Workflow id')
  return id
}

// Remove a workflow component through the shared teardown (DELETE /api/v1/workflows/{id}),
// which purges the definition tables. Used to clear abandoned empty drafts and to delete a
// workflow from its row.
export async function deleteWorkflow(id: string): Promise<void> {
  if (!id) return
  const { data } = await api.delete(`/api/v1/workflows/${encodeURIComponent(id)}`)
  if (data && data.success === false) throw new Error(String(data.error || 'delete failed'))
}

export async function getState(id: string): Promise<Record<string, unknown>> {
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/state`)
  const inner = data.state
  return inner && typeof inner === 'object' ? (inner as Record<string, unknown>) : data
}

function asApplyResult(data: Record<string, unknown>): ApplyResult {
  return {
    events: Array.isArray(data.events) ? (data.events as ApplyResult['events']) : [],
    head_seq: Number(data.head_seq || 0),
    can_undo: data.can_undo === true,
    can_redo: data.can_redo === true,
  }
}

export async function applyCommands(id: string, commands: Command[]): Promise<ApplyResult> {
  // The host proxy supplies authentication. Fetch keepalive allows the current
  // writer to complete during reload; unsent successors live in the journal.
  // Keepalive has a 64 KiB browser-wide body budget. Larger definitions use the
  // ordinary request and remain recoverable from their durable checkpoint.
  const body = { commands }
  const keepalive = new TextEncoder().encode(JSON.stringify(body)).byteLength < 60 * 1024
  const { data } = await api.post(`/api/v1/workflows/${encodeURIComponent(id)}/apply`, body, {
    adapter: 'fetch', fetchOptions: { keepalive },
  })
  if (data && data.success === false) throw new Error(payloadErrorMessage(data, 'request failed'))
  return asApplyResult(data)
}

export async function undo(id: string): Promise<ApplyResult> {
  const data = await post(`/api/v1/workflows/${encodeURIComponent(id)}/undo`, {})
  return asApplyResult(data)
}

export async function redo(id: string): Promise<ApplyResult> {
  const data = await post(`/api/v1/workflows/${encodeURIComponent(id)}/redo`, {})
  return asApplyResult(data)
}
