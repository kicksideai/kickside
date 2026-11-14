import { describe, expect, it } from 'vitest'
import type { WfNode } from '../types'
import { effectiveNodeInputSchema, effectiveNodeOutputSchema, finishSchemaAdoption, hydrateNodeContracts } from './schema-policy'

const schema = (key: string) => ({ type: 'object', properties: { [key]: { type: 'string' } } })

describe('effective boundary node schemas', () => {
  it('prefers live boundary config over a stale decorated projection', () => {
    expect(effectiveNodeOutputSchema({
      id: 's', kind: 'start', title: 'Start', config: { input_schema: schema('query') }, output_schema: schema('old'),
    })).toEqual(schema('query'))
    expect(effectiveNodeInputSchema({
      id: 'f', kind: 'finish', title: 'Finish', config: { output_schema: schema('result') }, input_schema: schema('old'),
    })).toEqual(schema('result'))
    expect(effectiveNodeInputSchema({
      id: 'e', kind: 'error', title: 'Error', config: { error_schema: schema('message') }, input_schema: schema('old'),
    })).toEqual(schema('message'))
  })

  it('leaves ordinary node schemas unchanged', () => {
    const tool = { id: 't', kind: 'block', title: 'Tool', input_schema: schema('in'), output_schema: schema('out') } as WfNode
    expect(effectiveNodeInputSchema(tool)).toEqual(schema('in'))
    expect(effectiveNodeOutputSchema(tool)).toEqual(schema('out'))
  })

  it('uses only the contracts projected from a component declaration', () => {
    const eventInput = {
      type: 'object',
      required: ['record_id', 'object_type'],
      properties: { record_id: { type: 'string' }, object_type: { type: 'string' }, values: { type: 'object' } },
      additionalProperties: true,
    }
    const start = { id: 'start', kind: 'start', title: 'Record created', config: { input_schema: eventInput } } as WfNode
    const decisionOutput = schema('outcome')
    const review = { id: 'review', kind: 'block', ref: 'test.blocks:review', title: 'Review new record', input_schema: eventInput, output_schema: decisionOutput } as WfNode
    const finish = { id: 'finish', kind: 'finish', title: 'Reviewed', config: { output_schema: decisionOutput } } as WfNode

    const startOutput = effectiveNodeOutputSchema(start)
    expect(effectiveNodeInputSchema(review, startOutput)).toEqual(eventInput)
    const reviewOutput = effectiveNodeOutputSchema(review)
    expect(reviewOutput).toEqual(decisionOutput)
    expect(effectiveNodeInputSchema(finish, reviewOutput)).toEqual(decisionOutput)
  })

  it('only adopts into a still-empty Finish contract', () => {
    const result = schema('items')
    const emptyFinish = {
      id: 'f', kind: 'finish', title: 'Finish', config: { output_schema: { type: 'object', properties: {} } },
    } as WfNode
    expect(finishSchemaAdoption(result, emptyFinish)).toEqual(result)
    expect(finishSchemaAdoption(result, { ...emptyFinish, config: { output_schema: schema('chosen') } })).toBeNull()
  })

  it('refreshes a loaded registry node from the current catalog without touching authored config', () => {
    const nodes: Record<string, WfNode> = {
      search: { id: 'search', kind: 'block', title: 'Google Search', ref: 'tools:google', config: { fixed: true } },
    }
    const input = schema('query')
    const output = schema('items')
    expect(hydrateNodeContracts(nodes, [{
      paletteId: 'block:tools:google', kind: 'block', category: 'Blocks', title: 'Google Search', subtitle: '', icon: 'tabler:search', ref: 'tools:google', input_schema: input, output_schema: output,
    }])).toBe(1)
    expect(nodes.search.input_schema).toEqual(input)
    expect(nodes.search.output_schema).toEqual(output)
    expect(nodes.search.config).toEqual({ fixed: true })
  })
})
