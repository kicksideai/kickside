import { describe, expect, it } from 'vitest'
import { runExportFilename, timelineEventViews } from './run-debug'
import type { RunNodeHeader, RunTimelineEvent } from '../api/api'

const headers: RunNodeHeader[] = [{ engine_node_id: 'engine-step', def_node_id: 'step', title: 'Check inventory', type: 'block', status: 'completed' }]
const event = (type: string, raw?: unknown): RunTimelineEvent => ({ seq: 1, source: 'engine', type, engine_node_id: 'engine-step', raw })

describe('run activity presentation', () => {
  it('uses the recorded step title and plain outcomes without diagnostic data', () => {
    expect(timelineEventViews([event('node.created'), event('node.updated', { status: 'completed', private: 'hidden' }), event('data.node.result')], headers))
      .toEqual([
        { key: '1:node.created:engine-step', occurredAt: undefined, title: 'Check inventory', outcome: 'Ready' },
        { key: '1:node.updated:engine-step', occurredAt: undefined, title: 'Check inventory', outcome: 'Completed' },
        { key: '1:data.node.result:engine-step', occurredAt: undefined, title: 'Check inventory', outcome: 'Output recorded' },
      ])
  })

  it('keeps workflow failure causes and lifecycle outcomes readable', () => {
    const views = timelineEventViews([
      { seq: 1, source: 'flow_run', type: 'flow.started' },
      { seq: 2, source: 'flow_run', type: 'flow.finished' },
      { seq: 3, source: 'flow_run', type: 'flow.failed', raw: { error: 'Inventory is unavailable' } },
    ], headers)
    expect(views.map(v => [v.title, v.outcome])).toEqual([
      ['Workflow', 'Started'], ['Workflow', 'Completed'], ['Workflow', 'Failed: Inventory is unavailable'],
    ])
  })

  it('resolves nested activity through its recorded parent step without exposing ids', () => {
    const child = { ...headers[0], engine_node_id: 'child', parent_engine_node_id: 'engine-step', title: '' }
    expect(timelineEventViews([{ ...event('data.agent.action'), engine_node_id: 'child' }], [...headers, child])[0])
      .toMatchObject({ title: 'Check inventory', outcome: 'Agent activity recorded' })
    expect(timelineEventViews([{ ...event('future.event'), engine_node_id: 'unknown' }], headers)[0])
      .toMatchObject({ title: 'Step', outcome: 'Activity recorded' })
  })

  it.each([['running', 'Running'], ['waiting', 'Waiting'], ['failed', 'Failed'], ['new-status', 'Updated']])('presents %s as %s', (status, outcome) => {
    expect(timelineEventViews([event('node.updated', { status })], headers)[0].outcome).toBe(outcome)
  })

  it('presents workflow input and output as recorded activity', () => {
    expect(timelineEventViews([event('data.dataflow.input'), event('data.dataflow.output')], headers).map(view => view.outcome))
      .toEqual(['Input received', 'Output recorded'])
  })

  it('names redacted downloads', () => {
    expect(runExportFilename('run / 1')).toBe('flow-run-run-1.redacted.json')
  })
})
