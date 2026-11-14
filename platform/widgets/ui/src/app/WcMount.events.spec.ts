// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: vi.fn(() => Promise.resolve()) }))

import WcMount from './WcMount.vue'

const TAG = 'wc-events-panel'
if (!customElements.get(TAG)) customElements.define(TAG, class extends HTMLElement {})

// A mounted panel's lifecycle events are its contract with the mounting form: WcMount
// consumes them and re-emits them, so a nested panel's `error` or `close` never
// escapes into an ancestor host and reads as that host's own report.
describe('WcMount mounted-element events', () => {
  for (const name of ['error', 'close', 'created'] as const) {
    it(`forwards ${name} and stops it at the mount`, async () => {
      const outer = document.createElement('div')
      document.body.appendChild(outer)
      const escaped = vi.fn()
      outer.addEventListener(name, escaped)
      const wrapper = mount(WcMount, { props: { tag: TAG }, attachTo: outer })
      await flushPromises()
      const el = wrapper.element.querySelector(TAG) as HTMLElement
      el.dispatchEvent(new CustomEvent(name, { detail: { message: 'x' }, bubbles: true, composed: true }))
      expect(wrapper.emitted(name)?.[0]).toEqual([{ message: 'x' }])
      expect(escaped).not.toHaveBeenCalled()
      wrapper.unmount()
      outer.remove()
    })
  }

  it('ignores a nested element\'s bubbling lifecycle event', async () => {
    const wrapper = mount(WcMount, { props: { tag: TAG } })
    await flushPromises()
    const el = wrapper.element.querySelector(TAG) as HTMLElement
    const inner = document.createElement('span')
    el.appendChild(inner)
    inner.dispatchEvent(new CustomEvent('close', { detail: {}, bubbles: true }))
    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })
})
