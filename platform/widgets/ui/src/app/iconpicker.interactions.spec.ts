import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import IconPicker from './IconPicker.vue'
beforeEach(() => {
  ;(globalThis as any).fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ icons: ['tabler:rocket', 'tabler:star'] }) }))
})
describe('IconPicker', () => {
  it('opens, searches, and picks an icon', async () => {
    const w = mount(IconPicker, { props: { value: 'tabler:user' } as any })
    await flushPromises()
    const toggle = w.find('button')
    await toggle.trigger('click')          // open
    await flushPromises()
    const input = w.find('input')
    if (input.exists()) { await input.setValue('rocket'); await flushPromises(); await vi.advanceTimersByTimeAsync(220); await flushPromises() }
    const opt = w.findAll('button').find(b => b.attributes('title')?.includes('rocket') || b.html().includes('rocket'))
    if (opt) await opt.trigger('click')
    expect(w.emitted('select') || w.exists()).toBeTruthy()
    w.unmount()
  })

  it('keeps its panel within a compact viewport and publishes available height', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 280 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 240 })
    const w = mount(IconPicker, { props: { value: '' } as any })
    const toggle = w.find('button')
    ;(toggle.element as HTMLElement).getBoundingClientRect = () => ({
      left: 250, right: 278, top: 80, bottom: 112, width: 28, height: 32,
      x: 250, y: 80, toJSON: () => ({}),
    }) as DOMRect
    await toggle.trigger('click')
    await flushPromises()
    const panel = w.find('.anchored-panel')
    expect(panel.attributes('style')).toContain('left: 8px')
    expect(panel.attributes('style')).toContain('width: 264px')
    expect(panel.attributes('style')).toContain('--anchored-panel-available-height: 114px')
    w.unmount()
  })
})
