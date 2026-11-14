// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadByTagName = vi.hoisted(() => vi.fn(async (tag: string) => {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
}))
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName }))

import WcMount from './WcMount.vue'

describe('WcMount attribute contract', () => {
  beforeEach(() => { loadByTagName.mockClear() })

  it('writes the config prop to the config attribute only, never to value', async () => {
    const tag = 'wc-attrs-config-only'
    const wrapper = mount(WcMount, { props: { tag, config: { foo: 'bar' } } })
    await flushPromises()

    const el = wrapper.element.querySelector(tag)!
    expect(el.getAttribute('config')).toBe(JSON.stringify({ foo: 'bar' }))
    expect(el.hasAttribute('value')).toBe(false)
  })

  it('leaves a consumer-supplied value attribute untouched across config re-renders', async () => {
    const tag = 'wc-attrs-explicit-value'
    const wrapper = mount(WcMount, {
      props: { tag, config: '', attrs: { value: 'seeded' } },
    })
    await flushPromises()

    const el = wrapper.element.querySelector(tag)!
    expect(el.getAttribute('value')).toBe('seeded')

    // A config prop change (e.g. a sibling field edit) must not perturb the
    // consumer-owned value attribute -- no oscillation between '' and the seed.
    await wrapper.setProps({ config: { unrelated: true } })
    await flushPromises()
    expect(el.getAttribute('value')).toBe('seeded')
    expect(el.getAttribute('config')).toBe(JSON.stringify({ unrelated: true }))
  })

  it('removes the value attribute when the consumer stops supplying it', async () => {
    const tag = 'wc-attrs-value-removal'
    const wrapper = mount(WcMount, {
      props: { tag, attrs: { value: 'seeded' } },
    })
    await flushPromises()
    const el = wrapper.element.querySelector(tag)!
    expect(el.getAttribute('value')).toBe('seeded')

    await wrapper.setProps({ attrs: { value: null } })
    await flushPromises()
    expect(el.hasAttribute('value')).toBe(false)
  })
  it("forwards only the mounted element's own change events, never a nested child's", async () => {
    const tag = 'wc-attrs-nested-change'
    const wrapper = mount(WcMount, { props: { tag } })
    await flushPromises()
    const el = wrapper.element.querySelector(tag)!

    const child = document.createElement('wc-attrs-nested-inner')
    el.appendChild(child)
    child.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { id: 'picker-row' } }))
    await flushPromises()
    expect(wrapper.emitted('change')).toBeUndefined()

    const escaped: Event[] = []
    wrapper.element.addEventListener('change', (e: Event) => escaped.push(e))
    el.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { spec: { v: 1 }, valid: true } }))
    await flushPromises()
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('change')![0][0]).toEqual({ spec: { v: 1 }, valid: true })
    // Consumed reports stop at the mount: shadow retargeting would otherwise
    // replay them into every ancestor mount as that ancestor's own report.
    expect(escaped).toHaveLength(0)
  })
  it.each(['change', 'config-changed', 'created', 'close', 'error'])(
    'ignores a shadow child’s composed %s even when target is retargeted to the mounted element',
    async (eventName) => {
      const tag = `wc-attrs-shadow-${eventName}`
      const wrapper = mount(WcMount, { props: { tag } })
      await flushPromises()
      const el = wrapper.element.querySelector(tag)!
      const shadow = el.attachShadow({ mode: 'open' })
      const child = document.createElement('wc-attrs-shadow-inner')
      shadow.appendChild(child)
      const nested = new CustomEvent(eventName, {
        bubbles: true, composed: true, detail: { selected: ['kb-id'], labels: ['KB'] },
      })
      // happy-dom preserves the origin as target across an open shadow root;
      // browsers retarget it to the host. Model that browser behavior while
      // keeping the real composed path produced by the shadow dispatch.
      Object.defineProperty(nested, 'target', { get: () => el })
      let observedTarget: EventTarget | null = null
      el.addEventListener(eventName, (e: Event) => { observedTarget = e.target })
      child.dispatchEvent(nested)
      await flushPromises()
      expect(observedTarget).toBe(el)
      const emitted = eventName === 'config-changed' ? 'change' : eventName
      expect(wrapper.emitted(emitted)).toBeUndefined()

      const detail = { kb_ids: ['kb-id'] }
      el.dispatchEvent(new CustomEvent(eventName, { bubbles: true, composed: true, detail }))
      await flushPromises()
      expect(wrapper.emitted(emitted)).toEqual([[detail]])
      wrapper.unmount()
    },
  )
})
