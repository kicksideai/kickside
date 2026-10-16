import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Automations from './automations.vue'

const g = globalThis as any

// WcMount mounts only a registered custom element.
if (!customElements.get('provider-sync-manage')) customElements.define('provider-sync-manage', class extends HTMLElement {})

// A registry-native automation type with contributed create and manage views,
// declared run-now and lifecycle actions, and a projected public state.
const SYNC_TYPE = {
  id: 'provider.sync:sync',
  title: 'Data Sync',
  icon: 'tabler:arrows-exchange',
  class: 'automation',
  component: {
    create_ui: { tag_name: 'provider-sync-create' },
    manage_ui: { tag_name: 'provider-sync-manage', base_path: 'provider-sync', entry_point: 'manage.js' },
  },
  actions: [{ name: 'execute' }, { name: 'pause' }, { name: 'resume' }],
  public_state_schema: { fields: [
    { key: 'enabled', type: 'boolean', hidden: true },
    { key: 'status', type: 'text', hidden: true },
    { key: 'when', type: 'text', label: 'When', role: 'subtitle' },
    { key: 'accepted_count', type: 'integer', label: 'Items processed' },
    { key: 'phase', type: 'text', label: 'Phase', hidden: true },
    { key: 'schedule_type', type: 'text', hidden: true },
    { key: 'schedule_expression', type: 'text', hidden: true },
  ] },
}

const ROW = {
  id: 's1',
  type: 'provider.sync:sync',
  title: 'Lead mirror',
  class: 'automation',
  public_state: { enabled: true },
}

describe('automation rows', () => {
  beforeEach(() => {
    g.__realtime__ = { on: vi.fn(() => vi.fn()) }
    g.__props__ = { config: {} }
    g.__api__ = {
      '/automations/types': { success: true, types: [SYNC_TYPE] },
      '/api/v1/automations': { success: true, automations: [ROW] },
    }
  })

  it('reads the row as the kind title and its declared subtitle, never engine fields', async () => {
    g.__api__['/api/v1/automations'] = {
      success: true,
      automations: [{
        ...ROW,
        public_state: {
          enabled: true, status: 'failed', when: 'On upload completed', accepted_count: 12,
          phase: 'live', schedule_type: 'trigger', schedule_expression: 'on event',
        },
      }],
    }
    const w = mount(Automations)
    await flushPromises()
    expect(w.findAll('.kx-row')).toHaveLength(1)
    expect(w.find('.kx-sub').text()).toContain('Data Sync · On upload completed')
    expect(w.text()).toContain('Items Processed')
    expect(w.text()).not.toContain('trigger')
    expect(w.text()).not.toContain('Phase')
    expect(w.text()).not.toContain('on event')
    expect(w.find('.kx-badge').text()).toContain('Failed')
    w.unmount()
  })

  it('shows a scheduled row next run once alongside its last run', async () => {
    const nextRun = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString()
    g.__api__['/automations/types'] = { success: true, types: [{
      ...SYNC_TYPE,
      public_state_schema: { fields: [...SYNC_TYPE.public_state_schema.fields, { key: 'next_run_at', type: 'text' }] },
    }] }
    g.__api__['/api/v1/automations'] = { success: true, automations: [{
      ...ROW, public_state: { enabled: true, next_run_at: nextRun },
      drive_status: { drives: [{ drive_key: 'timer', source_kind: 'timer', enabled: true, phase: 'live',
        last_run_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), next_run_at: nextRun }] },
    }] }
    const w = mount(Automations)
    await flushPromises()
    const row = w.find('.kx-row').text()
    expect(row).toContain('last ran 3d ago')
    expect(row).toContain('next in 4d')
    expect(row.match(/in 4d/g)).toHaveLength(1)
    expect(row).not.toContain('Next Run At')
    expect(row).not.toContain('just now')
    w.unmount()
  })

  it('runs an automation now through its declared execute action', async () => {
    const w = mount(Automations)
    await flushPromises()
    await w.find('button[aria-label="More actions for Lead mirror"]').trigger('click')
    const run = w.find('[aria-label="Run Lead mirror now"]')
    expect(run.exists()).toBe(true)
    await run.trigger('click')
    await flushPromises()
    expect((api.post as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/automations/s1/actions/execute')).toBe(true)
    w.unmount()
  })

  it('edits an automation in its type\'s declared manage view, handed the row as config', async () => {
    const w = mount(Automations)
    await flushPromises()
    await w.find('button[aria-label="More actions for Lead mirror"]').trigger('click')
    await w.find('[aria-label="Edit Lead mirror"]').trigger('click')
    await flushPromises()
    const el = w.element.querySelector('.kx-modal-manage provider-sync-manage') as HTMLElement | null
    expect(el).toBeTruthy()
    expect(JSON.parse(el?.getAttribute('config') || '{}').id).toBe('s1')
    w.unmount()
  })

  it('mounts the declared manage view in the details Config tab and renders no configuration itself', async () => {
    const w = mount(Automations)
    await flushPromises()
    await w.find('button[aria-label="Open Lead mirror details"]').trigger('click')
    await w.find('[data-testid="drawer-tab-config"]').trigger('click')
    await flushPromises()
    const config = w.find('[data-testid="drawer-config"]')
    const el = config.element.querySelector('provider-sync-manage') as HTMLElement | null
    expect(el).toBeTruthy()
    expect(JSON.parse(el?.getAttribute('config') || '{}').id).toBe('s1')
    expect((api.get as any).mock.calls.some((c: any[]) => String(c[0]).includes('/config'))).toBe(false)
    w.unmount()
  })

  it('states that a type without a manage view has no settings view', async () => {
    g.__api__['/automations/types'] = { success: true, types: [{ ...SYNC_TYPE, component: {} }] }
    const w = mount(Automations)
    await flushPromises()
    await w.find('button[aria-label="Open Lead mirror details"]').trigger('click')
    await w.find('[data-testid="drawer-tab-config"]').trigger('click')
    await flushPromises()
    expect(w.find('[data-testid="drawer-config"]').text()).toContain('declares no settings view')
    w.unmount()
  })

  it('lists one automation projection scoped to the owning component', async () => {
    g.__props__ = { config: {}, componentId: 'crm-1' }
    ;(api.get as any).mockClear()
    const w = mount(Automations)
    await flushPromises()
    const listCalls = (api.get as any).mock.calls.filter((c: any[]) => String(c[0]) === '/api/v1/automations')
    expect(listCalls).toHaveLength(1)
    expect(listCalls[0][1]?.params).toEqual({ class: 'automation', parent_id: 'crm-1' })
    w.unmount()
  })
})
