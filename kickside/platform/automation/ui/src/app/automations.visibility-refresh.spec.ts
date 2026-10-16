import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Automations from './automations.vue'

describe('Automations retained-surface refresh', () => {
  it('reloads the type catalog and the automation projection after false to true', async () => {
    const callsBefore = (api.get as any).mock.calls.length
    const w = mount(Automations)
    await flushPromises()
    const root = w.element
    expect((api.get as any).mock.calls.length - callsBefore).toBe(2)
    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()
    expect((api.get as any).mock.calls.length - callsBefore).toBe(4)
    expect(w.element).toBe(root)
    ;(globalThis as any).__hostVisibility__.value = false
    w.unmount()
  })
})
