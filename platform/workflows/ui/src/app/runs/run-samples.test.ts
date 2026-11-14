import { describe, expect, it } from 'vitest'
import { extractOutputSample } from './run-samples'
import type { RunNodeDataRow } from '../api/api'

function row(type: string, content: unknown, data_id = 'd'): RunNodeDataRow {
  return { data_id, node_id: 'n', type, content }
}

describe('extractOutputSample', () => {
  it('reads the resolved completed step output instead of completion metadata', () => {
    expect(extractOutputSample([row('node.result', {
      success: true, message: 'Function executed successfully', data_ids: ['output-1'],
      output: { product: 'Northwind Tea', crates: 48 },
    })])).toEqual({ product: 'Northwind Tea', crates: 48 })
  })

  it('keeps a completion without a produced value out of the output inspector', () => {
    expect(extractOutputSample([row('node.result', {
      success: true, message: 'Completed', data_ids: [],
    })])).toBeNull()
  })

  it('uses the completed agent output ahead of generation tool calls', () => {
    const output = { marker: 'NORTHWIND-GEMMA', crates: 48 }
    expect(extractOutputSample([
      row('agent.action', { tool_calls: [{ name: 'finish', arguments: output }] }),
      row('node.result', { success: true, data_ids: ['finish-output'], output }),
    ])).toEqual(output)
  })

  it('returns null when there are no rows', () => {
    expect(extractOutputSample([])).toBeNull()
  })

  it('picks the node.output content over inputs', () => {
    const rows = [row('node.input', { a: 1 }), row('node.output', { result: 'ok' })]
    expect(extractOutputSample(rows)).toEqual({ result: 'ok' })
  })

  it('returns the most recent output when several exist', () => {
    const rows = [row('node.output', { n: 1 }, 'd1'), row('node.output', { n: 2 }, 'd2')]
    expect(extractOutputSample(rows)).toEqual({ n: 2 })
  })

  it('falls back to node.result when no node.output is present', () => {
    const rows = [row('node.input', { a: 1 }), row('node.result', { done: true })]
    expect(extractOutputSample(rows)).toEqual({ done: true })
  })

  it('ignores rows with no content', () => {
    const rows = [row('node.output', null), row('node.output', { keep: 1 }, 'd0')]
    expect(extractOutputSample(rows)).toEqual({ keep: 1 })
  })

  it('returns null when only unrelated data types are present', () => {
    expect(extractOutputSample([row('node.input', { a: 1 })])).toBeNull()
  })

  it('maps from an agent result, not its completion envelope', () => {
    const rows = [
      row('node.input', 'refund request', 'd1'),
      row('agent.action', { result: 'Structured summary of the refund', tool_calls: [] }, 'd2'),
      row('node.result', { success: true, message: 'Agent completed successfully', data_ids: ['x'] }, 'd3'),
    ]
    expect(extractOutputSample(rows)).toBe('Structured summary of the refund')
  })

  it('falls back to the whole agent.action content when it has no result field', () => {
    const rows = [row('agent.action', { tool_calls: [{ name: 'search' }] })]
    expect(extractOutputSample(rows)).toEqual({ tool_calls: [{ name: 'search' }] })
  })
})
