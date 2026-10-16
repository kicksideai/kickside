import { decodeSchema, schemaSummary } from '../domain/schema-policy'
export { schemaSummary } from '../domain/schema-policy'
import type { WorkflowSummary } from '../types'
import type { WorkflowVersionSummary } from '../api/api'

export interface FlowCandidate extends WorkflowSummary {
  callable: boolean
  is_current: boolean
  published_version?: number
  has_draft_changes: boolean
  input_schema?: unknown
  output_schema?: unknown
  input_summary: string
  output_summary: string
  trigger_label: string
  leaf_count: number
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {}
}

function firstVersion(versions: WorkflowVersionSummary[]): WorkflowVersionSummary | null {
  return [...versions].sort((a, b) => b.version - a.version)[0] || null
}

function interfaceFromState(state: Record<string, unknown>): { input_schema: unknown; output_schema: unknown } | null {
  const params = asRecord(state.params)
  const nested = asRecord(params.interface)
  const input = decodeSchema(params.input_schema) || decodeSchema(nested.input_schema)
  const output = decodeSchema(params.output_schema) || decodeSchema(nested.output_schema)
  return input && output ? { input_schema: input, output_schema: output } : null
}

function interfaceFromSummary(summary: WorkflowSummary): { input_schema: unknown; output_schema: unknown } | null {
  const iface = summary.published_interface || summary.interface
  if (!iface) return null
  const input = decodeSchema(iface.input_schema)
  const output = decodeSchema(iface.output_schema)
  return input && output ? { input_schema: input, output_schema: output } : null
}

export function analyzeFlowCandidate(
  summary: WorkflowSummary,
  state: Record<string, unknown>,
  versions: WorkflowVersionSummary[],
  currentWorkflowId: string,
): FlowCandidate {
  const latest = firstVersion(versions)
  const iface = interfaceFromSummary(summary) || interfaceFromState(state)
  const publishedVersion = summary.published_version || latest?.version
  // A workflow is callable when it has a graph-derived Start/Finish interface.
  const callable = !!iface
  // The list API's has_draft_changes now excludes publish markers, so it is trusted directly
  // rather than re-derived from head/def sequences on the client.
  const hasDraftChanges = summary.has_draft_changes === true

  return {
    ...summary,
    is_current: summary.id === currentWorkflowId,
    callable,
    published_version: publishedVersion,
    has_draft_changes: hasDraftChanges,
    input_schema: iface?.input_schema,
    output_schema: iface?.output_schema,
    input_summary: schemaSummary(iface?.input_schema),
    output_summary: schemaSummary(iface?.output_schema),
    trigger_label: 'Declared input',
    leaf_count: iface ? 1 : 0,
  }
}
