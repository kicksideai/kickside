// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import Panel from './PublishedRunPanel.vue'
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: vi.fn() }))
const versions = vi.hoisted(() => ({ getWorkflowVersion: vi.fn() }))
vi.mock('../api/versions', () => versions)
const launcher = defineComponent({ props: ['tag', 'attrs'], template: '<div data-testid="launcher" />' })
const schema = defineComponent({ props: ['schema', 'modelValue'], emits: ['valid', 'update:modelValue'], template: '<div />' })
const inputSchema = { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] }
function create() { return mount(Panel, { props: { workflowId: 'flow', publishedVersion: 2 }, global: { stubs: { WcMount: launcher, SchemaEditor: schema } } }) }
beforeEach(() => { versions.getWorkflowVersion.mockReset(); versions.getWorkflowVersion.mockResolvedValue({ version: 2, input_schema: inputSchema }) })
describe('BOT-WORKFLOW-PUBLISHED-LAUNCH', () => {
  it('reads frozen schema and passes fixed target/input and existing parent to the shared launcher', async () => {
    const w = create(); await flushPromises()
    expect(versions.getWorkflowVersion).toHaveBeenCalledWith('flow', 2)
    expect(w.getComponent(schema).props('schema')).toEqual(inputSchema)
    w.getComponent(schema).vm.$emit('update:modelValue', { text: 'published input' }); await flushPromises()
    const props = w.getComponent(launcher).props()
    expect(props.tag).toBe('wc-manual-task-launcher')
    expect(props.attrs.parent).toBe('flow')
    expect(JSON.parse(props.attrs.target)).toEqual({ kind: 'workflow', flow_ref: { kind: 'flow', id: 'flow', version: 2 }, input: { text: 'published input' } })
    expect(w.text()).toContain('published version 2'); w.unmount()
  })
  it('does not mount authority-bearing launch control for invalid input or unavailable/mismatched version', async () => {
    const w = create(); await flushPromises()
    w.getComponent(schema).vm.$emit('valid', false); await flushPromises()
    expect(w.findComponent(launcher).exists()).toBe(false); w.unmount()
    for (const response of [Promise.reject(new Error('Workflow is unreadable')), Promise.resolve({ version: 3, input_schema: inputSchema })]) {
      versions.getWorkflowVersion.mockImplementationOnce(() => response)
      const panel = create(); await flushPromises()
      expect(panel.findComponent(launcher).exists()).toBe(false); expect(panel.get('[role="alert"]').text()).not.toBe(''); panel.unmount()
    }
  })
  it('discards old version reads and keeps newer schema failure visible', async () => {
    let resolve!: (value: unknown) => void
    versions.getWorkflowVersion.mockImplementationOnce(() => new Promise(r => { resolve = r })).mockRejectedValueOnce(new Error('Version unavailable'))
    const w = create(); await w.setProps({ workflowId: 'next' }); await flushPromises()
    resolve({ version: 2, input_schema: inputSchema }); await flushPromises()
    expect(w.findComponent(launcher).exists()).toBe(false); expect(w.get('[role="alert"]').text()).toContain('Version unavailable'); w.unmount()
  })
})
