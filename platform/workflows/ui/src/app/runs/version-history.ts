// Pure core for the version-history panel — no API calls, no Vue. The panel lists the
// immutable published versions of a workflow and, for a selected version, a read-only
// summary of the interface it pinned. This module holds the two decisions the panel makes
// about that data so they are unit-tested against real version records.

import type { WorkflowInterface } from '../types'

// Whether the editable canvas holds authored changes beyond the latest published version.
//
// This is the server's own has_draft_changes rule applied to the canvas's live edit head:
// the definition-edit sequence (publish markers already excluded, both on the server and in
// the folded doc) is strictly greater than the latest published version's def_seq. With
// nothing published there is no version to compare against, so the panel shows its "no
// versions yet" state instead.
export function hasUnpublishedEdits(definitionEditSeq: number, latestVersionDefSeq: number | null | undefined): boolean {
  if (latestVersionDefSeq == null) return false
  return definitionEditSeq > latestVersionDefSeq
}

// A compact, presentation-ready view of a version's Start/Finish/Error interface: the key
// names for each side plus their counts, and whether the whole interface is empty (a
// workflow that declares no boundary schema). Keys fall back to the counts when the backend
// returned counts without an explicit key list.
export interface InterfaceSummary {
  input: string[]
  output: string[]
  error: string[]
  inputCount: number
  outputCount: number
  errorCount: number
  empty: boolean
}

function countOf(keys: string[], count: number | undefined): number {
  return count != null ? count : keys.length
}

export function summarizeInterface(iface: WorkflowInterface | null | undefined): InterfaceSummary {
  const input = iface?.input_keys ?? []
  const output = iface?.output_keys ?? []
  const error = iface?.error_keys ?? []
  const inputCount = countOf(input, iface?.input_count)
  const outputCount = countOf(output, iface?.output_count)
  const errorCount = countOf(error, iface?.error_count)
  return {
    input,
    output,
    error,
    inputCount,
    outputCount,
    errorCount,
    empty: inputCount === 0 && outputCount === 0 && errorCount === 0,
  }
}

// A field side rendered as prose: the named keys, or "N fields" when the count is known but
// the names are not, or "none" when the side is empty.
export function fieldSummary(keys: string[], count: number): string {
  if (keys.length) return keys.join(', ')
  if (count > 0) return `${count} field${count === 1 ? '' : 's'}`
  return 'none'
}

// Restore always creates a separate draft; history remains immutable. Kept as data so the
// confirmation wording and post-success navigation are covered without mounting the panel.
export function restoreDraftMessage(version: number): string {
  return `Restore v${version} as a new unpublished draft. This never changes version history.`
}

export function restoredDraftRoute(workflowId: string): string {
  return workflowId
}
