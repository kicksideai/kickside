import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import JournalContextMenu from './JournalContextMenu.vue'
vi.mock('@iconify/vue', () => ({ Icon: { render: () => h('i') } }))
afterEach(() => vi.restoreAllMocks())
describe('journal menu placement', () => {
  it('measures the containing block and menu before placing a corner action', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
      if (this.classList.contains('jr-context-overlay')) return { left: 224, top: 44, width: 676, height: 756 } as DOMRect
      return { width: 190, height: 220 } as DOMRect
    })
    const view = mount(JournalContextMenu, { props: { x: 890, y: 790 } })
    await flushPromises()
    const panel = view.get('.jr-context-menu').element as HTMLElement
    expect(panel.style.left).toBe('486px')
    expect(panel.style.top).toBe('536px')
    await view.get('button').trigger('click')
    expect(view.emitted('details')).toHaveLength(1)
    view.unmount()
  })
})

describe('journal menu keyboard', () => {
  it('dismisses with Escape without passing the key to the host', async () => {
    const view = mount(JournalContextMenu, { props: { x: 300, y: 100 } })
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    view.get('.jr-context-menu').element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(view.emitted('close')).toHaveLength(1)
    view.unmount()
  })
})
