// @vitest-environment happy-dom
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useResponsiveRails } from './use-responsive-rails'

describe('useResponsiveRails canvas action settlement', () => {
  const frames: FrameRequestCallback[] = []

  beforeEach(() => {
    frames.length = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    })
    vi.stubGlobal('ResizeObserver', class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback([{ contentRect: { width: 980 } } as ResizeObserverEntry], this as unknown as ResizeObserver)
      }
      disconnect() {}
      unobserve() {}
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  async function nextFrame() {
    const callback = frames.shift()
    expect(callback).toBeTypeOf('function')
    callback?.(0)
    await Promise.resolve()
  }

  it('closes a compact palette, waits two frames, and fits the full readable canvas', async () => {
    const reframe = vi.fn()
    const Harness = defineComponent({
      template: '<div ref="rootEl" />',
      setup() {
        const rootEl = ref<HTMLElement | null>(null)
        const panelOpen = ref(false)
        const paletteOpen = ref(true)
        const hasSelection = ref(false)
        const viewingRun = ref<unknown | null>(null)
        return { rootEl, paletteOpen, ...useResponsiveRails({ rootEl, panelOpen, paletteOpen, hasSelection, viewingRun, reframe }) }
      },
    })
    const wrapper = mount(Harness)
    await nextTick()
    expect((wrapper.vm as unknown as { compact: boolean }).compact).toBe(true)
    expect((wrapper.vm as unknown as { narrow: boolean }).narrow).toBe(false)

    let settled = false
    const action = (wrapper.vm as unknown as { prepareCanvasAction: () => Promise<boolean> }).prepareCanvasAction()
      .then((closed) => { expect(closed).toBe(true); settled = true })
    await nextTick()
    expect((wrapper.vm as unknown as { paletteOpen: boolean }).paletteOpen).toBe(false)
    expect(settled).toBe(false)
    expect(reframe).not.toHaveBeenCalled()
    await nextFrame()
    expect(settled).toBe(false)
    await nextFrame()
    await action
    expect(settled).toBe(true)
    expect(reframe).not.toHaveBeenCalled()
  })
})
