import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Settings from './settings.vue'
import SettingsForm from './SettingsForm.vue'

const rows = [
  { namespace: 'test.alpha', key: 'limit', title: 'Alpha limit', owner: 'Renderer', value: 3, default: 3, value_type: 'int', is_default: true, schema: { type: 'integer', minimum: 1 } },
  { namespace: 'test.beta', key: 'limit', title: 'Beta limit', value: 7, default: 5, value_type: 'int', is_default: false },
]
beforeEach(() => {
  vi.clearAllMocks()
  ;(globalThis as any).__props__ = {}
  ;(globalThis as any).__api__ = {
    'settings/blocks': { success: true, blocks: [{ key: 'beta', title: 'Beta module', namespace: 'test.beta' }] },
    '/api/v1/settings': { success: true, settings: rows },
  }
})
afterEach(() => { (globalThis as any).__props__ = {}; (globalThis as any).__api__ = {} })

describe('All settings', () => {
  it('opens one cross-namespace table and filters by declared and block owners', async () => {
    const wrapper = mount(Settings)
    await flushPromises()
    const all = wrapper.findAll('button').find(button => button.text() === 'All settings')
    expect(all).toBeDefined()
    await all!.trigger('click')
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/settings')
    expect(wrapper.findAll('table')).toHaveLength(1)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.text()).toContain('Renderer')
    expect(wrapper.text()).toContain('Beta module')
    await wrapper.get('input[aria-label="Search settings"]').setValue('Renderer')
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.get('tbody tr').text()).toContain('Alpha limit')
  })

  it('saves and resets equal keys in distinct namespaces through the shared field path', async () => {
    const wrapper = mount(SettingsForm, { props: { namespace: '', all: true } })
    await flushPromises()
    const row = wrapper.findAll('.ks-row').find(candidate => candidate.text().includes('Beta limit'))!
    await row.get('input[type="number"]').setValue('9')
    await row.findAll('button').find(button => button.text() === 'Save')!.trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', { namespace: 'test.beta', key: 'limit', value: 9 })
    const reloaded = wrapper.findAll('.ks-row').find(candidate => candidate.text().includes('Beta limit'))!
    await reloaded.get('button[aria-label="Reset to default"]').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', { namespace: 'test.beta', key: 'limit', value: null })
  })

  it('preserves a block named all-settings when the table is selected separately', async () => {
    ;(globalThis as any).__props__ = { route: 'all-settings' }
    ;(globalThis as any).__api__['settings/blocks'].blocks = [{ key: 'all-settings', title: 'Contributed section', namespace: 'test.beta' }]
    const wrapper = mount(Settings)
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/settings?namespace=test.beta')
    await wrapper.findAll('button').find(button => button.text() === 'All settings')!.trigger('click')
    await flushPromises()
    expect(wrapper.find('table').exists()).toBe(true)
    await wrapper.findAll('button').find(button => button.text() === 'Contributed section')!.trigger('click')
    await flushPromises()
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('keeps schema refusal and request errors visible in the all view', async () => {
    const wrapper = mount(SettingsForm, { props: { namespace: '', all: true } })
    await flushPromises()
    const row = wrapper.findAll('.ks-row').find(candidate => candidate.text().includes('Alpha limit'))!
    await row.get('input[type="number"]').setValue('0')
    expect(row.get('.ks-field-err').text()).toContain('Must be')
    expect(row.findAll('button').find(button => button.text() === 'Save')!.attributes('disabled')).toBeDefined()
    expect(api.put).not.toHaveBeenCalled()
    vi.mocked(api.get).mockRejectedValueOnce(new Error('settings read unavailable'))
    await wrapper.setProps({ namespace: 'test.gamma' })
    await flushPromises()
    expect(wrapper.get('.ks-err').text()).toContain('settings read unavailable')
  })
})
