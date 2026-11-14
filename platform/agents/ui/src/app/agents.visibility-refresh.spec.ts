import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Agents from './agents.vue'

describe('Agents retained-surface refresh', () => {
  it('reloads the list and editor catalogs after false to true without remounting', async () => {
    const callsBefore = (api.get as any).mock.calls.length
    const w = mount(Agents)
    await flushPromises()
    const root = w.element
    const search = w.get('input[placeholder="Search agents…"]')
    await search.setValue('draft')
    expect((api.get as any).mock.calls.length - callsBefore).toBe(4)
    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()
    expect((api.get as any).mock.calls.length - callsBefore).toBe(8)
    expect(w.element).toBe(root)
    expect((search.element as HTMLInputElement).value).toBe('draft')
    ;(globalThis as any).__hostVisibility__.value = false
    w.unmount()
  })
})
