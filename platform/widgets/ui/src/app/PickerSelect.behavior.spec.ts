import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import PickerSelect from './PickerSelect.vue'

const items = [
  { id: 'a', title: 'Alpha', subtitle: 'First origin', group: 'Channels' },
  { id: 'b', title: 'Beta', subtitle: 'Second origin', group: 'Knowledge' },
]
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks() })

async function open() {
  const w = mount(PickerSelect, { props: { items, modelValue: 'a' },
    global: { plugins: [PrimeVue] }, attachTo: document.body })
  await w.get('[role="combobox"]').trigger('click')
  await flushPromises()
  return w
}

describe('catalog picker', () => {
  it('BOT-RUN-AS-CANDIDATES requests remote searches and pages without applying a second local filter', async () => {
    const w = mount(PickerSelect, { props: { items, modelValue: 'a', remote: true, more: true },
      global: { plugins: [PrimeVue] }, attachTo: document.body })
    await w.get('[role="combobox"]').trigger('click')
    await flushPromises()
    expect(w.emitted('search')).toEqual([['']])
    const search = document.querySelector<HTMLInputElement>('input')!
    search.value = 'server query'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await flushPromises()
    expect(w.emitted('search')?.at(-1)).toEqual(['server query'])
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(2)
    await w.get('button[data-testid="picker-more"]').trigger('click')
    expect(w.emitted('more')).toHaveLength(1)
    await w.setProps({ loading: true })
    expect(w.get('button[data-testid="picker-more"]').attributes('disabled')).toBeDefined()
    await w.setProps({ error: 'Catalog unavailable' })
    expect(w.get('[role="alert"]').text()).toBe('Catalog unavailable')
    w.unmount()
  })

  it('counts only selectable rows as options and keeps keyboard filtering and selection', async () => {
    const w = await open()
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(2)
    const search = document.querySelector<HTMLInputElement>('input')!
    search.value = 'Second origin'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await flushPromises()
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(1)
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    expect(w.emitted('update:modelValue')).toEqual([['b']])
    expect(w.get('[role="combobox"]').attributes('aria-expanded')).toBe('false')
    w.unmount()
  })

  it('places a bottom-edge catalog within the viewport', async () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 })
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1216 })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const trigger = this.getAttribute('role') === 'combobox'
      return { left: trigger ? 507 : 0, right: trigger ? 1028 : 521,
        top: trigger ? 644 : 0, bottom: trigger ? 679 : 340,
        width: 521, height: trigger ? 35 : 340, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
    })
    const w = await open()
    const list = document.querySelector('[role="listbox"]')!
    const placed = list.closest<HTMLElement>('[style]')!
    expect(placed.style.position).toBe('fixed')
    expect(Number.parseFloat(placed.style.top)).toBeLessThan(644)
    expect(Number.parseFloat(placed.style.maxHeight)).toBeLessThanOrEqual(900)
    w.unmount()
  })
})
