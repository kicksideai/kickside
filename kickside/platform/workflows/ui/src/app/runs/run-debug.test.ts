import { describe, expect, it } from 'vitest'
import { keeperDataflowHref, processIdentity, runExportFilename, timelineEventViews } from './run-debug'

describe('Keeper run-debug mapping', () => {
  it('keeps engine events and their raw payload available for collapsed expansion', () => {
    expect(timelineEventViews([{ seq: 4, occurred_at: '2026-07-10T12:00:00Z', source: 'engine', type: 'node.updated', engine_node_id: 'eng-1', raw: { status: 'done' } }]))
      .toMatchObject([{ source: 'engine', type: 'node.updated', engineNodeId: 'eng-1', raw: { status: 'done' } }])
  })

  it('only makes a Keeper URL when a dataflow identity exists and names redacted exports honestly', () => {
    expect(keeperDataflowHref('df/a')).toBe('/api/v1/dataflows/df%2Fa')
    expect(keeperDataflowHref('')).toBeNull()
    expect(runExportFilename('run / 1')).toBe('flow-run-run-1.redacted.json')
    expect(processIdentity({ process: { id: 'proc-1', host: 'worker-a', pid: '9' } })).toBe('proc-1 · worker-a · pid 9')
  })
})
