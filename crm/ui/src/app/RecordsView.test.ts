// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { CrmAttribute, CrmObject, CrmRecord } from '../crm-types'

const listRecords = vi.fn()
const countRecords = vi.fn()
const getBoard = vi.fn()
const getTimeline = vi.fn()
const recordsByIds = vi.fn()
const readListViews = vi.fn()
const writeListViews = vi.fn()
const applyCommands = vi.fn()

vi.mock('../crm-api', () => ({
  listRecords: (...args: unknown[]) => listRecords(...args),
  countRecords: (...args: unknown[]) => countRecords(...args),
  getBoard: (...args: unknown[]) => getBoard(...args),
  getTimeline: (...args: unknown[]) => getTimeline(...args),
  recordsByIds: (...args: unknown[]) => recordsByIds(...args),
  readListViews: (...args: unknown[]) => readListViews(...args),
  writeListViews: (...args: unknown[]) => writeListViews(...args),
  applyCommands: (...args: unknown[]) => applyCommands(...args),
  crmErrorMessage: (_: unknown, fallback: string) => fallback,
}))
vi.mock('@wippy-fe/proxy', () => ({ host: { toast: vi.fn() } }))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const RecordsView = (await import('./RecordsView.vue')).default

const object: CrmObject = { type: 'person', label: 'People' }
const attributes: CrmAttribute[] = [
  { object_type: 'person', attr: 'name', data_type: 'text', label: 'Name', config: { ui: { role: 'title' } } },
  { object_type: 'person', attr: 'company', data_type: 'text', label: 'Company' },
]
const rows: CrmRecord[] = [
  { record_id: 'p1', object_type: 'person', values: { name: 'Ann Example' } },
  { record_id: 'p2', object_type: 'person', values: { name: 'Second Record' } },
  { record_id: 'p3', object_type: 'person', values: { name: 'Cara Example' } },
]
const page = (r: CrmRecord[], total = r.length) => ({ rows: r, total, limit: 50, offset: 0 })

const stubs = {
  CrmFilterBar: { props: ['modelValue', 'crmId', 'fields', 'views'], template: '<div data-test="filterbar" />' },
  ValueDisplay: { props: ['value', 'attribute', 'names', 'compact'], template: '<span />' },
  RecordEditor: { props: ['crmId', 'title', 'attributes', 'saving'], template: '<div />' },
}

function make(props: Record<string, unknown> = {}) {
  return mount(RecordsView, {
    props: { crmId: 'crm-1', object, objects: [object], attributes, pipelines: [], views: [], ...props },
    global: { stubs },
  })
}

describe('CRM records toolbar', () => {
  beforeEach(() => {
    listRecords.mockReset(); countRecords.mockReset(); getBoard.mockReset(); getTimeline.mockReset(); recordsByIds.mockReset(); readListViews.mockReset(); writeListViews.mockReset(); applyCommands.mockReset()
    listRecords.mockResolvedValue(page(rows))
    countRecords.mockResolvedValue(3)
    getBoard.mockResolvedValue({})
    getTimeline.mockResolvedValue([])
    recordsByIds.mockResolvedValue([])
    readListViews.mockResolvedValue({})
    writeListViews.mockResolvedValue(undefined)
    applyCommands.mockResolvedValue(undefined)
  })

  it('composes search, Views/Filter, view-mode toggle, and New into one toolbar row', async () => {
    const wrapper = make()
    await flushPromises()
    const actions = wrapper.get('.crm-page-actions')
    expect(actions.find('.crm-search').exists()).toBe(true)
    expect(actions.find('[data-test="filterbar"]').exists()).toBe(true)
    expect(actions.find('.crm-segment').exists()).toBe(true)
    expect(actions.findAll('button').some((node) => node.text().includes('New'))).toBe(true)
  })

  it('keeps the record count out of the header title and inside the toolbar', async () => {
    const wrapper = make()
    await flushPromises()
    expect(wrapper.find('.crm-page-title p').exists()).toBe(false)
    const count = wrapper.get('.crm-page-actions .crm-count')
    expect(count.text()).toContain('3')
  })

  it('sends the paginated query and reports an honest range and total', async () => {
    const wrapper = make()
    await flushPromises()
    expect(listRecords).toHaveBeenCalledWith('crm-1', 'person', { filters: [], sort: { attr: 'name', dir: 'asc' }, search: '', limit: 50, offset: 0 })
    expect(wrapper.get('.crm-gridfoot .crm-mono').text()).toContain('1–3 of 3')
  })

  it('encodes an opaque provider id when a table row opens', async () => {
    listRecords.mockResolvedValue(page([
      { record_id: 'contacts/524190630611', object_type: 'person', values: { name: 'Zion Example' } },
    ]))
    const wrapper = make()
    await flushPromises()
    await wrapper.get('.crm-row-link').trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['person/r~Y29udGFjdHMvNTI0MTkwNjMwNjEx'])
  })

  it('updates the count to the filtered subset while the total stays visible', async () => {
    const wrapper = make()
    await flushPromises()
    listRecords.mockResolvedValueOnce(page([rows[0]], 1))
    await wrapper.get('.crm-search input').setValue('ann')
    await new Promise((resolve) => setTimeout(resolve, 275))
    await flushPromises()
    expect(listRecords).toHaveBeenLastCalledWith('crm-1', 'person', { filters: [], sort: { attr: 'name', dir: 'asc' }, search: 'ann', limit: 50, offset: 0 })
    expect(wrapper.get('.crm-count').text()).toContain('1 of 3')
  })

  it('loads the next page and appends without refetching the first', async () => {
    listRecords.mockReset()
    listRecords.mockResolvedValue(page(rows.slice(0, 2), 3))
    const wrapper = mount(RecordsView, { props: { crmId: 'crm-1', object, objects: [object], attributes, pipelines: [], views: [] }, global: { stubs } })
    await flushPromises()
    listRecords.mockResolvedValueOnce(page([rows[2]], 3))
    await wrapper.get('.crm-gridfoot button').trigger('click')
    await flushPromises()
    expect(listRecords).toHaveBeenLastCalledWith('crm-1', 'person', { filters: [], sort: { attr: 'name', dir: 'asc' }, search: '', limit: 50, offset: 50 })
    expect(wrapper.get('.crm-gridfoot .crm-mono').text()).toContain('1–3 of 3')
    wrapper.unmount()
  })

  it('maps a typed scope token to a real filter and keeps the rest as full text', async () => {
    const wrapper = make()
    await flushPromises()
    await wrapper.get('.crm-search input').setValue('company:acme landed')
    await new Promise((resolve) => setTimeout(resolve, 275))
    await flushPromises()
    expect(listRecords).toHaveBeenLastCalledWith('crm-1', 'person', expect.objectContaining({
      filters: [{ attr: 'company', op: 'eq', value: 'acme' }], search: 'landed',
    }))
    expect(wrapper.find('.crm-command-scoped').exists()).toBe(true)
  })

  it('renders saved views as tabs plus an All reset and applies the picked view', async () => {
    const view = { view_id: 'person_warm', object_type: 'person', name: 'Warm leads', layout: 'table', spec: { filters: [{ attr: 'company', op: 'contains', value: 'x' }] } }
    const wrapper = mount(RecordsView, { props: { crmId: 'crm-1', object, objects: [object], attributes, pipelines: [], views: [view] }, global: { stubs } })
    await flushPromises()
    const tabs = wrapper.findAll('.crm-vtab').map((node) => node.text())
    expect(tabs.some((text) => text.includes('All'))).toBe(true)
    expect(tabs.some((text) => text.includes('Warm leads'))).toBe(true)
    listRecords.mockClear()
    await wrapper.findAll('.crm-vtab').find((node) => node.text().includes('Warm leads'))!.trigger('click')
    await flushPromises()
    expect(listRecords).toHaveBeenCalledWith('crm-1', 'person', expect.objectContaining({ filters: [{ attr: 'company', op: 'contains', value: 'x' }] }))
    wrapper.unmount()
  })

  it('renders pipeline membership from the canonical board query', async () => {
    const pipeline = { collection_id: 'sales', object_type: 'person', label: 'Sales', stages: [{ stage_id: 'lead', label: 'Lead' }, { stage_id: 'won', label: 'Won' }] }
    getBoard.mockResolvedValue({ lead: { records: [{ record_id: 'p1', position: 1 }], total: 1 }, won: { records: [], total: 0 } })
    recordsByIds.mockResolvedValue([rows[0]])
    const wrapper = mount(RecordsView, { props: { crmId: 'crm-1', object, objects: [object], attributes, pipelines: [pipeline], views: [] }, global: { stubs } })
    await flushPromises()
    await wrapper.find('button[aria-label="Board view"]').trigger('click')
    await flushPromises()
    expect(getBoard).toHaveBeenCalledWith('crm-1', 'sales', { limit: 30, offset: 0 })
    expect(recordsByIds).toHaveBeenCalledWith('crm-1', ['p1'])
    expect(wrapper.get('.crm-board-card').text()).toContain('Ann Example')
    expect(wrapper.find('.crm-search').exists()).toBe(false)
    await wrapper.findAll('.crm-board-column')[1]!.trigger('drop', { dataTransfer: { getData: () => 'p1' } })
    await flushPromises()
    expect(applyCommands).toHaveBeenCalledWith('crm-1', [{
      type: 'kickside.crm.events:membership.set',
      body: { collection_id: 'sales', record_id: 'p1', stage_id: 'won', position: 1, from_stage_id: 'lead' },
    }])
    wrapper.unmount()
  })

  it('refetches only its own query in place when the read model advances', async () => {
    const wrapper = mount(RecordsView, { props: { crmId: 'crm-1', object, objects: [object], attributes, pipelines: [], views: [], revision: 0 }, global: { stubs } })
    await flushPromises()
    expect(listRecords).toHaveBeenCalledTimes(1)

    const refreshed = [...rows, { record_id: 'p4', object_type: 'person', values: { name: 'New Arrival' } }]
    listRecords.mockResolvedValue(page(refreshed))
    await wrapper.setProps({ revision: 1 })
    await flushPromises()

    // The rows update without the view collapsing into its loading state.
    expect(wrapper.find('.crm-state').exists()).toBe(false)
    expect(wrapper.text()).toContain('New Arrival')
    expect(listRecords).toHaveBeenCalledTimes(2)
    expect(listRecords).toHaveBeenLastCalledWith('crm-1', 'person', expect.objectContaining({ offset: 0 }))
    wrapper.unmount()
  })

  it('re-reads a background refresh to the depth the reader has already paged to', async () => {
    const deep = Array.from({ length: 120 }, (_, index) => ({ record_id: `p${index}`, object_type: 'person', values: { name: `Person ${index}` } }))
    listRecords.mockResolvedValue(page(deep.slice(0, 50), 120))
    const wrapper = mount(RecordsView, { props: { crmId: 'crm-1', object, objects: [object], attributes, pipelines: [], views: [], revision: 0 }, global: { stubs } })
    await flushPromises()
    listRecords.mockResolvedValue(page(deep.slice(50, 100), 120))
    await wrapper.findAll('button').find((node) => node.text().includes('more'))!.trigger('click')
    await flushPromises()

    listRecords.mockResolvedValue(page(deep.slice(0, 100), 120))
    await wrapper.setProps({ revision: 1 })
    await flushPromises()

    expect(listRecords).toHaveBeenLastCalledWith('crm-1', 'person', expect.objectContaining({ limit: 100, offset: 0 }))
    expect(wrapper.text()).toContain('Person 99')
    wrapper.unmount()
  })

  it('keeps the rows the reader has when a background refresh fails', async () => {
    const wrapper = mount(RecordsView, { props: { crmId: 'crm-1', object, objects: [object], attributes, pipelines: [], views: [], revision: 0 }, global: { stubs } })
    await flushPromises()
    listRecords.mockRejectedValue(new Error('CRM query failed.'))
    await wrapper.setProps({ revision: 1 })
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Ann Example')
    wrapper.unmount()
  })

  it('hides record mutation while retaining private saved views on a read-only workspace', async () => {
    const wrapper = mount(RecordsView, { props: { crmId: 'crm-1', object, objects: [object], attributes, pipelines: [], views: [], canWrite: false }, global: { stubs } })
    await flushPromises()
    expect(wrapper.findAll('button').some((node) => node.text().includes('New'))).toBe(false)
    expect(wrapper.find('.crm-vtab-save').exists()).toBe(true)
    wrapper.unmount()
  })

})

// A deployment says how its object reads by declaring a view. The columns of
// that view already lead the page; its sort has to reach the query too, or a
// list a seller wants newest-first opens alphabetical.
describe('the declared view leads the first read', () => {
  beforeEach(() => {
    listRecords.mockReset(); countRecords.mockReset(); getBoard.mockReset(); getTimeline.mockReset(); recordsByIds.mockReset(); readListViews.mockReset(); writeListViews.mockReset(); applyCommands.mockReset()
    listRecords.mockResolvedValue(page(rows))
    countRecords.mockResolvedValue(3)
    getBoard.mockResolvedValue({})
    getTimeline.mockResolvedValue([])
    recordsByIds.mockResolvedValue([])
    readListViews.mockResolvedValue({})
    writeListViews.mockResolvedValue(undefined)
    applyCommands.mockResolvedValue(undefined)
  })

  const declared = [{
    view_id: 'person_table', object_type: 'person', name: 'People', layout: 'table' as const,
    spec: { columns: ['name', 'company'], sort: { attr: 'updated_at', dir: 'desc' as const } },
  }]

  it('sorts by what the schema declares when the reader has chosen nothing', async () => {
    const wrapper = make({ views: declared })
    await flushPromises()
    expect(listRecords).toHaveBeenCalledWith('crm-1', 'person', { filters: [], sort: { attr: 'updated_at', dir: 'desc' }, search: '', limit: 50, offset: 0 })
    wrapper.unmount()
  })

  it("keeps the reader's own saved sort above the declared one", async () => {
    readListViews.mockResolvedValue({ 'crm-1': { person: { sort: { attr: 'name', dir: 'asc' } } } })
    const wrapper = make({ views: declared })
    await flushPromises()
    expect(listRecords).toHaveBeenCalledWith('crm-1', 'person', { filters: [], sort: { attr: 'name', dir: 'asc' }, search: '', limit: 50, offset: 0 })
    wrapper.unmount()
  })

  it('falls back to the record name when the declared sort names no column this object has', async () => {
    const wrapper = make({ views: [{ ...declared[0], spec: { columns: ['name'], sort: { attr: 'nonexistent', dir: 'desc' as const } } }] })
    await flushPromises()
    expect(listRecords).toHaveBeenCalledWith('crm-1', 'person', { filters: [], sort: { attr: 'name', dir: 'asc' }, search: '', limit: 50, offset: 0 })
    wrapper.unmount()
  })
})
