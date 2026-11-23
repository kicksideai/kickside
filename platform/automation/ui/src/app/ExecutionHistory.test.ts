// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'
import ExecutionHistory from './ExecutionHistory.vue'

vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn() } }))
vi.mock('../../../../users/ui/src/principals', () => ({ resolvePrincipals: vi.fn().mockResolvedValue([]) }))

it('keeps delivery and Workflow outcomes distinct when the optional outcome is present', async () => {
  const entry = {
    drive_key: 'main', round_token: 'round', source_port: 'timer', item_key: 'item',
    identity_key: 'delivery', state: 'resolved', evidence_status: 'absent', round_at: '2026-11-20T16:00:00Z',
  }
  vi.mocked(api.get).mockImplementation(async (_path: string, options?: { params?: { kind?: string } }) => {
    const kind = options?.params?.kind
    const entries = kind === 'deliveries' ? [
      entry,
      { ...entry, identity_key: 'workflow-delivery', workflow_run: { status: 'failed', error: 'Inventory unavailable' } },
    ] : []
    return { data: { success: true, kind, entries } } as Awaited<ReturnType<typeof api.get>>
  })
  const wrapper = mount(ExecutionHistory, { props: { root: 'automation' } })
  try {
    await flushPromises()
    const records = wrapper.findAll('article')
    expect(records[0].text()).toContain('Delivered')
    expect(records[0].text()).not.toContain('Workflow run')
    expect(records[1].text()).toContain('Delivered')
    expect(records[1].text()).toContain('Workflow run')
    expect(records[1].text()).toContain('Failed')
    expect(records[1].text()).toContain('Inventory unavailable')
  } finally {
    wrapper.unmount()
  }
})
