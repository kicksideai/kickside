import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import type { ComponentMetaEvent } from '@widgets/app/componentRealtime'
import Automations from './automations.vue'

const subscriptions = vi.hoisted(() => new Map<string, (event: ComponentMetaEvent) => void>())
vi.mock('@widgets/app/componentRealtime', () => ({
  subscribeComponentMeta: (id: string, cb: (event: ComponentMetaEvent) => void) => {
    subscriptions.set(id, cb)
    return () => subscriptions.delete(id)
  },
}))
const kind = { id: 'fixture:kind', title: 'Fixture', actions: [{ name: 'status' }, { name: 'pause' }, { name: 'resume' }] }
const active = { drives: [{ drive_key: 'main', source_kind: 'event', phase: 'active', enabled: true }] }
const paused = { drives: [{ drive_key: 'main', source_kind: 'event', phase: 'paused', enabled: false }] }
function event(): ComponentMetaEvent {
  return { event: 'component.meta.changed', component_id: 'a1', meta: { title: 'Live receipt review' }, deleted: [] }
}

describe('automation realtime drive status', () => {
  beforeEach(() => {
    subscriptions.clear()
    vi.stubGlobal('__props__', { config: {} })
    vi.stubGlobal('__api__', {
      '/automations/types': { success: true, types: [kind] },
      '/automations/a1/status': { success: true, ...paused },
      '/api/v1/automations': { success: true, automations: [{ id: 'a1', type: kind.id, title: 'Receipt review', drive_status: active }] },
    })
  })

  it('leaves Starting when a committed round sends a component wakeup without meta edits', async () => {
    vi.stubGlobal('__api__', {
      '/automations/types': { success: true, types: [kind] },
      '/automations/a1/status': { success: true, ...active, delivery_failures: { count: 0 } },
      '/api/v1/automations': { success: true, automations: [{ id: 'a1', type: kind.id,
        title: 'Receipt review', drive_status: { drives: [{ ...active.drives[0], phase: 'pending' }] } }] },
    })
    const w = mount(Automations)
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Starting')
    const notify = subscriptions.get('a1')
    if (!notify) throw new Error('automation has no realtime subscription')
    notify({ event: 'component.meta.changed', component_id: 'a1', meta: {}, deleted: [] })
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Active')
    expect(w.text()).toContain('Receipt review')
    w.unmount()
  })

  it('keeps the newest status when realtime reads complete out of order', async () => {
    const w = mount(Automations)
    await flushPromises()
    const notify = subscriptions.get('a1')
    if (!notify) throw new Error('automation has no realtime subscription')
    let resolveFirst: (value: { data: unknown }) => void = () => { throw new Error('first read was not started') }
    const first = new Promise<{ data: unknown }>(resolve => { resolveFirst = resolve })
    const response = (data: unknown): { data: unknown } => ({ data })
    vi.mocked(api.get).mockImplementationOnce(() => first)
      .mockResolvedValueOnce(response({ success: true, ...paused }))
    notify(event())
    notify(event())
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Paused')
    resolveFirst(response({ success: true, ...active }))
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Paused')
    w.unmount()
  })

  it('refreshes the drive pill and open drawer when a component event arrives', async () => {
    const w = mount(Automations)
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Active')
    const notify = subscriptions.get('a1')
    if (!notify) throw new Error('automation has no realtime subscription')
    notify(event())
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Paused')
    expect(w.find('button[aria-label="Resume Live receipt review"]').exists()).toBe(true)
    await w.get('button[aria-label="Open Live receipt review details"]').trigger('click')
    await flushPromises()
    expect(w.get('[data-testid="detail-drawer"] .kx-badge').text()).toBe('Paused')
    w.unmount()
    expect(subscriptions.size).toBe(0)
  })
})
