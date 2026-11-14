import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Uploads from './uploads.vue'

describe('Uploads retained-surface refresh', () => {
  beforeEach(() => {
    ;(globalThis as any).__hostVisible = false
    ;(globalThis as any).__uploadHandlers__ = []
    ;(globalThis as any).__api__ = {
      '/uploads/list': { success: true, component_id: 'uploads-u1', uploads: [
        { uuid: 'u1', filename: 'report.pdf', status: 'completed', size: 1024, mime_type: 'application/pdf' },
      ] },
    }
  })

  it('reloads the current list on false-to-true while retaining the surface and query', async () => {
    ;(api.get as any).mockClear()
    const wrapper = mount(Uploads)
    const surface = wrapper.element
    await flushPromises()
    const listGets = () => (api.get as any).mock.calls.filter(([url]: [string]) => url === '/api/v1/uploads/list')
    expect(listGets()).toHaveLength(1)

    const search = wrapper.get('[data-testid="uploads-search-input"]')
    await search.setValue('report')
    ;(globalThis as any).__setHostVisible(true)
    await flushPromises()

    expect(listGets()).toHaveLength(2)
    expect(wrapper.element).toBe(surface)
    expect((search.element as HTMLInputElement).value).toBe('report')
    wrapper.unmount()
  })
})
