// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ContextMenu from './ContextMenu.vue'

afterEach(() => vi.restoreAllMocks())
describe('owned menu placement', () => {
  it('keeps a corner menu inside its rendered containing block', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('rm-ctx-overlay')) return { x: 224, y: 44, left: 224, top: 44, right: 900, bottom: 800, width: 676, height: 756 } as DOMRect
      return { x: 0, y: 0, left: 0, top: 0, right: 190, bottom: 220, width: 190, height: 220 } as DOMRect
    })
    const action = vi.fn()
    const view = mount(ContextMenu, { props: { x: 890, y: 790, items: [{ label: 'Northwind action', action }] } })
    await flushPromises()
    const panel = view.get('.rm-ctx').element as HTMLElement
    expect(panel.style.left).toBe('486px')
    expect(panel.style.top).toBe('536px')
    await view.get('button').trigger('click')
    expect(action).toHaveBeenCalledOnce()
    expect(view.emitted('close')).toHaveLength(1)
    view.unmount()
  })
})
