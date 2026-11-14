import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Settings from './settings.vue'

describe('Settings retained-surface refresh', () => {
  it('reloads blocks after false to true without remounting or losing the selected block', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/settings/blocks': {
        success: true,
        blocks: [
          { key: 'general', title: 'General', namespace: 'general' },
          { key: 'advanced', title: 'Advanced', namespace: 'advanced' },
        ],
      },
    }
    ;(api.get as any).mockClear()
    const wrapper = mount(Settings)
    await flushPromises()
    const root = wrapper.element

    await wrapper.get('button:nth-of-type(2)').trigger('click')
    expect(wrapper.text()).toContain('Advanced')
    const blockRequests = () => (api.get as any).mock.calls
      .filter(([url]: [string]) => url === '/api/v1/settings/blocks')
    expect(blockRequests()).toHaveLength(1)

    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()

    expect(blockRequests()).toHaveLength(2)
    expect(wrapper.element).toBe(root)
    expect(wrapper.get('button:nth-of-type(2)').classes()).toContain('ks-nav-item-active')

    ;(globalThis as any).__hostVisibility__.value = false
    wrapper.unmount()
  })
})
