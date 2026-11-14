import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

let refresh: (() => unknown) | undefined
let visible: boolean | null = null
async function setVisible(next: boolean) {
  const previous = visible
  visible = next
  if (previous === false && next === true) await refresh?.()
}
const { get } = vi.hoisted(() => ({ get: vi.fn(() => Promise.resolve({ data: { scopes: [], policies: [] } })) }))

vi.mock('@wippy-fe/proxy', () => ({ api: { get, post: vi.fn(), put: vi.fn(), delete: vi.fn() }, host: { toast: vi.fn(), confirm: vi.fn() } }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useHostVisibilityRefresh: (callback: () => unknown) => {
    refresh = callback
    void callback()
    return { value: visible }
  },
}))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))

import Security from './Security.vue'

describe('Security retained visibility', () => {
  it('reloads on reveal without remounting', async () => {
    visible = null
    get.mockClear()
    const wrapper = mount(Security)
    await flushPromises()
    const root = wrapper.element
    expect(get).toHaveBeenCalledTimes(2)
    await setVisible(true)
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(2)
    await setVisible(false)
    await setVisible(true)
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(4)
    expect(wrapper.element).toBe(root)
    wrapper.unmount()
  })
})
