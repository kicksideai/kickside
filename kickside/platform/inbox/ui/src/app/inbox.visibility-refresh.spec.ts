import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api, on } from '@wippy-fe/proxy'
import Inbox from './inbox.vue'

describe('Inbox retained-surface refresh', () => {
  it('reloads kinds and list after false to true without a second realtime subscription', async () => {
    const callsBefore = (api.get as any).mock.calls.length
    const subscriptionsBefore = (on as any).mock.calls.length
    const w = mount(Inbox)
    await flushPromises()
    const root = w.element
    expect((api.get as any).mock.calls.length - callsBefore).toBe(2)
    const subscriptions = (on as any).mock.calls.length - subscriptionsBefore
    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()
    expect((api.get as any).mock.calls.length - callsBefore).toBe(4)
    expect((on as any).mock.calls.length - subscriptionsBefore).toBe(subscriptions)
    expect(w.element).toBe(root)
    ;(globalThis as any).__hostVisibility__.value = false
    w.unmount()
  })
})
