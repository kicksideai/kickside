// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const host = vi.hoisted(() => ({ emit: vi.fn(), get: vi.fn(), post: vi.fn(), on: vi.fn(), dispose: vi.fn() }))
const props = ref<Record<string, unknown>>({})
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => props, useEvents: () => host.emit }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: host.get, post: host.post }, on: host.on, loadByTagName: vi.fn() }))
const WorkflowPicker = (await import('./WorkflowPicker.vue')).default
beforeEach(() => {
  props.value = { config: '{}', schema: JSON.stringify({ properties: { flow_ref: { picker: 'wc-workflow-picker' } } }) }
  host.emit.mockReset()
  host.on.mockReset().mockReturnValue(host.dispose)
  host.dispose.mockReset()
  host.post.mockReset()
  host.get.mockReset().mockResolvedValue({ data: { success: true, workflows: [
    { id: 'published', title: 'Digest', published_version: 3 }, { id: 'draft', title: 'Unpublished' },
  ] } })
})
describe('published workflow config host', () => {
  it('creates for the selected source, opens the builder and selects the published result', async () => {
    props.value = {...props.value, sourceContext: JSON.stringify({source: 'example:event', config: {thread_id: 'source'}}), sourceSchema: '{"type":"object"}', returnRoute: '/automations'}
    const wrapper = mount(WorkflowPicker)
    await flushPromises()
    await wrapper.get('[data-test="new-workflow"]').trigger('click')
    const setup = wrapper.findComponent({name: 'WcMount'})
    expect(setup.props('attrs')).toMatchObject({'source-context': props.value.sourceContext})
    setup.vm.$emit('created', {id: 'new-draft'})
    await flushPromises()
    expect(host.on).toHaveBeenCalledWith('workflow.new-draft', expect.any(Function))
    expect(host.emit).toHaveBeenCalledWith('navigate', {route: '/workflows/new-draft/return/%2Fautomations'})
    host.get.mockResolvedValueOnce({data: {success: true, version: {version: 1, input_schema: {type: 'object'}}}})
    await host.on.mock.calls[0][1]({data: {events: [{type: 'kickside.workflows.events:version.published', body: {version: 1}}]}})
    await flushPromises()
    expect(host.emit).toHaveBeenCalledWith('change', {flow_ref: {kind: 'flow', id: 'new-draft', version: 1}})
    expect(host.emit).toHaveBeenCalledWith('select', {input_schema: {type: 'object'}, transform: {kind: 'none'}})
    wrapper.unmount()
    expect(host.dispose).toHaveBeenCalled()
  })
  it('uses binding assist when the published Start differs from the source', async () => {
    props.value = {...props.value, sourceContext: JSON.stringify({source: 'example:event'}), sourceSchema: JSON.stringify({type: 'object', properties: {email: {type: 'string'}}})}
    const wrapper = mount(WorkflowPicker)
    await flushPromises()
    host.get.mockResolvedValueOnce({data: {success: true, version: {version: 3, input_schema: {type: 'object', required: ['address'], properties: {address: {type: 'string'}}}}}})
    host.post.mockResolvedValueOnce({data: {success: true, transform: '{address: payload.email}'}})
    await wrapper.get('button.wf-embed-row').trigger('click')
    await flushPromises()
    expect(host.post).toHaveBeenCalledWith('/api/v1/workflows/published/assist/binding', expect.objectContaining({source_root: 'payload'}))
    expect(host.emit).toHaveBeenCalledWith('select', expect.objectContaining({transform: {kind: 'expr', expr: '{address: payload.email}'}}))
  })
  it('publishes its tag, entry point and config-host props from the owning module', () => {
    const registry = readFileSync(resolve(__dirname, '../../../../src/_index.yaml'), 'utf8')
    const picker = registry.split('  - name: workflow_picker_view')[1].split('  - name:')[0]
    expect(picker).toContain('tag_name: wc-workflow-picker')
    expect(picker).toContain('entry_point: workflow_picker.js')
    expect(picker).toContain('base_path: kickside-workflows')
    expect(picker).toMatch(/config:\s+type: string/)
    expect(picker).toMatch(/schema:\s+type: string/)
  })
  it('offers only published workflows and emits a keyed pinned reference', async () => {
    const w = mount(WorkflowPicker); await flushPromises()
    expect(host.get).toHaveBeenCalledWith('/api/v1/workflows?published=true&fields=labels%2Chead_seq%2Cinterface%2Cpublished_interface%2Cpublished_def_seq%2Chas_draft_changes%2Cparent_id%2Cparent_name%2Cbreadcrumb%2Clast_run%2Cnode_count%2Crun_count&limit=100&offset=0')
    expect(w.findAll('button.wf-embed-row')).toHaveLength(1)
    await w.get('button.wf-embed-row').trigger('click')
    expect(host.emit).toHaveBeenCalledWith('change', { flow_ref: { kind: 'flow', id: 'published', version: 3 } })
  })
  it('reads the configured key and displays the stored version without advancing it', async () => {
    props.value = { schema: JSON.stringify({ properties: { workflow: { picker: 'wc-workflow-picker' } } }),
      config: JSON.stringify({ workflow: { kind: 'flow', id: 'published', version: 2 } }) }
    const w = mount(WorkflowPicker); await flushPromises()
    expect(w.text()).toContain('Digest · Published v2')
    expect(host.emit).not.toHaveBeenCalled()
    await w.get('button.wf-embed-row').trigger('click')
    expect(host.emit).toHaveBeenCalledWith('change', { workflow: { kind: 'flow', id: 'published', version: 3 } })
  })
  it('refreshes the catalog when a newly published reference becomes selected', async () => {
    const wrapper = mount(WorkflowPicker)
    await flushPromises()
    host.get.mockResolvedValueOnce({data: {success: true, workflows: [{id: 'created', title: 'Customer intake', published_version: 1}]}})
    props.value = {...props.value, config: JSON.stringify({flow_ref: {kind: 'flow', id: 'created', version: 1}})}
    await flushPromises()
    expect(wrapper.text()).toContain('Customer intake · Published v1')
  })
  it('shows catalog failures', async () => {
    host.get.mockRejectedValueOnce(new Error('Read denied'))
    const w = mount(WorkflowPicker); await flushPromises()
    expect(w.text()).toContain('Read denied')
    expect(w.findAll('button.wf-embed-row')).toHaveLength(0)
  })
})
