import { describe, expect, it } from 'vitest'
import { FAILED_PAYLOAD_SCHEMA, isFailedSourcePort } from '../domain/node-policy'
import { buildFlowData } from '../canvas/graph-projection'
import { validateConnection, edgeCompat } from '../domain/connection-policy'
import { emptyDoc } from '../mapping/sync'
import type { WfNodeData } from '../domain/graph-data'
import { registerBlocks } from '../domain/node-policy'

const failing = 'test.blocks:failing'
const infallible = 'test.blocks:infallible'

function registerFixtures() {
  registerBlocks([
    { id: failing, label: 'Failing', ports: [{ id: 'result', label: 'Done' }, { id: 'failed', label: 'Failed' }] },
    { id: infallible, label: 'Infallible', ports: [{ id: 'result', label: 'Done' }] },
  ])
}

describe('declaration-owned Failed port', () => {
  it('publishes the stable { code, message } schema', () => {
    expect(FAILED_PAYLOAD_SCHEMA.required).toEqual(['code', 'message'])
    expect(FAILED_PAYLOAD_SCHEMA.additionalProperties).toBe(false)
  })

  it('recognizes only the canonical failed port', () => {
    expect(isFailedSourcePort('failed')).toBe(true)
    expect(isFailedSourcePort('error')).toBe(false)
    expect(isFailedSourcePort(undefined)).toBe(false)
  })

  it('renders and wires Failed only when the exact Block declaration owns it', () => {
    registerFixtures()
    const doc = emptyDoc()
    doc.nodes = {
      source: { id: 'source', title: 'Source', kind: 'block', ref: failing },
      recover: { id: 'recover', title: 'Recover', kind: 'block', ref: infallible },
    }
    doc.edges = { failure: { id: 'failure', source_id: 'source', target_id: 'recover', source_port: 'failed' } }
    const built = buildFlowData(doc)
    const source = built.flowNodes.find((node) => node.id === 'source')!.data as WfNodeData
    expect(source.failedPort).toBe(true)
    expect(source.failedWired).toBe(true)
    expect(built.flowEdges[0].sourceHandle).toBe('failed')
  })

  it('does not invent failure capability for an infallible Block', () => {
    registerFixtures()
    const doc = emptyDoc()
    doc.nodes = {
      source: { id: 'source', title: 'Source', kind: 'block', ref: infallible },
    }
    const source = buildFlowData(doc).flowNodes[0].data as WfNodeData
    expect(source.failedPort).toBe(false)
    expect(source.failedWired).toBe(false)
  })
})

describe('failed edge compatibility', () => {
  it('uses the canonical error envelope', () => {
    const wantsCode = { type: 'object', properties: { code: {} }, required: ['code'] }
    expect(validateConnection(FAILED_PAYLOAD_SCHEMA, wantsCode).status).toBe('ok')
    const wantsOrderId = { type: 'object', properties: { order_id: {} }, required: ['order_id'] }
    expect(edgeCompat(FAILED_PAYLOAD_SCHEMA, wantsOrderId)).toBe('needs-mapping')
  })
})
