import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import Editor from './ExecutionIdentityEditor.vue'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
const directory = vi.hoisted(() => ({ resolvePrincipals: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api, loadByTagName: vi.fn() }))
vi.mock('../../../../users/ui/src/principals', () => directory)
const picker = defineComponent({ props: ['tag', 'attrs'], emits: ['change'], template: '<div data-testid="shared-picker" />' })
const stored = { principal: { kind: 'user', id: 'operator' }, authorized_by: { kind: 'user', id: 'operator' }, identity_generation: 4 }
const selection = { principal: { kind: 'user', id: 'executor' }, label: 'Sales bot' }
function mountEditor(root = 'root') { return mount(Editor, { props: { root }, global: { stubs: { WcMount: picker } } }) }
beforeEach(() => {
  api.get.mockReset(); api.post.mockReset()
  directory.resolvePrincipals.mockReset()
  directory.resolvePrincipals.mockResolvedValue([{ type: 'user', id: 'operator', label: 'Configuring operator' }])
  api.get.mockResolvedValue({ data: { success: true, identity: stored } })
  api.post.mockImplementation((_url, body) => {
    api.get.mockResolvedValue({ data: { success: true, identity: {
      ...stored, principal: body.principal, identity_generation: 5,
    } } })
    return Promise.resolve({ data: { success: true, state: 'succeeded', identity_generation: 5 } })
  })
})
afterEach(() => { document.body.innerHTML = '' })

describe('BOT-AUTOMATION-IDENTITY-EDITOR', () => {
  it('shows committed executor and authorizer separately from an unsaved selection', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, identity: { ...stored, principal: selection.principal } } })
    directory.resolvePrincipals.mockResolvedValueOnce([
      { type: 'user', id: 'executor', label: 'Sales bot' },
      { type: 'user', id: 'operator', label: 'Configuring operator' },
    ])
    const w = mountEditor(); await flushPromises()
    expect(w.get('[aria-label="Runs as"]').text()).toBe('Sales bot')
    expect(w.get('[aria-label="Authorized by"]').text()).toBe('Configuring operator')
    w.getComponent(picker).vm.$emit('change', { principal: stored.principal, label: 'Me' }); await flushPromises()
    expect(w.get('[aria-label="Runs as"]').text()).toBe('Sales bot')
    expect(w.get('[aria-label="Authorized by"]').text()).toBe('Configuring operator')
    w.unmount()
  })
  it('refetches the native authorizer after save rather than guessing it from the page caller', async () => {
    const w = mountEditor(); await flushPromises()
    api.get.mockResolvedValueOnce({ data: { success: true, identity: {
      principal: selection.principal, authorized_by: { kind: 'user', id: 'replacement' }, identity_generation: 5,
    } } })
    directory.resolvePrincipals.mockResolvedValueOnce([
      { type: 'user', id: 'executor', label: 'Sales bot' },
      { type: 'user', id: 'replacement', label: 'Replacement authorizer' },
    ])
    w.getComponent(picker).vm.$emit('change', selection); await flushPromises()
    await w.get('button').trigger('click'); await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    expect(w.get('[aria-label="Runs as"]').text()).toBe('Sales bot')
    expect(w.get('[aria-label="Authorized by"]').text()).toBe('Replacement authorizer')
    expect(w.emitted('changed')).toHaveLength(1)
    w.unmount()
  })
  it('retains a missing-account label without inventing a new authorizer', async () => {
    directory.resolvePrincipals.mockResolvedValueOnce([])
    const w = mountEditor(); await flushPromises()
    expect(w.get('[aria-label="Authorized by"]').text()).toBe('Account unavailable')
    expect(api.post).not.toHaveBeenCalled()
    w.unmount()
  })
  it('preserves absent optional authorizer behavior and does not write during label resolution', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, identity: { principal: stored.principal, identity_generation: 4 } } })
    const w = mountEditor(); await flushPromises()
    expect(w.findComponent(picker).exists()).toBe(true)
    expect(w.find('[aria-label="Authorized by"]').exists()).toBe(false)
    expect(api.post).not.toHaveBeenCalled()
    w.unmount()
  })
  it('reports directory failures and does not display an invented provenance receipt', async () => {
    directory.resolvePrincipals.mockRejectedValueOnce(new Error('Directory unavailable'))
    const w = mountEditor(); await flushPromises()
    expect(w.get('[role="alert"]').text()).toBe('Directory unavailable')
    expect(w.find('[aria-label="Authorized by"]').exists()).toBe(false)
    expect(w.emitted('error')).toHaveLength(1)
    expect(api.post).not.toHaveBeenCalled()
    w.unmount()
  })
  it('does not report saved provenance when the confirmed command cannot be refetched', async () => {
    const w = mountEditor(); await flushPromises()
    api.get.mockRejectedValueOnce(new Error('Receipt unavailable'))
    w.getComponent(picker).vm.$emit('change', selection); await flushPromises()
    await w.get('button').trigger('click'); await flushPromises()
    expect(w.get('[role="alert"]').text()).toBe('Receipt unavailable')
    expect(w.get('[aria-label="Authorized by"]').text()).toBe('Configuring operator')
    expect(w.text()).not.toContain('Run-as account saved')
    expect(w.emitted('changed')).toBeUndefined()
    w.unmount()
  })
  it('refuses an old canonical receipt after a newer confirmed command', async () => {
    const w = mountEditor(); await flushPromises()
    api.get.mockResolvedValueOnce({ data: { success: true, identity: stored } })
    w.getComponent(picker).vm.$emit('change', selection); await flushPromises()
    await w.get('button').trigger('click'); await flushPromises()
    expect(w.get('[role="alert"]').text()).toBe('Execution account confirmation is stale')
    expect(w.text()).not.toContain('Run-as account saved')
    expect(w.emitted('changed')).toBeUndefined()
    w.unmount()
  })
  it('discards delayed directory labels after changing roots', async () => {
    let finish!: (value: unknown[]) => void
    directory.resolvePrincipals.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    const w = mountEditor('old-root'); await flushPromises()
    api.get.mockResolvedValueOnce({ data: { success: true, identity: { ...stored, principal: selection.principal } } })
    directory.resolvePrincipals.mockResolvedValueOnce([{ type: 'user', id: 'executor', label: 'New root account' }])
    await w.setProps({ root: 'new-root' }); await flushPromises()
    finish([{ type: 'user', id: 'operator', label: 'Old root account' }]); await flushPromises()
    expect(w.get('[aria-label="Runs as"]').text()).toBe('New root account')
    expect(w.text()).not.toContain('Old root account')
    w.unmount()
  })
  it('reads the protected generation and mounts the same Users picker without saving on load', async () => {
    const w = mountEditor(); await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/automations/root/identity')
    expect(w.getComponent(picker).props()).toMatchObject({ tag: 'wc-run-as-picker', attrs: { root: 'root', value: 'operator' } })
    expect(api.post).not.toHaveBeenCalled()
    expect(w.get('button').attributes('disabled')).toBeDefined()
    w.unmount()
  })
  it('saves one explicit ordinary principal through the fenced command and reports confirmed success', async () => {
    const w = mountEditor(); await flushPromises()
    w.getComponent(picker).vm.$emit('change', selection); await flushPromises()
    await w.get('button').trigger('click'); await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/automations/root/identity', {
      principal: selection.principal, request_id: expect.any(String), expected_identity_generation: 4,
    })
    expect(w.text()).toContain('Run-as account saved')
    expect(w.emitted('changed')).toHaveLength(1)
    w.unmount()
  })
  it('keeps rejected or pending selections visible without emitting success or adopting a generation', async () => {
    for (const answer of ['denied', 'pending']) {
      api.post.mockImplementationOnce(() => answer === 'denied'
        ? Promise.reject(new Error('Selection permission is revoked'))
        : Promise.resolve({ data: { success: true, state: 'pending' } }))
      const w = mountEditor(); await flushPromises()
      w.getComponent(picker).vm.$emit('change', selection); await flushPromises()
      await w.get('button').trigger('click'); await flushPromises()
      expect(w.text()).toContain(answer === 'denied' ? 'Selection permission is revoked' : 'Identity change is pending')
      expect(w.emitted('changed')).toBeUndefined()
      expect(w.text()).not.toContain('Run-as account saved')
      w.unmount()
    }
  })
  it('refuses unavailable reads and discards responses and saves from a previous root', async () => {
    let resolve!: (value: unknown) => void
    api.get.mockImplementationOnce(() => new Promise(r => { resolve = r })).mockRejectedValueOnce(new Error('Not authorized'))
    const w = mountEditor('old-root')
    await w.setProps({ root: 'new-root' }); await flushPromises()
    resolve({ data: { success: true, identity: stored } }); await flushPromises()
    expect(w.text()).toContain('Not authorized')
    expect(w.findComponent(picker).exists()).toBe(false)
    expect(api.post).not.toHaveBeenCalled()
    w.unmount()
  })
  it('does not permit a delayed save to update a different root', async () => {
    let resolve!: (value: unknown) => void
    api.post.mockImplementationOnce(() => new Promise(r => { resolve = r }))
    const w = mountEditor('old-root'); await flushPromises()
    w.getComponent(picker).vm.$emit('change', selection); await flushPromises()
    await w.get('button').trigger('click')
    await w.setProps({ root: 'new-root' }); await flushPromises()
    resolve({ data: { success: true, state: 'succeeded', identity_generation: 5 } }); await flushPromises()
    expect(w.emitted('changed')).toBeUndefined()
    expect(w.getComponent(picker).props('attrs').value).toBe('operator')
    w.unmount()
  })
  it('permits explicit reauthorization of the same principal through the owning command', async () => {
    const w = mountEditor(); await flushPromises()
    w.getComponent(picker).vm.$emit('change', { principal: stored.principal, label: 'Me' }); await flushPromises()
    await w.get('button').trigger('click'); await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/automations/root/identity', {
      principal: stored.principal, request_id: expect.any(String), expected_identity_generation: 4,
    })
    w.unmount()
  })
})
