import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { RunNodeDataRow } from '../api/api'
import {
  buildNodeInspection,
  extractAgentActions,
  extractNodeError,
  extractTiming,
  formatDuration,
  parseRunError,
  runFailureReason,
  stringifyPayload,
  truncatePayload,
} from './run-detail'
import { decodeRunNodeRows } from '../domain/run-payload'

// The real failed-run record captured live from workflow 019f487a / run 88444c66: Start
// ok, Google Search ok, the Refund Triage agent node failed with a bare "Failed", the
// downstream steps pending. Every mapping below is asserted against this shape, not a
// hand-built stand-in.
function fixture(name: string): { success: boolean; data: Record<string, unknown>[] } {
  return JSON.parse(readFileSync(new URL(`../__fixtures__/${name}.json`, import.meta.url), 'utf8'))
}
const agentRaw = fixture('run-88444c66-agent-node')
const startRaw = fixture('run-88444c66-start-node')
const googleRaw = fixture('run-88444c66-google-node')
const RUN_ERROR = 'Node [7ad0f448-f846-4fb0-a9e9-ba165ed66d99] failed: Failed'

function row(over: Partial<RunNodeDataRow>): RunNodeDataRow {
  return { data_id: 'd', node_id: 'n', type: 'node.result', content: null, ...over }
}

describe('decodeRunNodeRows', () => {
  it('parses JSON content and preserves discriminator and created_at', () => {
    const rows = decodeRunNodeRows(agentRaw.data)
    const result = rows.find((r) => r.type === 'node.result')
    expect(result?.discriminator).toBe('result.error')
    expect(result?.created_at).toBeTruthy()
    const input = rows.find((r) => r.type === 'node.input')
    expect(input?.content).toMatchObject({ query: 'industrial automation trends' })
  })
})

describe('buildNodeInspection — real failed agent node', () => {
  const rows = decodeRunNodeRows(agentRaw.data)
  const insp = buildNodeInspection(rows, { failed: true, runError: RUN_ERROR })

  it('reads the input the agent received (the upstream search payload)', () => {
    expect(insp.input).toMatchObject({ query: 'industrial automation trends' })
  })

  it('reads the produced answer as the output', () => {
    expect(typeof insp.output).toBe('string')
    expect(insp.output as string).toContain('Based on the provided search results')
  })

  it('surfaces the failure with an honest no-detail fallback when only a bare token was recorded', () => {
    expect(insp.error).not.toBeNull()
    expect(insp.error?.message).toBe('This step failed.')
    expect(insp.error?.hasDetail).toBe(false)
    expect(insp.error?.code).toBeUndefined()
  })

  it('exposes the agent generation trace', () => {
    expect(insp.agentActions).toHaveLength(1)
    expect(insp.agentActions[0].toolCalls).toEqual([])
    expect(insp.agentActions[0].result).toContain('Based on the provided search results')
  })

  it('measures the step duration from its data rows', () => {
    expect(insp.timing.durationMs).toBeGreaterThan(0)
    expect(formatDuration(insp.timing.durationMs as number)).toMatch(/s$/)
  })
})

describe('buildNodeInspection — routed completion', () => {
  it('shows the value routed to a target ahead of an empty agent generation', () => {
    const output = { passages: 'found', citations: ['record-1'] }
    const inspection = buildNodeInspection([
      row({ type: 'node.input', content: { query: 'q' } }),
      row({ type: 'agent.action', content: { result: '', tool_calls: [{ name: 'finish', arguments: output }] } }),
      row({ type: 'node.result', discriminator: 'result.success', content: { success: true, data_ids: ['target-input'], output } }),
    ])
    expect(inspection.input).toEqual({ query: 'q' })
    expect(inspection.output).toEqual(output)
    expect(inspection.agentActions[0].result).toBe('')
  })
})

describe('buildNodeInspection — start and google nodes', () => {
  it('reads the Start input the run began with', () => {
    const insp = buildNodeInspection(decodeRunNodeRows(startRaw.data))
    expect(insp.input).toEqual({ topic: 'industrial automation trends', audience: 'logistics executives' })
    expect(insp.error).toBeNull()
  })

  it('reads a completed tool node without inventing a failure', () => {
    const insp = buildNodeInspection(decodeRunNodeRows(googleRaw.data))
    expect(insp.error).toBeNull()
    expect(insp.input).toMatchObject({ query: 'industrial automation trends' })
  })
})

describe('extractNodeError', () => {
  it('reads a structured { code, message } error branch and keeps the whole payload', () => {
    const rows = [row({ type: 'node.result', discriminator: 'result.error', content: { code: 'exit_schema_invalid', message: 'Output did not match the exit schema' } })]
    const err = extractNodeError(rows)
    expect(err).toMatchObject({ code: 'exit_schema_invalid', message: 'Output did not match the exit schema', hasDetail: true })
    expect(err?.detail).toMatchObject({ code: 'exit_schema_invalid' })
  })

  it('treats a bare "Failed" string as failure without detail', () => {
    expect(extractNodeError([row({ discriminator: 'result.error', content: 'Failed' })])).toEqual({ message: 'This step failed.', hasDetail: false })
  })

  it('returns null when no error row is present', () => {
    expect(extractNodeError([row({ type: 'node.result', discriminator: 'result.success', content: { success: true } })])).toBeNull()
  })
})

describe('buildNodeInspection — failure fallback', () => {
  it('falls back to the run-level reason when the node recorded no error row', () => {
    const rows = [row({ type: 'node.input', content: { a: 1 } })]
    const insp = buildNodeInspection(rows, { failed: true, runError: 'Node [x] failed: Google Search API key not configured' })
    expect(insp.error).toEqual({ message: 'Google Search API key not configured', hasDetail: true })
  })

  it('gives the honest fallback when the run-level reason is also a bare token', () => {
    const insp = buildNodeInspection([row({ type: 'node.input', content: {} })], { failed: true, runError: RUN_ERROR })
    expect(insp.error).toEqual({ message: 'This step failed.', hasDetail: false })
  })
})

describe('runFailureReason', () => {
  it('strips the uuid-bearing prefix and keeps the reason', () => {
    expect(runFailureReason('Node [7ad0f448-abc] failed: Google Search API key not configured')).toBe('Google Search API key not configured')
  })
  it('returns empty for a bare "Failed" token', () => {
    expect(runFailureReason(RUN_ERROR)).toBe('')
  })
  it('returns empty for missing input', () => {
    expect(runFailureReason(null)).toBe('')
    expect(runFailureReason(undefined)).toBe('')
  })
  it('passes through a non-prefixed message', () => {
    expect(runFailureReason('Something went wrong')).toBe('Something went wrong')
  })
})

describe('parseRunError', () => {
  it('renders a JSON { code, message } envelope as the message plus the code', () => {
    const v = parseRunError('{"code":"AGENT_EXEC_FAILED","message":"No models found for class: fast"}')
    expect(v).toEqual({ message: 'No models found for class: fast', code: 'AGENT_EXEC_FAILED', generic: false })
  })

  it('parses a JSON envelope wrapped in the engine "Node [uuid] failed:" prefix', () => {
    const v = parseRunError('Node [abc-123] failed: {"code":"E1","message":"boom"}')
    expect(v).toMatchObject({ message: 'boom', code: 'E1', generic: false })
  })

  it('reads a plain object without stringifying it', () => {
    expect(parseRunError({ code: 'X', message: 'nope' })).toMatchObject({ message: 'nope', code: 'X' })
  })

  it('keeps a plain human sentence unchanged, with no code', () => {
    const v = parseRunError('Something went wrong')
    expect(v.message).toBe('Something went wrong')
    expect(v.generic).toBe(false)
    expect(v.code).toBeUndefined()
  })

  it('marks a bare token / empty as generic so the strip can suppress it', () => {
    expect(parseRunError(RUN_ERROR).generic).toBe(true)
    expect(parseRunError('').generic).toBe(true)
    expect(parseRunError(null).generic).toBe(true)
  })

  it('never returns raw JSON text as the message', () => {
    const raw = '{"code":"E","message":"real reason"}'
    expect(parseRunError(raw).message).toBe('real reason')
    expect(parseRunError(raw).message).not.toContain('{')
  })
})

describe('extractAgentActions', () => {
  it('collects each agent.action generation', () => {
    const rows = [
      row({ type: 'agent.action', content: { result: 'answer', tool_calls: [{ name: 'search' }] } }),
      row({ type: 'agent.action', content: { result: 'refined', tool_calls: [] } }),
    ]
    const actions = extractAgentActions(rows)
    expect(actions).toHaveLength(2)
    expect(actions[0]).toMatchObject({ result: 'answer', toolCalls: [{ name: 'search' }] })
    expect(actions[1].toolCalls).toEqual([])
  })
  it('is empty for a node with no agent rows', () => {
    expect(extractAgentActions([row({ type: 'node.output', content: { x: 1 } })])).toEqual([])
  })
})

describe('extractTiming and formatDuration', () => {
  it('spans the earliest to the latest row', () => {
    const rows = [
      row({ created_at: '2026-07-09T16:56:42.884310265-04:00' }),
      row({ created_at: '2026-07-09T16:56:46.462319980-04:00' }),
    ]
    const t = extractTiming(rows)
    expect(t.durationMs).toBeGreaterThan(3000)
    expect(t.durationMs).toBeLessThan(4000)
  })
  it('is empty when no rows carry a timestamp', () => {
    expect(extractTiming([row({})])).toEqual({})
  })
  it('formats sub-second, second and minute durations', () => {
    expect(formatDuration(820)).toBe('820ms')
    expect(formatDuration(3578)).toBe('3.6s')
    expect(formatDuration(64000)).toBe('1m 4s')
    expect(formatDuration(-1)).toBe('—')
  })
})

describe('stringifyPayload and truncatePayload', () => {
  it('passes a string through and pretty-prints an object', () => {
    expect(stringifyPayload('hello')).toBe('hello')
    expect(stringifyPayload({ a: 1 })).toBe('{\n  "a": 1\n}')
  })
  it('degrades gracefully on a circular value', () => {
    const c: Record<string, unknown> = {}
    c.self = c
    expect(typeof stringifyPayload(c)).toBe('string')
  })
  it('truncates to a leading slice past the line budget', () => {
    const text = Array.from({ length: 100 }, (_, i) => `line ${i}`).join('\n')
    const t = truncatePayload(text, 40)
    expect(t.truncated).toBe(true)
    expect(t.hiddenLines).toBe(60)
    expect(t.preview.split('\n')).toHaveLength(40)
  })
  it('leaves a short payload intact', () => {
    const t = truncatePayload('a\nb', 40)
    expect(t.truncated).toBe(false)
    expect(t.totalLines).toBe(2)
  })
})
