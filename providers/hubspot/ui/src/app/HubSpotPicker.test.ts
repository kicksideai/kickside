import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Select from 'primevue/select'

const state = vi.hoisted(() => ({
  propsRef: { value: { config: { connection_id: 'conn1', object_type: 'deals' } } },
  emitted: [] as Array<{ event: string; payload: unknown }>,
  discovery: { data: { success: true, resources: [
    { type: 'hubspot_object', id: 'contacts', name: 'Contacts' },
    { type: 'hubspot_object', id: 'deals', name: 'Deals' },
  ] } } as { data: unknown },
}))

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => state.propsRef,
  useEvents: () => (event: string, payload: unknown) => state.emitted.push({ event, payload }),
}))

vi.mock('@wippy-fe/proxy', () => ({
  api: {
    get: vi.fn(async () => ({ data: { connections: [{ component_id: 'conn1', name: 'Sales Hub' }] } })),
    post: vi.fn(async () => state.discovery),
  },
  loadByTagName: vi.fn(async () => undefined),
}))

import HubSpotPicker from './HubSpotPicker.vue'

describe('HubSpotPicker', () => {
  beforeEach(() => {
    state.propsRef.value = { config: { connection_id: 'conn1', object_type: 'deals' } }
    state.discovery = { data: { success: true, resources: [
      { type: 'hubspot_object', id: 'contacts', name: 'Contacts' },
      { type: 'hubspot_object', id: 'deals', name: 'Deals' },
    ] } }
    state.emitted.length = 0
  })

  it('loads connections and emits primary object_type config changes', async () => {
    const wrapper = mount(HubSpotPicker, { global: { plugins: [PrimeVuePlugin] } })
    await flushPromises()

    const picker = wrapper.element.querySelector('wc-connection-picker')!
    expect(picker.getAttribute('providers')).toBe('hubspot')
    const select = wrapper.findComponent(Select)
    expect(select.props('modelValue')).toBe('deals')

    await select.vm.$emit('update:modelValue', 'contacts')
    await select.vm.$emit('change')
    expect(state.emitted).toContainEqual({
      event: 'config-changed',
      payload: { connection_id: 'conn1', object_type: 'contacts' },
    })
  })

  it('shows a bounded discovery-envelope failure without replacing the configured object', async () => {
    state.discovery = { data: { success: false, error: `token revoked ${'x'.repeat(300)}` } }
    const wrapper = mount(HubSpotPicker, { global: { plugins: [PrimeVuePlugin] } })
    await flushPromises()

    const select = wrapper.findComponent(Select)
    expect(select.props('modelValue')).toBe('deals')
    expect(select.props('options')).toEqual([])
    const text = wrapper.text()
    expect(text).toContain('HubSpot object discovery failed: token revoked')
    expect(text.length).toBeLessThan(400)
  })
})
