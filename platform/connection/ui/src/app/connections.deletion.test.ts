// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Connections from './connections.vue'
let refresh: () => Promise<void>
vi.mock('@wippy-fe/webcomponent-vue', () => ({useHostVisibilityRefresh: (callback: () => Promise<void>) => {refresh = callback; void callback()}}))
vi.mock('@iconify/vue', () => ({Icon: {template: '<span />'}}))
vi.mock('@wippy-fe/proxy', () => ({api: {get: vi.fn()}, on: vi.fn(() => vi.fn()), host: {handleError: vi.fn()}}))
it('keeps a deleting connection visible when a later read fails', async () => {
  let fail = false
  vi.mocked(api.get).mockImplementation(async (url: string) => {
    if (String(url).startsWith('/api/v1/connections?')) {
      if (fail) throw new Error('Read unavailable')
      return {data: {success: true, connections: [{component_id: 'selected', name: 'Selected connection', provider: 'generic', deleting_at: 'marked', deletion_job_id: 'job'}]}} as never
    }
    if (String(url).startsWith('/api/v1/components/')) return {data: {success: true, deleting_at: 'marked', deletion_job_id: 'job', deletion_job: {status: 'pending', attempts: 0}}} as never
    return {data: {success: true, providers: []}} as never
  })
  const wrapper = mount(Connections)
  await flushPromises()
  expect(wrapper.text()).toContain('Selected connection')
  expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
  fail = true
  await refresh()
  await flushPromises()
  expect(wrapper.text()).toContain('Selected connection')
  expect(wrapper.text()).toContain('Read unavailable')
  expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
  wrapper.unmount()
})
