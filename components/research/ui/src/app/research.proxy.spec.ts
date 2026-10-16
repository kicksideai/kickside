import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, on } from '@wippy-fe/proxy'
import Research from './research.vue'

const DEFAULT_AGENT = 'kickside.research.agents:researcher'

describe('research proxy and agent picker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, items: [] } })
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, research_id: 'r1', thread_id: 't1', status: 'running' },
    })
  })

  it('uses canonical proxy exports and keeps the picker selection controlled', async () => {
    expect('$W' in window).toBe(false)
    const wrapper = mount(Research)
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/api/v1/research/list?limit=100')
    expect(on).toHaveBeenCalledWith('kickside.threads', expect.any(Function))

    const picker = wrapper.find('wc-agent-picker')
    expect(picker.attributes('selected')).toBe(JSON.stringify([DEFAULT_AGENT]))

    picker.element.dispatchEvent(new CustomEvent('change', {
      detail: { selected: ['userspace.agents:researcher'] },
    }))
    await wrapper.vm.$nextTick()
    expect(picker.attributes('selected')).toBe(JSON.stringify(['userspace.agents:researcher']))

    await wrapper.find('textarea').setValue('Investigate this')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/research', {
      prompt: 'Investigate this',
      agent_id: 'userspace.agents:researcher',
      max_iterations: 20,
    })
    wrapper.unmount()
  })

  it('renders the compact-list title when the prompt is absent', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        items: [{
          research_id: 'r-title', thread_id: 't-title', agent_id: DEFAULT_AGENT,
          title: 'Northwind warehouse analysis', status: 'complete',
        }],
      },
    })

    const wrapper = mount(Research)
    await flushPromises()

    expect(wrapper.find('.kx-name').text()).toBe('Northwind warehouse analysis')
    expect(wrapper.find('.kx-name').attributes('title')).toBe('Northwind warehouse analysis')
    wrapper.unmount()
  })
})
