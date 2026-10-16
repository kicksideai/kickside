import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import { HOST_VISIBILITY_PROVIDER } from '@wippy-fe/webcomponent-vue'
import { nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Dashboard from './dashboard.vue'

const surface = (id: string, label: string) => ({
  id,
  label,
  description: `${label} description`,
  icon: 'tabler:box',
  route_name: id,
  component_tag: `kickside-${id}`,
})

describe('dashboard retained visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads on mount and refreshes after a false-to-true reveal without remounting', async () => {
    const visible = ref<boolean | null>(false)
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: { success: true, surfaces: [surface('agents', 'Agents')] } })
      .mockResolvedValueOnce({ data: { success: true, surfaces: [surface('workflows', 'Workflows')] } })

    const wrapper = mount(Dashboard, {
      global: {
        provide: {
          [HOST_VISIBILITY_PROVIDER as symbol]: visible,
        },
      },
    })
    await flushPromises()

    const root = wrapper.get('.kx').element
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Agents')

    visible.value = true
    await nextTick()
    await flushPromises()

    expect(api.get).toHaveBeenCalledTimes(2)
    expect(wrapper.get('.kx').element).toBe(root)
    expect(wrapper.text()).toContain('Workflows')
    expect(wrapper.text()).not.toContain('Agents')

    visible.value = true
    await nextTick()
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })
})
