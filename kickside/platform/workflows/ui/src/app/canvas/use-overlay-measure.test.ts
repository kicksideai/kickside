// @vitest-environment happy-dom
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useOverlayMeasure, type OverlayMeasure } from './use-overlay-measure'

let resizeCallback: (() => void) | null = null
const disconnect = vi.fn()

class FakeResizeObserver {
  constructor(callback: () => void) { resizeCallback = callback }
  observe() {}
  disconnect() { disconnect() }
}

afterEach(() => {
  vi.restoreAllMocks()
  resizeCallback = null
  disconnect.mockReset()
})

describe('useOverlayMeasure', () => {
  it('reports the mounted footprint, then reports dynamic content growth and disconnects', async () => {
    let size = { width: 300, height: 120 }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0, y: 0, left: 0, top: 0, right: size.width, bottom: size.height,
      width: size.width, height: size.height, toJSON: () => ({}),
    }) as DOMRect)
    const measures: OverlayMeasure[] = []
    const Harness = defineComponent({
      setup() { return useOverlayMeasure((measure) => measures.push(measure)) },
      template: '<div ref="overlayEl"><slot /></div>',
    })
    const wrapper = mount(Harness)
    await nextTick()
    await nextTick()
    expect(measures[measures.length - 1]).toEqual({ width: 300, height: 120 })

    size = { width: 300, height: 340 }
    resizeCallback?.()
    expect(measures[measures.length - 1]).toEqual({ width: 300, height: 340 })

    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
    vi.unstubAllGlobals()
  })
})
