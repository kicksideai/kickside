import { describe, expect, it } from 'vitest'
import type { CrmAttribute, CrmFilter } from './crm-types'
import {
  OPERATORS, conditionComplete, describeCondition, deserializeFilters, filterableFields,
  newCondition, operatorsForType, parseScopeTokens, serializeConditions, withOperator, type FilterCondition,
} from './crm-filter'

const fields: CrmAttribute[] = [
  { object_type: 'person', attr: 'name', data_type: 'text', label: 'Name' },
  { object_type: 'person', attr: 'status', data_type: 'select', label: 'Status', config: { choices: ['hot', 'warm', 'cold'] } },
  { object_type: 'person', attr: 'tags', data_type: 'multi_select', label: 'Tags', config: { choices: ['Lead', 'VIP'] } },
  { object_type: 'person', attr: 'score', data_type: 'number', label: 'Score' },
  { object_type: 'person', attr: 'close_date', data_type: 'date', label: 'Close date' },
  { object_type: 'person', attr: 'do_not_contact', data_type: 'boolean', label: 'Do not contact' },
  { object_type: 'person', attr: 'company', data_type: 'relation', label: 'Company', config: { target: { kind: 'record', object_type: 'company' } } },
]
const field = (attr: string) => fields.find((item) => item.attr === attr)!

describe('CRM criteria model', () => {
  it('offers operators appropriate to each field type', () => {
    expect(operatorsForType('text')).toEqual(['contains', 'eq', 'neq', 'is_set', 'is_empty'])
    expect(operatorsForType('number')).toEqual(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'is_set', 'is_empty'])
    expect(operatorsForType('date')).toEqual(['before', 'after', 'between', 'is_set', 'is_empty'])
    expect(operatorsForType('select')).toEqual(['eq', 'any_of', 'neq', 'is_set', 'is_empty'])
    expect(operatorsForType('multi_select')).toEqual(['any_of', 'eq', 'is_set', 'is_empty'])
    expect(operatorsForType('boolean')).toEqual(['eq', 'is_set', 'is_empty'])
    expect(operatorsForType('relation')).toEqual(['eq', 'is_set', 'is_empty'])
  })

  it('makes every supported stored field available to server-side filters', () => {
    expect(filterableFields(fields)).toEqual(fields)
  })

  it('seeds a new condition with the field type default operator', () => {
    expect(newCondition(field('name')).op).toBe('contains')
    expect(newCondition(field('score')).op).toBe('eq')
    expect(newCondition(field('close_date')).op).toBe('before')
    expect(newCondition(field('tags')).value).toEqual([])
    expect(newCondition(field('do_not_contact')).value).toBe(true)
  })

  it('re-seeds the value when the operator arity changes', () => {
    const between = withOperator(newCondition(field('score')), 'between', field('score'))
    expect(between.value).toBe('')
    expect(between.value2).toBeUndefined()
    const presence = withOperator(between, 'is_set', field('score'))
    expect(OPERATORS[presence.op].arity).toBe('none')
  })

  it('treats a condition complete only when its operator has all values', () => {
    expect(conditionComplete({ id: '1', attr: 'name', op: 'contains', value: '' })).toBe(false)
    expect(conditionComplete({ id: '1', attr: 'name', op: 'contains', value: 'ada' })).toBe(true)
    expect(conditionComplete({ id: '1', attr: 'name', op: 'is_set', value: '' })).toBe(true)
    expect(conditionComplete({ id: '1', attr: 'tags', op: 'any_of', value: [] })).toBe(false)
    expect(conditionComplete({ id: '1', attr: 'score', op: 'between', value: '1' })).toBe(false)
    expect(conditionComplete({ id: '1', attr: 'score', op: 'between', value: '1', value2: '9' })).toBe(true)
  })

  it('serializes conditions to the query filter shape and coerces values by type', () => {
    const conditions: FilterCondition[] = [
      { id: '1', attr: 'status', op: 'eq', value: 'hot' },
      { id: '2', attr: 'score', op: 'gte', value: '1000' },
      { id: '3', attr: 'score', op: 'between', value: '10', value2: '20' },
      { id: '4', attr: 'tags', op: 'any_of', value: ['VIP', 'Lead'] },
      { id: '5', attr: 'do_not_contact', op: 'eq', value: false },
      { id: '6', attr: 'name', op: 'is_set', value: '' },
      { id: '7', attr: 'name', op: 'contains', value: '' }, // incomplete, dropped
    ]
    expect(serializeConditions(conditions, fields)).toEqual([
      { attr: 'status', op: 'eq', value: 'hot' },
      { attr: 'score', op: 'gte', value: 1000 },
      { attr: 'score', op: 'between', value: [10, 20] },
      { attr: 'tags', op: 'any_of', value: ['VIP', 'Lead'] },
      { attr: 'do_not_contact', op: 'eq', value: false },
      { attr: 'name', op: 'is_set', value: null },
    ])
  })

  it('deserializes a saved view spec.filters back into editable conditions', () => {
    const filters: CrmFilter[] = [
      { attr: 'status', op: 'eq', value: 'hot' },
      { attr: 'score', op: 'between', value: [10, 20] },
      { attr: 'tags', op: 'any_of', value: ['VIP'] },
    ]
    const conditions = deserializeFilters(filters, fields)
    expect(conditions.map((cond) => cond.attr)).toEqual(['status', 'score', 'tags'])
    const range = conditions[1]
    expect(range.value).toBe(10)
    expect(range.value2).toBe(20)
    expect(conditions[2].value).toEqual(['VIP'])
  })

  it('refuses unknown operators and non-array saved list values', () => {
    expect(() => deserializeFilters([{ attr: 'status', op: 'nonsense', value: 1 }], fields)).toThrow('Unknown saved-view')
    expect(() => deserializeFilters([{ attr: 'tags', op: 'any_of', value: 'VIP' }], fields)).toThrow('requires an array')
  })

  it('round-trips criteria through serialize and deserialize unchanged (bar <-> view)', () => {
    const original: FilterCondition[] = [
      { id: 'a', attr: 'status', op: 'eq', value: 'hot' },
      { id: 'b', attr: 'score', op: 'between', value: '10', value2: '20' },
      { id: 'c', attr: 'tags', op: 'any_of', value: ['VIP'] },
      { id: 'd', attr: 'name', op: 'is_empty', value: '' },
    ]
    const spec = serializeConditions(original, fields)
    const reopened = deserializeFilters(spec, fields)
    expect(serializeConditions(reopened, fields)).toEqual(spec)
  })

  it('maps typed scope tokens to eq filters and leaves the rest as full text', () => {
    const parsed = parseScopeTokens('status:hot score:42 landed cost', fields)
    expect(parsed.filters).toEqual([
      { attr: 'status', op: 'eq', value: 'hot' },
      { attr: 'score', op: 'eq', value: 42 },
    ])
    expect(parsed.text).toBe('landed cost')
  })

  it('accepts a field label as a token key and leaves unknown keys in full text', () => {
    expect(parseScopeTokens('Status:warm', fields).filters).toEqual([{ attr: 'status', op: 'eq', value: 'warm' }])
    const unknown = parseScopeTokens('nope:1 people_count:5', fields)
    expect(unknown.filters).toEqual([])
    expect(unknown.text).toBe('nope:1 people_count:5')
  })

  it('describes a condition as a humanized removable chip, never a raw key', () => {
    expect(describeCondition({ id: '1', attr: 'status', op: 'eq', value: 'hot' }, field('status'))).toEqual({ field: 'Status', op: 'is', value: 'hot' })
    expect(describeCondition({ id: '2', attr: 'score', op: 'between', value: 10, value2: 20 }, field('score'))).toEqual({ field: 'Score', op: 'between', value: '10 – 20' })
    expect(describeCondition({ id: '3', attr: 'do_not_contact', op: 'eq', value: false }, field('do_not_contact'))).toEqual({ field: 'Do not contact', op: 'is', value: 'No' })
    expect(describeCondition({ id: '4', attr: 'name', op: 'is_set', value: '' }, field('name'))).toEqual({ field: 'Name', op: 'is set', value: '' })
    expect(describeCondition({ id: '5', attr: 'company', op: 'eq', value: 'company:acme-inc' }, field('company'))).toEqual({ field: 'Company', op: 'is', value: 'Acme Inc' })
  })
})
