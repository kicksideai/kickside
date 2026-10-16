import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
const mocks = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn(), emit: vi.fn(), props: {} as Record<string, unknown> }))
vi.mock('@wippy-fe/proxy', () => ({ api: { post: mocks.post, put: mocks.put } }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => ref(mocks.props), useEvents: () => mocks.emit }))
import Connect from './Connect.vue'
beforeEach(() => { vi.clearAllMocks(); mocks.props = {} })
describe('SimpleFIN connection', () => {
  it('rejects an empty setup token before making a request', async () => {
    const wrapper = mount(Connect)
    await wrapper.find('form').trigger('submit')
    expect(mocks.post).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toContain('Paste the setup token')
    wrapper.unmount()
  })
  it('clears the token after discovery and waits for Done before closing', async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: true, component_id: 'conn-1' } }).mockResolvedValueOnce({ data: { success: true, resources: [] } })
    const wrapper = mount(Connect)
    await wrapper.get('input[type="password"]').setValue('private-token')
    await wrapper.find('form').trigger('submit'); await flushPromises()
    expect(mocks.post).toHaveBeenNthCalledWith(1, '/api/v1/connections', expect.objectContaining({ private_context: { setup_token: 'private-token' } }))
    expect(mocks.post).toHaveBeenNthCalledWith(2, '/api/v1/connections/conn-1/discover_resources', {})
    expect(wrapper.text()).not.toContain('private-token')
    expect(mocks.emit).not.toHaveBeenCalled()
    await wrapper.get('.sf-submit').trigger('click')
    expect(mocks.emit).toHaveBeenCalledWith('connection-saved', { success: true, component_id: 'conn-1' })
    wrapper.unmount()
  })
  it('rotates the component provided through normalized host props', async () => {
    mocks.props = { componentId: 'existing/id' }
    mocks.put.mockResolvedValueOnce({ data: { success: true, component_id: 'existing/id' } })
    mocks.post.mockResolvedValueOnce({ data: { success: true, resources: [] } })
    const wrapper = mount(Connect)
    await wrapper.get('input[type="password"]').setValue('replacement-token')
    await wrapper.find('form').trigger('submit'); await flushPromises()
    expect(mocks.put).toHaveBeenCalledWith('/api/v1/simplefin/connections/existing%2Fid', { setup_token: 'replacement-token', name: 'SimpleFIN' })
    expect(mocks.post).toHaveBeenCalledWith('/api/v1/connections/existing%2Fid/discover_resources', {})
    wrapper.unmount()
  })
  it('shows a rejected credential without reporting a saved connection', async () => {
    mocks.post.mockResolvedValueOnce({ data: { success: false, error: 'Token rejected' } })
    const wrapper = mount(Connect)
    await wrapper.get('input[type="password"]').setValue('invalid-token')
    await wrapper.find('form').trigger('submit'); await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Token rejected')
    expect(mocks.emit).toHaveBeenCalledWith('connection-saved', { success: false, error: 'Token rejected' })
    expect(mocks.post).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})
