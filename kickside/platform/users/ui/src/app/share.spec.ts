import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const get = vi.fn()
const post = vi.fn()
const toast = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: (...a: any[]) => get(...a), post: (...a: any[]) => post(...a), put: vi.fn(() => Promise.resolve({ data: {} })) },
  host: { toast: (...a: any[]) => toast(...a) },
}))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: { config: { resource_id: 'r1', access_url: '/api/v1/things/r1/access' } } }),
  useEvents: () => vi.fn(),
}))

import Share from './share.vue'

const stubs = { Icon: true, AnchoredPanel: { template: '<div><slot /></div>' } }

function defaultGet(url: string, cfg?: any) {
  if (url.includes('access-model')) return Promise.resolve({ data: { success: true, capabilities: [{ bit: 1, label: 'Read' }] } })
  if (url.includes('/access')) return Promise.resolve({ data: { success: true, grants: [] } })
  if (url.includes('principals/search')) return Promise.resolve({ data: { success: true, principals: [{ type: 'user', id: 'u1', label: 'Ann' }] } })
  return Promise.resolve({ data: { success: true } })
}

describe('share.vue', () => {
  beforeEach(() => { get.mockReset(); post.mockReset(); toast.mockReset(); get.mockImplementation(defaultGet) })

  it('loads the access model + current grants on mount', async () => {
    const w = mount(Share, { global: { stubs } })
    await flushPromises()
    expect(get).toHaveBeenCalledWith('/api/v1/components/access-model')
    w.unmount()
  })

  it('debounces the principal search and clears the timer on unmount', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const w = mount(Share, { global: { stubs } })
    await vi.runOnlyPendingTimersAsync()
    await w.find('.kpp-control').trigger('click')
    const input = w.find('.kpp-search input')
    await input.setValue('an')          // schedules the debounce
    w.unmount()                         // must clear it
    expect(clearSpy).toHaveBeenCalled()
    // Firing remaining timers after unmount must not throw.
    expect(() => vi.advanceTimersByTime(500)).not.toThrow()
  })

  it('runs the search after the debounce window', async () => {
    const w = mount(Share, { global: { stubs } })
    await vi.runOnlyPendingTimersAsync()
    await w.find('.kpp-control').trigger('click')
    await w.find('.kpp-search input').setValue('an')
    await vi.advanceTimersByTimeAsync(200)
    expect(get).toHaveBeenCalledWith('/api/v1/principals/search', expect.objectContaining({ params: expect.objectContaining({ q: 'an' }) }))
    w.unmount()
  })

  it('selects a principal on a single click (no double-click)', async () => {
    const w = mount(Share, { global: { stubs } })
    await vi.runOnlyPendingTimersAsync()
    await w.find('.kpp-control').trigger('click')
    await w.find('.kpp-search input').setValue('an')
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()
    const opt = w.find('button.kpp-row')
    expect(opt.exists()).toBe(true)
    await opt.trigger('click')                 // ONE click must select it
    await flushPromises()
    // The pick sticks: the shared picker trigger reflects it and Share is enabled.
    expect(w.find('.kpp-control').text()).toContain('Ann')
    expect(w.find('button.kxs-btn-primary').attributes('disabled')).toBeUndefined()
    w.unmount()
  })

  it('surfaces a caps error and fabricates no permission bits when the access model fails', async () => {
    get.mockImplementation((url: string) => {
      if (url.includes('access-model')) return Promise.resolve({ data: { success: true } })
      if (url.includes('/access')) return Promise.resolve({ data: { success: true, grants: [] } })
      return Promise.resolve({ data: { success: true } })
    })
    const w = mount(Share, { global: { stubs } })
    await flushPromises()
    expect(w.html()).toContain('could not load permissions')
    // No fallback Write/Delete/Admin chips are invented.
    expect(w.findAll('.kxs-cap')).toHaveLength(0)
    expect(w.html()).not.toContain('Delete')
    w.unmount()
  })

  it('renders a human label for the subject type, not the raw enum', async () => {
    const w = mount(Share, { global: { stubs } })
    await vi.runOnlyPendingTimersAsync()
    await w.find('.kpp-control').trigger('click')
    await w.find('.kpp-search input').setValue('an')
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()
    const kind = w.find('.kpp-kind')
    expect(kind.exists()).toBe(true)
    expect(kind.text()).toBe('Person')
    w.unmount()
  })
})
