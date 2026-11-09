// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { api } from '@wippy-fe/proxy'
import SettingsForm from './SettingsForm.vue'
import Provider from './provider.vue'

vi.mock('@wippy-fe/proxy', () => ({
  api: { get: vi.fn(), put: vi.fn() },
  loadByTagName: vi.fn(async (tag: string) => {
    if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
  }),
}))
vi.mock('@wippy-fe/webcomponent-vue', async () => {
  const { ref } = await import('vue')
  return { useProps: () => ref({ config: { namespace: 'test.preferences' } }) }
})
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

let wrapper: VueWrapper
let setting: Record<string, any>
beforeEach(() => {
  vi.clearAllMocks()
  setting = {
    namespace: 'test.preferences', key: 'target', value: 'class:fast',
    value_type: 'string', default: 'class:fast', is_default: true,
    control: { tag: 'wc-test-picker', props: { capability: 'vision', value: 'ignored' } },
    schema: { type: 'string', minLength: 3 },
  }
  vi.mocked(api.get).mockImplementation(async () => ({ data: { success: true, settings: [{ ...setting }] } }))
  vi.mocked(api.put).mockImplementation(async (_url: string, body: any) => {
    setting.value = body.value ?? setting.default
    setting.is_default = body.value === null
    setting.updated_by = body.value === null ? null : 'admin'
    return { data: { success: true } }
  })
})
afterEach(() => wrapper?.unmount())
async function render(all = false) {
  wrapper = mount(SettingsForm, { props: { namespace: 'test.preferences', all }, global: { plugins: [PrimeVuePlugin] } })
  await flushPromises()
}
function button(label: string) {
  return wrapper.findAll('button').find(b => b.text() === label || b.attributes('aria-label') === label)!
}
async function select(value: string) {
  wrapper.get('wc-test-picker').element.dispatchEvent(new CustomEvent('select', { detail: value, bubbles: true, composed: true }))
  await flushPromises()
}

describe('declarative setting value controls', () => {
  for (const all of [false, true]) {
    it(`mounts, edits, saves and resets a value in ${all ? 'all settings' : 'a namespace'}`, async () => {
      await render(all)
      expect(customElements.get('wc-test-picker')).toBeDefined()
      expect(wrapper.get('wc-test-picker').attributes()).toMatchObject({ capability: 'vision', value: 'class:fast' })
      expect(button('Save').attributes()).toHaveProperty('disabled')
      await select('model-one')
      expect(api.put).not.toHaveBeenCalled()
      expect(wrapper.get('wc-test-picker').attributes('value')).toBe('model-one')
      expect(button('Save').attributes()).not.toHaveProperty('disabled')
      await button('Save').trigger('click')
      await flushPromises()
      expect(api.put).toHaveBeenCalledWith('/api/v1/settings', { namespace: 'test.preferences', key: 'target', value: 'model-one' })
      expect(wrapper.get('wc-test-picker').attributes('value')).toBe('model-one')
      expect(wrapper.text()).toContain('overridden')
      expect(wrapper.text()).toContain('by admin')
      await button('Reset to default').trigger('click')
      await flushPromises()
      expect(api.put).toHaveBeenLastCalledWith('/api/v1/settings', { namespace: 'test.preferences', key: 'target', value: null })
      expect(wrapper.get('wc-test-picker').attributes('value')).toBe('class:fast')
    })
  }
  it('validates selections before save and shows server validation errors', async () => {
    await render()
    await select('x')
    expect(wrapper.text()).toContain('Must be at least 3 characters')
    expect(button('Save').attributes()).toHaveProperty('disabled')
    await select('model-two')
    vi.mocked(api.put).mockResolvedValueOnce({ data: { success: false, error: 'Selection is unavailable' } })
    await button('Save').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Selection is unavailable')
    expect(setting.value).toBe('class:fast')
  })
  it('binds structured values and saves structured selections through normal JSON validation', async () => {
    setting.value_type = 'json'
    setting.value = { source: 'first' }
    setting.schema = { type: 'object', required: ['source'] }
    await render()
    expect(JSON.parse(wrapper.get('wc-test-picker').attributes('value')!)).toEqual({ source: 'first' })
    wrapper.get('wc-test-picker').element.dispatchEvent(new CustomEvent('select', { detail: { source: 'second' } }))
    await flushPromises()
    await button('Save').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', { namespace: 'test.preferences', key: 'target', value: { source: 'second' } })
  })
  it('does not mount a control for a read-only setting', async () => {
    setting.editable = false
    await render()
    expect(wrapper.find('wc-test-picker').exists()).toBe(false)
    expect(wrapper.get('.ks-static').text()).toBe('class:fast')
  })
  it('keeps ordinary inputs and self-saving editors unchanged', async () => {
    delete setting.control
    await render()
    expect(wrapper.get('input[type="text"]').element).toHaveProperty('value', 'class:fast')
    wrapper.unmount()
    setting.ui = 'wc-test-editor'
    await render()
    expect(wrapper.find('input[type="text"]').exists()).toBe(false)
    wrapper.get('wc-test-editor').element.dispatchEvent(new CustomEvent('config-changed', { detail: {}, bubbles: true }))
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(3)
    expect(api.put).not.toHaveBeenCalled()
  })
})


describe('provider setting value controls', () => {
  async function renderProvider() {
    wrapper = mount(Provider, { global: { plugins: [PrimeVuePlugin] } })
    await flushPromises()
  }
  it('mounts the declared control and keeps save, discard and reset in Settings', async () => {
    await renderProvider()
    expect(wrapper.get('wc-test-picker').attributes()).toMatchObject({ capability: 'vision', value: 'class:fast' })
    expect(button('Save').attributes()).toHaveProperty('disabled')
    await select('model-one')
    expect(api.put).not.toHaveBeenCalled()
    expect(button('Save').attributes()).not.toHaveProperty('disabled')
    await button('Discard').trigger('click')
    await flushPromises()
    expect(wrapper.get('wc-test-picker').attributes('value')).toBe('class:fast')
    await select('model-two')
    await button('Save').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', { namespace: 'test.preferences', key: 'target', value: 'model-two' })
    expect(wrapper.text()).toContain('overridden')
    expect(wrapper.get('wc-test-picker').attributes('value')).toBe('model-two')
    await button('Reset to default').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenLastCalledWith('/api/v1/settings', { namespace: 'test.preferences', key: 'target', value: null })
    expect(wrapper.get('wc-test-picker').attributes('value')).toBe('class:fast')
  })
  it('keeps a read-only control static', async () => {
    setting.editable = false
    await renderProvider()
    expect(wrapper.find('wc-test-picker').exists()).toBe(false)
    expect(button('Save').attributes()).toHaveProperty('disabled')
  })
})
