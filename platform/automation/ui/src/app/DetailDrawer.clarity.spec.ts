// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import DetailDrawer from './DetailDrawer.vue'

describe('automation detail facts', () => {
  it('owns progress in Overview, status in the header, and last run in Activity', async () => {
    const next = '2099-01-01T00:00:00Z'
    const drives = { drives: [{ drive_key: 'main', source_kind: 'timer', phase: 'active', enabled: true, next_run_at: next }] }
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, ...drives } } as any)
    const w = mount(DetailDrawer, { props: {
      automation: { id: 'task', title: 'Digest', drive_status: drives, public_state: { status: 'idle', enabled: true, next_run_at: next, last_run_at: '2026-01-01T00:00:00Z', count: 2 } },
      type: { id: 'type', actions: [{ name: 'status' }], public_state_schema: { fields: [{ key: 'count', label: 'Items', type: 'integer' }] } },
    } })
    await flushPromises()
    expect(w.findAll('[role="tab"]').map(tab => tab.text())).toEqual(['Overview', 'Config', 'Activity'])
    const facts = w.findAll('.kx-dfact-k').map(fact => fact.text())
    expect(facts).not.toContain('Status'); expect(facts).not.toContain('Enabled'); expect(facts).not.toContain('Last run')
    expect(facts.filter(label => label === 'Next run')).toHaveLength(1)
    expect(w.text()).toContain('Progress'); expect(w.text()).toContain('Items')
    await w.get('[data-testid="drawer-tab-activity"]').trigger('click')
    expect(w.findAll('.kx-dfact-k').filter(fact => fact.text() === 'Last run')).toHaveLength(1)
  })
})
