// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

const props = ref<Record<string, unknown>>({ parentId: 'folder-1', mode: 'create' })
const emit = vi.fn()
type PostResponse = { data: { success: boolean; id: string } }
const post = vi.fn<(path: string, body: Record<string, unknown>) => Promise<PostResponse>>()

vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => props, useEvents: () => emit }))
vi.mock('@wippy-fe/proxy', () => ({
  api: { post: (path: string, body: Record<string, unknown>) => post(path, body) },
}))
vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const CrmCreate = (await import('./CrmCreate.vue')).default

describe('CrmCreate', () => {
  beforeEach(() => {
    props.value = { parentId: 'folder-1', mode: 'create' }
    emit.mockReset()
    post.mockReset()
  })

  it('creates through the CRM service and reports the component once', async () => {
    post.mockResolvedValueOnce({ data: { success: true, id: 'crm-1' } })
    const wrapper = mount(CrmCreate)
    await wrapper.find('input').setValue('Revenue operations')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(post).toHaveBeenCalledTimes(1)
    expect(post).toHaveBeenCalledWith('/api/v1/workspace/crm', {
      title: 'Revenue operations',
      parent_id: 'folder-1',
      idempotency_key: expect.any(String),
    })
    expect(emit).toHaveBeenCalledWith('created', { id: 'crm-1' })
  })

  it('retains its idempotency key when the user retries', async () => {
    post
      .mockRejectedValueOnce(new Error('request timed out'))
      .mockResolvedValueOnce({ data: { success: true, id: 'crm-1' } })
    const wrapper = mount(CrmCreate)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const calls = post.mock.calls
    expect(calls[0][1]).toMatchObject({ idempotency_key: expect.any(String) })
    expect(calls[1][1].idempotency_key).toBe(calls[0][1].idempotency_key)
    expect(emit).toHaveBeenCalledWith('created', { id: 'crm-1' })
  })

  it('dismisses without creating', async () => {
    const wrapper = mount(CrmCreate)
    await wrapper.find('button[type="button"]').trigger('click')
    expect(post).not.toHaveBeenCalled()
    expect(emit).toHaveBeenCalledWith('close', {})
  })

  it('does not render a dead cancel action in the initial workspace flow', () => {
    props.value = { mode: 'create' }
    const wrapper = mount(CrmCreate, { attrs: { mode: 'initial' } })
    expect(wrapper.find('button[type="button"]').exists()).toBe(false)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Create CRM')
  })

  it('notifies an embedded Vue parent after creation', async () => {
    const created = vi.fn()
    post.mockResolvedValueOnce({ data: { success: true, id: 'crm-embedded' } })
    const wrapper = mount(CrmCreate, { attrs: { onCreated: created } })
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(created).toHaveBeenCalledWith({ id: 'crm-embedded' })
  })
})
