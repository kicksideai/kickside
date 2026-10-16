import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Automations from './automations.vue'

// Catalog shape for a binding with no kind actions (the published Data Sync
// failure). The backend catalog test independently requires these six controls.
const sync = {
  id: 'kickside.sync:sync', title: 'Data Sync', actions: [],
  controls: [
    { name: 'pause' }, { name: 'resume' }, { name: 'run_now' },
    { name: 'replay', request_id_required: true },
    { name: 'resync', request_id_required: true },
    { name: 'discard', request_id_required: true, keys_required: true },
  ],
}
const active = { drives: [{ drive_key: 'main', source_kind: 'collection', phase: 'active', enabled: true }] }
const paused = { drives: [{ drive_key: 'main', source_kind: 'collection', phase: 'paused', enabled: false }] }

describe('Data Sync generic catalog controls', () => {
  it('keeps type actions beside generic controls in both row and drawer menus', async () => {
    const type = { ...sync, actions: [{ name: 'execute' }, { name: 'inspect' }] }
    vi.stubGlobal('__props__', { config: {} })
    vi.stubGlobal('__api__', {
      '/automations/types': { success: true, types: [type] },
      '/automations/sync-1/status': { success: true, ...active },
      '/api/v1/automations': { success: true, automations: [{ id: 'sync-1', type: sync.id, title: 'Data Sync', drive_status: active }] },
    })
    const w = mount(Automations)
    await flushPromises()
    await w.get('button[aria-label="More actions for Data Sync"]').trigger('click')
    for (const method of ['run_now', 'execute', 'inspect', 'replay', 'resync', 'discard']) {
      expect(w.find(`[data-testid="action-${method}"]`).exists()).toBe(true)
    }
    document.body.click()
    await flushPromises()
    expect(w.find('[role="menu"]').exists()).toBe(false)
    await w.get('button[aria-label="Open Data Sync details"]').trigger('click')
    await flushPromises()
    const drawer = w.get('[data-testid="detail-drawer"]')
    await drawer.get('button[aria-label="More actions for Data Sync"]').trigger('click')
    for (const method of ['run_now', 'execute', 'inspect', 'replay', 'resync', 'discard']) {
      expect(drawer.find(`[data-testid="action-${method}"]`).exists()).toBe(true)
    }
    w.unmount()
  })

  it('shows Pause on an active sync and Resume after a committed pause, returns to Active after resume', async () => {
    vi.stubGlobal('__props__', { config: {} })
    const responses = {
      '/automations/types': { success: true, types: [sync] },
      '/api/v1/automations/sync-1/actions/pause': { success: true, result: { state: 'succeeded' } },
      '/api/v1/automations/sync-1/actions/resume': { success: true, result: { state: 'succeeded' } },
      '/api/v1/automations/sync-1/actions/run_now': { success: true, result: { state: 'succeeded' } },
      '/automations/sync-1/status': { success: true, ...paused },
      '/api/v1/automations': { success: true, automations: [{ id: 'sync-1', type: sync.id, title: 'Data Sync', drive_status: active }] },
    }
    vi.stubGlobal('__api__', responses)
    const w = mount(Automations)
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Active')
    await w.get('button[aria-label="Pause Data Sync"]').trigger('click')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/automations/sync-1/actions/pause', { request_id: expect.any(String) })
    expect(w.get('.kx-badge').text()).toBe('Paused')
    expect(w.find('button[aria-label="Pause Data Sync"]').exists()).toBe(false)
    responses['/automations/sync-1/status'] = { success: true, ...active }
    await w.get('button[aria-label="Resume Data Sync"]').trigger('click')
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Active')
    expect(w.find('button[aria-label="Pause Data Sync"]').exists()).toBe(true)
    await w.get('button[aria-label="More actions for Data Sync"]').trigger('click')
    expect(w.get('[data-testid="action-discard"]').attributes('disabled')).toBeDefined()
    await w.get('[data-testid="action-run_now"]').trigger('click')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/automations/sync-1/actions/run_now', { request_id: expect.any(String) })
    w.unmount()
  })
})
