// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'

// The workspace preview panel mounts every renderer with mode="preview" and a
// narrow width. The builder must answer with the frozen graph — the same
// projection and node renderers as the canvas, with every editing affordance
// off — never the editor with its palette and inspector.

const propsRef = ref<Record<string, unknown>>({ route: '/wf-1', mode: 'preview' })
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => propsRef, useEvents: () => vi.fn(), useHostVisibilityRefresh: () => {} }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn(), post: vi.fn() }, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], template: '<i class="ic" :data-icon="icon" />' } }))
vi.mock('@vue-flow/core', () => ({
  VueFlow: defineComponent({
    name: 'VueFlow',
    props: ['nodes', 'edges', 'nodesDraggable', 'nodesConnectable', 'elementsSelectable', 'edgesUpdatable'],
    template: '<div class="vf-stub" :data-nodes="(nodes || []).length" :data-draggable="String(nodesDraggable)" :data-connectable="String(nodesConnectable)" :data-selectable="String(elementsSelectable)"><slot /></div>',
  }),
  useVueFlow: () => ({ fitView: vi.fn(), onNodesInitialized: vi.fn() }),
  MarkerType: { ArrowClosed: 'arrowclosed' },
  Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' },
  Handle: defineComponent({ name: 'Handle', template: '<span />' }),
}))
vi.mock('@vue-flow/background', () => ({ Background: defineComponent({ name: 'Background', template: '<span />' }) }))
vi.mock('./api/defs', () => ({
  getState: vi.fn(async () => ({
    workflow_id: 'wf-1',
    head_seq: 3,
    nodes: [
      { id: 'a', kind: 'start', title: 'Start' },
      { id: 'b', kind: 'finish', title: 'Finish' },
    ],
    edges: [{ id: 'e1', source_id: 'a', target_id: 'b' }],
    notes: [],
    layout: {},
    params: {},
  })),
}))

const WorkflowBuilder = (await import('./WorkflowBuilder.vue')).default

describe('workspace preview contract', () => {
  it('renders the frozen graph in preview mode, never the editor', async () => {
    propsRef.value = { route: '/wf-1', mode: 'preview' }
    const wrapper = mount(WorkflowBuilder)
    await flushPromises()
    expect(wrapper.find('.wfp').exists()).toBe(true)
    const flow = wrapper.find('.vf-stub')
    expect(flow.exists()).toBe(true)
    expect(Number(flow.attributes('data-nodes'))).toBeGreaterThan(0)
    expect(flow.attributes('data-draggable')).toBe('false')
    expect(flow.attributes('data-connectable')).toBe('false')
    expect(flow.attributes('data-selectable')).toBe('false')
    expect(wrapper.find('.wf-canvas-root').exists()).toBe(false)
    expect(wrapper.find('.wf-inspector-drawer').exists()).toBe(false)
  })

  it('keeps the list surface when no workflow is routed', async () => {
    propsRef.value = { route: '', mode: 'preview' }
    const wrapper = mount(WorkflowBuilder)
    await flushPromises()
    expect(wrapper.find('.wfp').exists()).toBe(false)
  })
})
