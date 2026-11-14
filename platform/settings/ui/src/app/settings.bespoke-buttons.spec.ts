import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Provider from './provider.vue'

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
