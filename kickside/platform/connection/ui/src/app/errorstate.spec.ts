import { describe, it, expect, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Connections from './connections.vue'
import Onboard from './Onboard.vue'

// A catalog/list load failure must render a directed error with a retry, while a
// genuinely empty success renders the honest empty state. The default api.get mock
// (test-setup) resolves from __api__; capture it so each test can restore it.
const defaultGet = vi.mocked(api.get).getMockImplementation()!

afterEach(() => {
  vi.mocked(api.get).mockImplementation(defaultGet)
  ;(globalThis as any).__api__ = {}
})

describe('connections.vue load failure vs empty', () => {
  it('renders a directed error with retry when the load fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('service unavailable'))
    const w = mount(Connections)
    await flushPromises()

    expect(w.text()).toContain("Couldn't load connections")
    expect(w.text()).toContain('service unavailable')
    const retry = w.findAll('button').find(b => /try again/i.test(b.text()))
    expect(retry).toBeTruthy()
    // The failure must NOT masquerade as an honest empty state.
    expect(w.text()).not.toContain('No providers available')
    expect(w.text()).not.toContain('Connect your first app')

    // Retry recovers once the backend is reachable again.
    vi.mocked(api.get).mockImplementation(defaultGet)
    ;(globalThis as any).__api__ = {
      '/api/v1/connections': { success: true, connections: [], total_count: 0, has_more: false },
      '/discover': { success: true, providers: [] },
    }
    await retry!.trigger('click')
    await flushPromises()
    expect(w.text()).not.toContain("Couldn't load connections")
    w.unmount()
  })

  it('renders only the no-providers state when nothing is installed', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/connections': { success: true, connections: [], total_count: 0, has_more: false },
      '/discover': { success: true, providers: [] },
    }
    const w = mount(Connections)
    await flushPromises()

    expect(w.text()).not.toContain("Couldn't load connections")
    expect(w.text()).toContain('No providers available')
    // "Connect your first app" points at the service grid; with no providers
    // there is nothing to pick, so the two empty states must not stack.
    expect(w.text()).not.toContain('Connect your first app')
    w.unmount()
  })

  it('invites the first connection when providers exist but none are connected', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/connections': { success: true, connections: [], total_count: 0, has_more: false },
      '/discover': { success: true, providers: [{ provider: 'slack', title: 'Slack' }] },
    }
    const w = mount(Connections)
    await flushPromises()

    expect(w.text()).toContain('Connect your first app')
    expect(w.text()).not.toContain('No providers available')
    w.unmount()
  })
})

describe('Onboard.vue load failure vs empty', () => {
  it('renders a directed error with retry when the catalog fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('catalog offline'))
    const w = mount(Onboard)
    await flushPromises()

    expect(w.text()).toContain("Couldn't load services")
    expect(w.text()).toContain('catalog offline')
    const retry = w.findAll('button').find(b => /try again/i.test(b.text()))
    expect(retry).toBeTruthy()
    // The empty-catalog line must not show when the fetch actually failed.
    expect(w.text()).not.toContain('No connectable services are configured yet.')
    w.unmount()
  })

  it('renders the honest empty catalog when the fetch succeeds with nothing', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/connections': { connections: [] },
      '/discover': { providers: [] },
    }
    const w = mount(Onboard)
    await flushPromises()

    expect(w.text()).not.toContain("Couldn't load services")
    expect(w.text()).toContain('No connectable services are configured yet.')
    w.unmount()
  })
})
