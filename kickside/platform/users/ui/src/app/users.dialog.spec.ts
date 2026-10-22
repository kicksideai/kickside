import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Dialog from 'primevue/dialog'

const get = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get: (...args: unknown[]) => get(...args) }, host: {} }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (callback: () => unknown) => callback() }))
import Users from './users.vue'

beforeEach(() => {
  get.mockImplementation((url: string) => Promise.resolve({ data: url.endsWith('assignable-scopes')
    ? { success: true, scopes: [] }
    : { success: true, users: [{ user_id: 'account', full_name: 'Test account', email: 'account@example.test',
      status: 'active', security_groups: [], bot_account: url.endsWith('/bots') }] } }))
})

describe('account modal editors', () => {
  it.each(['user', 'bot'])('opens create and prefilled edit in a modal Dialog for a %s', async kind => {
    const view = mount(Users, { global: { stubs: { Icon: true } } })
    await flushPromises()
    if (kind === 'bot') {
      await view.get('[role="tab"][aria-controls="users-bots"]').trigger('click')
      await flushPromises()
    }
    await view.get(`[aria-label="Create ${kind}"]`).trigger('click')
    await flushPromises()
    expect(view.getComponent(Dialog).props('modal')).toBe(true)
    expect(view.get('[role="dialog"]').attributes('aria-modal')).toBe('true')
    await view.getComponent(Dialog).vm.$emit('update:visible', false)
    await flushPromises()
    expect(view.find('[role="dialog"]').exists()).toBe(false)
    await view.get('[aria-label="Edit Test account"]').trigger('click')
    await flushPromises()
    expect(view.getComponent(Dialog).props('modal')).toBe(true)
    expect(view.get<HTMLInputElement>('[aria-label="Full name"]').element.value).toBe('Test account')
    expect(view.get('[role="dialog"]').attributes('aria-modal')).toBe('true')
    view.unmount()
  })
})
