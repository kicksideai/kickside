import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, host } from '@wippy-fe/proxy'
import Knowledge from './knowledge.vue'

const kb = { id: 'kb1', name: 'Dispatch library', kb_type: 'document' }
const progress = { success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: { status: 'pending', attempts: 0 } }
let items = [kb]
const read = async (url: string) => ({ data: url.endsWith('/list')
  ? { success: true, items: items.map(item => ({ ...item })) }
  : url.startsWith('/api/v1/components/') ? progress : { success: true, engines: [], models: [] } }) as any
beforeEach(() => {
  items = [kb]
  vi.clearAllMocks()
  vi.mocked(api.get).mockReset()
  vi.mocked(api.delete).mockReset()
  ;(globalThis as any).__props__ = { config: {} }
  ;(globalThis as any).__realtimeHandlers__ = []
  ;(globalThis as any).__hostVisibility__.value = false
  vi.mocked(host.confirm).mockResolvedValue(true)
  vi.mocked(api.get).mockImplementation(read)
  vi.mocked(api.delete).mockResolvedValue({ data: { success: true, deleted: false, in_progress: true, cleanup_pending: true, job_id: 'job' } } as any)
})
async function remove() {
  const wrapper = mount(Knowledge)
  await flushPromises()
  await wrapper.get('button[aria-label="Delete Dispatch library"]').trigger('click')
  await flushPromises()
  return wrapper
}
describe('knowledge cleanup progress', () => {
  it('shows accepted cleanup and removes the KB when its deletion completes', async () => {
    const wrapper = await remove()
    expect(wrapper.text()).toContain('Deleting…')
    expect(wrapper.find('.kx-card').exists()).toBe(true)
    ;(globalThis as any).__emitRealtime__({ event: 'component.deleted', component_id: 'kb1' })
    await flushPromises()
    expect(wrapper.find('.kx-card').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Deleting…')
  })
  it('removes the KB when a later refresh omits it', async () => {
    const wrapper = await remove()
    items = []
    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()
    expect(wrapper.find('.kx-card').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Deleting…')
  })
  it('stops checking when the surface unmounts', async () => {
    const wrapper = await remove()
    const gets = vi.mocked(api.get).mock.calls.length
    wrapper.unmount()
    expect((globalThis as any).__realtimeHandlers__).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(2000)
    expect(vi.mocked(api.get).mock.calls).toHaveLength(gets)
  })
  it('keeps cleanup pending and reports a failed list read', async () => {
    let listReads = 0
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.endsWith('/list') && ++listReads === 2) throw new Error('cleanup status unavailable')
      return read(url)
    })
    const wrapper = await remove()
    expect(wrapper.text()).toContain('cleanup status unavailable')
    expect(vi.mocked(api.get).mock.calls.some(([url]: unknown[]) => String(url).startsWith('/api/v1/components/'))).toBe(false)
    expect(wrapper.text()).toContain('Deleting…')
    expect(wrapper.find('.kx-card').exists()).toBe(true)
  })
  it('retains an accepted cleanup in the list when its immediate refresh fails', async () => {
    let listReads = 0
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.endsWith('/list') && ++listReads === 2) throw new Error('cleanup status unavailable')
      return read(url)
    })
    const wrapper = await remove()
    expect(wrapper.text()).toContain('cleanup status unavailable')
    expect(wrapper.text()).toContain('Deleting…')
    expect(wrapper.find('.kx-card').exists()).toBe(true)
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
