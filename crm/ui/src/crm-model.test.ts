import { describe, expect, it } from 'vitest'
import { apiName, boardBuckets, choiceLabel, defaultColumns, detailGroups, displayValue, friendly, hasValue, heroFacts, humanizeKey, isCollapsedField, isStructuredValue, moreFields, objectAttributes, partitionFields, readableText, recordLabel, relationEntries, relationTargetTypes, stageValue, stages, structuredLines } from './crm-model'
import type { CrmAttribute, CrmPipeline, CrmRecord } from './crm-types'

const candidateFields: CrmAttribute[] = [
  { object_type: 'prospect_candidate', attr: 'name', data_type: 'text', label: 'Name', sort_order: 5, system: true, config: { ui: { role: 'title' } } },
  { object_type: 'prospect_candidate', attr: 'email', data_type: 'email', label: 'Email', sort_order: 10, system: true },
  { object_type: 'prospect_candidate', attr: 'company_name', data_type: 'text', label: 'Company', sort_order: 20, system: true },
  { object_type: 'prospect_candidate', attr: 'title', data_type: 'text', label: 'Title', sort_order: 30, system: true },
  { object_type: 'prospect_candidate', attr: 'status', data_type: 'select', label: 'Status', sort_order: 40, system: true },
  { object_type: 'prospect_candidate', attr: 'session_id', data_type: 'text', label: 'Import session', sort_order: 70, system: true, config: { ui: { section: 'collapsed' } } },
  { object_type: 'prospect_candidate', attr: 'icp', data_type: 'ai', label: 'ICP result', sort_order: 150, system: true, config: { ui: { section: 'collapsed' } } },
  { object_type: 'prospect_candidate', attr: 'row', data_type: 'ai', label: 'Original import data', sort_order: 180, system: true, config: { ui: { section: 'collapsed' } } },
]

const opportunityFields: CrmAttribute[] = [
  { object_type: 'opportunity', attr: 'name', data_type: 'text', label: 'Name', sort_order: 10, config: { ui: { role: 'title' } } },
  { object_type: 'opportunity', attr: 'company', data_type: 'relation', label: 'Company', sort_order: 20, config: { target: { kind: 'record', object_type: 'company' }, relation: 'opportunity_for' } },
  { object_type: 'opportunity', attr: 'amount', data_type: 'currency', label: 'Amount', sort_order: 30 },
  { object_type: 'opportunity', attr: 'stage', data_type: 'select', label: 'Stage', sort_order: 40, config: { choices: ['Lead', 'Qualified', 'Demo', 'Won', 'Lost'] } },
]

const salesPipeline: CrmPipeline = {
  collection_id: 'sales_pipeline',
  object_type: 'opportunity',
  label: 'Sales Pipeline',
  stages: [
    { stage_id: 'Lead', label: 'Lead', order: 10 },
    { stage_id: 'Qualified', label: 'Qualified', order: 20 },
    { stage_id: 'Demo', label: 'Demo', order: 30 },
    { stage_id: 'Won', label: 'Won', order: 40, terminal: true, won: true },
    { stage_id: 'Lost', label: 'Lost', order: 50, terminal: true },
  ],
}

const personFields: CrmAttribute[] = [
  { object_type: 'person', attr: 'name', data_type: 'text', label: 'Name', sort_order: 10, config: { ui: { role: 'title' } } },
  { object_type: 'person', attr: 'email', data_type: 'email', label: 'Email', sort_order: 20 },
  { object_type: 'person', attr: 'phone', data_type: 'phone', label: 'Phone', sort_order: 30 },
  { object_type: 'person', attr: 'company', data_type: 'relation', label: 'Company', sort_order: 40, config: { target: { kind: 'record', object_type: 'company' }, relation: 'works_at' } },
  { object_type: 'person', attr: 'status', data_type: 'select', label: 'Status', sort_order: 50 },
  { object_type: 'person', attr: 'owner', data_type: 'text', label: 'Owner', sort_order: 60 },
  { object_type: 'person', attr: 'do_not_contact', data_type: 'boolean', label: 'Do not contact', sort_order: 70 },
]

describe('shared CRM UI model', () => {
  it('derives stable API names without preserving display punctuation', () => {
    expect(apiName(' Annual Revenue ')).toBe('annual_revenue')
    expect(apiName('Buyer / Champion')).toBe('buyer_champion')
  })

  it('sorts schema fields using backend sort order', () => {
    expect(objectAttributes([
      { object_type: 'person', attr: 'email', data_type: 'email', label: 'Email', sort_order: 20 },
      { object_type: 'company', attr: 'name', data_type: 'text', label: 'Name', sort_order: 10 },
      { object_type: 'person', attr: 'name', data_type: 'text', label: 'Name', sort_order: 10 },
    ], 'person').map((field) => field.attr)).toEqual(['name', 'email'])
  })

  it('normalizes string and object pipeline stages for one board renderer', () => {
    expect(stages({ collection_id: 'sales', object_type: 'deal', label: 'Sales', stages: ['Lead', { stage_id: 'won', label: 'Won', terminal: true }] })).toEqual([
      { stage_id: 'Lead', label: 'Lead', order: 10 },
      { stage_id: 'won', label: 'Won', terminal: true },
    ])
  })

  it('places each record in the pipeline column matching its stage attribute value', () => {
    const attr = opportunityFields.find((field) => field.attr === 'stage')
    const records: CrmRecord[] = [
      { record_id: 'opportunity:1', object_type: 'opportunity', values: { name: 'Acme Expansion', stage: 'Qualified', amount: 5000 } },
      { record_id: 'opportunity:2', object_type: 'opportunity', values: { name: 'Beta Renewal', stage: 'Lead' } },
    ]
    const buckets = boardBuckets(salesPipeline, records, attr)
    expect(buckets.Qualified.map((record) => record.record_id)).toEqual(['opportunity:1'])
    expect(buckets.Lead.map((record) => record.record_id)).toEqual(['opportunity:2'])
    expect(buckets.Demo).toEqual([])
  })

  it('matches a stage value to its column regardless of case or punctuation', () => {
    const attr = opportunityFields.find((field) => field.attr === 'stage')
    const records: CrmRecord[] = [{ record_id: 'opportunity:3', object_type: 'opportunity', values: { name: 'Gamma', stage: 'qualified' } }]
    expect(boardBuckets(salesPipeline, records, attr).Qualified.map((record) => record.record_id)).toEqual(['opportunity:3'])
  })

  it('resolves the stored choice value a board move should write for a stage', () => {
    const attr = opportunityFields.find((field) => field.attr === 'stage')
    expect(stageValue({ stage_id: 'Won', label: 'Won' }, attr)).toBe('Won')
  })

  it('classifies structured object values distinctly from relations and scalar tag lists', () => {
    const relation: CrmAttribute = { object_type: 'person', attr: 'company', data_type: 'relation', label: 'Company' }
    expect(isStructuredValue({ session_id: 'abc', source: 'csv' })).toBe(true)
    expect(isStructuredValue(['Lead', 'VIP'])).toBe(false)
    expect(isStructuredValue('Acme', relation)).toBe(false)
    expect(isStructuredValue('plain text')).toBe(false)
    expect(isStructuredValue(undefined)).toBe(false)
  })

  it('formats values from field metadata and uses honest empty values', () => {
    expect(displayValue(undefined)).toBe('—')
    expect(displayValue(false)).toBe('No')
    expect(displayValue(['Lead', 'VIP'])).toBe('Lead, VIP')
    expect(displayValue(1250, { object_type: 'deal', attr: 'amount', label: 'Amount', data_type: 'currency', config: { currency_code: 'USD', precision: 0 } })).toMatch(/1,250/)
  })

  it('humanizes raw record keys instead of showing type:slug', () => {
    expect(humanizeKey('company:example-logistics')).toBe('Example Logistics')
    expect(humanizeKey('gtm_import_session:autumn-batch')).toBe('Autumn Batch')
    expect(humanizeKey('company:550e8400-e29b-41d4-a716-446655440000')).toBe('Company')
    expect(friendly('company:example-logistics')).toBe('Example Logistics')
    expect(friendly('Acme Corporation')).toBe('Acme Corporation')
    expect(friendly(undefined)).toBe('')
  })

  it('labels a record by its name and falls back to a humanized key', () => {
    expect(recordLabel({ record_id: 'company:acme', values: { name: 'Acme Corp' } }, [{ object_type: 'company', attr: 'name', data_type: 'text', label: 'Name', config: { ui: { role: 'title' } } }])).toBe('Acme Corp')
    expect(recordLabel({ record_id: 'company:example-logistics', values: {} })).toBe('Example Logistics')
  })

  it('resolves relation values to display names with a humanized fallback', () => {
    const names = { 'company:acme': { name: 'Acme Corp', type: 'company' } }
    expect(relationEntries({ kind: 'record', type: 'company', id: 'company:acme' }, names)).toEqual([{ kind: 'record', id: 'company:acme', label: 'Acme Corp', type: 'company', route: 'company/r~Y29tcGFueTphY21l' }])
    expect(relationEntries({ kind: 'record', type: 'company', id: 'company:example-logistics' }, names)).toEqual([{ kind: 'record', id: 'company:example-logistics', label: 'Example Logistics', type: 'company', route: 'company/r~Y29tcGFueTpleGFtcGxlLWxvZ2lzdGljcw' }])
    expect(relationEntries([{ kind: 'record', type: 'company', id: 'company:acme' }, { kind: 'record', type: 'company', id: 'company:beta-inc' }], names)).toEqual([
      { kind: 'record', id: 'company:acme', label: 'Acme Corp', type: 'company', route: 'company/r~Y29tcGFueTphY21l' },
      { kind: 'record', id: 'company:beta-inc', label: 'Beta Inc', type: 'company', route: 'company/r~Y29tcGFueTpiZXRhLWluYw' },
    ])
    expect(relationEntries(undefined, names)).toEqual([])
  })

  it('collects relation target types from the schema', () => {
    expect(relationTargetTypes(personFields, 'person')).toEqual(['company'])
  })

  it('ships a calm default column set without consent-flag noise', () => {
    expect(defaultColumns(personFields)).toEqual(['name', 'email', 'phone', 'company', 'status', 'owner'])
    expect(defaultColumns(personFields)).not.toContain('do_not_contact')
  })

  it('never adds an AI field to the default columns, even when it looks like a fit signal', () => {
    const columns = defaultColumns(candidateFields)
    expect(columns).toEqual(['name', 'email', 'company_name', 'title', 'status'])
    expect(columns).not.toContain('icp')
    expect(columns).not.toContain('row')
  })

  it('renders structured values as humanized lines, never a raw JSON blob', () => {
    expect(displayValue({ title: 'VP Operations', name: 'Alex Example' })).toBe('')
    expect(displayValue({ title: 'VP Operations' })).not.toMatch(/[{}"]/)
    expect(structuredLines({ title: 'VP Operations', name: 'Alex Example', company: 'Example Freight' })).toEqual([
      { label: 'Title', text: 'VP Operations' },
      { label: 'Name', text: 'Alex Example' },
      { label: 'Company', text: 'Example Freight' },
    ])
  })

  it('flattens a nested scoring object into readable lines without braces', () => {
    const lines = structuredLines({ fit: 'low', lane: 'services', score_breakdown: { total: 0 } })
    expect(lines).toContainEqual({ label: 'Fit', text: 'low' })
    expect(lines).toContainEqual({ label: 'Score Breakdown · Total', text: '0' })
    expect(lines.every((line) => !/[{}"]/.test(line.text))).toBe(true)
  })

  it('classifies collapsed fields separately from reading fields', () => {
    expect(isCollapsedField(candidateFields[0])).toBe(false) // name
    expect(isCollapsedField(candidateFields[1])).toBe(false) // email
    expect(isCollapsedField(candidateFields[5])).toBe(true) // session_id
    expect(isCollapsedField(candidateFields[6])).toBe(true) // icp (ai)
    expect(isCollapsedField(candidateFields[7])).toBe(true) // row (ai)
    expect(isCollapsedField(personFields[6])).toBe(false) // do_not_contact stays a reading field
  })

  it('partitions record fields into reading and collapsed system groups', () => {
    const { reading, system } = partitionFields(candidateFields)
    expect(reading.map((field) => field.attr)).toEqual(['name', 'email', 'company_name', 'title', 'status'])
    expect(system.map((field) => field.attr)).toEqual(['session_id', 'icp', 'row'])
  })

  // A deployment may declare a placement this surface has no seat for. Only an
  // explicit "main" -- or no placement at all -- earns the front of the page.
  it('collapses a field assigned to a placement this surface does not have', () => {
    const declared: CrmAttribute[] = [
      { object_type: 'person', attr: 'name', data_type: 'text', label: 'Name' },
      { object_type: 'person', attr: 'front', data_type: 'text', label: 'Front', config: { ui: { section: 'main' } } },
      { object_type: 'person', attr: 'memory_kb_id', data_type: 'text', label: 'Memory KB', config: { ui: { section: 'more' } } },
      { object_type: 'person', attr: 'gone', data_type: 'text', label: 'Gone', config: { ui: { section: 'hidden' } } },
    ]
    const { reading, system, hidden } = partitionFields(declared)
    expect(reading.map((field) => field.attr)).toEqual(['name', 'front'])
    expect(system.map((field) => field.attr)).toEqual(['memory_kb_id'])
    expect(hidden.map((field) => field.attr)).toEqual(['gone'])
  })

  it('never title-cases an upstream key into a record name', () => {
    expect(humanizeKey('person:hubspot:421037348576')).toBe('Person')
    expect(humanizeKey('company:9912837')).toBe('Company')
    expect(humanizeKey('company:example-logistics')).toBe('Example Logistics')
  })

  // Upstream constants must never reach the page as constants, and prose a
  // person wrote must survive untouched.
  it('reads a stored choice as the option, never as the constant', () => {
    expect(choiceLabel('DIRECT_TRAFFIC')).toBe('Direct Traffic')
    expect(choiceLabel('NEW')).toBe('New')
    expect(choiceLabel('customer')).toBe('Customer')
    expect(choiceLabel('lead_status_open')).toBe('Lead Status Open')
    expect(choiceLabel('Closed Won')).toBe('Closed Won')
    expect(choiceLabel('MQLs')).toBe('MQLs')
    expect(choiceLabel('')).toBe('')
    expect(displayValue('OFFLINE', { object_type: 'person', attr: 'source', data_type: 'select', label: 'Source' })).toBe('Offline')
  })

  it('rewrites free text only when it is unmistakably a constant', () => {
    expect(readableText('DIRECT_TRAFFIC')).toBe('Direct Traffic')
    expect(readableText('recent_form')).toBe('Recent Form')
    expect(readableText('OFFLINE')).toBe('Offline')
    expect(readableText('NDA')).toBe('NDA')
    expect(readableText('GDPR')).toBe('GDPR')
    expect(readableText('SOC2')).toBe('SOC2')
    expect(readableText('Offline')).toBe('Offline')
    expect(readableText('Meetings Link: john-griffin3')).toBe('Meetings Link: john-griffin3')
    expect(readableText('https://ACME_CORP.test')).toBe('https://ACME_CORP.test')
  })

  it('knows what counts as a value a reader can see', () => {
    expect(hasValue('Acme')).toBe(true)
    expect(hasValue(0)).toBe(true)
    expect(hasValue(false)).toBe(true)
    expect(hasValue(['a'])).toBe(true)
    expect(hasValue('')).toBe(false)
    expect(hasValue([])).toBe(false)
    expect(hasValue({})).toBe(false)
    expect(hasValue(undefined)).toBe(false)
    expect(hasValue(null)).toBe(false)
  })
})

describe('record detail field layout', () => {
  const values = { name: 'Jules Example', email: 'jules@example.test', phone: '202-555-0142', company: [{ kind: 'record', type: 'company', id: 'company:example' }], status: 'Customer', owner: 'Sam Example' }

  it('groups filled fields by what they are and keeps the schema order between groups', () => {
    const groups = detailGroups(personFields, values)
    expect(groups.map((group) => group.label)).toEqual(['Profile', 'Contact', 'Status'])
    expect(groups[0].fields.map((field) => field.attr)).toEqual(['name', 'owner'])
    expect(groups[1].fields.map((field) => field.attr)).toEqual(['email', 'phone'])
    expect(groups[2].fields.map((field) => field.attr)).toEqual(['status'])
  })

  it('keeps relations and empty fields out of the reading groups entirely', () => {
    const groups = detailGroups(personFields, values)
    const shown = groups.flatMap((group) => group.fields.map((field) => field.attr))
    expect(shown).not.toContain('company')
    expect(shown).not.toContain('do_not_contact')
  })

  it('puts every empty and collapsed field behind one disclosure, written ones first', () => {
    const { reading, system } = partitionFields(candidateFields)
    const rows = moreFields(reading, system, { name: 'Alex', email: 'alex@acme.test', session_id: 'batch-7' })
    // The one collapsed field carrying a value leads; the rest keep their
    // declared order, collapsed before the record's own blanks.
    expect(rows.map((field) => field.attr)).toEqual(['session_id', 'icp', 'row', 'company_name', 'title', 'status'])
  })

  // The header already names the record and states where it stands; repeating
  // both a line below is noise.
  it('starts the field groups where the page header left off', () => {
    const groups = detailGroups(personFields, values, ['name', 'status'])
    // Contact now leads: a group sits where its earliest remaining field was
    // declared, and the profile group has lost the name to the heading.
    expect(groups.map((group) => group.label)).toEqual(['Contact', 'Profile'])
    expect(groups[1].fields.map((field) => field.attr)).toEqual(['owner'])
  })

  it('reads the two leading facts off the declaration rather than off field names', () => {
    const facts = heroFacts(personFields, values)
    expect(facts.relation?.attr).toBe('company')
    expect(facts.status?.attr).toBe('status')
    expect(heroFacts(personFields, { name: 'Jules Example' })).toEqual({ relation: undefined, status: undefined })
  })
})
