import { describe, expect, it } from 'vitest'
import { RELATED_SHOWN, relatedGroups, relatedIds, relatedRows, relationLabel, visibleRelatedIds } from './crm-related'
import type { CrmAttribute, CrmObject, CrmRecord } from './crm-types'

const objects: CrmObject[] = [
  { type: 'company', label: 'Companies' },
  { type: 'opportunity', label: 'Opportunities' },
  { type: 'person', label: 'People' },
]

const attributes: CrmAttribute[] = [
  { object_type: 'person', attr: 'company', data_type: 'relation', label: 'Company' },
  { object_type: 'opportunity', attr: 'contacts', data_type: 'relation', label: 'Contacts' },
]

const record: CrmRecord = {
  record_id: 'person:julie',
  object_type: 'person',
  values: { company: [{ kind: 'record', type: 'company', id: 'company:example' }] },
  associations: {
    outgoing: [{ attr: 'company', source: { kind: 'record', type: 'person', id: 'person:julie' }, target: { kind: 'record', type: 'company', id: 'company:example' } }],
    incoming: [
      { attr: 'contacts', source: { kind: 'record', type: 'opportunity', id: 'opportunity:one' }, target: { kind: 'record', type: 'person', id: 'person:julie' } },
      { attr: 'contacts', source: { kind: 'record', type: 'opportunity', id: 'opportunity:two' }, target: { kind: 'record', type: 'person', id: 'person:julie' } },
    ],
  },
}

describe('related records', () => {
  // The stored edge and the field value describe one connection; the panel shows
  // one row for it.
  it('merges association edges with relation values instead of showing both', () => {
    const rows = relatedRows(record, attributes.filter((field) => field.object_type === 'person'))
    expect(rows).toEqual([
      { id: 'company:example', type: 'company', attr: 'company', direction: 'outgoing' },
      { id: 'opportunity:one', type: 'opportunity', attr: 'contacts', direction: 'incoming' },
      { id: 'opportunity:two', type: 'opportunity', attr: 'contacts', direction: 'incoming' },
    ])
  })

  it('keeps a relation value the deployment wrote without an edge', () => {
    const valueOnly: CrmRecord = { record_id: 'person:sam', object_type: 'person', values: { company: { kind: 'record', type: 'company', id: 'company:acme' } } }
    expect(relatedRows(valueOnly, attributes)).toEqual([{ id: 'company:acme', type: 'company', attr: 'company', direction: 'outgoing' }])
    expect(relatedRows(null)).toEqual([])
  })

  it('gathers connections by the kind of record they point at, in declared order', () => {
    const groups = relatedGroups(relatedRows(record, attributes), objects)
    expect(groups.map((group) => group.label)).toEqual(['Companies', 'Opportunities'])
    expect(groups[1].rows).toHaveLength(2)
  })

  it('names a group whose object type the workspace does not declare', () => {
    const groups = relatedGroups([{ id: 'support_ticket:9', type: 'support_ticket', attr: 'raised_by', direction: 'incoming' }], objects)
    expect(groups.map((group) => group.label)).toEqual(['Support Ticket'])
  })

  it('captions a connection with the declared field label from whichever side owns it', () => {
    const rows = relatedRows(record, attributes)
    expect(relationLabel(rows[0], attributes, 'person')).toBe('Company')
    expect(relationLabel(rows[1], attributes, 'person')).toBe('Contacts')
    expect(relationLabel({ id: 'x:1', type: 'x', attr: 'primary_owner', direction: 'outgoing' }, attributes, 'person')).toBe('Primary Owner')
  })

  it('lists every id to hydrate exactly once', () => {
    expect(relatedIds(relatedRows(record, attributes))).toEqual(['company:example', 'opportunity:one', 'opportunity:two'])
    expect(relatedIds([])).toEqual([])
  })

  // A company with hundreds of people attached is a normal company. Naming every
  // one of them to put five names on screen is a read the size of the data.
  it('asks for the names of exactly the rows the panel puts on screen', () => {
    const crowded: CrmRecord = {
      record_id: 'company:example',
      object_type: 'company',
      values: {},
      associations: {
        incoming: Array.from({ length: 40 }, (_, index) => ({
          attr: 'company',
          source: { kind: 'record' as const, type: 'person', id: `person:${index}` },
          target: { kind: 'record' as const, type: 'company', id: 'company:example' },
        })),
      },
    }
    const rows = relatedRows(crowded, [])
    expect(rows).toHaveLength(40)
    const visible = visibleRelatedIds(rows, objects)
    expect(visible).toHaveLength(RELATED_SHOWN)
    expect(visible).toEqual(['person:0', 'person:1', 'person:2', 'person:3', 'person:4'])
  })

  it('takes the first rows of every kind, not the first rows overall', () => {
    const visible = visibleRelatedIds(relatedRows(record, attributes), objects, 1)
    expect(visible).toEqual(['company:example', 'opportunity:one'])
  })
})
