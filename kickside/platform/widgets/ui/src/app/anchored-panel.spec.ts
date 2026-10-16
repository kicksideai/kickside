import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AnchoredPanel from './AnchoredPanel.vue'

describe('AnchoredPanel', () => {
  it('clamps requested width and exposes the actual available height', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 260 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 220 })
    const anchor = document.createElement('button')
    anchor.getBoundingClientRect = () => ({
      left: 230, right: 254, top: 70, bottom: 102, width: 24, height: 32,
      x: 230, y: 70, toJSON: () => ({}),
    }) as DOMRect
    const w = mount(AnchoredPanel, {
      props: { open: true, anchor, width: 320, maxHeight: 340 },
      slots: { default: '<div class="content">Options</div>' },
    })
    await flushPromises()
    const panel = w.find('.anchored-panel')
    expect(panel.attributes('style')).toContain('left: 8px')
    expect(panel.attributes('style')).toContain('width: 244px')
    expect(panel.attributes('style')).toContain('--anchored-panel-available-height: 106px')
    expect(panel.attributes('style')).toContain('z-index: 2000')
    w.unmount()
  })

  it('allows a dialog owner to select its overlay layer', async () => {
    const anchor = document.createElement('button')
    anchor.getBoundingClientRect = () => ({
      left: 20, right: 60, top: 20, bottom: 52, width: 40, height: 32,
      x: 20, y: 20, toJSON: () => ({}),
    }) as DOMRect
    const w = mount(AnchoredPanel, {
      props: { open: true, anchor, zIndex: 2400 },
      slots: { default: '<div>Options</div>' },
    })
    await flushPromises()
    expect(w.find('.anchored-panel').attributes('style')).toContain('z-index: 2400')
    w.unmount()
  })
})
