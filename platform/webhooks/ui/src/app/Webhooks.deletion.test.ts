import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Webhooks from './Webhooks.vue'
import { host } from '@wippy-fe/proxy'
import { useComponentDeletion } from '@widgets/app/useComponentDeletion'
import { deleteWebhook, fetchWebhooks } from '../api'
vi.mock('@wippy-fe/proxy', () => ({host: {confirm: vi.fn(), toast: vi.fn()}, api: {get: vi.fn()}, on: vi.fn()}))
vi.mock('@iconify/vue', () => ({Icon: {template: '<span />'}}))
vi.mock('@widgets/app/useComponentDeletion', () => ({useComponentDeletion: vi.fn(() => ({acceptDeletion: vi.fn()}))}))
vi.mock('@wippy-fe/webcomponent-vue', () => ({useHostVisibilityRefresh: (load: () => void) => load()}))
vi.mock('../api', () => ({
  fetchWebhooks: vi.fn(async () => [{webhook_id: 'deleting', label: 'Deleting webhook', status: 'active', deleting_at: 'marked', subscriber_count: 0}]),
  ingressUrl: vi.fn(), errMsg: vi.fn(), revokeWebhook: vi.fn(), deleteWebhook: vi.fn(), updateWebhook: vi.fn(),
}))
it('disables Remove while component deletion is active', async () => {
  const wrapper = mount(Webhooks)
  await flushPromises()
  const remove = wrapper.get('button[title="Remove"]')
  expect(remove.attributes('disabled')).toBeDefined()
  await remove.trigger('click')
  expect(host.confirm).not.toHaveBeenCalled()
  wrapper.unmount()
})
it('forwards the accepted job handle before refreshing the list', async () => {
  vi.mocked(fetchWebhooks).mockResolvedValue([{webhook_id: 'selected', label: 'Selected webhook', status: 'active', subscriber_count: 0}] as never)
  vi.mocked(host.confirm).mockResolvedValue(true)
  vi.mocked(deleteWebhook).mockResolvedValue({job_id: 'accepted-job'} as never)
  const wrapper = mount(Webhooks)
  await flushPromises()
  const {acceptDeletion} = vi.mocked(useComponentDeletion).mock.results.at(-1)!.value
  await wrapper.get('button[title="Remove"]').trigger('click')
  await flushPromises()
  expect(acceptDeletion).toHaveBeenCalledWith('selected', {job_id: 'accepted-job'})
  wrapper.unmount()
})
