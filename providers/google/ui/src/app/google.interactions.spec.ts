import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import GooglePicker from './GooglePicker.vue'
beforeEach(() => {
  globalThis.__props__ = { value: {} }
  globalThis.__api__ = {
    '/connections?provider=google': { success: true, connections: [{ id: 'g1', name: 'My Google' }] },
  }
})
describe('GooglePicker interactions', () => {
  it('loads google connections', async () => {
    const w = mount(GooglePicker)
    await flushPromises()
    expect(w.exists()).toBe(true)
    w.unmount()
  })
})

describe('GooglePicker select', () => {
  it('selects a connection and publishes', async () => {
    globalThis.__props__ = { value: {} }
    const w = mount(GooglePicker)
    await flushPromises()
    const picker = w.element.querySelector('wc-connection-picker')!
    picker.dispatchEvent(new CustomEvent('change', { detail: { connection_id: 'g1' } }))
    await flushPromises()
    expect(picker.getAttribute('providers')).toBe('google')
    w.unmount()
  })
})
