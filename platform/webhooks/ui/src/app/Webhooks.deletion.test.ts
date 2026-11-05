// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Webhooks from './Webhooks.vue'
import { host } from '@wippy-fe/proxy'
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
