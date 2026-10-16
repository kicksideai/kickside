// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { CrmActivity, CrmAttribute, CrmObject, CrmRecord } from '../crm-types'

const getRecord = vi.fn()
const getTimeline = vi.fn()
const getRecordPanels = vi.fn()
const recordsByIds = vi.fn()

vi.mock('../crm-api', () => ({
  getRecord: (...args: unknown[]) => getRecord(...args),
  getTimeline: (...args: unknown[]) => getTimeline(...args),
  getRecordPanels: (...args: unknown[]) => getRecordPanels(...args),
  recordsByIds: (...args: unknown[]) => recordsByIds(...args),
  applyCommands: vi.fn(),
  crmErrorMessage: (_: unknown, fallback: string) => fallback,
}))
const loadByTagName = vi.fn()
const apiGet = vi.fn()

vi.mock('@wippy-fe/proxy', () => ({
  api: { get: (...args: unknown[]) => apiGet(...args) },
  host: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() },
  loadByTagName: (...args: unknown[]) => loadByTagName(...args),
}))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const RecordDetail = (await import('./RecordDetail.vue')).default

const object: CrmObject = { type: 'person', label: 'People' }
const objects: CrmObject[] = [object, { type: 'company', label: 'Companies' }, { type: 'opportunity', label: 'Opportunities' }]
const attributes: CrmAttribute[] = [
  { object_type: 'person', attr: 'name', data_type: 'text', label: 'Name', sort_order: 10, config: { ui: { role: 'title' } } },
  { object_type: 'person', attr: 'first_name', data_type: 'text', label: 'First name', sort_order: 20 },
  { object_type: 'person', attr: 'email', data_type: 'email', label: 'Email', sort_order: 30 },
  { object_type: 'person', attr: 'phone', data_type: 'phone', label: 'Phone', sort_order: 40 },
  { object_type: 'person', attr: 'company', data_type: 'relation', label: 'Company', sort_order: 50, config: { target: { kind: 'record', object_type: 'company' } } },
  { object_type: 'person', attr: 'lifecycle_stage', data_type: 'select', label: 'Lifecycle stage', sort_order: 60 },
  { object_type: 'person', attr: 'lead_status', data_type: 'select', label: 'Lead status', sort_order: 65 },
  { object_type: 'person', attr: 'budget', data_type: 'number', label: 'Budget', sort_order: 70 },
  { object_type: 'person', attr: 'memory_kb_id', data_type: 'text', label: 'Memory KB', sort_order: 900, config: { ui: { section: 'more' } } },
  { object_type: 'company', attr: 'name', data_type: 'text', label: 'Name', config: { ui: { role: 'title' } } },
  { object_type: 'opportunity', attr: 'name', data_type: 'text', label: 'Name', config: { ui: { role: 'title' } } },
  { object_type: 'opportunity', attr: 'contacts', data_type: 'relation', label: 'Contacts' },
]
const record: CrmRecord = {
  record_id: 'person:hubspot:421037348576',
  object_type: 'person',
  values: {
    name: 'Jules Example',
    first_name: 'Jules',
    email: 'jules.example@example.test',
    phone: '202-555-0142',
    company: [{ kind: 'record', type: 'company', id: 'company:hubspot:316184318653' }],
    lifecycle_stage: 'customer',
    lead_status: 'NEW',
    memory_kb_id: 'kb-991',
  },
  associations: {
    outgoing: [{ attr: 'company', source: { kind: 'record', type: 'person', id: 'person:hubspot:421037348576' }, target: { kind: 'record', type: 'company', id: 'company:hubspot:316184318653' } }],
    incoming: [{ attr: 'contacts', source: { kind: 'record', type: 'opportunity', id: 'opportunity:hubspot:286909396715' }, target: { kind: 'record', type: 'person', id: 'person:hubspot:421037348576' } }],
  },
}

function meeting(id: string, overrides: Record<string, unknown> = {}): CrmActivity {
  return {
    activity_id: `fireflies:${id}`,
    activity_type: 'meeting',
    occurred_at: '2026-08-05T19:30:00.000Z',
    source: 'fireflies',
    external_id: `fireflies:${id}`,
    payload: { title: `Interview prep ${id}`, attendee_emails: ['sam.example@example.test', 'jules.example@example.test'] },
    ...overrides,
  } as CrmActivity
}

const stubs = { RecordEditor: { props: ['crmId', 'title', 'attributes', 'record', 'saving'], template: '<div />' } }

function make(props: Record<string, unknown> = {}) {
  return mount(RecordDetail, {
    props: { crmId: 'crm-1', recordId: record.record_id, object, objects, attributes, ...props },
    global: { stubs },
  })
}

describe('CRM record detail', () => {
  beforeEach(() => {
    getRecord.mockReset(); getTimeline.mockReset(); getRecordPanels.mockReset(); recordsByIds.mockReset(); loadByTagName.mockReset(); apiGet.mockReset()
    loadByTagName.mockResolvedValue(undefined)
    getRecord.mockResolvedValue(record)
    getTimeline.mockResolvedValue([])
    getRecordPanels.mockResolvedValue([])
    recordsByIds.mockResolvedValue([
      { record_id: 'company:hubspot:316184318653', object_type: 'company', values: { name: 'Example Company' } },
      { record_id: 'opportunity:hubspot:286909396715', object_type: 'opportunity', values: { name: 'Platform rebuild' } },
    ])
    apiGet.mockResolvedValue({ data: { success: true, items: [] } })
  })

  it('queries detail and timeline with the complete opaque provider id', async () => {
    const wrapper = make({ recordId: 'contacts/524190630611' })
    await flushPromises()
    expect(getRecord).toHaveBeenCalledWith('crm-1', 'contacts/524190630611')
    expect(getTimeline).toHaveBeenCalledWith('crm-1', 'contacts/524190630611', 50)
    wrapper.unmount()
  })

  it('leads with who the record is and where it stands, never with an identifier', async () => {
    getTimeline.mockResolvedValueOnce([meeting('A')])
    const wrapper = make()
    await flushPromises()
    const hero = wrapper.find('.crm-record-hero')
    expect(hero.find('h1').text()).toBe('Jules Example')
    expect(hero.text()).toContain('Person')
    expect(hero.text()).toContain('Example Company')
    // The stored constant is read out as the option, not as the constant.
    expect(hero.text()).toContain('Customer')
    expect(hero.text()).not.toContain('customer')
    expect(hero.text()).toContain('Last touch')
    expect(hero.text()).not.toContain('hubspot')
    expect(hero.text()).not.toContain('421037348576')
    wrapper.unmount()
  })

  it('groups written fields and never shows an empty one in the reading surface', async () => {
    const wrapper = make()
    await flushPromises()
    const fields = wrapper.find('.crm-fields-card')
    expect(fields.findAll('.crm-fields-kind').map((node) => node.text())).toEqual(['Profile', 'Contact', 'Status'])
    expect(fields.text()).toContain('Email')
    expect(fields.text()).toContain('jules.example@example.test')
    // The header already gave the name and the lifecycle stage.
    expect(fields.text()).not.toContain('Jules Example')
    expect(fields.text()).not.toContain('Lifecycle stage')
    expect(fields.text()).toContain('Lead status')
    expect(fields.text()).toContain('New')
    // Budget carries no value and Company is answered by the related panel.
    expect(fields.text()).not.toContain('Budget')
    expect(fields.text()).not.toContain('Company')
    expect(fields.text()).not.toContain('—')
    wrapper.unmount()
  })

  it('collapses the long tail behind one disclosure, including a placement it has no seat for', async () => {
    const wrapper = make()
    await flushPromises()
    const more = wrapper.find('.crm-more-card')
    expect(more.exists()).toBe(true)
    expect(more.find('summary').text()).toContain('More fields')
    expect(more.text()).toContain('Memory KB')
    expect(wrapper.find('.crm-fields-card').text()).not.toContain('Memory KB')
    wrapper.unmount()
  })

  it('renders every connection once, grouped by the kind of record it points at', async () => {
    const wrapper = make()
    await flushPromises()
    expect(recordsByIds).toHaveBeenCalledWith('crm-1', ['company:hubspot:316184318653', 'opportunity:hubspot:286909396715'])
    const related = wrapper.find('.crm-related-card')
    expect(related.findAll('.crm-related-kind').map((node) => node.text())).toEqual(['Companies1', 'Opportunities1'])
    expect(related.findAll('.crm-related')).toHaveLength(2)
    expect(related.text()).toContain('Example Company')
    expect(related.text()).toContain('Platform rebuild')
    wrapper.unmount()
  })

  it('navigates to a connected record on click', async () => {
    const wrapper = make()
    await flushPromises()
    await wrapper.findAll('.crm-related')[0].trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['company/r~Y29tcGFueTpodWJzcG90OjMxNjE4NDMxODY1Mw'])
    wrapper.unmount()
  })

  it('resolves a meeting activity to the meeting the viewer may open', async () => {
    getTimeline.mockResolvedValueOnce([meeting('A'), meeting('B')])
    apiGet.mockResolvedValueOnce({ data: { success: true, items: [{ meeting_id: 'm-77', refs: [{ system: 'fireflies', external_id: 'A' }] }] } })
    const wrapper = make()
    await flushPromises()
    expect(apiGet).toHaveBeenCalledWith('/api/v1/meetings?limit=2&external_ids=A%2CB')
    const rows = wrapper.findAll('.crm-timeline-row')
    expect(rows[0].attributes('href')).toBe('/meetings/m-77')
    expect(rows[1].attributes('href')).toBeUndefined()
    wrapper.unmount()
  })

  it('asks for earlier activity without reloading the record', async () => {
    getTimeline.mockResolvedValueOnce(Array.from({ length: 50 }, (_, index) => meeting(`X${index}`)))
    const wrapper = make()
    await flushPromises()
    getTimeline.mockResolvedValueOnce([meeting('Y')])
    await wrapper.find('.crm-timeline-more').trigger('click')
    await flushPromises()
    expect(getTimeline).toHaveBeenLastCalledWith('crm-1', record.record_id, 100)
    expect(getRecord).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('renders registered panel elements with the CRM record context and hides undefined tags', async () => {
    if (!customElements.get('wc-record-panel')) customElements.define('wc-record-panel', class extends HTMLElement {})
    getRecordPanels.mockResolvedValueOnce([
      { tag: 'wc-record-panel', title: 'Deal room', order: 10, object_types: ['person'] },
      { tag: 'wc-missing-record-panel', title: 'Not installed', order: 20, object_types: ['person'] },
    ])
    const wrapper = make()
    await flushPromises()
    expect(getRecordPanels).toHaveBeenCalledWith('crm-1', 'person')
    expect(wrapper.text()).toContain('Deal room')
    expect(wrapper.text()).not.toContain('Not installed')
    expect(wrapper.find('wc-record-panel').attributes()).toMatchObject({ 'record-id': record.record_id, 'crm-id': 'crm-1', 'object-type': 'person' })
    expect(loadByTagName).toHaveBeenCalledWith('wc-missing-record-panel', { timeoutMs: 8000 })
    wrapper.unmount()
  })

  // The mount contract is the whole seam: a contributed panel knows which record
  // it is reading only from what this page hands it. Every declared tag gets the
  // same three, spelled the way the element declares them.
  it('hands every contributed panel the same record identity', async () => {
    for (const tag of ['wc-first-record-panel', 'wc-second-record-panel']) {
      if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    }
    getRecordPanels.mockResolvedValueOnce([
      { tag: 'wc-first-record-panel', title: 'Meetings', order: 50, object_types: ['person'] },
      { tag: 'wc-second-record-panel', title: 'Dealroom', order: 60, object_types: ['person'] },
    ])
    const wrapper = make({ recordId: 'contacts/524190630611' })
    await flushPromises()
    const identity = { 'record-id': 'contacts/524190630611', 'crm-id': 'crm-1', 'object-type': 'person' }
    expect(wrapper.find('wc-first-record-panel').attributes()).toMatchObject(identity)
    expect(wrapper.find('wc-second-record-panel').attributes()).toMatchObject(identity)
    wrapper.unmount()
  })

  // A contributed panel is content, not a card: the page owns the section around
  // it, so it is inset like every native panel body rather than sitting flush
  // against the card edge.
  it('insets a contributed panel in the same section chrome as a native one', async () => {
    if (!customElements.get('wc-chrome-record-panel')) customElements.define('wc-chrome-record-panel', class extends HTMLElement {})
    getRecordPanels.mockResolvedValueOnce([{ tag: 'wc-chrome-record-panel', title: 'Dealroom', order: 60, object_types: ['person'] }])
    const wrapper = make()
    await flushPromises()
    const section = wrapper.find('.crm-panel-card')
    expect(section.find('.crm-card-head h2').text()).toBe('Dealroom')
    expect(section.find('wc-chrome-record-panel').classes()).toContain('crm-panel-body')
    wrapper.unmount()
  })

  it('mounts a declared panel whose element the platform defines on demand', async () => {
    loadByTagName.mockImplementation((tag: string) => {
      if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
      return Promise.resolve()
    })
    getRecordPanels.mockResolvedValueOnce([{ tag: 'wc-late-record-panel', title: 'Meetings', order: 50, object_types: ['person'] }])
    const wrapper = make()
    await flushPromises()
    expect(loadByTagName).toHaveBeenCalledWith('wc-late-record-panel', { timeoutMs: 8000 })
    expect(wrapper.text()).toContain('Meetings')
    wrapper.unmount()
  })

  it('keeps the record page usable when a contributed panel bundle is unavailable', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    loadByTagName.mockRejectedValue(new Error('no view.component registered for tag'))
    getRecordPanels.mockResolvedValueOnce([{ tag: 'wc-broken-record-panel', title: 'Broken panel', order: 10, object_types: ['person'] }])
    const wrapper = make()
    await flushPromises()
    expect(wrapper.text()).toContain('Jules Example')
    expect(wrapper.text()).not.toContain('Broken panel')
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
    wrapper.unmount()
  })

  it('re-reads only the record on screen when the read model advances', async () => {
    const wrapper = make({ revision: 0 })
    await flushPromises()
    expect(getRecord).toHaveBeenCalledTimes(1)

    getRecord.mockResolvedValueOnce({ ...record, values: { ...record.values, first_name: 'Jules Updated' } })
    await wrapper.setProps({ revision: 1 })
    await flushPromises()

    // No spinner: the record updates in place instead of collapsing the page.
    expect(wrapper.find('.crm-state').exists()).toBe(false)
    expect(getRecord).toHaveBeenCalledTimes(2)
    expect(getRecord).toHaveBeenLastCalledWith('crm-1', record.record_id)
    wrapper.unmount()
  })

  it('keeps the record on screen when a background re-read fails', async () => {
    const wrapper = make({ revision: 0 })
    await flushPromises()
    getRecord.mockRejectedValueOnce(new Error('CRM query failed.'))
    await wrapper.setProps({ revision: 1 })
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Jules Example')
    wrapper.unmount()
  })

  // A record's chronology now reaches one relation hop: rows keyed to a
  // connected record arrive on this page, and the page has to be able to name
  // them or the history reads as this record's own.
  it('resolves the names of the records its chronology is keyed to, in the same bounded read', async () => {
    getTimeline.mockResolvedValueOnce([meeting('A', { record_id: 'opportunity:hubspot:286909396715' })])
    const wrapper = make()
    await flushPromises()
    expect(recordsByIds).toHaveBeenCalledTimes(1)
    const [, ids] = recordsByIds.mock.calls[0] as [string, string[]]
    expect(ids).toContain('opportunity:hubspot:286909396715')
    expect(wrapper.find('[data-test="activity-anchor"]').text()).toContain('Platform rebuild')
    wrapper.unmount()
  })

  it('asks for a chronology anchor once, never a second time for a record it already names', async () => {
    getTimeline.mockResolvedValueOnce([meeting('A', { record_id: 'company:hubspot:316184318653' })])
    const wrapper = make()
    await flushPromises()
    const [, ids] = recordsByIds.mock.calls[0] as [string, string[]]
    expect(ids.filter((id) => id === 'company:hubspot:316184318653')).toHaveLength(1)
    wrapper.unmount()
  })

  // Opening a crowded group is what asks for the rest of the names; the first
  // read stays the size of the page.
  it('reads the names behind a disclosure only when the reader opens it', async () => {
    const crowded: CrmRecord = {
      record_id: 'company:example',
      object_type: 'company',
      values: { name: 'Example Company' },
      associations: {
        incoming: Array.from({ length: 9 }, (_, index) => ({
          attr: 'company',
          source: { kind: 'record' as const, type: 'person', id: `person:${index}` },
          target: { kind: 'record' as const, type: 'company', id: 'company:example' },
        })),
      },
    }
    getRecord.mockResolvedValueOnce(crowded)
    recordsByIds.mockReset()
    recordsByIds.mockResolvedValue([])
    const wrapper = make({ recordId: 'company:example', object: { type: 'company', label: 'Companies' } })
    await flushPromises()

    expect(recordsByIds).toHaveBeenCalledTimes(1)
    expect((recordsByIds.mock.calls[0] as [string, string[]])[1]).toHaveLength(5)

    recordsByIds.mockResolvedValueOnce(Array.from({ length: 9 }, (_, index) => ({
      record_id: `person:${index}`, object_type: 'person', values: { name: `Person ${index}` },
    })))
    await wrapper.find('.crm-related-more').trigger('click')
    await flushPromises()

    expect(recordsByIds).toHaveBeenCalledTimes(2)
    expect((recordsByIds.mock.calls[1] as [string, string[]])[1]).toHaveLength(9)
    expect(wrapper.find('.crm-related-card').text()).toContain('Person 8')
    wrapper.unmount()
  })

  it('shows a record with nothing attached as nothing, without empty panels', async () => {
    getRecord.mockResolvedValueOnce({ record_id: 'person:sam', object_type: 'person', values: { name: 'Sam Example' } })
    recordsByIds.mockResolvedValueOnce([])
    const wrapper = make()
    await flushPromises()
    expect(wrapper.find('.crm-related-card').exists()).toBe(false)
    expect(recordsByIds).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Nothing has been logged')
    wrapper.unmount()
  })
})
