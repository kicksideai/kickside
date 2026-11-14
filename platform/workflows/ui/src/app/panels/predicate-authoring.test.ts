import { describe, expect, it } from 'vitest'
import { operatorsFor, parseSimplePredicate, predicateFields, serializePredicate } from './predicate-authoring'

const schema = {
  type: 'object',
  properties: {
    status: { type: 'string', title: 'Status' },
    score: { type: 'number' },
    approved: { type: 'boolean' },
    rows: { type: 'array', items: { type: 'object' } },
    customer: { type: 'object', properties: { tier: { type: 'string' } } },
  },
}

describe('predicate authoring', () => {
  it('projects upstream leaf fields and can narrow to arrays for For each', () => {
    expect(predicateFields(schema).map((f) => [f.path, f.type])).toEqual([
      ['status', 'string'], ['score', 'number'], ['approved', 'boolean'], ['customer.tier', 'string'],
    ])
    expect(predicateFields(schema, true).map((f) => f.path)).toEqual(['rows'])
  })

  it('uses type-appropriate operators and serializes into the existing predicate grammar', () => {
    expect(operatorsFor('boolean').map((o) => o.value)).toEqual(['truthy', 'falsy'])
    expect(operatorsFor('number').map((o) => o.value)).toContain('gte')
    expect(operatorsFor('string').map((o) => o.value)).toEqual(['eq', 'neq'])
    expect(serializePredicate({ field: 'score', operator: 'gte', value: '80' }, 'number')).toBe('output.score >= 80')
    expect(serializePredicate({ field: 'status', operator: 'eq', value: "owner's choice" }, 'string')).toBe("output.status == 'owner\\'s choice'")
    expect(serializePredicate({ field: 'approved', operator: 'truthy', value: '' }, 'boolean')).toBe('output.approved == true')
  })

  it('round-trips composer expressions while leaving arbitrary expr-lang to Advanced', () => {
    expect(parseSimplePredicate("output.status == 'ready'")).toEqual({ field: 'status', operator: 'eq', value: 'ready' })
    expect(parseSimplePredicate('state.iteration < 8', 'state')).toEqual({ field: 'iteration', operator: 'lt', value: '8' })
    expect(parseSimplePredicate('len(output.rows) > 0')).toBeNull()
  })
})
