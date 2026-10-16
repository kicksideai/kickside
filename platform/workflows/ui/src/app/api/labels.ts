// Flat organization labels (W18) on a workflow definition.

import { normalizeLabels } from '../domain/workflow-labels'
import { asRecord, post } from './http'

// Replace a workflow's flat organization labels (W18). Labels are a first-class
// definition edit, so this routes through the def actor's undo stream; the server
// returns the folded label set, which we normalize back to a clean string list.
export async function setWorkflowLabels(id: string, labels: string[]): Promise<string[]> {
  const clean = normalizeLabels(labels)
  const data = await post(`/api/v1/workflows/${encodeURIComponent(id)}/labels`, { labels: clean })
  const state = asRecord(data.state)
  const returned = Array.isArray(state.labels) ? state.labels : Array.isArray(data.labels) ? data.labels : clean
  return normalizeLabels(returned)
}
