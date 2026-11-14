// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { WfNode } from '../types'

vi.mock('@wippy-fe/proxy', () => ({
  api: { get: vi.fn(async () => ({ data: {} })), post: vi.fn(async () => ({ data: {} })) },
  loadByTagName: vi.fn(async () => {}),
}))
vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', props: ['icon'], template: '<i />' } }))
vi.mock('@widgets/app/WcMount.vue', () => ({ default: { name: 'WcMount', props: ['tag', 'config', 'schema', 'attrs'], template: '<div />' } }))

const NodeConfigPanel = (await import('./NodeConfigPanel.vue')).default
const { registerBlocks } = await import('../domain/node-policy')

const BoundarySchemaEditorStub = {
  name: 'SchemaEditor',
  props: ['label', 'surface', 'modelValue', 'mode', 'resetKey'],
  emits: ['change'],
  template: '<button class="schema-editor-stub" :data-surface="surface" @click="$emit(\'change\', { type: \'object\', properties: { extra: { type: \'string\' } } })"></button>',
}

describe('NodeConfigPanel — canonical Flow authoring', () => {
  it('supplies the Research agent picker value and stores its canonical agent_id', async () => {
    registerBlocks([{
      id: 'kickside.research:research', label: 'Research', config_schema: {
        type: 'object', required: ['agent_id', 'prompt'], properties: {
          agent_id: { type: 'string', picker: 'wc-agent-picker' }, prompt: { type: 'string' },
        },
      },
    }])
    const node = { id: 'research', kind: 'block', title: 'Research', ref: 'kickside.research:research', config: { prompt: 'NW-BLOCK-RESEARCH' } } as WfNode
    const wrapper = mount(NodeConfigPanel, {
      props: { workflowId: 'wf-1', node, edge: null, note: null, catalog: [] },
      global: { stubs: { SchemaEditor: true, FlowPicker: true, ConfigAssist: true } },
    })
    const picker = wrapper.findAllComponents({ name: 'WcMount' })[0]
    expect(picker.props('attrs')?.value).toEqual(node.config)
    picker.vm.$emit('change', { agent_id: 'user_agent:northwind-analyst', selected: ['user_agent:northwind-analyst'], labels: ['Northwind Analyst'] })
    expect(wrapper.emitted('update-node')!.at(-1)![0]).toEqual({ config: {
      prompt: 'NW-BLOCK-RESEARCH', agent_id: 'user_agent:northwind-analyst',
    } })
  })

  it('keeps the boundary contract editable', async () => {
    const node = { id: 'start-1', kind: 'start', title: 'Start', config: {} } as WfNode
    const wrapper = mount(NodeConfigPanel, {
      props: { workflowId: 'wf-1', node, edge: null, note: null, catalog: [] },
      global: { stubs: { SchemaEditor: BoundarySchemaEditorStub, FlowPicker: true } },
    })
    await wrapper.find('.schema-editor-stub[data-surface="workflow.boundary.start"]').trigger('click')
    const patch = wrapper.emitted('update-node')![0][0] as { config: Record<string, unknown> }
    expect(patch.config.input_schema).toEqual({ type: 'object', properties: { extra: { type: 'string' } } })
  })

  it('stores an exact nested Flow reference selected by the Flow picker', async () => {
    const node = { id: 'child', kind: 'flow', title: 'Flow', config: {} } as WfNode
    const FlowPickerStub = {
      name: 'FlowPicker',
      emits: ['select'],
      template: '<button class="pick-flow" @click="$emit(\'select\', { id: \'wf-child\', title: \'Child\', published_version: 7 })"></button>',
    }
    const wrapper = mount(NodeConfigPanel, {
      props: { workflowId: 'wf-parent', node, edge: null, note: null, catalog: [] },
      global: { stubs: { SchemaEditor: true, FlowPicker: FlowPickerStub } },
    })
    await wrapper.find('.pick-flow').trigger('click')
    const patch = wrapper.emitted('update-node')![0][0] as Partial<WfNode>
    expect(patch.kind).toBeUndefined()
    expect(patch.config).toEqual({ flow_ref: { kind: 'flow', id: 'wf-child', version: 7 } })
  })

  it('explains tool configuration as optional fixed input overrides', () => {
    registerBlocks([{
      id: 'keeper.files:count_files',
      label: 'Count Files',
      source_kind: 'tool',
      tool: true,
      config_schema: {
        type: 'object',
        properties: { path: { type: 'string', title: 'Path' } },
      },
    }])
    const node = {
      id: 'count', kind: 'block', ref: 'keeper.files:count_files', title: 'Count Files', config: {},
    } as WfNode
    const wrapper = mount(NodeConfigPanel, {
      props: { workflowId: 'wf-1', node, edge: null, note: null, catalog: [] },
      global: { stubs: { SchemaEditor: true, FlowPicker: true, ConfigAssist: true } },
    })

    expect(wrapper.text()).toContain('Fixed input overrides')
    expect(wrapper.text()).toContain('Optional fixed values override matching inputs from the connection.')
    expect(wrapper.text()).toContain('Leave them empty to use incoming data.')
  })
})
