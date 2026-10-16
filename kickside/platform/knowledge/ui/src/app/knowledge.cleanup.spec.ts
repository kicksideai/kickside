import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, host } from '@wippy-fe/proxy'
import Knowledge from './knowledge.vue'

const kb = { id: 'kb1', name: 'Dispatch library', kb_type: 'document' }
let items = [kb]
beforeEach(() => {
  items = [kb]
  vi.clearAllMocks()
  vi.mocked(api.get).mockReset()
  vi.mocked(api.delete).mockReset()
  ;(globalThis as any).__props__ = { config: {} }
  ;(globalThis as any).__realtimeHandlers__ = []
  vi.mocked(host.confirm).mockResolvedValue(true)
  vi.mocked(api.get).mockImplementation(async (url: string) => ({ data: url.endsWith('/list')
    ? { success: true, items } : { success: true, engines: [], models: [] } }) as any)
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, deleted: false, in_progress: true, cleanup_pending: true } } as any)
})
async function remove() {
  const wrapper = mount(Knowledge)
  await flushPromises()
  await wrapper.get('button[aria-label="Delete Dispatch library"]').trigger('click')
  await flushPromises()
  return wrapper
}
describe('knowledge cleanup progress', () => {
  it('shows accepted cleanup and refreshes until the completed KB leaves the list', async () => {
    const wrapper = await remove()
    expect(wrapper.text()).toContain('cleanup is in progress')
    expect(wrapper.find('.kx-card').exists()).toBe(true)
    items = []
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()
    expect(wrapper.find('.kx-card').exists()).toBe(false)
    expect(wrapper.text()).toContain('Deletion complete')
    expect(wrapper.text()).not.toContain('cleanup is in progress')
  })
  it('stops checking when the surface unmounts', async () => {
    const wrapper = await remove()
    const gets = vi.mocked(api.get).mock.calls.length
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(2000)
    expect(vi.mocked(api.get).mock.calls).toHaveLength(gets)
  })
  it('keeps cleanup pending and shows a failed status read', async () => {
    const wrapper = await remove()
    vi.mocked(api.get).mockRejectedValueOnce(new Error('cleanup status unavailable'))
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()
    expect(wrapper.text()).toContain('cleanup status unavailable')
    expect(wrapper.text()).toContain('cleanup is in progress')
    expect(wrapper.find('.kx-card').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Deletion complete')
  })
  it('retains an accepted cleanup in the list when its immediate refresh fails', async () => {
    let listReads = 0
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (!url.endsWith('/list')) return { data: { success: true, engines: [], models: [] } } as any
      listReads += 1
      if (listReads === 2) throw new Error('cleanup status unavailable')
      return { data: { success: true, items } } as any
    })
    const wrapper = await remove()
    expect(wrapper.text()).toContain('cleanup status unavailable')
    expect(wrapper.text()).toContain('cleanup is in progress')
    expect(wrapper.find('.kx-card').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Deletion complete')
  })
  it('refreshes an immediate deletion without starting cleanup polling', async () => {
    vi.mocked(api.delete).mockImplementationOnce(async () => {
      items = []
      return { data: { success: true, deleted: true, in_progress: false } } as any
    })
    const wrapper = await remove()
    expect(wrapper.find('.kx-card').exists()).toBe(false)
    const gets = vi.mocked(api.get).mock.calls.length
    await vi.advanceTimersByTimeAsync(2000)
    expect(vi.mocked(api.get).mock.calls).toHaveLength(gets)
  })
})
