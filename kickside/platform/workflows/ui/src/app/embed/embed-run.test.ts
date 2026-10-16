import { describe, expect, it } from 'vitest'
import type { RunRow } from '../api/api'
import { inputGate, isTerminalStatus, missingRequiredFields, runView } from './embed-run'
import completedDetail from '../__fixtures__/run-e754dc50-completed-detail.json'
import failedDetail from '../__fixtures__/run-589d3cb5-failed-detail.json'

// The real published Start schema of "UX Audit Sandwich" (versions.get, v1).
const startSchema = {
  type: 'object',
  required: ['topic', 'audience'],
  properties: {
    topic: { type: 'string', description: 'The subject to write about' },
    audience: { type: 'string', description: 'Who the content is for' },
  },
}

describe('input gate', () => {
  it('lists the required fields the payload does not supply', () => {
    expect(missingRequiredFields({}, startSchema)).toEqual(['topic', 'audience'])
    expect(missingRequiredFields({ topic: 'x' }, startSchema)).toEqual(['audience'])
    expect(missingRequiredFields({ topic: 'x', audience: 'y' }, startSchema)).toEqual([])
  })

  it('treats a blank string as unsupplied', () => {
    expect(missingRequiredFields({ topic: '  ', audience: 'y' }, startSchema)).toEqual(['topic'])
  })

  it('passes a schema with no required fields, even with an empty payload', () => {
    expect(inputGate({}, { type: 'object', properties: { note: { type: 'string' } } })).toEqual({ ok: true, message: '', missing: [] })
    expect(inputGate({}, undefined).ok).toBe(true)
  })

  it('blocks with a directed message naming the missing fields', () => {
    expect(inputGate({}, startSchema)).toEqual({
      ok: false,
      message: 'Provide these fields: topic, audience before running.',
      missing: ['topic', 'audience'],
    })
    expect(inputGate({ topic: 'x' }, startSchema).message).toBe('Provide the audience field before running.')
  })

  it('passes a complete payload', () => {
    expect(inputGate({ topic: 'x', audience: 'y' }, startSchema).ok).toBe(true)
  })
})

describe('isTerminalStatus', () => {
  it('recognizes terminal and non-terminal statuses', () => {
    for (const s of ['completed', 'failed', 'cancelled', 'terminated', 'succeeded']) expect(isTerminalStatus(s)).toBe(true)
    for (const s of ['running', 'pending', 'queued', '']) expect(isTerminalStatus(s)).toBe(false)
  })
})

describe('runView', () => {
  it('folds a real completed run into a rendered result with its Finish output', () => {
    // Real live run e754dc50 (adv-runner-contract): completed, Finish output {"x":"ok"}.
    const v = runView(completedDetail.run as unknown as RunRow)
    expect(v.phase).toBe('completed')
    expect(v.tone).toBe('ok')
    expect(v.hasOutput).toBe(true)
    expect(v.outputPending).toBe(false)
    expect(v.output).toEqual({ x: 'ok' })
  })

  it('marks a completed run whose output has not attached as output-pending, not empty', () => {
    const v = runView({ run_id: 'r', flow_ref: { kind: 'flow', id: 'w', version: 1 }, status: 'completed' } as RunRow)
    expect(v.phase).toBe('completed')
    expect(v.hasOutput).toBe(false)
    expect(v.outputPending).toBe(true)
  })

  it('folds a real failed run into an honest no-detail failure (bare "Failed")', () => {
    // Real live run 589d3cb5 (UX Audit Sandwich): the agent node failed and the run-level
    // reason is the bare "Node [uuid] failed: Failed" — no human detail, so the surface shows
    // the honest fallback rather than dressing the uuid up as a reason (W13).
    const v = runView(failedDetail.run as unknown as RunRow)
    expect(v.phase).toBe('failed')
    expect(v.tone).toBe('error')
    expect(v.hasReason).toBe(false)
    expect(v.reason).toBe('')
  })

  it('surfaces a structured failure reason when one is recorded', () => {
    const v = runView({ run_id: 'r', flow_ref: { kind: 'flow', id: 'w', version: 1 }, status: 'failed', error: 'Node [abc] failed: upstream timed out' } as RunRow)
    expect(v.phase).toBe('failed')
    expect(v.hasReason).toBe(true)
    expect(v.reason).toBe('upstream timed out')
  })

  it('reports a non-terminal run as running', () => {
    const v = runView({ run_id: 'r', flow_ref: { kind: 'flow', id: 'w', version: 1 }, status: 'running' } as RunRow)
    expect(v.phase).toBe('running')
    expect(v.tone).toBe('pending')
  })
})
