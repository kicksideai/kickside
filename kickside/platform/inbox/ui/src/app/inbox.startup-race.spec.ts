import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, on } from '@wippy-fe/proxy'
import Inbox from './inbox.vue'

const item = { id: 'arriving-notice', item_type: 'notice', title: 'Arrived during startup',
  content: 'Review this new item', status: 'pending', priority: 'normal' }
function response(items: typeof item[]) {
  return { data: { component_id: 'inbox-owner', items, total_count: items.length,
    item_count: items.length, pending_count: items.filter(value => value.status === 'pending').length,
    resolved_count: items.filter(value => value.status !== 'pending').length } }
}
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(yes => { resolve = yes })
  return { promise, resolve }
}
function notify() {
  ;(globalThis as any).__emitRealtime__({ topic: 'component.inbox-owner',
    data: { event: 'component.meta.changed', component_id: 'inbox-owner',
      meta: { item_count: '1', pending_count: '1' } } })
}
const wrappers: Array<ReturnType<typeof mount>> = []
const register = vi.mocked(on).getMockImplementation()!
beforeEach(() => {
  vi.mocked(on).mockClear().mockImplementation(register)
  vi.mocked(api.get).mockClear().mockImplementation(async (url: string) =>
    url.includes('item-types') ? { data: { item_types: [] } } : response([]))
})
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  vi.mocked(on).mockImplementation(register)
})
function openInbox() {
  const wrapper = mount(Inbox)
  wrappers.push(wrapper)
  return wrapper
}

describe('Inbox subscription before rendered snapshot', () => {
  it('includes an item whose notification falls between discovery load and subscription', async () => {
    let delivered = false
    const order: string[] = []
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('item-types')) return { data: { item_types: [] } }
      order.push('list')
      return response(delivered ? [item] : [])
    })
    vi.mocked(on).mockImplementation((topic, cb) => {
      // The discovery snapshot has already been read. Delivery commits and its
      // event is lost just before the listener exists, as in the PG report.
      delivered = true
      notify()
      order.push('subscribe')
      return register(topic, cb)
    })
    const wrapper = openInbox()
    await flushPromises()
    expect(wrapper.findAll('.kx-item')).toHaveLength(1)
    expect(wrapper.text()).toContain(item.title)
    expect(wrapper.text()).toContain('1 pending')
    expect(order).toEqual(['list', 'subscribe', 'list'])
    expect(on).toHaveBeenCalledTimes(1)
  })

  it('keeps a newer event refresh when the subscribed startup snapshot finishes later', async () => {
    const startup = deferred<ReturnType<typeof response>>()
    let lists = 0
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('item-types')) return { data: { item_types: [] } }
      lists += 1
      return lists === 1 ? response([]) : lists === 2 ? startup.promise : response([item])
    })
    const wrapper = openInbox()
    await flushPromises()
    expect(lists).toBe(2)
    expect(wrapper.text()).toContain('Loading...')
    notify()
    await flushPromises()
    expect(wrapper.text()).toContain(item.title)
    startup.resolve(response([]))
    await flushPromises()
    expect(wrapper.findAll('.kx-item')).toHaveLength(1)
    expect(wrapper.text()).toContain('1 pending')
  })

  it('does not subscribe or refetch after unmount during discovery', async () => {
    const discovery = deferred<ReturnType<typeof response>>()
    vi.mocked(api.get).mockImplementation(async (url: string) =>
      url.includes('item-types') ? { data: { item_types: [] } } : discovery.promise)
    const wrapper = openInbox()
    wrapper.unmount()
    wrappers.pop()
    discovery.resolve(response([]))
    await flushPromises()
    expect(on).not.toHaveBeenCalled()
    expect(api.get).toHaveBeenCalledTimes(2)
  })

  it('keeps the selected folder when its response overtakes the startup snapshot', async () => {
    const startup = deferred<ReturnType<typeof response>>()
    const resolved = { ...item, status: 'dismissed', action: 'dismiss' }
    let lists = 0
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('item-types')) return { data: { item_types: [] } }
      return ++lists === 1 ? response([]) : lists === 2 ? startup.promise : response([resolved])
    })
    const wrapper = openInbox()
    await flushPromises()
    await wrapper.find('[data-testid="inbox-tab-resolved"]').trigger('click')
    await flushPromises()
    startup.resolve(response([]))
    await flushPromises()
    expect(wrapper.findAll('.kx-item')).toHaveLength(1)
    expect(wrapper.text()).toContain('1 resolved')
    expect(on).toHaveBeenCalledTimes(1)
  })

  it('refreshes a retained surface without reopening its subscription', async () => {
    const wrapper = openInbox()
    await flushPromises()
    expect(on).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenCalledTimes(3)
    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(5)
    expect(on).toHaveBeenCalledTimes(1)
    ;(globalThis as any).__hostVisibility__.value = false
  })

  it('releases the subscription while a startup snapshot is in flight', async () => {
    const startup = deferred<ReturnType<typeof response>>()
    let lists = 0
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('item-types')) return { data: { item_types: [] } }
      return ++lists === 1 ? response([]) : startup.promise
    })
    const wrapper = openInbox()
    await flushPromises()
    expect(lists).toBe(2)
    wrapper.unmount()
    wrappers.pop()
    notify()
    startup.resolve(response([item]))
    await flushPromises()
    expect(lists).toBe(2)
    expect((globalThis as any).__realtimeHandlers__).toHaveLength(0)
  })
})
