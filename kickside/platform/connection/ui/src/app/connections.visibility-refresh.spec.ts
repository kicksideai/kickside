import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Connections from './connections.vue'

describe('Connections retained-surface refresh', () => {
  it('reloads connections and both provider catalogs after false to true without remounting', async () => {
    const callsBefore = (api.get as any).mock.calls.length
    const w = mount(Connections)
    await flushPromises()
    const root = w.element
    expect((api.get as any).mock.calls.length - callsBefore).toBe(3)
    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()
    expect((api.get as any).mock.calls.length - callsBefore).toBe(6)
    expect(w.element).toBe(root)
    ;(globalThis as any).__hostVisibility__.value = false
    w.unmount()
  })
})
