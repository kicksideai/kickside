import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Skills from './skills.vue'

describe('Skills retained-surface refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(globalThis as any).__hostVisible = false
    ;(globalThis as any).__api__ = {
      '/api/v1/skills': { success: true, skills: [
        { skill_id: 's1', name: 'Summarize', description: 'condense text' },
      ] },
    }
  })

  it('reloads the skills list on false-to-true while retaining the same surface and search state', async () => {
    const wrapper = mount(Skills)
    const surface = wrapper.element
    await flushPromises()
    const skillGets = () => (api.get as any).mock.calls.filter(([url]: [string]) => url === '/api/v1/skills?limit=100')
    expect(skillGets()).toHaveLength(1)

    const search = wrapper.get('input[aria-label="Search skills"]')
    await search.setValue('summ')
    ;(globalThis as any).__setHostVisible(true)
    await flushPromises()

    expect(skillGets()).toHaveLength(2)
    expect(wrapper.element).toBe(surface)
    expect((search.element as HTMLInputElement).value).toBe('summ')
    wrapper.unmount()
  })
})
