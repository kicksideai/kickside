import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Automations from './automations.vue'

const g = globalThis as any

// A type that declares the full control surface: run-now, pause/resume, and every
// recovery action. Before this redesign only pause/resume/trigger/status were
// reachable; the rest had no button. The row must now surface all of them.
const RICH_TYPE = {
  id: 'sync',
  title: 'Data Sync',
  exportable: true,
  component: { create_ui: { tag_name: 'wc-sync-create' }, manage_ui: { tag_name: 'wc-sync-manage' } },
  controls: [{ name: 'resync', request_id_required: true }, { name: 'replay', request_id_required: true }],
  actions: [
    { name: 'trigger' }, { name: 'pause' }, { name: 'resume' }, { name: 'status' },
    { name: 'rewind' }, { name: 'resync' }, { name: 'replay' }, { name: 'reconcile' },
  ],
}

beforeEach(() => {
  ;(api.post as any).mockClear()
  g.__realtime__ = { on: vi.fn(() => vi.fn()) }
  g.__props__ = { config: {} }
  g.__api__ = {
    '/automations/types': { success: true, types: [RICH_TYPE] },
    '/api/v1/automations': { success: true, automations: [
      { id: 'a1', type: 'sync', title: 'My Sync', public_state: { enabled: true, status: 'active' } },
    ] },
  }
})

describe('data-driven row actions', () => {
  it('renders every declared meta.action in the overflow menu, not a hardcoded subset', async () => {
    const w = mount(Automations)
    await flushPromises()
    await w.find('button[aria-label="More actions for My Sync"]').trigger('click')

    // Run-now and every recovery action the type declares are reachable.
    for (const method of ['trigger', 'status', 'rewind', 'resync', 'replay', 'reconcile']) {
      expect(w.find(`[data-testid="action-${method}"]`).exists()).toBe(true)
    }
    // Plus the shell operations.
    for (const method of ['reconfigure', 'export', 'delete']) {
      expect(w.find(`[data-testid="action-${method}"]`).exists()).toBe(true)
    }
    // pause/resume stay the primary control, so they are not duplicated in the menu.
    expect(w.find('[data-testid="action-pause"]').exists()).toBe(false)
    expect(w.find('[aria-label="Pause My Sync"]').exists()).toBe(true)
    w.unmount()
  })

  it('dispatches a recovery action through the generic action endpoint', async () => {
    const w = mount(Automations)
    await flushPromises()
    await w.find('button[aria-label="More actions for My Sync"]').trigger('click')
    await w.find('[data-testid="action-rewind"]').trigger('click')
    await flushPromises()
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/automations/a1/actions/rewind')).toBe(true)
    w.unmount()
  })

  it('sends caller request IDs for resync and replay, and reuses one after an uncertain response', async () => {
    const post = api.post as any
    const w = mount(Automations)
    await flushPromises()
    const action = async (method: string) => {
      await w.find('button[aria-label="More actions for My Sync"]').trigger('click')
      await w.find(`[data-testid="action-${method}"]`).trigger('click')
      await flushPromises()
    }
    post.mockImplementationOnce(() => Promise.reject(new Error('connection lost')))
    for (let i = 0; i < 3; i++) {
      post.mockImplementationOnce(() => Promise.resolve({ data: { success: true, result: { state: 'succeeded' } } }))
    }
    await action('resync')
    await action('resync')
    await action('resync')
    await action('replay')

    const calls = post.mock.calls.filter((c: any[]) => String(c[0]).includes('/actions/'))
    expect(calls.map((c: any[]) => c[0])).toEqual([
      '/api/v1/automations/a1/actions/resync',
      '/api/v1/automations/a1/actions/resync',
      '/api/v1/automations/a1/actions/resync',
      '/api/v1/automations/a1/actions/replay',
    ])
    for (const [, body] of calls) expect(body).toEqual({ request_id: expect.any(String) })
    expect(calls[0][1].request_id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(calls[1][1].request_id).toBe(calls[0][1].request_id)
    expect(calls[2][1].request_id).not.toBe(calls[0][1].request_id)
    expect(calls[3][1].request_id).not.toBe(calls[2][1].request_id)
    w.unmount()
  })
})

describe('errored row surfaces its cause and a one-click recovery', () => {
  beforeEach(() => {
    g.__api__['/api/v1/automations'] = { success: true, automations: [
      { id: 'a1', type: 'sync', title: 'My Sync', public_state: {
        enabled: true, status: 'failed', consecutive_failures: 3,
        last_error: 'sink write did not acknowledge item 42',
      } },
    ] }
  })

  it('shows the real dead-letter cause and a Recover button on the row', async () => {
    const w = mount(Automations)
    await flushPromises()
    const msg = w.find('.kx-rowmsg-error')
    expect(msg.exists()).toBe(true)
    expect(msg.text()).toContain('sink write did not acknowledge item 42')
    expect(w.find('[data-testid="row-recover"]').exists()).toBe(true)
    expect(w.find('[aria-label="Recover My Sync"]').exists()).toBe(true)
    w.unmount()
  })

  it('recovers through rewind, falling back to resync when the type has no rewind', async () => {
    const w = mount(Automations)
    await flushPromises()
    await w.find('[data-testid="row-recover"]').trigger('click')
    await flushPromises()
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/automations/a1/actions/rewind')).toBe(true)
    w.unmount()

    // A type that declares resync but not rewind recovers through resync.
    g.__api__['/automations/types'] = { success: true, types: [{
      id: 'sync2', title: 'Sync Two', actions: [], controls: [{ name: 'resync', request_id_required: true }, { name: 'pause' }],
    }] }
    g.__api__['/api/v1/automations'] = { success: true, automations: [
      { id: 'b1', type: 'sync2', title: 'Second', public_state: { status: 'failed', last_error: 'boom' } },
    ] }
    ;(api.post as any).mockClear()
    const w2 = mount(Automations)
    await flushPromises()
    await w2.find('[data-testid="row-recover"]').trigger('click')
    await flushPromises()
    expect((api.post as any).mock.calls.some((c: any[]) =>
      c[0] === '/api/v1/automations/b1/actions/resync' &&
      typeof c[1]?.request_id === 'string' && c[1].request_id.length > 0)).toBe(true)
    w2.unmount()
  })

  it('shows the full error cause with a Recover CTA in the detail drawer overview', async () => {
    const w = mount(Automations)
    await flushPromises()
    await w.find('button[aria-label="Open My Sync details"]').trigger('click')
    await flushPromises()
    const card = w.find('[data-testid="drawer-error-card"]')
    expect(card.exists()).toBe(true)
    expect(card.text()).toContain('sink write did not acknowledge item 42')
    expect(w.find('[data-testid="drawer-recover"]').exists()).toBe(true)
    w.unmount()
  })
})
