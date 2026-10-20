// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const host = vi.hoisted(() => ({ emit: vi.fn(), get: vi.fn() }))
const props = ref<Record<string, unknown>>({})
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => props, useEvents: () => host.emit }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: host.get } }))
const WorkflowPicker = (await import('./WorkflowPicker.vue')).default
beforeEach(() => {
  props.value = { config: '{}', schema: JSON.stringify({ properties: { flow_ref: { picker: 'wc-workflow-picker' } } }) }
  host.emit.mockReset()
  host.get.mockReset().mockResolvedValue({ data: { success: true, workflows: [
    { id: 'published', title: 'Digest', published_version: 3 }, { id: 'draft', title: 'Unpublished' },
  ] } })
})
describe('published workflow config host', () => {
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
  it('shows catalog failures', async () => {
    host.get.mockRejectedValueOnce(new Error('Read denied'))
    const w = mount(WorkflowPicker); await flushPromises()
    expect(w.text()).toContain('Read denied')
    expect(w.findAll('button.wf-embed-row')).toHaveLength(0)
  })
})
