// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils'
import { h, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { PROPS_PROVIDER } from '@wippy-fe/webcomponent-vue'

const flow = vi.hoisted(() => ({ fit: vi.fn(), initialized: vi.fn(), subscribe: vi.fn(() => () => {}), get: vi.fn() }))
flow.get.mockResolvedValue({ data: { success: true, graph: { thread_id: 'fictional-thread', nodes: [{ id: 'n1', name: 'Bookings', type: 'note' }], edges: [], materials: [], schema: {}, layout: {}, settings: {} } } })
const post = vi.fn()
vi.mock('@iconify/vue', () => ({ Icon: { setup: () => () => h('i') } }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: (...args: unknown[]) => flow.get(...args), post: (...args: unknown[]) => post(...args) }, on: (...args: unknown[]) => flow.subscribe(...(args as [])) }))
vi.mock('@vue-flow/core', () => ({
  VueFlow: { name: 'VueFlow', setup: () => () => h('div') },
  Handle: { setup: () => () => h('div') }, Position: {}, MarkerType: {},
  useVueFlow: () => ({ fitView: flow.fit, viewport: ref({ x: 0, y: 0, zoom: 1 }), getNodes: ref([]), setCenter: vi.fn(), screenToFlowCoordinate: (p: unknown) => p, getSelectedNodes: ref([]), getSelectedEdges: ref([]), onNodesInitialized: flow.initialized }),
}))
vi.mock('@vue-flow/background', () => ({ Background: { setup: () => () => h('div') } }))
vi.mock('@vue-flow/controls', () => ({ Controls: { setup: () => () => h('div') } }))
vi.mock('@vue-flow/minimap', () => ({ MiniMap: { setup: () => () => h('div') } }))
const { default: GraphApp } = await import('./GraphApp.vue')

describe('shared graph reading', () => {
  it('keeps inspection and fitting while hiding all write controls and keyboard mutations', async () => {
    const view = mount(GraphApp, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'graph1', mode: 'full', readOnly: true }) } } })
    await flushPromises()
    expect(view.find('.kg-tree-row').exists()).toBe(true)
    expect(view.find('button[aria-label="Undo"]').exists()).toBe(false)
    expect(view.find('button[aria-label="Auto layout"]').exists()).toBe(false)
    expect(view.find('button[aria-label="Add graph material"]').exists()).toBe(false)
    await view.get('.kg').trigger('keydown', { key: 'v', ctrlKey: true })
    expect(post).not.toHaveBeenCalled()
    view.unmount()
  })
})

describe('measured graph fitting', () => {
  it('fits the initial graph after nodes finish measuring', async () => {
    flow.fit.mockClear()
    flow.initialized.mockClear()
    const view = mount(GraphApp, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'graph1', mode: 'full' }) } } })
    await flushPromises()
    expect(flow.initialized).toHaveBeenCalled()
    expect(flow.fit).not.toHaveBeenCalled()
    flow.initialized.mock.calls[0][0]()
    await flushPromises()
    expect(flow.fit).toHaveBeenCalledTimes(1)
    view.unmount()
  })
  it('shows a recoverable fit failure', async () => {
    flow.fit.mockRejectedValueOnce(new Error('Canvas is unavailable.'))
    const view = mount(GraphApp, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'graph1', mode: 'full' }) } } })
    await flushPromises()
    await view.get('button[aria-label="Fit view"]').trigger('click')
    await flushPromises()
    expect(view.get('.kg-error').text()).toContain('Canvas is unavailable.')
    view.unmount()
  })
})

describe('narrow graph canvas', () => {
  it('keeps the initial canvas clear and opens one reading panel at a time', async () => {
    let resized: ResizeObserverCallback | undefined
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) { resized = callback }
      observe() {}
      disconnect() {}
    })
    const view = mount(GraphApp, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'graph1', mode: 'full' }) } } })
    await flushPromises()
    expect(resized).toBeDefined()
    resized!([{ contentRect: { width: 676 } } as ResizeObserverEntry], {} as ResizeObserver)
    await flushPromises()
    expect(view.find('.kg-tree').exists()).toBe(false)
    expect(view.find('.kg-panel').exists()).toBe(false)
    await view.get('button[aria-label="Show structure"]').trigger('click')
    await view.get('.kg-tree-row').trigger('click')
    await flushPromises()
    expect(view.find('.kg-tree').exists()).toBe(false)
    expect(view.find('.kg-panel').exists()).toBe(true)
    view.unmount()
    vi.unstubAllGlobals()
  })
})

it('reports unavailable graph live updates while retaining the graph', async () => {
  flow.subscribe.mockImplementationOnce(() => { throw new Error('Subscription unavailable') })
  const view = mount(GraphApp, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'graph1', mode: 'full' }) } } })
  await flushPromises()
  expect(view.get('.kg-error').text()).toContain('Live updates are unavailable.')
  expect(view.find('.kg-tree-row').exists()).toBe(true)
  view.unmount()
})

it('reports graph live-update cleanup failures', async () => {
  const captured = vi.fn()
  flow.subscribe.mockReturnValueOnce(() => { throw new Error('Dispose failed') })
  const view = mount(GraphApp, { global: { config: { errorHandler: captured }, provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'graph1', mode: 'full' }) } } })
  await flushPromises()
  view.unmount()
  expect(captured).toHaveBeenCalledWith(expect.objectContaining({ message: 'Couldn’t close live updates.' }), expect.anything(), 'beforeUnmount hook')
})

it('keeps a failed graph load separate from a true empty graph', async () => {
  flow.get.mockRejectedValueOnce(new Error('Graph is unavailable.'))
  const view = mount(GraphApp, { global: { provide: { [PROPS_PROVIDER as symbol]: ref({ entryId: 'graph1', mode: 'full' }) } } })
  await flushPromises()
  expect(view.get('.kg-error').text()).toContain('Graph is unavailable.')
  expect(view.text()).not.toContain('Empty graph')
  expect(view.text()).not.toContain('Add a node')
  expect(view.find('.kg-sel').exists()).toBe(false)
  view.unmount()
})
