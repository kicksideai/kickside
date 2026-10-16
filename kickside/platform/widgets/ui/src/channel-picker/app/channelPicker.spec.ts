import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import ChannelPicker from './ChannelPicker.vue'

// A seeded {connection_id, channel_id} (an installed channel responder's stored
// config) arrives before the user ever opens the tree. The roots — and every
// container along the path to the channel — used to load lazily on first open,
// so a seeded selection had nothing to resolve against and the closed trigger
// fell back to printing the raw channel id.

let propsRef: any

function mountWith(props: Record<string, unknown>) {
  propsRef = (globalThis as any).__props_ref__
  propsRef.value = { config: {}, ...props }
  return mount(ChannelPicker)
}

describe('ChannelPicker seeded value resolution', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = { config: {} }
    ;(globalThis as any).__api__ = {}
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
  })

  it('hydrates a preselected channel to its display label without the panel opening', async () => {
    // The more specific key must come first: resp() in test-setup.ts matches on
    // the first url.includes(key) hit, and the discover_resources url contains
    // the plain connections url as a prefix.
    ;(globalThis as any).__api__ = {
      '/api/v1/connections/conn-1/discover_resources': { items: [{ id: 'chan-1', label: '#general', selectable: true }] },
      '/api/v1/connections': { items: [{ id: 'conn-1', label: 'HubSpot Team', reply_provider: true }] },
    }
    const w = mountWith({ value: JSON.stringify({ connection_id: 'conn-1', channel_id: 'chan-1' }) })
    await flushPromises()
    expect(w.find('.cp-value').text()).toBe('#general')
    expect(w.text()).not.toContain('chan-1')
    w.unmount()
  })

  it('never shows the raw id as the primary label when the channel cannot be resolved', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/connections': { items: [{ id: 'conn-1', label: 'HubSpot Team', reply_provider: true }] },
      '/api/v1/connections/conn-1/discover_resources': { items: [{ id: 'chan-other', label: '#other', selectable: true }] },
    }
    const w = mountWith({ value: JSON.stringify({ connection_id: 'conn-1', channel_id: 'chan-missing' }) })
    await flushPromises()
    const primary = w.find('.cp-value').text()
    expect(primary).not.toBe('chan-missing')
    expect(primary.trim().startsWith('chan-missing')).toBe(false)
    w.unmount()
  })

  it('resolves a channel nested inside a container by drilling the same discover calls the interactive tree uses', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url.includes('/connections')) return { data: { items: [{ id: 'conn-1', label: 'Discord', reply_provider: true }] } }
      return { data: { items: [] } }
    })
    vi.mocked(api.post).mockImplementation(async (_url: string, body: any) => {
      if (!body?.parent_id) return { data: { items: [{ id: 'cat-1', label: 'General', selectable: false, drillable: true }] } }
      if (body.parent_id === 'cat-1') return { data: { items: [{ id: 'chan-9', label: '#deep-channel', selectable: true }] } }
      return { data: { items: [] } }
    })
    const w = mountWith({ value: JSON.stringify({ connection_id: 'conn-1', channel_id: 'chan-9' }) })
    await flushPromises()
    expect(w.find('.cp-value').text()).toBe('#deep-channel')
    expect(w.text()).not.toContain('chan-9')
    w.unmount()
  })
})
