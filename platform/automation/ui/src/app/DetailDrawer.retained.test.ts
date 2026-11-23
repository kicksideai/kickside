// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { flushPromises, shallowMount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { api } from '@wippy-fe/proxy'
import DetailDrawer from './DetailDrawer.vue'

vi.mock('@iconify/vue', () => ({ Icon: { template: '<span />' } }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn() }, host: { handleError: vi.fn() } }))

it('shows the retained hold and counts when the predecessor still describes itself as active', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: {
    success: true, drives: [],
    legacy_adoption: { state: 'awaiting_adoption', unresolved: 2, dependency_blocked: 1 },
  } } as Awaited<ReturnType<typeof api.get>>)
  const wrapper = shallowMount(DetailDrawer, {
    global: { renderStubDefaultSlot: true },
    props: {
      automation: {
        id: 'retained', title: 'Retained Sync', drive_status: { drives: [] },
        public_state: { status: 'active', next_run_at: '2099-01-01T00:00:00Z' },
      },
    },
  })
  try {
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/api/v1/automations/retained/status')
    expect(wrapper.text()).toContain('Handoff required')
    const facts = wrapper.findAll('.kx-dfact').map(fact => fact.text())
    expect(facts).toContain('Unresolved deliveries2')
    expect(facts).toContain('Blocked by a dependency1')
    expect(facts.some(fact => fact.includes('Next run'))).toBe(false)
  } finally {
    wrapper.unmount()
  }
})
