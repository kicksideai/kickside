// Version-diff presentation mapping. The API carries raw before/after graph records;
// expose names when present while retaining a stable id fallback for anonymous edges.

import type { VersionGraphChange, WorkflowVersionDiff } from '../api/api'

function recordName(record: Record<string, unknown> | undefined, fallback: string): string {
  if (!record) return fallback
  for (const key of ['title', 'name', 'label']) {
    if (typeof record[key] === 'string' && record[key]) return record[key] as string
  }
  const source = typeof record.source_id === 'string' ? record.source_id : ''
  const target = typeof record.target_id === 'string' ? record.target_id : ''
  return source && target ? `${source} → ${target}` : fallback
}

export interface GraphDeltaItem { id: string; name: string }

export function graphDeltaItems(rows: VersionGraphChange[]): GraphDeltaItem[] {
  return rows.map((row) => ({ id: row.id, name: recordName(row.after || row.before, row.id) }))
}

export function interfaceChangeLabel(change: unknown): string {
  if (typeof change === 'string' && change) return change
  if (!change || typeof change !== 'object' || Array.isArray(change)) return 'Input or result changed.'
  const row = change as Record<string, unknown>
  const field = typeof row.field === 'string' ? row.field : typeof row.key === 'string' ? row.key : 'Input or result'
  const type = typeof row.type === 'string' ? row.type : typeof row.kind === 'string' ? row.kind : 'changed'
  return `${field}: ${type}`
}

export function diffHasChanges(diff: WorkflowVersionDiff): boolean {
  const graph = diff.graph
  return diff.interface.changes.length > 0 || Object.values(graph.nodes).some((rows) => rows.length > 0) || Object.values(graph.edges).some((rows) => rows.length > 0)
}
