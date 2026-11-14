// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const pending = vi.hoisted(() => new Map<string, () => void>())
const loadByTagName = vi.hoisted(() => vi.fn((tag: string) => new Promise<void>((resolve) => {
  pending.set(tag, () => {
    if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
    resolve()
  })
})))
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName }))

import WcMount from './WcMount.vue'

describe('WcMount async registration ownership', () => {
  beforeEach(() => { pending.clear(); loadByTagName.mockClear() })

  it('lets only the latest tag append when registrations resolve out of order', async () => {
    const first = 'wc-race-first'
    const second = 'wc-race-second'
    const wrapper = mount(WcMount, { props: { tag: first } })
    await flushPromises()
    expect(pending.has(first)).toBe(true)

    await wrapper.setProps({ tag: second })
    await flushPromises()
    expect(pending.has(second)).toBe(true)
    pending.get(second)?.(); await flushPromises()
    expect(wrapper.element.querySelectorAll(second)).toHaveLength(1)
    expect(wrapper.element.querySelector(second)?.classList.contains('kx-wcmount-surface')).toBe(true)

    pending.get(first)?.(); await flushPromises()
    expect(wrapper.element.querySelectorAll(first)).toHaveLength(0)
    expect(wrapper.element.querySelectorAll(second)).toHaveLength(1)
    wrapper.unmount()
  })

  it('does not create or append an element after unmount', async () => {
    const tag = 'wc-race-unmounted'
    const create = vi.spyOn(document, 'createElement')
    const wrapper = mount(WcMount, { props: { tag } })
    await flushPromises()
    wrapper.unmount()
    pending.get(tag)?.(); await flushPromises()
    expect(create.mock.calls.some(([name]) => name === tag)).toBe(false)
    create.mockRestore()
  })
})
