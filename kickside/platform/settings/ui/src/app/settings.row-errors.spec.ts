// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import SettingsForm from './SettingsForm.vue'

const invalid = { namespace: 'test.preferences', key: 'enabled', value_type: 'bool', value: null,
  default: true, is_default: false, error: 'expected a boolean' }

beforeEach(() => {
  vi.clearAllMocks()
  ;(globalThis as any).__api__ = { '/api/v1/settings': { success: true, settings: [{ ...invalid }] } }
})

describe('Settings service row errors', () => {
  it.each([false, true])('shows the stored error and resets only on request (all=%s)', async all => {
    const wrapper = mount(SettingsForm, { props: { namespace: invalid.namespace, all } })
    await flushPromises()
    expect(wrapper.get('.ks-row').classes()).toContain('ks-row-invalid')
    expect(wrapper.get('.ks-field-err').text()).toBe(invalid.error)
    expect(api.put).not.toHaveBeenCalled()
    ;(globalThis as any).__api__['/api/v1/settings'].settings = [{ ...invalid, value: true, is_default: true, error: undefined }]
    await wrapper.get('button[aria-label="Reset to default"]').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledExactlyOnceWith('/api/v1/settings', {
      namespace: invalid.namespace, key: invalid.key, value: null,
    })
    expect(wrapper.find('.ks-field-err').exists()).toBe(false)
    expect(wrapper.find('.ks-row-invalid').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Reset to default"]').exists()).toBe(false)
  })

  it('keeps the stored error visible during edits and allows a replacement to save', async () => {
    ;(globalThis as any).__api__['/api/v1/settings'].settings = [{ ...invalid, value_type: 'string', default: '', error: 'expected a string' }]
    const wrapper = mount(SettingsForm, { props: { namespace: invalid.namespace } })
    await flushPromises()
    await wrapper.get('input').setValue('replacement')
    expect(wrapper.get('.ks-field-err').text()).toBe('expected a string')
    await wrapper.findAll('button').find(button => button.text() === 'Save')!.trigger('click')
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', {
      namespace: invalid.namespace, key: invalid.key, value: 'replacement',
    })
  })

  it('shows row errors for bespoke editors too', async () => {
    ;(globalThis as any).__api__['/api/v1/settings'].settings = [{ ...invalid, ui: 'test-editor' }]
    const wrapper = mount(SettingsForm, { props: { namespace: invalid.namespace }, global: { stubs: { WcMount: true } } })
    await flushPromises()
    expect(wrapper.get('.ks-field-err').text()).toBe(invalid.error)
  })
})
