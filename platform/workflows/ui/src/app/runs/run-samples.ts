// Extracting a node's real output payload from a run's dataflow data rows. Edge assist
// maps from real data, not schemas: the upstream node's most recent output row carries
// the concrete shape the model learns from. Data rows arrive newest-last (ordered by
// data_id ASC), each tagged with its dataflow data type.

import type { RunNodeDataRow } from '../api/api'

// The newest row of a given type, or undefined.
function lastOfType(rows: RunNodeDataRow[], type: string): RunNodeDataRow | undefined {
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].type === type && rows[i].content != null) return rows[i]
  }
  return undefined
}

// The value the node received as input in this run — the engine records a node.input
// row before the step runs. Null when the node recorded no input.
export function extractInputSample(rows: RunNodeDataRow[]): unknown | null {
  const inp = lastOfType(rows, 'node.input')
  return inp ? inp.content : null
}

// The upstream node's real output value from its data rows, or null when the node has
// produced no output yet. The value returned is what flows downstream — the same payload
// the next node receives as its input — so the mapping learns from the real shape.
export function extractOutputSample(rows: RunNodeDataRow[]): unknown | null {
  // An explicit node.output row is the produced value directly.
  const out = lastOfType(rows, 'node.output')
  if (out) return out.content

  const completed = lastOfType(rows, 'node.result')?.content
  if (completed && typeof completed === 'object' && 'data_ids' in completed && 'output' in completed) {
    return completed.output ?? null
  }

  // An agent emits its produced value on an agent.action row as { result, tool_calls }.
  // The result is exactly what flows to the next node, so map from that rather than the
  // node.result completion envelope ({ success, message, data_ids }) the agent also writes.
  const action = lastOfType(rows, 'agent.action')
  if (action) {
    const c = action.content
    if (c && typeof c === 'object' && 'result' in c) {
      const result = (c as { result: unknown }).result
      if (result != null) return result
    }
    return c
  }

  // For non-agent nodes the node.result row carries the produced value.
  const res = lastOfType(rows, 'node.result')
  if (res) {
    const value = res.content
    if (value && typeof value === 'object' && 'data_ids' in value && 'success' in value) {
      return (value as { output?: unknown }).output ?? null
    }
    return value
  }

  return null
}
