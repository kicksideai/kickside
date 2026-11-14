import { describe, expect, it } from 'vitest'
import { docFromState } from './sync'
import { edgeMappingCompleteness } from './mapping-completeness'

const INPUT = {
  type: 'object',
  required: ['email', 'total'],
  properties: {
    email: { type: 'string', title: 'Email' },
    total: { type: 'number', title: 'Total' },
    note: { type: 'string' },
  },
}

describe('edgeMappingCompleteness', () => {
  it('is satisfied when the stored transform maps every required target field', () => {
    expect(edgeMappingCompleteness({ transform: '{ email: output.email, total: output.total }' }, INPUT))
      .toEqual({ required: ['Email', 'Total'], unmappedRequired: [] })
  })

  it('reports only required target fields absent from the stored transform', () => {
    expect(edgeMappingCompleteness({ transform: '{ email: output.email }' }, INPUT).unmappedRequired)
      .toEqual(['Total'])
  })

  it('stays normal when the target declares no required fields', () => {
    expect(edgeMappingCompleteness({ transform: '' }, {
      type: 'object', properties: { note: { type: 'string' } },
    })).toEqual({ required: [], unmappedRequired: [] })
  })

  it('treats an unchanged compatible payload as satisfied', () => {
    const source = {
      type: 'object',
      properties: { email: { type: 'string' }, total: { type: 'integer' } },
    }
    expect(edgeMappingCompleteness({ transform: '' }, INPUT, source))
      .toEqual({ required: ['Email', 'Total'], unmappedRequired: [] })
  })

  it('does not exempt a failed route when its envelope cannot satisfy the target', () => {
    const failed = {
      type: 'object', required: ['code', 'message'],
      properties: { code: { type: 'string' }, message: { type: 'string' } },
    }
    expect(edgeMappingCompleteness({ source_port: 'failed', transform: '' }, INPUT, failed).unmappedRequired)
      .toEqual(['Email', 'Total'])
  })

  it('recomputes from a reload-shaped stored document after transform normalization', () => {
    const doc = docFromState({
      nodes: [
        { id: 'source', kind: 'block', title: 'Source' },
        { id: 'target', kind: 'block', title: 'Target', input_schema: INPUT },
      ],
      edges: [{
        id: 'stored-edge', source_id: 'source', target_id: 'target',
        transform: { v: 1, mode: 'expr', expr: '{ email: input.email }' },
      }],
    })
    const edge = doc.edges['stored-edge']
    expect(edge.transform).toBe('{ email: output.email }')
    expect(edgeMappingCompleteness(edge, doc.nodes[edge.target_id].input_schema).unmappedRequired)
      .toEqual(['Total'])
  })
})
