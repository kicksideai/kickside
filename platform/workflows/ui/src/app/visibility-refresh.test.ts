// @vitest-environment happy-dom
import { config, flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

config.global.plugins.push(ConfirmationService, ToastService)

const host = vi.hoisted(() => ({
  refreshes: [] as Array<() => Promise<unknown> | unknown>,
  visible: false,
  async reveal() {
    if (this.visible) return
    this.visible = true
    await Promise.all(this.refreshes.map((refresh) => refresh()))
  },
}))

const api = vi.hoisted(() => ({
  listWorkflows: vi.fn(),
  getState: vi.fn(),
  listWorkflowVersions: vi.fn(),
}))

const canvas = vi.hoisted(() => ({
  loadCatalog: vi.fn(),
  initialized: vi.fn(),
}))

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useHostVisibilityRefresh: (refresh: () => Promise<unknown> | unknown) => {
    host.refreshes.push(refresh)
    void refresh()
  },
  useProps: () => ({ value: {} }),
}))

vi.mock('./api/api', () => ({
  listWorkflows: api.listWorkflows,
  applyCommands: vi.fn(),
  createWorkflow: vi.fn(),
  deleteWorkflow: vi.fn(),
  exportWorkflow: vi.fn(),
  getState: api.getState,
  humanError: (error: unknown) => String(error),
  listWorkflowVersions: api.listWorkflowVersions,
  publishWorkflow: vi.fn(),
  PublishError: class PublishError extends Error {},
  redo: vi.fn(),
  setWorkflowLabels: vi.fn(),
  undo: vi.fn(),
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<i />' } }))
vi.mock('./share', () => ({ mountWorkflowShare: vi.fn() }))
vi.mock('./catalog/catalog', () => ({ loadCatalog: canvas.loadCatalog }))
vi.mock('@wippy-fe/proxy', () => ({
  on: vi.fn(() => () => {}),
  api: { get: vi.fn(async () => ({ data: { success: true, user: { id: 'editor-fixture' } } })) },
}))
vi.mock('@vue-flow/core', () => ({
  VueFlow: { template: '<div><slot /></div>' },
  useVueFlow: () => ({
    fitView: vi.fn(), screenToFlowCoordinate: vi.fn(), getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
    onNodesInitialized: canvas.initialized, findNode: () => null,
  }),
}))
vi.mock('@vue-flow/background', () => ({ Background: { template: '<div />' } }))
vi.mock('@vue-flow/controls', () => ({ Controls: { template: '<div />' } }))
vi.mock('@vue-flow/minimap', () => ({ MiniMap: { template: '<div />' } }))
vi.mock('./list/WorkflowListHeader.vue', () => ({
  default: {
    props: ['q'],
    emits: ['update:q'],
    template: '<input data-test="workflow-search" :value="q" @input="$emit(\'update:q\', $event.target.value)" />',
  },
}))
vi.mock('./list/WorkflowTable.vue', () => ({ default: { template: '<div />' } }))
vi.mock('./list/ImportModal.vue', () => ({ default: { template: '<div />' } }))

const WorkflowList = (await import('./list/WorkflowList.vue')).default
const WorkflowCanvas = (await import('./canvas/WorkflowCanvas.vue')).default

describe('WorkflowList retained-surface refresh', () => {
  beforeEach(() => {
    host.refreshes.length = 0
    host.visible = false
    api.listWorkflows.mockReset()
    api.listWorkflows.mockResolvedValue([{ id: 'wf-1', title: 'Initial workflow', labels: [] }])
  })

  it('reloads on false-to-true reveal while keeping the mounted list and search state', async () => {
    const wrapper = mount(WorkflowList, {
      global: {
        stubs: { Dialog: true, Button: true, InputText: true, Message: true, ProgressSpinner: true },
      },
    })
    const root = wrapper.element
    await flushPromises()
    expect(api.listWorkflows).toHaveBeenCalledTimes(1)

    await wrapper.get('[data-test="workflow-search"]').setValue('initial')
    api.listWorkflows.mockResolvedValue([{ id: 'wf-1', title: 'Fresh workflow', labels: [] }])
    await host.reveal()
    await flushPromises()

    expect(api.listWorkflows).toHaveBeenCalledTimes(2)
    expect(wrapper.element).toBe(root)
    expect(wrapper.get('[data-test="workflow-search"]').element).toHaveProperty('value', 'initial')
    wrapper.unmount()
  })
})

describe('WorkflowCanvas retained-surface refresh', () => {
  beforeEach(() => {
    host.refreshes.length = 0
    host.visible = false
    canvas.loadCatalog.mockReset()
    canvas.initialized.mockReset()
    api.getState.mockReset()
    api.listWorkflowVersions.mockReset()
    canvas.loadCatalog.mockResolvedValue({ items: [], errors: [] })
    api.getState.mockResolvedValue({ nodes: {}, edges: {}, notes: {}, events: [] })
    api.listWorkflowVersions.mockResolvedValue([{ version: 3 }])
  })

  it('keeps the compact step palette open when the initial graph is measured', async () => {
    vi.stubGlobal('ResizeObserver', class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) { this.callback([{contentRect: {width: 980}} as ResizeObserverEntry], this as unknown as ResizeObserver) }
      disconnect() {}
      unobserve() {}
    })
    try {
      const wrapper = mount(WorkflowCanvas, {
        props: {workflowId: 'initial-fit'}, shallow: true,
        global: {stubs: {WorkflowCanvasView: {name: 'WorkflowCanvasView', props: ['model'], template: '<div :ref="el => { model.rootEl = el }" />'}}},
      })
      await flushPromises()
      const model = wrapper.findComponent({name: 'WorkflowCanvasView'}).props('model') as {paletteOpen: boolean}
      expect(model.paletteOpen).toBe(true)
      canvas.initialized.mock.calls.at(-1)![0]()
      await flushPromises()
      expect(model.paletteOpen).toBe(true)
      wrapper.unmount()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('reloads catalog, state, and published version on reveal without remounting the canvas', async () => {
    const wrapper = mount(WorkflowCanvas, {
      props: { workflowId: 'wf-1' },
      shallow: true,
      global: { stubs: { Button: true, Drawer: true, Message: true, ProgressSpinner: true, Tag: true, Toast: true, ConfirmDialog: true } },
    })
    const root = wrapper.element
    await flushPromises()
    expect(canvas.loadCatalog).toHaveBeenCalledTimes(1)
    expect(api.getState).toHaveBeenCalledWith('wf-1')
    expect(api.listWorkflowVersions).toHaveBeenCalledWith('wf-1')

    await host.reveal()
    await flushPromises()
    expect(canvas.loadCatalog).toHaveBeenCalledTimes(2)
    expect(api.getState).toHaveBeenCalledTimes(2)
    expect(api.listWorkflowVersions).toHaveBeenCalledTimes(2)
    expect(wrapper.element).toBe(root)
    wrapper.unmount()
  })
})
