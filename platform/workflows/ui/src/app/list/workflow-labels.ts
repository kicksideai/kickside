// Pure transforms for W18 workflow labels — flat organization metadata on a workflow
// definition (n8n-style tags), never a folder or an access boundary. The workspace tree
// stays the only hierarchy; labels only group and filter the list. No Vue, no API, so the
// grouping/filter/edit logic is unit-tested without a DOM. Distinct from labels.ts, which
// derives human display titles from registry ids.

import type { WorkflowRow } from './workflow-row'
import { sameWorkflowLabel } from '../domain/workflow-labels'

// The un-labeled bucket in grouped view: an honest header, not a fabricated label.
export const NO_LABEL_KEY = ''
export const NO_LABEL_HEADER = 'No label'

// The full label vocabulary across the list, for the filter chrome — sorted
// case-insensitively so the picker reads alphabetically regardless of stored casing.
export function allLabels(rows: WorkflowRow[]): string[] {
  const seen: string[] = []
  for (const r of rows) {
    for (const l of r.labels) {
      if (!seen.some((e) => sameWorkflowLabel(e, l))) seen.push(l)
    }
  }
  return seen.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}

// Add a label to a row's set: no-op on blank or an already-present tag (case-insensitive),
// otherwise appended in the typed casing.
export function addLabel(existing: string[], label: string): string[] {
  const s = label.trim()
  if (!s) return existing
  if (existing.some((e) => sameWorkflowLabel(e, s))) return existing
  return [...existing, s]
}

// Remove a label from a row's set (case-insensitive match).
export function removeLabel(existing: string[], label: string): string[] {
  const s = label.trim()
  if (!s) return existing
  return existing.filter((e) => !sameWorkflowLabel(e, s))
}

// True when a row carries the given label (case-insensitive).
export function hasLabel(row: WorkflowRow, label: string): boolean {
  return row.labels.some((l) => sameWorkflowLabel(l, label))
}

// Filter to rows carrying a specific label. NO_LABEL_KEY selects the un-labeled rows;
// a blank filter that isn't the un-labeled sentinel is treated as "no filter" by callers,
// so this is only called with a concrete label or NO_LABEL_KEY.
export function filterByLabel(rows: WorkflowRow[], label: string): WorkflowRow[] {
  if (label === NO_LABEL_KEY) return rows.filter((r) => r.labels.length === 0)
  return rows.filter((r) => hasLabel(r, label))
}

export interface LabelGroup {
  // Sort/identity key: a real label, or NO_LABEL_KEY for the un-labeled bucket.
  key: string
  // The header rendered above the group.
  header: string
  rows: WorkflowRow[]
}

// Group rows by label for the grouped view. A workflow with several labels appears under
// each of them (labels organize, they don't partition). Un-labeled workflows collect under
// a single "No label" group, always rendered last; real labels are ordered alphabetically.
// Row order within a group follows the incoming (already sorted/filtered) order.
export function groupByLabel(rows: WorkflowRow[]): LabelGroup[] {
  const groups = new Map<string, LabelGroup>()
  const noLabel: WorkflowRow[] = []
  for (const r of rows) {
    if (r.labels.length === 0) {
      noLabel.push(r)
      continue
    }
    for (const l of r.labels) {
      const key = l.toLowerCase()
      const g = groups.get(key)
      if (g) g.rows.push(r)
      else groups.set(key, { key: l, header: l, rows: [r] })
    }
  }
  const ordered = Array.from(groups.values()).sort((a, b) =>
    a.header.localeCompare(b.header, undefined, { sensitivity: 'base' }),
  )
  if (noLabel.length) ordered.push({ key: NO_LABEL_KEY, header: NO_LABEL_HEADER, rows: noLabel })
  return ordered
}
