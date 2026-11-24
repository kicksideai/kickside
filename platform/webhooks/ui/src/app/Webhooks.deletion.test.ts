// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Dialog from 'primevue/dialog'
import Webhooks from './Webhooks.vue'
import { host } from '@wippy-fe/proxy'
import { fetchWebhooks } from '../api'
vi.mock('@wippy-fe/proxy', () => ({host: {confirm: vi.fn(), toast: vi.fn()}, api: {get: vi.fn()}, on: vi.fn()}))
vi.mock('@iconify/vue', () => ({Icon: {template: '<span />'}}))
vi.mock('@kickside/ui-kit/useComponentDeletion', () => ({useComponentDeletion: vi.fn(() => ({acceptDeletion: vi.fn()}))}))
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

it('keeps the editor closed when activating a card secondary action', async () => {
  vi.mocked(fetchWebhooks).mockResolvedValueOnce([{
    webhook_id: 'active', label: 'Active webhook', status: 'active', subscriber_count: 0,
  }])
  const wrapper = mount(Webhooks)
  await flushPromises()
  const revoke = wrapper.get('button[aria-label="Revoke Active webhook"]')
  await revoke.trigger('keydown', { key: 'Enter' })
  expect(wrapper.findAllComponents(Dialog).every(dialog => !dialog.props('visible'))).toBe(true)
  await revoke.trigger('click')
  expect(host.confirm).toHaveBeenCalledWith(expect.objectContaining({ header: 'Revoke webhook' }))
  wrapper.unmount()
})
