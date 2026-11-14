// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DataTable from 'primevue/datatable'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get }, host: {} }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (load: () => unknown) => { void load() } }))
import Users from './users.vue'

it.each(['users', 'bots'])('uses the themed account table and retains actions in %s', async kind => {
  get.mockImplementation(async (url: string) => ({ data: url.endsWith('assignable-scopes')
    ? { success: true, scopes: [{ id: 'reviewers', label: 'Reviewers' }] }
    : { success: true, users: [{ user_id: 'account', full_name: 'Review account', email: 'review@example.test',
      status: 'active', security_groups: ['reviewers'], bot_account: kind === 'bots', created_at: '2026-01-01T00:00:00Z' }] } }))
  const view = mount(Users)
  await flushPromises()
  if (kind === 'bots') {
    await view.get('[aria-controls="users-bots"]').trigger('click')
    await flushPromises()
  }
  expect(view.getComponent(DataTable).props('dataKey')).toBe('user_id')
  expect(view.get('table').attributes('aria-label')).toBe(kind === 'bots' ? 'Bots' : 'All users')
  expect(view.findAll('th').map(th => th.text())).toEqual(['Account', 'Status', 'Roles', 'Created', 'Actions'])
  expect(view.get('.p-datatable-tbody').text()).toContain('Reviewers')
  expect(view.find('[aria-label="Edit Review account"]').exists()).toBe(true)
  expect(view.find(`[aria-label="${kind === 'bots' ? 'Disable' : 'Delete'} Review account"]`).exists()).toBe(true)
  view.unmount()
})
