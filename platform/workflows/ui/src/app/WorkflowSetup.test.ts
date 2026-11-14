// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'

const host = vi.hoisted(() => ({post: vi.fn(), emit: vi.fn()}))
const props = ref<Record<string, unknown>>({})
vi.mock('@wippy-fe/webcomponent-vue', () => ({useProps: () => props, useEvents: () => host.emit}))
vi.mock('@wippy-fe/proxy', () => ({api: {post: host.post}}))
const WorkflowSetup = (await import('./WorkflowSetup.vue')).default
beforeEach(() => {
  host.post.mockReset().mockResolvedValue({data: {success: true, flow_id: 'created'}})
  host.emit.mockReset()
  props.value = {}
})
describe('Workflow setup', () => {
  it('refuses malformed source context before creating an unseeded workflow', async () => {
    props.value = {sourceContext: '{broken'}
    const wrapper = mount(WorkflowSetup)
    await wrapper.get('input').setValue('Source flow')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(host.post).not.toHaveBeenCalled()
    expect(host.emit).not.toHaveBeenCalledWith('created', expect.anything())
  })
  it('uses the creation response and passes only the source context to the server', async () => {
    const source = {source: 'example:customer_changed', config: {thread_id: 'customer'}, filter: {expr: 'payload.active'}}
    props.value = {parentId: 'folder', sourceContext: JSON.stringify(source)}
    const wrapper = mount(WorkflowSetup)
    await wrapper.get('input').setValue('Customer intake')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(host.post).toHaveBeenCalledWith('/api/v1/workflows', {title: 'Customer intake', parent_id: 'folder', source_context: source})
    expect(host.emit).toHaveBeenCalledWith('created', {id: 'created'})
  })
  it('preserves ordinary creation without source context', async () => {
    const wrapper = mount(WorkflowSetup)
    await wrapper.get('input').setValue('Manual flow')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(host.post).toHaveBeenCalledWith('/api/v1/workflows', {title: 'Manual flow', parent_id: undefined, source_context: undefined})
    expect(host.emit).toHaveBeenCalledWith('created', {id: 'created'})
  })
  it.each([
    {success: false, error: 'Creation denied'},
    {success: true},
  ])('does not announce creation without a successful response and flow id: %j', async (data) => {
    host.post.mockResolvedValueOnce({data})
    const wrapper = mount(WorkflowSetup)
    await wrapper.get('input').setValue('Source flow')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(host.post).toHaveBeenCalledOnce()
    expect(host.emit).not.toHaveBeenCalledWith('created', expect.anything())
  })
})
