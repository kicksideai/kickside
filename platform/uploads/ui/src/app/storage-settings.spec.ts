// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Storage from './storage-settings.vue'

function buttonNamed(wrapper: VueWrapper, name: string) {
  const button = wrapper.findAll('button').find(candidate =>
    candidate.attributes('aria-label') === name || candidate.text().trim() === name,
  )
  expect(button, `button named ${name}`).toBeDefined()
  return button!
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  ;(globalThis as any).__api__ = {}
  ;(globalThis as any).__props__ = { config: {} }
})

describe('Storage actions', () => {
  beforeEach(() => {
    ;(globalThis as any).__api__ = {
      '/api/v1/settings': {
        success: true,
        settings: [{
          namespace: 'kickside.uploads.documents',
          key: 'max_upload_bytes',
          value: 121 * 1024 * 1024,
          is_default: false,
        }],
      },
    }
  })

  it('keeps pristine actions disabled, enables dirty actions, and saves through the proxy', async () => {
    const wrapper = mount(Storage)
    await flushPromises()

    expect(buttonNamed(wrapper, 'Discard').attributes()).toHaveProperty('disabled')
    expect(buttonNamed(wrapper, 'Save').attributes()).toHaveProperty('disabled')

    await wrapper.get('input[type="number"]').setValue('122')
    expect(buttonNamed(wrapper, 'Discard').attributes()).not.toHaveProperty('disabled')
    expect(buttonNamed(wrapper, 'Save').attributes()).not.toHaveProperty('disabled')

    await buttonNamed(wrapper, 'Save').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', {
      namespace: 'kickside.uploads.documents',
      key: 'max_upload_bytes',
      value: 122 * 1024 * 1024,
    })
    wrapper.unmount()
  })

  it('resets an override with the exact null payload', async () => {
    const wrapper = mount(Storage)
    await flushPromises()

    const reset = buttonNamed(wrapper, 'Reset to default')
    expect(reset.attributes('title')).toBe('Reset to default')
    await reset.trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', {
      namespace: 'kickside.uploads.documents',
      key: 'max_upload_bytes',
      value: null,
    })
    wrapper.unmount()
  })
})

describe('Storage boolean controls', () => {
  it('uses PrimeVue ToggleSwitch in the storage panel', async () => {
    ;(globalThis as any).__api__ = {
      'settings?namespace': { success: true, settings: [{
        namespace: 'kickside.uploads.rasterize',
        key: 'rasterize_empty_enabled',
        title: 'Rasterize empty documents',
        value: true,
        value_type: 'bool',
        default: false,
        is_default: false,
        editable: true,
        description: 'Render sparse documents.',
      }] },
    }
    const wrapper = mount(Storage)
    await flushPromises()
    const toggle = wrapper.get('[role="switch"]')
    expect(toggle.attributes('aria-label')).toBe('Rasterize empty documents')
    expect(toggle.attributes('aria-checked')).toBe('true')
    await toggle.setValue(false)
    expect(toggle.attributes('aria-checked')).toBe('false')
    wrapper.unmount()
  })
})
