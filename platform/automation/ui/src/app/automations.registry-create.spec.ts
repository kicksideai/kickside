import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Automations from './automations.vue'

const g = globalThis as any
const CUSTOM_TAG = 'provider-custom-setup'

beforeEach(() => {
  if (!customElements.get(CUSTOM_TAG)) customElements.define(CUSTOM_TAG, class extends HTMLElement {})
  g.__realtime__ = { on: vi.fn(() => vi.fn()) }
  g.__props__ = { config: {} }
  g.__api__ = {
    '/automations/types': { success: true, types: [
      { id: 'provider:custom', title: 'Provider action', component: { create_ui: { tag_name: CUSTOM_TAG } } },
      { id: 'provider:plain', title: 'Plain action' },
    ] },
    '/api/v1/automations': { success: true, automations: [] },
  }
})

describe('registry-driven create flow', () => {
  it('opens on the registry catalog with no type selected', async () => {
    const wrapper = mount(Automations)
    await flushPromises()
    await wrapper.findAll('button').find((button) => /add automation/i.test(button.text()))!.trigger('click')
    await flushPromises()

    expect(wrapper.findAll('.kx-cat-name').map((name) => name.text())).toEqual([
      'Provider action',
      'Plain action',
    ])
    expect(wrapper.findAll('.kx-cat-card.sel')).toHaveLength(0)
    expect(wrapper.text()).toContain('Select an automation type to configure it.')
    expect(wrapper.find('[data-testid="automations-install-create"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Run a Workflow')
    wrapper.unmount()
  })

  it('never requests a destination catalog', async () => {
    ;(api.get as any).mockClear()
    const wrapper = mount(Automations)
    await flushPromises()
    const urls = (api.get as any).mock.calls.map((call: any[]) => String(call[0]))
    expect(urls.some((url: string) => url.includes('/destinations'))).toBe(false)
    wrapper.unmount()
  })

  it('mounts a contributed create view with only generic host context', async () => {
    const wrapper = mount(Automations)
    await flushPromises()
    await wrapper.findAll('button').find((button) => /add automation/i.test(button.text()))!.trigger('click')
    await wrapper.findAll('.kx-cat-card').find((card) => /provider action/i.test(card.text()))!.trigger('click')
    await flushPromises()

    const element = wrapper.element.querySelector(CUSTOM_TAG) as HTMLElement | null
    expect(element).toBeTruthy()
    expect(element?.getAttribute('type-id')).toBe('provider:custom')
    expect(element?.getAttribute('embedded')).toBe('true')
    expect(element?.hasAttribute('workflow-id')).toBe(false)
    wrapper.unmount()
  })

  it('preselects an opaque registry type in component mode', async () => {
    g.__props__ = { config: {}, mode: 'component', componentId: 'customer-1', typeId: 'provider:custom' }
    const wrapper = mount(Automations)
    await flushPromises()
    await wrapper.findAll('button').find((button) => /add automation/i.test(button.text()))!.trigger('click')
    await flushPromises()

    expect(wrapper.find('.kx-2p-l').exists()).toBe(false)
    const element = wrapper.element.querySelector(CUSTOM_TAG) as HTMLElement | null
    // The owning component is placement, delivered as parent-id. component-id
    // names the instance a create view edits, so a create mount never carries it.
    expect(element?.getAttribute('parent-id')).toBe('customer-1')
    expect(element?.hasAttribute('component-id')).toBe(false)
    expect(element?.getAttribute('type-id')).toBe('provider:custom')
    wrapper.unmount()
  })

  it('keeps provider vocabulary out of the generic manager source', () => {
    const source = ['automations.vue', 'InstallDialog.vue', 'useInstallFlow.ts', 'install-form.ts']
      .map((file) => readFileSync(resolve(import.meta.dirname, file), 'utf8'))
      .join('\n')
    expect(source).not.toMatch(/kickside\.workflows|workflow_definition|Run a workflow|event workflow/i)
  })
})


it('offers applicable types without a preset in component mode and creates the selected type with its destination input', async () => {
  g.__props__ = { mode: 'component', componentId: 'wf-42', input: JSON.stringify({ sink_port: 'fixture:run', sink_config: { flow_ref: { kind: 'flow', id: 'wf-42', version: 3 } } }) }
  g.__api__['/automations/types'] = { success: true, types: [
    { id: 'fixture:sync', title: 'Data sync', inputs: { properties: { sink_port: { type: 'string' }, sink_config: { type: 'object' } } } },
    { id: 'fixture:other', title: 'Unrelated setup', inputs: { properties: { channel: { type: 'string' } } } },
    { id: 'fixture:hidden', title: 'Hidden', installable: false, inputs: { properties: { sink_port: {}, sink_config: {} } } },
  ] }
  const wrapper = mount(Automations)
  await flushPromises()
  const add = wrapper.findAll('button').find(button => /add automation/i.test(button.text()))
  if (!add) throw new Error('Add automation button missing')
  await add.trigger('click')
  await flushPromises()
  expect(wrapper.findAll('.kx-cat-name').map(name => name.text())).toEqual(['Data sync'])
  await wrapper.get('.kx-cat-card').trigger('click')
  await flushPromises()
  await wrapper.get('[data-testid="automations-install-create"]').trigger('click')
  await flushPromises()
  expect(api.post).toHaveBeenCalledWith('/api/v1/automations', {
    type: 'fixture:sync', parent_id: 'wf-42', input: { sink_port: 'fixture:run', sink_config: { flow_ref: { kind: 'flow', id: 'wf-42', version: 3 } } },
  })
  expect(wrapper.find('[data-testid="automations-install-create"]').exists()).toBe(false)
  wrapper.unmount()
})


it('passes the declared destination into a contributed create view and handles its completion', async () => {
  const input = { sink_port: 'fixture:run', sink_config: { flow_ref: { kind: 'flow', id: 'wf-42', version: 3 } } }
  g.__props__ = { mode: 'component', componentId: 'wf-42', input: JSON.stringify(input) }
  g.__api__['/automations/types'] = { success: true, types: [{
    id: 'fixture:custom', title: 'Custom sync', inputs: { properties: { sink_port: {}, sink_config: {} } },
    component: { create_ui: { tag_name: CUSTOM_TAG } },
  }] }
  const wrapper = mount(Automations)
  await flushPromises()
  const add = wrapper.findAll('button').find(button => /add automation/i.test(button.text()))
  if (!add) throw new Error('Add automation button missing')
  await add.trigger('click')
  await flushPromises()
  await wrapper.get('.kx-cat-card').trigger('click')
  await flushPromises()
  const setup = wrapper.element.querySelector(CUSTOM_TAG)
  if (!setup) throw new Error('Contributed create view missing')
  expect(setup.getAttribute('input')).toBe(JSON.stringify(input))
  expect(setup.getAttribute('parent-id')).toBe('wf-42')
  setup.dispatchEvent(new CustomEvent('automation-installed', { detail: { success: true, id: 'installed-trigger' } }))
  await flushPromises()
  expect(wrapper.find('[data-testid="automations-install-create"]').exists()).toBe(false)
  wrapper.unmount()
})
