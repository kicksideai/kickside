import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import MasterNamespacePicker from './MasterNamespacePicker.vue'

const traits = [
  { id: 'example.docs:read', title: 'Read documents', description: 'Read documents completely.', prompt: 'Read before answering.', tools: ['example:read'] },
  { id: 'example.docs.child:write', title: 'Write documents' },
  { id: 'example.other:search', title: 'Search sources' },
]
function picker(config: unknown) {
  ;(globalThis as any).__props__ = reactive({ config })
  return mount(MasterNamespacePicker)
}
function configChanges() {
  return (globalThis as any).__events__.filter((event: any) => event.name === 'config-changed').map((event: any) => [event.detail])
}
beforeEach(() => {
  ;(globalThis as any).__events__ = []
  ;(globalThis as any).__props__ = reactive({ config: {} })
  ;(globalThis as any).__api__ = {
    '/agents/namespaces': { success: true, namespaces: [{ id: 'example.docs', label: 'Documents', kind: 'trait' }] },
    '/agents/traits': { success: true, traits },
    '/agents/tools': { success: true, tools: [{ id: 'example:read', title: 'Read text', llm_description: 'Read the full text.' }] },
  }
})

describe('capability activation limits', () => {
  it('renders and emits only fields supported by the capability context schema', async () => {
    ;(globalThis as any).__props__ = { config: { namespaces: ['example.docs'] },
      schema: { type: 'object', properties: { namespaces: { type: 'array' } }, additionalProperties: false } }
    const wrapper = mount(MasterNamespacePicker)
    try {
      await flushPromises()
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
      expect(wrapper.find('.kx-capability-picker').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Limit which capabilities it can turn on')
      await wrapper.get('[aria-label="Remove Documents package limit"]').trigger('click')
      expect(configChanges().at(-1)).toEqual([{ namespaces: [] }])
    } finally {
      wrapper.unmount()
    }
  })

  it('loads saved limits and reports edits through the web-component props and events bridge', async () => {
    ;(globalThis as any).__props__ = { config: { namespaces: ['example.docs'], trait_ids: ['example.docs:read'], inject_trait_catalog: false } }
    ;(globalThis as any).__events__ = []
    const wrapper = mount(MasterNamespacePicker)
    await flushPromises()
    expect(wrapper.get('.kx-trait').text()).toContain('Read documents')
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect((globalThis as any).__events__).toContainEqual({ name: 'config-changed', detail: {
      namespaces: ['example.docs'], trait_ids: ['example.docs:read'], inject_trait_catalog: true,
    } })
    wrapper.unmount()
  })

  it('uses the editor capability picker with plain language and preserves the config contract', async () => {
    const wrapper = picker({ namespaces: ['example.docs'], trait_ids: [], inject_trait_catalog: true })
    await flushPromises()
    expect(wrapper.text()).toContain('Limit which capabilities it can turn on')
    expect(wrapper.text()).not.toMatch(/namespace|allow-list|context object/i)
    const search = wrapper.get('[aria-label="Search capabilities to add"]')
    await search.trigger('focus')
    expect(wrapper.findAll('[role="option"]').map(option => option.text())).toEqual(expect.arrayContaining([expect.stringContaining('Read documents'), expect.stringContaining('Write documents')]))
    expect(wrapper.text()).not.toContain('Search sources')
    const option = wrapper.findAll('[role="option"]').find(option => option.text().includes('Read documents'))!
    await option.get('[aria-label="Show Read documents details"]').trigger('click')
    expect(option.text()).toContain('Read before answering.')
    expect(option.text()).toContain('Read the full text.')
    await option.trigger('click')
    expect(wrapper.findAll('.kx-trait[data-trait-id="example.docs:read"]')).toHaveLength(1)
    await search.trigger('focus')
    expect(wrapper.findAll('[role="option"]').some(option => option.text().includes('Read documents'))).toBe(false)
    expect(configChanges().at(-1)).toEqual([{ namespaces: ['example.docs'], trait_ids: ['example.docs:read'], inject_trait_catalog: true }])
    await wrapper.get('[aria-label="Remove Read documents capability"]').trigger('click')
    expect(configChanges().at(-1)).toEqual([{ namespaces: ['example.docs'], trait_ids: [], inject_trait_catalog: true }])
    wrapper.unmount()
  })

  it('keeps stored capability limits when changing the package scope or prompt setting', async () => {
    const config = { namespaces: ['example.docs'], trait_ids: ['example.other:search', 'missing:trait'], inject_trait_catalog: false }
    const wrapper = picker(config)
    await flushPromises()
    expect(wrapper.findAll('.kx-trait[data-trait-id="example.other:search"]')).toHaveLength(1)
    expect(wrapper.findAll('.kx-trait[data-trait-id="missing:trait"]')).toHaveLength(1)
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(configChanges().at(-1)).toEqual([{ ...config, inject_trait_catalog: true }])
    await wrapper.get('[aria-label="Remove Documents package limit"]').trigger('click')
    expect(configChanges().at(-1)).toEqual([{ ...config, namespaces: [], inject_trait_catalog: true }])
    wrapper.unmount()
  })

  it('reads legacy scope arrays and reacts to config updates without altering stored values', async () => {
    const wrapper = picker(['example.docs'])
    await flushPromises()
    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(configChanges().at(-1)).toEqual([{ namespaces: ['example.docs'], trait_ids: [], inject_trait_catalog: true }])
    ;(globalThis as any).__props__.config = { namespaces: ['*'], trait_ids: ['example.other:search'], inject_trait_catalog: false }
    await flushPromises()
    expect(wrapper.get('.kx-trait').text()).toContain('Search sources')
    await wrapper.get('[aria-label="Search capabilities to add"]').trigger('focus')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    wrapper.unmount()
  })
})
