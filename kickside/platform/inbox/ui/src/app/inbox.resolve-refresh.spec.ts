import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Inbox from './inbox.vue'
import InboxItem from './InboxItem.vue'

const realtime = vi.hoisted(() => ({ notify: () => {} }))
vi.mock('@widgets/app/componentRealtime', () => ({
  subscribeComponentMeta: vi.fn((_id: string, cb: (event: { meta: Record<string, unknown> }) => void) => {
    realtime.notify = () => cb({ meta: { pending_count: 0, resolved_count: 1 } })
    return vi.fn()
  }),
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const pending = { id: 'decision', item_type: 'flow_decision', title: 'Review decision', priority: 'normal', status: 'pending' }
const resolved = { ...pending, status: 'rejected', action: 'reject', form: { reason: 'No' }, resolved_at: 1700000000 }
function response(items: Array<typeof pending | typeof resolved>) {
  return { data: { items, component_id: 'inbox-owner', item_count: items.length,
    pending_count: items.filter(item => item.status === 'pending').length,
    resolved_count: items.filter(item => item.status !== 'pending').length } }
}
const wrappers: Array<ReturnType<typeof mount>> = []
beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async (url: string) => url.includes('item-types')
    ? { data: { item_types: [] } } : response([pending]))
  vi.mocked(api.post).mockResolvedValue({ data: { success: true, item: resolved } })
})
afterEach(() => { for (const wrapper of wrappers.splice(0)) wrapper.unmount() })
async function openInbox() {
  const wrapper = mount(Inbox)
  wrappers.push(wrapper)
  await flushPromises()
  return wrapper
}

describe('Inbox decision refresh ordering', () => {
  it('keeps the committed decision visible while notification and POST refreshes read an older projection', async () => {
    const wrapper = await openInbox()
    await wrapper.find('[data-testid="inbox-tab-all"]').trigger('click')
    await flushPromises()
    wrapper.findComponent(InboxItem).vm.$emit('resolve', { id: 'decision', action: 'reject', form: { reason: 'No' } })
    await flushPromises()
    expect(wrapper.findComponent(InboxItem).props('item')).toMatchObject(resolved)
    realtime.notify()
    await flushPromises()
    expect(wrapper.findComponent(InboxItem).props('item')).toMatchObject(resolved)
    expect(wrapper.findAll('[data-testid="inbox-action"]')).toHaveLength(0)
    vi.mocked(api.get).mockResolvedValueOnce(response([resolved]))
    await wrapper.find('[data-testid="inbox-tab-resolved"]').trigger('click')
    await flushPromises()
    expect(wrapper.findComponent(InboxItem).props('item')).toMatchObject(resolved)
    expect(wrapper.text()).toContain('1 resolved')
  })

  it('removes an acknowledged decision from Pending even while the projection still lists it', async () => {
    const wrapper = await openInbox()
    wrapper.findComponent(InboxItem).vm.$emit('resolve', { id: 'decision', action: 'reject' })
    await flushPromises()
    expect(wrapper.findAll('.kx-item')).toHaveLength(0)
    expect(wrapper.text()).toContain('0 pending')
    await wrapper.find('[data-testid="inbox-tab-resolved"]').trigger('click')
    await flushPromises()
    expect(wrapper.findComponent(InboxItem).props('item')).toMatchObject(resolved)
  })

  it('retains both terminal receipts when two decisions resolve before projection catch-up', async () => {
    const second = { ...pending, id: 'decision-2', title: 'Second decision' }
    const secondResolved = { ...resolved, id: 'decision-2', title: 'Second decision' }
    vi.mocked(api.get).mockImplementation(async (url: string) => url.includes('item-types')
      ? { data: { item_types: [] } } : response([pending, second]))
    const wrapper = await openInbox()
    wrapper.findComponent(InboxItem).vm.$emit('resolve', { id: 'decision', action: 'reject' })
    await flushPromises()
    expect(wrapper.findComponent(InboxItem).props('item').id).toBe('decision-2')
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true, item: secondResolved } })
    wrapper.findComponent(InboxItem).vm.$emit('resolve', { id: 'decision-2', action: 'reject' })
    await flushPromises()
    expect(wrapper.findAll('.kx-item')).toHaveLength(0)
    vi.mocked(api.get).mockResolvedValueOnce({ data: { ...response([]).data, item_count: 2, pending_count: 2 } })
    await wrapper.find('[data-testid="inbox-tab-resolved"]').trigger('click')
    await flushPromises()
    expect(wrapper.findAll('.kx-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('2 resolved')
    expect(wrapper.findComponent(InboxItem).props('item').status).toBe('rejected')
  })

  it('leaves a refused decision pending and displays the current failure', async () => {
    const wrapper = await openInbox()
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Callback refused'))
    wrapper.findComponent(InboxItem).vm.$emit('resolve', { id: 'decision', action: 'reject' })
    await flushPromises()
    expect(wrapper.findComponent(InboxItem).props('item').status).toBe('pending')
    expect(wrapper.text()).toContain('Callback refused')
  })

  it('keeps the post-resolution list when an earlier realtime request finishes later', async () => {
    const wrapper = await openInbox()
    await wrapper.find('[data-testid="inbox-tab-all"]').trigger('click')
    await flushPromises()
    const older = deferred<ReturnType<typeof response>>()
    vi.mocked(api.get).mockImplementationOnce(() => older.promise)
    realtime.notify()
    vi.mocked(api.get).mockResolvedValueOnce(response([resolved]))
    wrapper.findComponent(InboxItem).vm.$emit('resolve', { id: 'decision', action: 'reject', form: { reason: 'No' } })
    await flushPromises()
    expect(wrapper.findComponent(InboxItem).props('item').status).toBe('rejected')
    older.resolve(response([pending]))
    await flushPromises()
    expect(wrapper.findComponent(InboxItem).props('item').status).toBe('rejected')
    expect(wrapper.text()).toContain('1 all')
    expect(wrapper.findAll('[data-testid="inbox-action"]')).toHaveLength(0)
  })

  it('converges from Pending to the Resolved folder after resolving without remounting', async () => {
    const wrapper = await openInbox()
    const root = wrapper.element
    vi.mocked(api.get).mockResolvedValueOnce(response([]))
    wrapper.findComponent(InboxItem).vm.$emit('resolve', { id: 'decision', action: 'reject', form: { reason: 'No' } })
    await flushPromises()
    expect(wrapper.findAll('.kx-item')).toHaveLength(0)
    vi.mocked(api.get).mockResolvedValueOnce(response([resolved]))
    await wrapper.find('[data-testid="inbox-tab-resolved"]').trigger('click')
    await flushPromises()
    expect(wrapper.element).toBe(root)
    expect(wrapper.findComponent(InboxItem).props('item')).toMatchObject(resolved)
    expect(wrapper.findAll('[data-testid="inbox-action"]')).toHaveLength(0)
  })

  it('does not replace a newer filter result with an earlier Pending response', async () => {
    const wrapper = await openInbox()
    const older = deferred<ReturnType<typeof response>>()
    vi.mocked(api.get).mockImplementationOnce(() => older.promise)
    realtime.notify()
    vi.mocked(api.get).mockResolvedValueOnce(response([resolved]))
    await wrapper.find('[data-testid="inbox-tab-resolved"]').trigger('click')
    await flushPromises()
    older.resolve(response([pending]))
    await flushPromises()
    expect(wrapper.findComponent(InboxItem).props('item').status).toBe('rejected')
    expect(wrapper.text()).toContain('1 resolved')
  })

  it('ignores an older request error after a successful newer refresh', async () => {
    const wrapper = await openInbox()
    const older = deferred<ReturnType<typeof response>>()
    vi.mocked(api.get).mockImplementationOnce(() => older.promise)
    realtime.notify()
    vi.mocked(api.get).mockResolvedValueOnce(response([resolved]))
    realtime.notify()
    await flushPromises()
    older.reject(new Error('stale request failed'))
    await flushPromises()
    expect(wrapper.text()).not.toContain('stale request failed')
    expect(wrapper.findComponent(InboxItem).props('item').status).toBe('rejected')
  })
})
