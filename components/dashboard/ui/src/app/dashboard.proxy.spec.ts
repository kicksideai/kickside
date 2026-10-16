import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import { HOST_VISIBILITY_PROVIDER } from '@wippy-fe/webcomponent-vue'
import { ref } from 'vue'
import Dashboard from './dashboard.vue'

describe('dashboard host access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        surfaces: [{
          id: 'crm',
          label: 'CRM',
          description: 'Customer records',
          icon: 'tabler:users',
          route_name: 'crm',
          component_tag: 'acme-crm',
        }],
      },
    })
  })

  it('loads through the synchronous proxy api without a legacy window bridge', async () => {
    expect('$W' in window).toBe(false)
    const wrapper = mount(Dashboard, {
      global: {
        provide: {
          [HOST_VISIBILITY_PROVIDER as symbol]: ref<boolean | null>(null),
        },
      },
    })
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/api/v1/dashboard/overview')
    expect(wrapper.text()).toContain('CRM')
    wrapper.unmount()
  })
})
