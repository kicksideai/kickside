// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import type { Policy, Scope } from '../types'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get, post }, host: { confirm: vi.fn() } }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (callback: () => unknown) => { void callback() } }))
vi.mock('@widgets/app/WcMount.vue', () => ({ default: { template: '<div />' } }))
import Security from './Security.vue'
import PolicyCard from './PolicyCard.vue'

const policy: Policy = { id: 'example.security:directory', title: 'User directory', comment: 'Find people and view their profiles.', effect: 'allow', surface: 'endpoint', actions: ['access'], resources: ['example.api:list.endpoint'] }
let scopes: Scope[] = []
beforeEach(() => {
  vi.clearAllMocks()
  scopes = []
  get.mockImplementation(async () => ({ data: { scopes, policies: [policy] } }))
  post.mockResolvedValue({ data: { success: true } })
})
const role = (slug: string): Scope => ({ id: `kickside.security.scopes:${slug}`, slug, label: 'Reviewers', description: '', source: 'custom', internal: false, built_in: false, enabled: true, policies: [policy] })
async function create(name = 'Reviewers') {
  const wrapper = mount(Security)
  await flushPromises()
  await wrapper.get('button[aria-label="New role"]').trigger('click')
  await wrapper.get('input[placeholder="Reviewer"]').setValue(name)
  await wrapper.get('button[aria-label="Add permission User directory"]').trigger('click')
  return wrapper
}
function save(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('button').find(button => button.text() === 'Save role')!
}

describe('Security permission presentation', () => {
  it.each(['palette', 'selected', 'locked'] as const)('describes a permission without raw codes in %s mode', async (mode) => {
    const wrapper = mount(PolicyCard, { props: { policy, mode } })
    expect(wrapper.text()).toContain('User directory')
    expect(wrapper.text()).toContain('Find people and view their profiles.')
    expect(wrapper.text()).toContain('Allows')
    expect(wrapper.text()).not.toMatch(/Policy ID|Surface|Effect|Actions|Resources|example\.|endpoint|access|allow\b/)
    expect(wrapper.find('button[aria-expanded]').exists()).toBe(false)
    if (mode === 'palette') {
      await wrapper.get('button[aria-label="Add permission User directory"]').trigger('click')
      expect(wrapper.emitted('add')).toHaveLength(1)
    }
    if (mode === 'selected') {
      await wrapper.get('button[aria-label="Remove permission User directory"]').trigger('click')
      expect(wrapper.emitted('remove')).toHaveLength(1)
    }
    expect(wrapper.attributes('draggable')).toBe(String(mode !== 'locked'))
  })
  it('describes a denial and keeps untitled permission codes out of labels', () => {
    const wrapper = mount(PolicyCard, { props: { policy: { ...policy, title: policy.id, effect: 'deny' }, mode: 'selected' } })
    expect(wrapper.text()).toContain('Blocks')
    expect(wrapper.text()).toContain('Unnamed permission')
    expect(wrapper.html()).not.toContain(policy.id)
  })
  it('derives a new role identifier from its name without an identifier input', async () => {
    const wrapper = await create('Café reviewers')
    expect(wrapper.text()).not.toContain('Role ID')
    expect(wrapper.find('input[placeholder="reviewer"]').exists()).toBe(false)
    expect(save(wrapper).attributes('disabled')).toBeUndefined()
    await save(wrapper).trigger('click')
    await flushPromises()
    expect(post).toHaveBeenCalledWith('/api/v1/security/scopes', expect.objectContaining({ slug: expect.stringMatching(/^cafe_reviewers_[0-9a-f]{32}$/), label: 'Café reviewers', policies: [policy.id] }))
  })
  it('avoids existing role identifiers and keeps the saved identifier on further edits', async () => {
    scopes = [role('reviewers'), role('reviewers_2')]
    const wrapper = await create()
    await save(wrapper).trigger('click')
    await flushPromises()
    const slug = post.mock.calls[0]![1].slug
    expect(slug).toMatch(/^reviewers_[0-9a-f]{32}$/)
    expect(scopes.map(scope => scope.slug)).not.toContain(slug)
    await wrapper.get('input[placeholder="Reviewer"]').setValue('Renamed reviewers')
    await save(wrapper).trigger('click')
    await flushPromises()
    expect(post.mock.calls[1]![1].slug).toBe(slug)
  })
  it('keeps same-name role creations distinct before either catalog refreshes', async () => {
    const first = await create()
    const second = await create()
    await save(first).trigger('click')
    await flushPromises()
    await save(second).trigger('click')
    await flushPromises()
    expect(post.mock.calls[0]![1].slug).not.toBe(post.mock.calls[1]![1].slug)
  })
  it('preserves existing role identity and selected policies when renaming', async () => {
    scopes = [role('original')]
    const wrapper = mount(Security)
    await flushPromises()
    await wrapper.get('.ks-scope-row').trigger('click')
    await wrapper.get('input[placeholder="Reviewer"]').setValue('Renamed reviewers')
    await save(wrapper).trigger('click')
    await flushPromises()
    expect(post.mock.calls[0]![1]).toMatchObject({ slug: 'original', policies: [policy.id], label: 'Renamed reviewers' })
  })
  it('copies a role with its selected permissions into a separate identity', async () => {
    scopes = [role('original')]
    const wrapper = mount(Security)
    await flushPromises()
    await wrapper.get('.ks-scope-row').trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Duplicate')!.trigger('click')
    await save(wrapper).trigger('click')
    await flushPromises()
    expect(post.mock.calls[0]![1]).toMatchObject({ slug: expect.stringMatching(/^copy_of_reviewers_[0-9a-f]{32}$/), label: 'Copy of Reviewers', policies: [policy.id], target: '' })
  })
  it('keeps an extension attached to its original role and preserves locked permissions', async () => {
    const original = { ...role('original'), source: 'registry' as const, overlay_slug: 'existing_extension', overlay_policies: [] }
    const additional = { ...policy, id: 'example.security:manage', title: 'Manage users' }
    scopes = [original]
    get.mockImplementation(async () => ({ data: { scopes, policies: [policy, additional] } }))
    const wrapper = mount(Security)
    await flushPromises()
    await wrapper.get('.ks-scope-row').trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Edit extension')!.trigger('click')
    expect(wrapper.get('.locked-pane').text()).toContain('User directory')
    expect(wrapper.find('.locked-pane button').exists()).toBe(false)
    await wrapper.get('button[aria-label="Add permission Manage users"]').trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Save extension')!.trigger('click')
    await flushPromises()
    expect(post.mock.calls[0]![1]).toMatchObject({ slug: 'existing_extension', target: original.id, policies: [additional.id] })
  })
  it('requires a name and supports names without Latin letters', async () => {
    const wrapper = await create(' ')
    expect(save(wrapper).attributes('disabled')).toBeDefined()
    await wrapper.get('input[placeholder="Reviewer"]').setValue('審査者')
    expect(save(wrapper).attributes('disabled')).toBeUndefined()
    await save(wrapper).trigger('click')
    await flushPromises()
    expect(post.mock.calls[0]![1]).toMatchObject({ slug: expect.stringMatching(/^role_[0-9a-f]{32}$/), label: '審査者' })
  })
})
