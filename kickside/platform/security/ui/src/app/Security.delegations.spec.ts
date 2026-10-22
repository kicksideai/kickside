import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const { get, post, remove } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), remove: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post, delete: remove }, host: { confirm: vi.fn() } }))
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
    : { scopes: [], policies: [] } }))
  post.mockResolvedValue({ data: { success: true } })
  remove.mockResolvedValue({ data: { success: true } })
})
async function open() {
  const wrapper = mount(Security)
  await flushPromises()
  await wrapper.get('[role=tab][data-tab=delegations]').trigger('click')
  await flushPromises()
  return wrapper
}
async function fill(wrapper: Awaited<ReturnType<typeof open>>) {
  const pickers = wrapper.findAllComponents({ name: 'WcMount' })
  expect(pickers.map(p => p.props('attrs').kinds)).toEqual(['user', 'group'])
  pickers[0]!.vm.$emit('change', { id: principal.id, principal_id: principal.id, type: 'user', label: 'Sales bot' })
  pickers[1]!.vm.$emit('change', { id: group, principal_id: group, type: 'group', label: 'Sales operators' })
  await flushPromises()
  await wrapper.get('input[aria-label="Component root"]').setValue(root)
}
function button(wrapper: Awaited<ReturnType<typeof open>>, label: string) {
  return wrapper.findAll('button').find(b => b.text() === label)!
}

describe('Security group-based act-as administration', () => {
  it('keeps the scope catalog reads and loads grants only on opening the tab', async () => {
    const wrapper = mount(Security)
    await flushPromises()
    expect(get.mock.calls.map(args => args[0])).toEqual(['/api/v1/security/scopes', '/api/v1/security/policies'])
    await wrapper.get('[role=tab][data-tab=delegations]').trigger('click')
    await flushPromises()
    expect(get).toHaveBeenLastCalledWith('/api/v1/security/delegations')
    expect(wrapper.text()).toContain(principal.id)
    expect(wrapper.text()).toContain(group)
  })
  it('requires an ordinary User, explicit operator group and component root', async () => {
    const wrapper = await open()
    expect(button(wrapper, 'Save act-as grant').attributes('disabled')).toBeDefined()
    await fill(wrapper)
    await wrapper.get('input[aria-label="Component root"]').setValue('')
    expect(button(wrapper, 'Save act-as grant').attributes('disabled')).toBeDefined()
    await wrapper.get('input[aria-label="All component roots"]').setValue(true)
    await button(wrapper, 'Save act-as grant').trigger('click')
    await flushPromises()
    expect(post).toHaveBeenCalledWith('/api/v1/security/delegations', {
      principal, root: '*', groups: [group],
    })
    expect(wrapper.get('[data-test=delegation-confirmation]').text()).toContain('Act-as grant saved')
  })
  it('preserves exact group IDs and deduplicates repeated choices without membership grants', async () => {
    const wrapper = await open()
    await fill(wrapper)
    wrapper.findAllComponents({ name: 'WcMount' })[1]!.vm.$emit('change', { id: group, type: 'group', label: 'Sales operators' })
    await button(wrapper, 'Save act-as grant').trigger('click')
    await flushPromises()
    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0]![1]).toMatchObject({ principal, root, groups: [group] })
    expect(post.mock.calls[0]![1]).not.toHaveProperty('authorized_by')
  })
  it('refuses group targets and user values in the operator group picker', async () => {
    const wrapper = await open()
    const pickers = wrapper.findAllComponents({ name: 'WcMount' })
    pickers[0]!.vm.$emit('change', { id: group, type: 'group' })
    pickers[1]!.vm.$emit('change', { id: principal.id, type: 'user' })
    await wrapper.get('input[aria-label="All component roots"]').setValue(true)
    expect(button(wrapper, 'Save act-as grant').attributes('disabled')).toBeDefined()
    expect(post).not.toHaveBeenCalled()
  })
  it('keeps payload and operation UUID on uncertain save retry and reports no success', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockRejectedValueOnce(new Error('Response lost'))
    await button(wrapper, 'Save act-as grant').trigger('click')
    await flushPromises()
    const payload = JSON.parse(JSON.stringify(post.mock.calls[0]![1]))
    expect(wrapper.get('[role=alert]').text()).toContain('Response lost')
    expect(wrapper.find('[data-test=delegation-confirmation]').exists()).toBe(false)
    expect(wrapper.get('fieldset').attributes('disabled')).toBeDefined()
    await button(wrapper, 'Retry act-as request').trigger('click')
    await flushPromises()
    expect(post.mock.calls[1]![1]).toEqual(payload)
    expect(wrapper.get('[data-test=delegation-confirmation]').text()).toContain('Act-as grant saved')
  })
  it('permits correction after a deterministic refusal and never claims success', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockRejectedValueOnce({ response: { status: 403, data: { error: 'Native policy write denied' } } })
    await button(wrapper, 'Save act-as grant').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toContain('Native policy write denied')
    expect(wrapper.get('fieldset').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('[data-test=delegation-confirmation]').exists()).toBe(false)
  })
  it('treats an unconfirmed successful HTTP response as uncertain, retaining the request', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockResolvedValueOnce({ data: { success: false, error: 'Reconciliation incomplete' } })
    await button(wrapper, 'Save act-as grant').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toContain('Reconciliation incomplete')
    expect(wrapper.find('[data-test=delegation-confirmation]').exists()).toBe(false)
    const payload = JSON.parse(JSON.stringify(post.mock.calls[0]![1]))
    await button(wrapper, 'Retry act-as request').trigger('click')
    await flushPromises()
    expect(post.mock.calls[1]![1]).toEqual(payload)
  })
  it('revokes through the same native API and retains the revoked declaration', async () => {
    const wrapper = await open()
    inventory = [{ ...grant, active: false, groups: [] }]
    await wrapper.get('button[aria-label="Revoke act-as grant for ' + principal.id + ' at ' + root + '"]').trigger('click')
    await flushPromises()
    expect(remove).toHaveBeenCalledWith('/api/v1/security/delegations', { data: { principal, root } })
    expect(wrapper.get('[data-test=delegation-confirmation]').text()).toContain('Act-as grant revoked')
    expect(wrapper.text()).toContain('Revoked')
    expect(wrapper.find('button[aria-label^="Revoke act-as grant"]').exists()).toBe(false)
  })
  it('retries uncertain revocation with the same payload without falling back to save', async () => {
    const wrapper = await open()
    remove.mockRejectedValueOnce(new Error('Revocation response lost'))
    await wrapper.get('button[aria-label^="Revoke act-as grant"]').trigger('click')
    await flushPromises()
    const payload = JSON.parse(JSON.stringify(remove.mock.calls[0]![1]))
    expect(wrapper.get('[role=alert]').text()).toContain('Revocation response lost')
    await button(wrapper, 'Retry act-as request').trigger('click')
    await flushPromises()
    expect(remove.mock.calls[1]![1]).toEqual(payload)
    expect(post).not.toHaveBeenCalled()
  })
  it('keeps inventory failures visible without replacing them with an empty success state', async () => {
    get.mockImplementation(async (path: string) => {
      if (path.endsWith('/delegations')) throw new Error('Inventory unavailable')
      return { data: { scopes: [], policies: [] } }
    })
    const wrapper = await open()
    expect(wrapper.get('[role=alert]').text()).toContain('Inventory unavailable')
    expect(wrapper.find('[data-test=delegation-confirmation]').exists()).toBe(false)
  })
  it('accepts a component UUID or explicit all-roots choice, not a typed wildcard', async () => {
    const wrapper = await open()
    await fill(wrapper)
    for (const value of ['*', 'unknown-root', '75e90182']) {
      await wrapper.get('input[aria-label="Component root"]').setValue(value)
      expect(button(wrapper, 'Save act-as grant').attributes('disabled')).toBeDefined()
    }
    await wrapper.get('input[aria-label="All component roots"]').setValue(true)
    expect(button(wrapper, 'Save act-as grant').attributes('disabled')).toBeUndefined()
  })
  it('keeps a pending operation across tab navigation and ignores stale picker edits', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockRejectedValueOnce(new Error('Response lost'))
    await button(wrapper, 'Save act-as grant').trigger('click')
    await flushPromises()
    const payload = JSON.parse(JSON.stringify(post.mock.calls[0]![1]))
    await button(wrapper, 'Scopes').trigger('click')
    await wrapper.get('[role=tab][data-tab=delegations]').trigger('click')
    await flushPromises()
    const pickers = wrapper.findAllComponents({ name: 'WcMount' })
    pickers[0]!.vm.$emit('change', { id: 'forged-other-user', type: 'user' })
    pickers[1]!.vm.$emit('change', { id: 'forged-other-group', type: 'group' })
    await button(wrapper, 'Retry act-as request').trigger('click')
    await flushPromises()
    expect(post.mock.calls[1]![1]).toEqual(payload)
  })
  it('allows removing a selected group and issues a new request after a definite refusal', async () => {
    const wrapper = await open()
    await fill(wrapper)
    post.mockRejectedValueOnce({ response: { status: 400, data: { error: 'Root does not exist' } } })
    await button(wrapper, 'Save act-as grant').trigger('click')
    await flushPromises()
    const prior = JSON.parse(JSON.stringify(post.mock.calls[0]![1]))
    await wrapper.get('button[aria-label="Remove operator group Sales operators"]').trigger('click')
    expect(button(wrapper, 'Save act-as grant').attributes('disabled')).toBeDefined()
    wrapper.findAllComponents({ name: 'WcMount' })[1]!.vm.$emit('change', { id: 'another:exact:group', type: 'group' })
    await wrapper.get('input[aria-label="All component roots"]').setValue(true)
    await button(wrapper, 'Save act-as grant').trigger('click')
    await flushPromises()
    const next = post.mock.calls[1]![1]
    expect(post).toHaveBeenCalledTimes(2)
    expect(next).not.toEqual(prior)
    expect(next).toEqual({ principal, root: '*', groups: ['another:exact:group'] })
  })
  it('distinguishes a confirmed mutation from a subsequent inventory failure', async () => {
    const wrapper = await open()
    await fill(wrapper)
    get.mockRejectedValueOnce(new Error('Reload unavailable'))
    await button(wrapper, 'Save act-as grant').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-test=delegation-confirmation]').text()).toContain('Act-as grant saved')
    expect(wrapper.get('[role=alert]').text()).toContain('Reload unavailable')
    expect(wrapper.get('fieldset').attributes('disabled')).toBeUndefined()
    expect(post).toHaveBeenCalledTimes(1)
  })
  it('never replaces failed inventory with an empty successful catalog', async () => {
    const wrapper = await open()
    get.mockResolvedValueOnce({ data: { success: false, error: 'Inventory refused' } })
    await button(wrapper, 'Refresh act-as grants').trigger('click')
    await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toContain('Inventory refused')
    expect(wrapper.text()).toContain(principal.id)
    expect(wrapper.text()).not.toContain('No act-as grants.')
  })

})
