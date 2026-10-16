import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const get = vi.fn()
const post = vi.fn()
const put = vi.fn()
const del = vi.fn()
let refresh: (() => unknown) | undefined
let visible: boolean | null = null
async function setVisible(next: boolean) {
  const previous = visible
  visible = next
  if (previous === false && next === true) await refresh?.()
}
vi.mock('@wippy-fe/proxy', () => ({
  api: {
    get: (...a: any[]) => get(...a),
    post: (...a: any[]) => post(...a),
    put: (...a: any[]) => put(...a),
    delete: (...a: any[]) => del(...a),
  },
  host: { toast: vi.fn(), confirm: vi.fn() },
}))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useHostVisibilityRefresh: (callback: () => unknown) => {
    refresh = callback
    void callback()
    return { value: visible }
  },
}))

import Users from './users.vue'

const roles = [
  { id: 'app.security:admin', label: 'Admin', built_in: true },
  { id: 'app.security:user', label: 'User', built_in: true },
  { id: 'app.security:support', label: 'Support', built_in: false },
]

function seed(users: any[] = []) {
  get.mockImplementation((url: string) => {
    if (url === '/api/v1/users/assignable-scopes') {
      return Promise.resolve({ data: { success: true, scopes: roles } })
    }
    return Promise.resolve({ data: { success: true, users } })
  })
  post.mockImplementation(() => Promise.resolve({ data: { success: true, user: { user_id: 'new' } } }))
  put.mockImplementation(() => Promise.resolve({ data: { success: true } }))
  del.mockImplementation(() => Promise.resolve({ data: { success: true } }))
}

const stubs = { Icon: true }

describe('users.vue (mounted)', () => {
  beforeEach(() => { get.mockReset(); post.mockReset(); put.mockReset(); del.mockReset(); visible = null })

  it('renders the empty state when there are no users', async () => {
    seed([])
    const w = mount(Users, { global: { stubs } })
    await flushPromises()
    expect(w.find('.ku-empty').exists()).toBe(true)
    expect(w.html()).toContain('No users yet')
    w.unmount()
  })

  it('lists users returned by the api', async () => {
    seed([
      { user_id: 'u1', email: 'ann@x.io', full_name: 'Ann', status: 'active', security_groups: [] },
      { user_id: 'u2', email: 'bo@x.io', full_name: 'Bo', status: 'active', security_groups: [] },
    ])
    const w = mount(Users, { global: { stubs } })
    await flushPromises()
    expect(w.findAll('.ku-row')).toHaveLength(2)
    expect(w.html()).toContain('ann@x.io')
    w.unmount()
  })

  it('opens the create-user dialog', async () => {
    seed([])
    const w = mount(Users, { global: { stubs } })
    await flushPromises()
    await w.find('.ku-btn-primary').trigger('click')
    await flushPromises()
    expect(w.find('.ku-form').exists()).toBe(true)
    expect(w.get<HTMLInputElement>('input[aria-label="Use default membership"]').element.checked).toBe(true)
    await w.get('input[aria-label="Use default membership"]').setValue(false)
    expect(w.html()).toContain('Support')
    w.unmount()
  })

  it('reloads roles and users when a retained surface becomes visible without remounting', async () => {
    seed([])
    const w = mount(Users, { global: { stubs } })
    await flushPromises()
    const root = w.element
    expect(get).toHaveBeenCalledTimes(2)

    await setVisible(true)
    await flushPromises()
    expect(get).toHaveBeenCalledTimes(2)
    await setVisible(false)
    await setVisible(true)
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(4)
    expect(w.element).toBe(root)
    w.unmount()
  })

  it('surfaces a roles error and fabricates no roles when the scopes api fails', async () => {
    get.mockImplementation((url: string) => {
      if (url === '/api/v1/users/assignable-scopes') return Promise.reject(new Error('scopes unavailable'))
      return Promise.resolve({ data: { success: true, users: [] } })
    })
    const w = mount(Users, { global: { stubs } })
    await flushPromises()
    expect(w.html()).toContain('scopes unavailable')
    await w.find('.ku-btn-primary').trigger('click')
    await flushPromises()
    // No fabricated built-in roles leak into the group picker.
    expect(w.findAll('input[type="checkbox"][value]')).toHaveLength(0)
    expect(w.html()).not.toContain('app.security:admin')
    w.unmount()
  })
})
