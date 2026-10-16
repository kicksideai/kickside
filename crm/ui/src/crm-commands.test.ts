import { describe, expect, it } from 'vitest'
import { createRecordCommands, updateRecordCommands } from './crm-commands'
import { CRM_EVENTS, type CrmAttribute, type CrmReference } from './crm-types'

const attributes: CrmAttribute[] = [
  { object_type: 'entity', attr: 'name', data_type: 'text', label: 'Name' },
  {
    object_type: 'entity',
    attr: 'parent',
    data_type: 'relation',
    label: 'Parent',
    config: { cardinality: 'one', relation: 'belongs_to', target: { kind: 'record', object_type: 'entity' } },
  },
  {
    object_type: 'entity',
    attr: 'reviewers',
    data_type: 'relation',
    label: 'Reviewers',
    config: { cardinality: 'many', target: { kind: 'principal', kinds: ['user'] } },
  },
]

const parent = (id: string, label?: string): CrmReference => ({ kind: 'record', type: 'entity', id, ...(label ? { label } : {}) })
const reviewer = (id: string): CrmReference => ({ kind: 'principal', type: 'user', id })

describe('CRM record command lowering', () => {
  it('keeps relations out of record.created and emits typed link commands', () => {
    expect(createRecordCommands('entity:1', 'entity', attributes, {
      name: 'One',
      parent: parent('entity:root', 'Root'),
      reviewers: [reviewer('user:a'), reviewer('user:b')],
    })).toEqual([
      { type: CRM_EVENTS.recordCreated, body: { record_id: 'entity:1', object_type: 'entity', values: { name: 'One' } } },
      { type: CRM_EVENTS.relationLinked, body: { record_id: 'entity:1', object_type: 'entity', attr: 'parent', reference: { kind: 'record', type: 'entity', id: 'entity:root' }, relation: 'belongs_to' } },
      { type: CRM_EVENTS.relationLinked, body: { record_id: 'entity:1', object_type: 'entity', attr: 'reviewers', reference: { kind: 'principal', type: 'user', id: 'user:a' } } },
      { type: CRM_EVENTS.relationLinked, body: { record_id: 'entity:1', object_type: 'entity', attr: 'reviewers', reference: { kind: 'principal', type: 'user', id: 'user:b' } } },
    ])
  })

  it('lowers scalar set/unset and relation deltas without rewriting retained references', () => {
    expect(updateRecordCommands('entity:1', 'entity', attributes, {
      name: 'Before',
      parent: parent('entity:old'),
      reviewers: [reviewer('user:a'), reviewer('user:b')],
    }, {
      parent: parent('entity:new'),
      reviewers: [reviewer('user:b'), reviewer('user:c')],
    })).toEqual([
      { type: CRM_EVENTS.recordUpdated, body: { record_id: 'entity:1', object_type: 'entity', unset: ['name'] } },
      { type: CRM_EVENTS.relationUnlinked, body: { record_id: 'entity:1', object_type: 'entity', attr: 'parent', reference: { kind: 'record', type: 'entity', id: 'entity:old' }, relation: 'belongs_to' } },
      { type: CRM_EVENTS.relationLinked, body: { record_id: 'entity:1', object_type: 'entity', attr: 'parent', reference: { kind: 'record', type: 'entity', id: 'entity:new' }, relation: 'belongs_to' } },
      { type: CRM_EVENTS.relationUnlinked, body: { record_id: 'entity:1', object_type: 'entity', attr: 'reviewers', reference: { kind: 'principal', type: 'user', id: 'user:a' } } },
      { type: CRM_EVENTS.relationLinked, body: { record_id: 'entity:1', object_type: 'entity', attr: 'reviewers', reference: { kind: 'principal', type: 'user', id: 'user:c' } } },
    ])
  })

  it('emits nothing when scalar and relation identities are unchanged', () => {
    const before = { name: 'One', parent: parent('entity:root', 'Old label') }
    const after = { name: 'One', parent: parent('entity:root', 'New label') }
    expect(updateRecordCommands('entity:1', 'entity', attributes, before, after)).toEqual([])
  })
})
