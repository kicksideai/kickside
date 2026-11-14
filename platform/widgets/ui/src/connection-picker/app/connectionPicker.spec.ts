import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import ConnectionPicker from './ConnectionPicker.vue'

// A seeded value (an installed automation's stored config, or any other preset)
// arrives before the user ever opens the panel. The list used to load lazily on
// first open, so a seeded id had nothing to resolve against and the closed
// trigger fell back to printing the raw connection id.

let propsRef: any

function mountWith(props: Record<string, unknown>) {
  propsRef = (globalThis as any).__props_ref__
  propsRef.value = { config: {}, ...props }
  return mount(ConnectionPicker)
}

describe('ConnectionPicker seeded value resolution', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = { config: {} }
    ;(globalThis as any).__api__ = {}
    vi.mocked(api.get).mockClear()
  })

  it('hydrates a preselected connection to its display label without the panel opening', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/connections': {
        items: [{ id: '019f9ab4-a0e2-7d9f-9ea7-315cea45c36a', label: 'HubSpot — Sales', icon: 'tabler:plug-connected', provider: 'hubspot', reply_provider: false }],
      },
    }
    const w = mountWith({
      value: JSON.stringify({ connection_id: '019f9ab4-a0e2-7d9f-9ea7-315cea45c36a' }),
      replyOnly: 'false',
    })
    await flushPromises()
    expect(w.find('.cn-val-label').text()).toBe('HubSpot — Sales')
    expect(w.text()).not.toContain('019f9ab4-a0e2-7d9f-9ea7-315cea45c36a')
    w.unmount()
  })

  it('never shows the raw id as the primary label when the connection cannot be resolved', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/connections': { items: [{ id: 'other-conn', label: 'Some other connection', icon: 'tabler:plug-connected', provider: 'hubspot', reply_provider: false }] },
    }
    const w = mountWith({
      value: JSON.stringify({ connection_id: 'missing-conn-9' }),
      label: 'HubSpot connection',
      replyOnly: 'false',
    })
    await flushPromises()
    expect(w.find('.cn-val-label').text()).not.toBe('missing-conn-9')
    // The id may still surface as a secondary detail, never as the primary label text.
    const primary = w.find('.cn-val-label')
    expect(primary.text().trim().startsWith('missing-conn-9')).toBe(false)
    w.unmount()
  })

  it('scopes the fetch to a single declared provider without needing the plural list', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/connections': { items: [{ id: 'c1', label: 'HubSpot main', icon: 'tabler:plug-connected', provider: 'hubspot', reply_provider: false }] },
    }
    const w = mountWith({ provider: 'hubspot', replyOnly: 'false' })
    w.findComponent({ name: 'Select' }).vm.$emit('before-show')
    await flushPromises()
    expect((api.get as any).mock.calls.some((c: unknown[]) => String(c[0]).includes('provider=hubspot'))).toBe(true)
    w.unmount()
  })
})
