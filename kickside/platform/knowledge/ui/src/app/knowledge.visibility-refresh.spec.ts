import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Knowledge from './knowledge.vue'

describe('Knowledge retained-surface refresh', () => {
  beforeEach(() => {
    ;(globalThis as any).__hostVisibility__.value = false
    ;(globalThis as any).__props__ = { config: {} }
    ;(globalThis as any).__api__ = {}
    ;(api.get as any).mockClear()
  })

  it('reloads the knowledge list and engine catalog after false to true', async () => {
    const callsBefore = (api.get as any).mock.calls.length
    const w = mount(Knowledge)
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

  it('refetches a routed detail on reveal without replacing its engine component or inner route', async () => {
    const tag = 'kx-retained-detail-test'
    if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    ;(globalThis as any).__props__ = { config: {}, route: 'kb-1/node-a' }
    ;(globalThis as any).__api__ = {
      '/knowledge/list': { success: true, items: [{ id: 'kb-1', name: 'Retained KB', kb_type: 'retained' }] },
      '/knowledge/engines': { success: true, engines: [{ kb_type: 'retained', manage_ui_id: tag }] },
      '/knowledge/kb-1': { success: true, id: 'kb-1', name: 'Retained KB', kb_type: 'retained' },
    }

    const w = mount(Knowledge)
    await flushPromises()
    await flushPromises()
    const engine = w.element.querySelector(tag) as HTMLElement | null
    expect(engine).not.toBeNull()
    expect(engine?.getAttribute('config')).toContain('"route":"node-a"')

    ;(api.get as any).mockClear()
    ;(globalThis as any).__hostVisibility__.value = true
    await flushPromises()

    expect((api.get as any).mock.calls.map(([url]: [string]) => url)).toEqual(expect.arrayContaining([
      '/api/v1/knowledge/list',
      '/api/v1/knowledge/engines',
      '/api/v1/knowledge/kb-1',
    ]))
    expect(w.element.querySelector(tag)).toBe(engine)
    expect(engine?.getAttribute('config')).toContain('"route":"node-a"')
    ;(globalThis as any).__hostVisibility__.value = false
    w.unmount()
  })
})
