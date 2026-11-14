import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const get = vi.fn()
const put = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({
  api: { get: (...a: any[]) => get(...a), put: (...a: any[]) => put(...a) },
  host: { toast: vi.fn() },
}))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ({ value: { config: {} } }),
  useEvents: () => vi.fn(),
}))

import Profile from './profile.vue'

const stubs = { Icon: true }

function meWith(status: string) {
  return { data: { success: true, user: { full_name: 'Ann', email: 'ann@x.io', status, created_at: null }, security: { is_admin: false, groups: [] } } }
}

describe('profile.vue', () => {
  beforeEach(() => { get.mockReset(); put.mockReset() })

  it('renders a human status label, not the raw enum', async () => {
    get.mockImplementation(() => Promise.resolve(meWith('suspended')))
    const w = mount(Profile, { global: { stubs } })
    await flushPromises()
    const status = w.find('.kxp-cap')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('Suspended')
    expect(w.html()).not.toContain('>suspended<')
    w.unmount()
  })

  it('maps each account status enum value to a label', async () => {
    for (const [raw, label] of [['active', 'Active'], ['inactive', 'Inactive'], ['pending', 'Pending']]) {
      get.mockImplementation(() => Promise.resolve(meWith(raw)))
      const w = mount(Profile, { global: { stubs } })
      await flushPromises()
      expect(w.find('.kxp-cap').text()).toBe(label)
      w.unmount()
    }
  })
})
