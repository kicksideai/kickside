// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import WcMount from './WcMount.vue'
vi.mock('@wippy-fe/proxy', () => ({ loadByTagName: vi.fn(async () => {}) }))
customElements.define('wc-select-test', class extends HTMLElement {})
it('forwards only the mounted element selection and consumes the DOM event', async () => {
  const parent = document.createElement('div')
  const escaped = vi.fn()
  parent.addEventListener('select', escaped)
  const selected = vi.fn()
  const wrapper = mount(WcMount, { props: { tag: 'wc-select-test', onSelect: selected }, attachTo: parent })
  await flushPromises()
  const picker = wrapper.get('wc-select-test').element
  const inner = document.createElement('span')
  picker.append(inner)
  inner.dispatchEvent(new CustomEvent('select', { detail: 'nested', bubbles: true }))
  expect(wrapper.emitted('select')).toBeUndefined()
  expect(escaped).toHaveBeenCalledTimes(1)
  escaped.mockClear()
  picker.dispatchEvent(new CustomEvent('select', { detail: 'class:fast', bubbles: true, composed: true }))
  expect(wrapper.emitted('select')).toEqual([['class:fast']])
  expect(escaped).not.toHaveBeenCalled()
  wrapper.unmount()
  picker.dispatchEvent(new CustomEvent('select', { detail: 'detached' }))
  expect(selected).toHaveBeenCalledExactlyOnceWith('class:fast')
})
