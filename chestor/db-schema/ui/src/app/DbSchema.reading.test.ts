// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils'
import { h, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PROPS_PROVIDER } from '@wippy-fe/webcomponent-vue'
const flow = vi.hoisted(() => ({ fit: vi.fn(), subscribe: vi.fn(() => () => {}), coordinate: vi.fn((p: unknown) => p) }))
const post = vi.fn()
const get = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get: (...args: unknown[]) => get(...args), post: (...args: unknown[]) => post(...args) }, on: (...args: unknown[]) => flow.subscribe(...(args as [])) }))
vi.mock('@vue-flow/core', () => ({ VueFlow: { name: 'VueFlow', setup: () => () => h('div') }, Handle: { setup: () => () => h('div') }, Position: {}, MarkerType: {}, useVueFlow: () => ({ fitView: flow.fit, onNodesInitialized: vi.fn(), screenToFlowCoordinate: flow.coordinate }) }))
vi.mock('@vue-flow/background', () => ({ Background: { setup: () => () => h('div') } }))
vi.mock('@vue-flow/controls', () => ({ Controls: { setup: () => () => h('div') } }))
vi.mock('@vue-flow/minimap', () => ({ MiniMap: { setup: () => () => h('div') } }))
const { default: DbSchema } = await import('./DbSchema.vue')
describe('shared schema reading', () => {
  beforeEach(() => { get.mockResolvedValue({ data: { success: true, schema: { tables: [], relations: [] } } }); post.mockReset() })
  it('shows a reading empty state and keeps Fit and Export without write actions', async () => {
    const view = mount(DbSchema, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'schema1', mode: 'full', readOnly: true }) } } })
    await flushPromises()
    expect(view.text()).toContain('Fit')
    expect(view.text()).toContain('Export')
    expect(view.text()).not.toContain('+ Table')
    expect(view.text()).not.toContain('Arrange')
    expect(view.text()).not.toContain('add one')
    await view.get('.de').trigger('keydown', { key: 'n' })
    expect(post).not.toHaveBeenCalled()
    view.unmount()
  })
})

describe('schema load failures', () => {
  it('shows the server message for a transport failure', async () => {
    get.mockRejectedValue(Object.assign(new Error('Request failed with status code 503'), { response: { data: { error: 'Northwind data is temporarily unavailable.' } } }))
    const view = mount(DbSchema, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'schema1', mode: 'full' }) } } })
    await flushPromises()
    expect(view.get('.de-error').text()).toContain('Northwind data is temporarily unavailable.')
    expect(view.text()).not.toContain('status code')
    view.unmount()
  })
  it('shows an explicit failed response instead of presenting an empty schema', async () => {
    get.mockResolvedValue({ data: { success: false, error: 'This schema is unavailable.' } })
    const view = mount(DbSchema, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'schema1', mode: 'full' }) } } })
    await flushPromises()
    expect(view.get('.de-error').text()).toContain('This schema is unavailable.')
    view.unmount()
  })
})

describe('shared table inspection', () => {
  it('reads table descriptions and complete column names without edit actions', async () => {
    const table = { id: 'table1', name: 'Northwind bookings', description: 'Booking records', columns: [{ id: 'column1', name: 'customer_booking_confirmation', col_type: 'TEXT' }] }
    get.mockResolvedValue({ data: { success: true, schema: { tables: [table], relations: [] } } })
    const view = mount(DbSchema, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'schema1', mode: 'full', readOnly: true }) } } })
    await flushPromises()
    view.getComponent({ name: 'VueFlow' }).vm.$emit('node-click', { node: { id: 'table1' } })
    await view.vm.$nextTick()
    expect(view.get('.de-panel').text()).toContain('customer_booking_confirmation')
    expect(view.get('.de-panel').text()).toContain('Booking records')
    expect(view.get('.de-panel').find('input').exists()).toBe(false)
    view.unmount()
  })
})

it('reports a failed schema fit', async () => {
  get.mockResolvedValue({ data: { success: true, schema: { tables: [], relations: [] } } })
  flow.fit.mockRejectedValueOnce(new Error('Canvas is unavailable.'))
  const view = mount(DbSchema, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'schema1', mode: 'full' }) } } })
  await flushPromises()
  await view.findAll('button').find(b => b.text() === 'Fit')!.trigger('click')
  await flushPromises()
  expect(view.get('.de-error').text()).toContain('Canvas is unavailable.')
  view.unmount()
})

it('refuses table creation when canvas placement fails', async () => {
  post.mockReset()
  get.mockResolvedValue({ data: { success: true, schema: { tables: [], relations: [] } } })
  flow.coordinate.mockImplementationOnce(() => { throw new Error('Canvas placement is unavailable.') })
  const view = mount(DbSchema, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'schema1', mode: 'full' }) } } })
  await flushPromises()
  view.getComponent({ name: 'VueFlow' }).vm.$emit('pane-context-menu', new MouseEvent('contextmenu', { clientX: 20, clientY: 20 }))
  await flushPromises()
  await view.get('.de-ctx-item').trigger('click')
  await flushPromises()
  expect(post).not.toHaveBeenCalled()
  expect(view.get('.de-error').text()).toContain('Canvas placement is unavailable.')
  view.unmount()
})
it('reports unavailable schema live updates', async () => {
  get.mockResolvedValue({ data: { success: true, schema: { thread_id: 'fictional-thread', tables: [], relations: [] } } })
  flow.subscribe.mockImplementationOnce(() => { throw new Error('Subscription unavailable') })
  const view = mount(DbSchema, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'schema1', mode: 'full' }) } } })
  await flushPromises()
  expect(view.get('.de-error').text()).toContain('Live updates are unavailable.')
  view.unmount()
})

it('closes every schema subscription and reports disposal failures', async () => {
  const captured = vi.fn(), second = vi.fn()
  get.mockResolvedValue({ data: { success: true, schema: { thread_id: 'fictional-thread', tables: [], relations: [] } } })
  flow.subscribe.mockReturnValueOnce(() => { throw new Error('Dispose failed') }).mockReturnValueOnce(second)
  const view = mount(DbSchema, { global: { config: { errorHandler: captured }, provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'schema1', mode: 'full' }) } } })
  await flushPromises()
  view.unmount()
  expect(second).toHaveBeenCalled()
  expect(captured).toHaveBeenCalledWith(expect.objectContaining({ message: 'Couldn’t close live updates.' }), expect.anything(), 'beforeUnmount hook')
})

it('clears a schema load failure after successful retry', async () => {
  get.mockRejectedValueOnce(new Error('Schema is unavailable.'))
  const view = mount(DbSchema, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'schema1', mode: 'full' }) } } })
  await flushPromises()
  expect(view.find('.de-error').exists()).toBe(true)
  get.mockResolvedValue({ data: { success: true, schema: { tables: [], relations: [] } } })
  await view.findAll('button').find(b => b.text() === 'Retry')!.trigger('click')
  await flushPromises()
  expect(view.find('.de-error').exists()).toBe(false)
  view.unmount()
})
