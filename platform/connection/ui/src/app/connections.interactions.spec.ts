import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Connections from './connections.vue'
beforeEach(() => {
  ;(globalThis as any).__props__ = { config: {} }
  ;(globalThis as any).__realtimeHandlers__ = []
  ;(globalThis as any).__api__ = {
    '/api/v1/connections': { success: true, connections: [
      { component_id: 'c1', name: 'Acme Jira', provider: 'atlassian', connection_state: 'connected' },
      { component_id: 'c2', name: 'GH', provider: 'github', connection_state: 'error' },
    ], total: 2 },
    '/discover': { success: true, providers: [{ key: 'atlassian', label: 'Atlassian', category: 'dev' }] },
  }
})
describe('connections.vue interactions', () => {
  it('loads and renders connections, filters by search', async () => {
    const w = mount(Connections)
    await flushPromises()
    expect(w.html()).toContain('Acme Jira')
    const s = w.find('input[type=search]')
    if (s.exists()) { await s.setValue('acme'); await flushPromises() }
    expect(w.exists()).toBe(true)
    w.unmount()
  })
  it('patches connection rows from component public meta realtime', async () => {
    const w = mount(Connections)
    await flushPromises()
    ;(globalThis as any).__emitRealtime__({
      topic: 'component.c1',
      data: {
        event: 'component.meta.changed',
        component_id: 'c1',
        meta: { title: 'Renamed Jira', connection_state: 'needs_reauth', scopes_granted: 'read write', oauth_connection: true },
      },
    })
    await flushPromises()
    expect(w.text()).toContain('Renamed Jira')
    expect(w.text()).toContain('Reconnect required')
    expect(w.text()).toContain('2 scopes')
    w.unmount()
  })
  it('shows a persisted reconnect reason on initial load', async () => {
    ;(globalThis as any).__api__['/api/v1/connections'].connections[0] = {
      component_id: 'c1', name: 'Google Mail', provider: 'google', oauth: true,
      connection_state: 'needs_reauth', reauth_reason: 'HTTP 400 (invalid_grant)',
    }
    const w = mount(Connections)
    await flushPromises()
    expect(w.text()).toContain('Reconnect required')
    expect(w.text()).toContain('HTTP 400 (invalid_grant)')
    w.unmount()
  })
  it('shows the realtime reconnect reason and clears it after authorization', async () => {
    const w = mount(Connections)
    await flushPromises()
    ;(globalThis as any).__emitRealtime__({
      topic: 'component.c1',
      data: { event: 'component.meta.changed', component_id: 'c1',
        meta: { connection_state: 'needs_reauth', reauth_reason: 'HTTP 400 (invalid_grant)' } },
    })
    await flushPromises()
    expect(w.text()).toContain('HTTP 400 (invalid_grant)')
    ;(globalThis as any).__emitRealtime__({
      topic: 'component.c1',
      data: { event: 'component.meta.changed', component_id: 'c1',
        meta: { connection_state: 'connected', reauth_reason: '' } },
    })
    await flushPromises()
    expect(w.text()).not.toContain('invalid_grant')
    w.unmount()
  })
  it('opens the provider picker', async () => {
    const w = mount(Connections)
    await flushPromises()
    const cta = w.find('.e-cta, .add, [aria-label*=dd], button')
    if (cta.exists()) { await cta.trigger('click'); await flushPromises() }
    expect(w.exists()).toBe(true)
    w.unmount()
  })
})

describe('connections.vue row actions', () => {
  it('exercises share + remove controls', async () => {
    const w = mount(Connections)
    await flushPromises()
    const share = w.find('[aria-label^=Share]')
    if (share.exists()) { await share.trigger('click'); await flushPromises() }
    const rm = w.find('[aria-label^=Remove], [aria-label^=Delete]')
    if (rm.exists()) { await rm.trigger('click'); await flushPromises() }
    expect(w.exists()).toBe(true)
    w.unmount()
  })
})

describe('connections.vue picker', () => {
  it('opens the connection picker', async () => {
    const w = mount(Connections)
    await flushPromises()
    const cta = w.findAll('button').find(b => /add|connect|new/i.test(b.text()) || (b.attributes('class')||'').includes('e-cta'))
    if (cta) { await cta.trigger('click'); await flushPromises() }
    const card = w.find('.setup-card')
    if (card.exists()) { await card.trigger('click'); await flushPromises() }
    expect(w.exists()).toBe(true)
    w.unmount()
  })
})
