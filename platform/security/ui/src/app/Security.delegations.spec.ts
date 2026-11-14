import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const { get, post, remove, confirm } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), remove: vi.fn(), confirm: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post, delete: remove }, host: { confirm } }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (callback: () => unknown) => { void callback(); return { value: true } } }))
vi.mock('@widgets/app/WcMount.vue', () => ({ default: {
  name: 'WcMount', props: ['tag', 'attrs', 'config'], emits: ['change', 'error'], template: '<div />',
} }))
import Security from './Security.vue'

const principal = { kind: 'user', id: '8329412e-342c-41c5-9ac2-22907a3615bc' }
const root = '75e90182-21ad-4165-a663-b146d455f8bb'
const group = 'kickside.security.scopes:sales:operators'
const grant = { policy_id: 'kickside.delegate:encoded', principal, root, groups: [group], active: true, grantor: 'human', created_at: '2026-10-10' }
let inventory = [grant]
beforeEach(() => {
  vi.clearAllMocks()
  inventory = [grant]
  get.mockImplementation(async (path: string) => ({ data: path.endsWith('/delegations')
    ? { success: true, delegations: inventory }
    : { scopes: [{ id: group, label: 'Sales operators' }], policies: [] } }))
  post.mockImplementation(async (path: string) => ({ data: path.endsWith('/principals/resolve')
    ? { principals: [{ id: principal.id, label: 'Sales bot' }] }
    : { success: true } }))
  remove.mockResolvedValue({ data: { success: true } })
  confirm.mockResolvedValue(true)
})
type Wrapper = ReturnType<typeof mount>
async function open() {
  const wrapper = mount(Security)
  await flushPromises()
  await wrapper.get('[role=tab][aria-controls$="_tabpanel_delegations"]').trigger('click')
  await flushPromises()
  return wrapper
}
function button(wrapper: Wrapper, label: string) {
  return wrapper.findAll('button').find(b => b.text() === label)!
}
function pickers(wrapper: Wrapper) {
  return wrapper.findAllComponents({ name: 'WcMount' })
}
function saves() {
  return post.mock.calls.filter(([path]) => path === '/api/v1/security/delegations')
}
async function oneComponent(wrapper: Wrapper, id: string) {
  await wrapper.findAll('input[type=radio]')[1]!.setValue(true)
  await flushPromises()
  const component = pickers(wrapper).find(picker => picker.props('tag') === 'wc-component-picker')!
  component.vm.$emit('change', { thread_id: id })
  await flushPromises()
}
async function anyComponent(wrapper: Wrapper) {
  await wrapper.findAll('input[type=radio]')[0]!.setValue(true)
  await flushPromises()
}
async function fill(wrapper: Wrapper) {
  if (button(wrapper, 'New permission')) {
    await button(wrapper, 'New permission').trigger('click')
    await flushPromises()
  }
  const [account, groups] = pickers(wrapper)
  expect([account!.props('attrs').kinds, groups!.props('attrs').kinds]).toEqual(['user', 'group'])
  account!.vm.$emit('change', { id: principal.id, principal_id: principal.id, type: 'user', label: 'Sales bot' })
  groups!.vm.$emit('change', { id: group, principal_id: group, type: 'group', label: 'Sales operators' })
  await flushPromises()
  await oneComponent(wrapper, root)
}

describe('Security run-as administration', () => {
  it('keeps the scope catalog reads and loads grants only on opening the tab', async () => {
    const wrapper = mount(Security)
    await flushPromises()
    expect(get.mock.calls.map(args => args[0])).toEqual(['/api/v1/security/scopes', '/api/v1/security/policies'])
    await wrapper.get('[role=tab][aria-controls$="_tabpanel_delegations"]').trigger('click')
    await flushPromises()
    expect(get).toHaveBeenLastCalledWith('/api/v1/security/delegations')
    expect(wrapper.text()).toContain('Sales bot')
    expect(wrapper.text()).toContain('Sales operators')
  })
  it('never substitutes stored identifiers for unavailable account, group or component names', async () => {
    post.mockResolvedValueOnce({ data: { principals: [] } })
    get.mockImplementation(async (path: string) => ({ data: path.endsWith('/delegations') ? { success: true, delegations: inventory } : { scopes: [], policies: [] } }))
    const wrapper = await open()
    expect(wrapper.text()).not.toContain(principal.id)
    expect(wrapper.text()).not.toContain(group)
    expect(wrapper.text()).not.toContain(root)
    expect(wrapper.text()).toContain('Account unavailable')
    expect(wrapper.text()).toContain('Group unavailable')
    expect(wrapper.text()).toContain('on an unavailable component')
  })
  it('requires an account, a group and a component choice', async () => {
    const wrapper = await open()
    await button(wrapper, 'New permission').trigger('click')
    await flushPromises()
    expect(button(wrapper, 'Save permission').attributes('disabled')).toBeDefined()
    await fill(wrapper)
    expect(button(wrapper, 'Save permission').attributes('disabled')).toBeUndefined()
    await anyComponent(wrapper)
    await button(wrapper, 'Save permission').trigger('click')
    await flushPromises()
    expect(saves()[0]![1]).toEqual({ principal, root: '*', groups: [group] })
    expect(wrapper.get('[data-test=delegation-confirmation]').text()).toContain('Run-as permission saved')
  })
  it('saves one picked component and deduplicates repeated group choices without membership grants', async () => {
    const wrapper = await open()
    await fill(wrapper)
    pickers(wrapper)[1]!.vm.$emit('change', { id: group, type: 'group', label: 'Sales operators' })
    await button(wrapper, 'Save permission').trigger('click')
    await flushPromises()
    expect(saves()).toHaveLength(1)
    expect(saves()[0]![1]).toEqual({ principal, root, groups: [group] })
    expect(saves()[0]![1]).not.toHaveProperty('authorized_by')
  })
  it('refuses group values in the account picker and accounts in the group picker', async () => {
    const wrapper = await open()
    await button(wrapper, 'New permission').trigger('click')
    await flushPromises()
    const [account, groups] = pickers(wrapper)
    account!.vm.$emit('change', { id: group, type: 'group' })
    groups!.vm.$emit('change', { id: principal.id, type: 'user' })
    await flushPromises()
    expect(button(wrapper, 'Save permission').attributes('disabled')).toBeDefined()
    expect(saves()).toHaveLength(0)
  })
  it('requires a picked component when the permission covers one component', async () => {
    const wrapper = await open()
    await button(wrapper, 'New permission').trigger('click')
    await flushPromises()
    const [account, groups] = pickers(wrapper)
    account!.vm.$emit('change', { id: principal.id, type: 'user' })
    groups!.vm.$emit('change', { id: group, type: 'group' })
    await wrapper.findAll('input[type=radio]')[1]!.setValue(true)
    await flushPromises()
    expect(button(wrapper, 'Save permission').attributes('disabled')).toBeDefined()
    const component = pickers(wrapper).find(picker => picker.props('tag') === 'wc-component-picker')!
    component.vm.$emit('change', { id: root })
    await flushPromises()
    expect(button(wrapper, 'Save permission').attributes('disabled')).toBeDefined()
    component.vm.$emit('change', { thread_id: root })
    await flushPromises()
    expect(button(wrapper, 'Save permission').attributes('disabled')).toBeUndefined()
  })
  it('keeps the payload on an uncertain save, retries it unchanged and reports no success until confirmed', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockRejectedValueOnce(new Error('Response lost'))
    await button(wrapper, 'Save permission').trigger('click')
    await flushPromises()
    const payload = JSON.parse(JSON.stringify(saves()[0]![1]))
    expect(wrapper.get('[role=alert]').text()).toContain('Response lost')
    expect(wrapper.find('[data-test=delegation-confirmation]').exists()).toBe(false)
    expect(wrapper.get('fieldset').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('We could not confirm whether the permission changed. Select Retry to check before making another change.')
    await button(wrapper, 'Retry').trigger('click')
    await flushPromises()
    expect(saves()[1]![1]).toEqual(payload)
    expect(wrapper.get('[data-test=delegation-confirmation]').text()).toContain('Run-as permission saved')
  })
  it('permits correction after a definite refusal and never claims success', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockRejectedValueOnce({ response: { status: 403, data: { error: 'Native policy write denied' } } })
    await button(wrapper, 'Save permission').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toContain('Native policy write denied')
    expect(wrapper.get('fieldset').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('[data-test=delegation-confirmation]').exists()).toBe(false)
  })
  it('treats an unconfirmed successful HTTP response as uncertain, retaining the request', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockResolvedValueOnce({ data: { success: false, error: 'Reconciliation incomplete' } })
    await button(wrapper, 'Save permission').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toContain('Reconciliation incomplete')
    expect(wrapper.find('[data-test=delegation-confirmation]').exists()).toBe(false)
    const payload = JSON.parse(JSON.stringify(saves()[0]![1]))
    await button(wrapper, 'Retry').trigger('click')
    await flushPromises()
    expect(saves()[1]![1]).toEqual(payload)
  })
  it('revokes through the native API and shows revoked permissions only on request', async () => {
    const wrapper = await open()
    inventory = [{ ...grant, active: false, groups: [] }]
    await wrapper.get('button[aria-label="Revoke run-as permission for Sales bot"]').trigger('click')
    await flushPromises()
    expect(confirm).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith('/api/v1/security/delegations', { data: { principal, root } })
    expect(wrapper.get('[data-test=delegation-confirmation]').text()).toContain('Run-as permission revoked')
    expect(wrapper.find('.ks-runas-grant.revoked').exists()).toBe(false)
    await button(wrapper, 'Show revoked permissions').trigger('click')
    expect(wrapper.get('.ks-runas-grant.revoked').text()).toContain('revoked')
    await button(wrapper, 'Hide revoked permissions').trigger('click')
    expect(wrapper.find('.ks-runas-grant.revoked').exists()).toBe(false)
    expect(wrapper.find('button[aria-label^="Revoke run-as permission"]').exists()).toBe(false)
  })
  it('shows active permissions by default alongside an optional revoked history', async () => {
    inventory = [grant, { ...grant, policy_id: 'revoked', active: false }]
    const wrapper = await open()
    expect(wrapper.findAll('.ks-runas-grant')).toHaveLength(1)
    await button(wrapper, 'Show revoked permissions').trigger('click')
    expect(wrapper.findAll('.ks-runas-grant')).toHaveLength(2)
  })
  it('does not revoke when the confirmation is declined', async () => {
    const wrapper = await open()
    confirm.mockResolvedValueOnce(false)
    await wrapper.get('button[aria-label^="Revoke run-as permission"]').trigger('click')
    await flushPromises()
    expect(remove).not.toHaveBeenCalled()
  })
  it('retries uncertain revocation with the same payload without falling back to save', async () => {
    const wrapper = await open()
    remove.mockRejectedValueOnce(new Error('Revocation response lost'))
    await wrapper.get('button[aria-label^="Revoke run-as permission"]').trigger('click')
    await flushPromises()
    const payload = JSON.parse(JSON.stringify(remove.mock.calls[0]![1]))
    expect(wrapper.get('[role=alert]').text()).toContain('Revocation response lost')
    await button(wrapper, 'Retry').trigger('click')
    await flushPromises()
    expect(remove.mock.calls[1]![1]).toEqual(payload)
    expect(saves()).toHaveLength(0)
  })
  it('keeps inventory failures visible without replacing them with an empty success state', async () => {
    get.mockImplementation(async (path: string) => {
      if (path.endsWith('/delegations')) throw new Error('Inventory unavailable')
      return { data: { scopes: [], policies: [] } }
    })
    const wrapper = await open()
    expect(wrapper.get('[role=alert]').text()).toContain('Inventory unavailable')
    expect(wrapper.find('[data-test=delegation-confirmation]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('No active run-as permissions')
  })
  it('keeps a pending operation across tab navigation and ignores stale picker edits', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockRejectedValueOnce(new Error('Response lost'))
    await button(wrapper, 'Save permission').trigger('click')
    await flushPromises()
    const payload = JSON.parse(JSON.stringify(saves()[0]![1]))
    await wrapper.findAll('[role=tab]').find(tab => tab.text() === 'Roles')!.trigger('click')
    await wrapper.get('[role=tab][aria-controls$="_tabpanel_delegations"]').trigger('click')
    await flushPromises()
    for (const picker of pickers(wrapper)) {
      picker.vm.$emit('change', { id: 'forged-other', type: 'user', thread_id: 'forged-root' })
      picker.vm.$emit('change', { id: 'forged-other-group', type: 'group' })
    }
    await button(wrapper, 'Retry').trigger('click')
    await flushPromises()
    expect(saves()[1]![1]).toEqual(payload)
  })
  it('allows removing a selected group and issues a new request after a definite refusal', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockRejectedValueOnce({ response: { status: 400, data: { error: 'Root does not exist' } } })
    await button(wrapper, 'Save permission').trigger('click')
    await flushPromises()
    const prior = JSON.parse(JSON.stringify(saves()[0]![1]))
    await wrapper.get('[aria-label="Remove group Sales operators"]').trigger('click')
    await flushPromises()
    expect(button(wrapper, 'Save permission').attributes('disabled')).toBeDefined()
    pickers(wrapper)[1]!.vm.$emit('change', { id: 'another:exact:group', type: 'group' })
    await anyComponent(wrapper)
    await button(wrapper, 'Save permission').trigger('click')
    await flushPromises()
    const next = saves()[1]![1]
    expect(saves()).toHaveLength(2)
    expect(next).not.toEqual(prior)
    expect(next).toEqual({ principal, root: '*', groups: ['another:exact:group'] })
  })
  it('distinguishes a confirmed mutation from a subsequent inventory failure', async () => {
    const wrapper = await open()
    await fill(wrapper)
    get.mockRejectedValueOnce(new Error('Reload unavailable'))
    await button(wrapper, 'Save permission').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-test=delegation-confirmation]').text()).toContain('Run-as permission saved')
    expect(wrapper.get('[role=alert]').text()).toContain('Reload unavailable')
    expect(saves()).toHaveLength(1)
  })
  it('never replaces failed inventory with an empty successful catalog', async () => {
    const wrapper = await open()
    get.mockResolvedValueOnce({ data: { success: false, error: 'Inventory refused' } })
    await wrapper.get('button[aria-label="Refresh"]').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toContain('Inventory refused')
    expect(wrapper.text()).toContain('Sales bot')
    expect(wrapper.text()).not.toContain('No active run-as permissions')
  })
})
