import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DetailDrawer from './DetailDrawer.vue'

const failedStatus = {
  drives: [{ drive_key: 'main', source_kind: 'event', phase: 'active', enabled: true, last_round_at: '2026-10-02T00:00:00Z' }],
  delivery_failures: { count: 1, last_error: { code: 'invalid_expression', message: 'payload.filename is missing', at: '2026-10-02T00:00:00Z' } },
}

describe('automation delivery failures', () => {
  it('shows missing modules ahead of retained drive state in the drawer', async () => {
    const w = mount(DetailDrawer, { props: { automation: {
      id: 'a1', drive_status: failedStatus,
      availability: { code: 'unavailable', message: 'Automation type unavailable: ns:removed' },
    } } })
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Unavailable')
    expect(w.get('[data-testid="drawer-error-card"]').text()).toContain('Reinstall its module to use this automation.')
    expect(w.text()).not.toContain('ns:removed')
    w.unmount()
  })

  beforeEach(() => {
    vi.stubGlobal('__api__', { '/automations/a1/status': { success: true, ...failedStatus } })
  })

  it('keeps a paused drive paused while still displaying its delivery failure', async () => {
    const status = { ...failedStatus, drives: [{ ...failedStatus.drives[0], phase: 'paused', enabled: false }] }
    vi.stubGlobal('__api__', { '/automations/a1/status': { success: true, ...status } })
    const w = mount(DetailDrawer, { props: { automation: { id: 'a1', drive_status: status } } })
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Paused')
    expect(w.get('[data-testid="drawer-error-card"]').text()).toContain('payload.filename is missing')
    w.unmount()
  })

  it('shows terminal delivery failures and their reason in activity and overview', async () => {
    const w = mount(DetailDrawer, { props: {
      automation: { id: 'a1', title: 'Receipt review', drive_status: failedStatus, public_state: {} },
      type: { id: 'fixture:kind', actions: [{ name: 'status' }] },
    } })
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Needs attention')
    expect(w.get('[data-testid="drawer-error-card"]').text()).toContain('payload.filename is missing')
    await w.get('[data-testid="drawer-tab-activity"]').trigger('click')
    expect(w.text()).not.toContain('Never')
    const facts = w.findAll('.kx-dfact').map(f => f.text())
    expect(facts).toContain('Failed deliveries1')
    expect(w.text()).toContain('invalid_expression')
    expect(w.text()).toContain('payload.filename is missing')
    w.unmount()
  })
})
