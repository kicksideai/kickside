import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProviderCard from './ProviderCard.vue'

const request = vi.hoisted(() => vi.fn())

vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))
vi.mock('@wippy-fe/proxy', () => ({ api: { put: request } }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: (globalThis as any).__providerProps }),
  useEvents: () => vi.fn(),
}))

describe('ProviderCard email trust', () => {
  beforeEach(() => {
    request.mockReset()
    request.mockResolvedValue({ data: { success: true } })
    ;(globalThis as any).__providerProps = {
      config: {
        namespace: 'kickside.sso.providers.oidc',
        label: 'Generic OIDC',
        engine: 'oidc',
        fields: [
          { key: 'enabled', value_type: 'bool', value: false },
          { key: 'allow_unverified_email', value_type: 'bool', value: false, description: 'Allow unverified email' },
        ],
      },
    }
  })

  it('renders and saves the unverified email switch', async () => {
    const wrapper = mount(ProviderCard)
    const switches = wrapper.findAll('[role="switch"]')

    expect(wrapper.text()).toContain('Allow unverified email')
    expect(switches).toHaveLength(2)
    expect(switches[1].attributes('aria-checked')).toBe('false')

    await switches[1].trigger('click')
    expect(switches[1].attributes('aria-checked')).toBe('true')
    await wrapper.get('.ap-btn-primary').trigger('click')
    await flushPromises()

    expect(request).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledWith('/api/v1/settings', {
      namespace: 'kickside.sso.providers.oidc',
      key: 'allow_unverified_email',
      value: true,
    })
    wrapper.unmount()
  })

  it('saves the disabled unverified email switch', async () => {
    ;(globalThis as any).__providerProps.config.fields[1].value = true
    const wrapper = mount(ProviderCard)
    const emailSwitch = wrapper.findAll('[role="switch"]')[1]

    expect(emailSwitch.attributes('aria-checked')).toBe('true')
    await emailSwitch.trigger('click')
    await wrapper.get('.ap-btn-primary').trigger('click')
    await flushPromises()

    expect(request).toHaveBeenCalledWith('/api/v1/settings', {
      namespace: 'kickside.sso.providers.oidc',
      key: 'allow_unverified_email',
      value: false,
    })
    wrapper.unmount()
  })
})
