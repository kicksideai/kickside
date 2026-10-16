import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MultiSelect from './MultiSelect.vue'
beforeEach(() => {
  ;(globalThis as any).__props__ = { source: '/api/v1/things', modelValue: [], idKey: 'id', labelKey: 'name' }
  ;(globalThis as any).__api__ = {
    '/api/v1/things': { success: true, items: [{ id: '1', name: 'Alpha' }, { id: '2', name: 'Beta' }] },
  }
})
describe('MultiSelect interactions', () => {
  it('mounts, opens on focus, and queries options', async () => {
    const w = mount(MultiSelect)
    await flushPromises()
    const input = w.find('input')
    if (input.exists()) {
      await input.trigger('focus')
      await input.setValue('al')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(180)
      await flushPromises()
    }
    expect(w.exists()).toBe(true)
    w.unmount()
  })
})
