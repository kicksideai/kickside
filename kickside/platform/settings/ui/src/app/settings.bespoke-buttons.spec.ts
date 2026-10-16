import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Provider from './provider.vue'
import Storage from './storage.vue'

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

describe('Provider actions', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = {
      config: { namespace: 'kickside.users', title: 'Authentication' },
    }
    ;(globalThis as any).__api__ = {
      '/api/v1/settings': {
        success: true,
        settings: [{
          namespace: 'kickside.users',
          key: 'token_expiration',
          value: '25h',
          value_type: 'duration',
          default: '24h',
          is_default: false,
          editable: true,
          title: 'Token expiration',
        }],
      },
    }
  })

  it('discards a dirty draft without writing', async () => {
    const wrapper = mount(Provider)
    await flushPromises()

    const input = wrapper.get('input[type="text"]')
    await input.setValue('26h')
    expect(buttonNamed(wrapper, 'Discard').attributes()).not.toHaveProperty('disabled')

    await buttonNamed(wrapper, 'Discard').trigger('click')
    await flushPromises()
    expect(api.put).not.toHaveBeenCalled()
    expect(wrapper.get('input[type="text"]').element).toHaveProperty('value', '25h')
    wrapper.unmount()
  })

  it('saves a dirty value and resets an override through the proxy', async () => {
    const wrapper = mount(Provider)
    await flushPromises()

    await wrapper.get('input[type="text"]').setValue('26h')
    await buttonNamed(wrapper, 'Save').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', {
      namespace: 'kickside.users',
      key: 'token_expiration',
      value: '26h',
    })

    vi.mocked(api.put).mockClear()
    await buttonNamed(wrapper, 'Reset to default').trigger('click')
    await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/settings', {
      namespace: 'kickside.users',
      key: 'token_expiration',
      value: null,
    })
    wrapper.unmount()
  })
})
