import { describe, expect, it } from 'vitest'
import { isFlowKind } from '../domain/node-policy'
import { buildFlowData } from '../canvas/graph-projection'
import { kindDef } from '../domain/node-policy'
import { emptyDoc } from '../mapping/sync'
import type { WfNodeData } from '../domain/graph-data'

const exactRef = (id: string, version: number) => ({
  kind: 'flow',
  id,
  version,
})

describe('Flow kind', () => {
  it('recognizes only Flow', () => {
    expect(isFlowKind('flow')).toBe(true)
    expect(isFlowKind('agent')).toBe(false)
    expect(isFlowKind(undefined)).toBe(false)
  })
})

describe('Flow rendering', () => {
  it('shows Finished/Failed ports only for an exact published Flow', () => {
    const doc = emptyDoc()
    doc.nodes = {
      flow: {
        id: 'flow',
        title: 'Qualify',
        kind: 'flow',
        ref: 'wf_child',
        config: { flow_ref: exactRef('wf_child', 4) },
        child_interface: {
          input_schema: { type: 'object', properties: { lead: {} } },
          output_schema: { type: 'object', properties: { score: {} } },
          error_schema: { type: 'object', properties: { message: {} } },
        },
      } as never,
    }

    const data = buildFlowData(doc).flowNodes[0].data as WfNodeData
    expect(data.kindLabel).toBe('Workflow')
    expect(data.hueVar).toBe(kindDef('flow').hueVar)
    expect(data.outPorts.map((port) => port.id)).toEqual(['result'])
    expect(data.outPorts.map((port) => port.label)).toEqual(['Finished'])
    expect(data.failedPort).toBe(true)
    expect(data.sub).toContain('lead')
    expect(data.sub).toContain('score')
  })

  it('does not treat display identity as an executable binding', () => {
    const doc = emptyDoc()
    doc.nodes = { flow: { id: 'flow', title: 'Flow', kind: 'flow', ref: 'wf_child' } as never }
    const data = buildFlowData(doc).flowNodes[0].data as WfNodeData
    expect(data.outPorts).toHaveLength(1)
    expect(data.outPorts[0].id).toBe('')
    expect(data.sub).toBeUndefined()
  })
})
