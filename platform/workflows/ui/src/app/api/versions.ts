// Published versions and publishing: the version list, a single frozen version's read-only
// summary, and the fold+compile publish call — which refuses an uncompilable graph with the
// compiler's own per-node reasons carried on a PublishError.

import { api } from '@wippy-fe/proxy'
import type { WorkflowInterface } from '../types'
import { asInterface, asRecord, get, post } from './http'

export async function assistWorkflowBinding(id: string, sourceSchema: unknown, startSchema: unknown): Promise<string> {
  const result = await post(`/api/v1/workflows/${encodeURIComponent(id)}/assist/binding`, {
    source_context_schema: sourceSchema, target_start_schema: startSchema,
    source_root: 'payload', intent: 'Map the source item to the Workflow Start input.',
  })
  if (typeof result.transform !== 'string' || !result.transform) throw new Error('Binding assist returns no transform.')
  return result.transform
}

export interface PublishResult {
  version: number
  hash?: string
}

export interface WorkflowVersionSummary {
  version: number
  def_seq: number
  created_at?: string
  created_by?: string
}

export async function listWorkflowVersions(id: string): Promise<WorkflowVersionSummary[]> {
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/versions`)
  const rows = Array.isArray(data.versions) ? (data.versions as Record<string, unknown>[]) : []
  return rows.map((r) => ({
    version: Number(r.version || 0),
    def_seq: Number(r.def_seq || 0),
    created_at: r.created_at != null ? String(r.created_at) : undefined,
    created_by: r.created_by != null ? String(r.created_by) : undefined,
  })).filter((r) => r.version > 0)
}

// One frozen published version, read-only. Carries the derived Start/Finish/Error
// interface the version pinned at publish — the history panel renders this summary so a
// past version's contract is inspectable without loading its graph. The endpoint also
// returns the full document/compiled commands; the client keeps only what the read-only
// summary needs (no graph time-travel).
export interface WorkflowVersionDetail {
  version: number
  def_seq: number
  created_at?: string
  created_by?: string
  interface: WorkflowInterface | null
  input_schema?: unknown
}

export interface VersionGraphChange {
  id: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export interface WorkflowVersionDiff {
  from_version: number
  to_version: number
  interface: { before: unknown; after: unknown; changes: unknown[] }
  graph: {
    nodes: { added: VersionGraphChange[]; removed: VersionGraphChange[]; changed: VersionGraphChange[] }
    edges: { added: VersionGraphChange[]; removed: VersionGraphChange[]; changed: VersionGraphChange[] }
  }
}

export async function getWorkflowVersion(id: string, n: number): Promise<WorkflowVersionDetail> {
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/versions/${encodeURIComponent(String(n))}`)
  const v = asRecord(data.version)
  return {
    version: Number(v.version || 0),
    def_seq: Number(v.def_seq || 0),
    created_at: v.created_at != null ? String(v.created_at) : undefined,
    created_by: v.created_by != null ? String(v.created_by) : undefined,
    interface: asInterface(v.interface) ?? null,
    input_schema: v.input_schema,
  }
}

function graphChanges(value: unknown): VersionGraphChange[] {
  if (!Array.isArray(value)) return []
  return value.map((row) => {
    const item = asRecord(row)
    return { id: String(item.id || ''), before: Object.keys(asRecord(item.before)).length ? asRecord(item.before) : undefined, after: Object.keys(asRecord(item.after)).length ? asRecord(item.after) : undefined }
  }).filter((row) => !!row.id)
}

export async function getWorkflowVersionDiff(id: string, fromVersion: number, toVersion: number): Promise<WorkflowVersionDiff> {
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/versions/diff?from_version=${encodeURIComponent(String(fromVersion))}&to_version=${encodeURIComponent(String(toVersion))}`)
  const diff = asRecord(data.diff)
  const graph = asRecord(diff.graph)
  const nodes = asRecord(graph.nodes)
  const edges = asRecord(graph.edges)
  const iface = asRecord(diff.interface)
  return {
    from_version: Number(diff.from_version || fromVersion),
    to_version: Number(diff.to_version || toVersion),
    interface: { before: iface.before, after: iface.after, changes: Array.isArray(iface.changes) ? iface.changes : [] },
    graph: {
      nodes: { added: graphChanges(nodes.added), removed: graphChanges(nodes.removed), changed: graphChanges(nodes.changed) },
      edges: { added: graphChanges(edges.added), removed: graphChanges(edges.removed), changed: graphChanges(edges.changed) },
    },
  }
}

export async function restoreWorkflowVersion(id: string, version: number): Promise<string> {
  const data = await post(`/api/v1/workflows/${encodeURIComponent(id)}/versions/${encodeURIComponent(String(version))}/restore`, {})
  const flow = asRecord(data.flow)
  const flowId = String(flow.flow_id || '')
  if (!flowId) throw new Error('the server did not return the restored Workflow draft')
  return flowId
}

// One compiler refusal reason, keyed to the node it names (empty when it is a whole-graph
// reason). node_config_missing carries the offending node id so the canvas can mark it,
// not only the summary banner.
export interface PublishIssue {
  code: string
  message: string
  nodeId: string
}

// A publish refusal that keeps the structured per-node issues alongside the composed
// banner message, so the same throw drives both the banner (its .message) and the on-node
// marks (.issues). Extends Error so every existing catch/humanError path still reads it.
export class PublishError extends Error {
  issues: PublishIssue[]
  constructor(message: string, issues: PublishIssue[]) {
    super(message)
    this.name = 'PublishError'
    this.issues = issues
  }
}

function publishIssues(data: Record<string, unknown> | undefined | null): PublishIssue[] {
  if (!data || !Array.isArray(data.errors)) return []
  return (data.errors as Record<string, unknown>[])
    .map((e) => ({
      code: e.code != null ? String(e.code) : '',
      message: e.message != null ? String(e.message) : '',
      nodeId: e.node_id != null ? String(e.node_id) : '',
    }))
    .filter((e) => e.message || e.code)
}

// Compose the compiler's structured refusal ({ errors: [{ message, code, node_id }] })
// into one readable line.
function refusalMessage(data: Record<string, unknown> | undefined | null): string {
  if (!data || data.success !== false) return ''
  const errors = Array.isArray(data.errors) ? (data.errors as Record<string, unknown>[]) : []
  const reasons = errors.map((e) => String(e.message || e.code || '')).filter(Boolean)
  if (reasons.length) return `Not publishable: ${reasons.join('; ')}`
  return String(data.error || '')
}

// Fold + compile the current definition into an immutable version. A published version
// is what makes the Flow callable — from an Automation or another Flow
// node, or an agent tool. A graph that doesn't compile is refused (422) with the
// compiler's own per-node reasons, thrown as a PublishError that carries both the readable
// message and the structured node-keyed issues.
export async function publishWorkflow(id: string): Promise<PublishResult> {
  let data: Record<string, unknown>
  try {
    data = (await api.post(`/api/v1/workflows/${encodeURIComponent(id)}/publish`, {})).data
  } catch (e) {
    const body = (e as { response?: { data?: Record<string, unknown> } })?.response?.data
    const refused = refusalMessage(body)
    if (refused) throw new PublishError(refused, publishIssues(body))
    throw e
  }
  if (data && data.success === false) throw new PublishError(refusalMessage(data) || String(data.error || 'publish refused'), publishIssues(data))
  return { version: Number(data.version || 0), hash: data.hash != null ? String(data.hash) : undefined }
}
