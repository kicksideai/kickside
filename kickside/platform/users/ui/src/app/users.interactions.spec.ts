import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const get = vi.fn()
const post = vi.fn()
const put = vi.fn()
const del = vi.fn()
const confirm = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({
  api: {
    get: (...a: any[]) => get(...a),
    post: (...a: any[]) => post(...a),
    put: (...a: any[]) => put(...a),
    delete: (...a: any[]) => del(...a),
  },
  host: { toast: vi.fn(), confirm: (...a: any[]) => confirm(...a) },
}))
vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useHostVisibilityRefresh: (callback: () => unknown) => callback(),
}))

import Users from './users.vue'

const roles = [
  { id: 'app.security:admin', label: 'Admin', built_in: true },
  { id: 'app.security:user', label: 'User', built_in: true },
  { id: 'app.security:support', label: 'Support', built_in: false },
]

function seed(users: any[]) {
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

beforeEach(() => {
  get.mockReset(); post.mockReset(); put.mockReset(); del.mockReset(); confirm.mockReset()
  confirm.mockResolvedValue(true)
  seed([{ user_id: 'u1', email: 'ann@x.io', full_name: 'Ann', status: 'active', security_groups: [] }])
})

const stubs = { Icon: true }

describe('users.vue create/edit/delete', () => {
  it('creates a user', async () => {
    const w = mount(Users, { global: { stubs } })
    await flushPromises()
    await w.find('.ku-btn-primary').trigger('click')        // open create
    await flushPromises()
    const inputs = w.findAll('.ku-form input')
    if (inputs[0]) await inputs[0].setValue('new@x.io')
    if (inputs[1]) await inputs[1].setValue('Newbie')
    if (inputs[2]) await inputs[2].setValue('password123')
    const submit = w.findAll('.ku-btn-primary').slice(-1)[0]
    if (submit) { await submit.trigger('click'); await flushPromises() }
    expect(post).toHaveBeenCalledWith('/api/v1/users', {
      email: 'new@x.io',
      full_name: 'Newbie',
      password: 'password123',
    })
    expect(put).not.toHaveBeenCalled()
    w.unmount()
  })
  it('preserves explicit group choices and an explicitly empty assignment', async () => {
    const w = mount(Users, { global: { stubs } })
    await flushPromises()
    await w.get('.ku-btn-primary').trigger('click')
    await flushPromises()
    await w.get('input[placeholder="user@example.com"]').setValue('scoped@x.io')
    await w.get('input[placeholder="Jane Doe"]').setValue('Scoped')
    await w.get('input[placeholder="Minimum 8 characters"]').setValue('password123')
    await w.get('input[aria-label="Use default membership"]').setValue(false)
    await w.get('input[type="checkbox"][value="app.security:support"]').setValue(true)
    await w.get('.ku-form').trigger('submit')
    await flushPromises()
    expect(post).toHaveBeenLastCalledWith('/api/v1/users', {
      email: 'scoped@x.io', full_name: 'Scoped', password: 'password123', groups: ['app.security:support'],
    })
    await w.get('.ku-btn-primary').trigger('click')
    await flushPromises()
    await w.get('input[placeholder="user@example.com"]').setValue('empty@x.io')
    await w.get('input[placeholder="Jane Doe"]').setValue('Empty')
    await w.get('input[placeholder="Minimum 8 characters"]').setValue('password123')
    await w.get('input[aria-label="Use default membership"]').setValue(false)
    await w.get('.ku-form').trigger('submit')
    await flushPromises()
    expect(post).toHaveBeenLastCalledWith('/api/v1/users', {
      email: 'empty@x.io', full_name: 'Empty', password: 'password123', groups: [],
    })
    w.unmount()
  })
  it('edits and deletes a user', async () => {
    const w = mount(Users, { global: { stubs } })
    await flushPromises()
    await w.find('[aria-label^=Edit]').trigger('click')
    await flushPromises()
    const save = w.findAll('.ku-btn-primary').slice(-1)[0]
    if (save) { await save.trigger('click'); await flushPromises() }
    expect(put).toHaveBeenCalledTimes(1)
    expect(put).toHaveBeenCalledWith('/api/v1/users/u1', expect.objectContaining({ groups: [] }))
    // Delete now routes through host.confirm (rendered in the host layer); a
    // confirmed prompt drives the delete call.
    await w.find('[aria-label^=Delete]').trigger('click')
    await flushPromises()
    expect(confirm).toHaveBeenCalled()
    expect(del).toHaveBeenCalledWith('/api/v1/users/u1')
    w.unmount()
  })
})
