import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import Automations from './automations.vue'
import { drivePill, driveFacts, driveProblem } from './drive-status'

const g = globalThis as any

// A kind driven by the automation round: its run state is the generic drive
// status (the status action), not its public state.
const SYNC_TYPE = {
  id: 'provider.sync:sync',
  title: 'Data Sync',
  icon: 'tabler:arrows-exchange',
  class: 'automation',
  actions: [{ name: 'status' }, { name: 'pause' }, { name: 'resume' }],
  public_state_schema: { fields: [
    { key: 'enabled', type: 'boolean', hidden: true },
    { key: 'status', type: 'text', hidden: true },
    { key: 'when', type: 'text', label: 'When', role: 'subtitle' },
  ] },
}

function drive(fields: Record<string, unknown>) {
  return { drive_key: 'main', source_kind: 'collection', phase: 'active', enabled: true, unresolved_count: 0, uncertain_count: 0, ...fields }
}

function row(drives: unknown[]) {
  return {
    id: 's1', type: 'provider.sync:sync', title: 'Lead mirror', class: 'automation',
    public_state: { enabled: true, status: 'idle', when: 'Every 15 min' },
    drive_status: { drives },
  }
}

describe('drive status wording', () => {
  it('reads the drives in user-facing words', () => {
    expect(drivePill({ drives: [drive({})] })).toEqual({ kind: 'on', label: 'Active' })
    expect(drivePill({ drives: [drive({ phase: 'paused', enabled: false })] })).toEqual({ kind: 'off', label: 'Paused' })
    expect(drivePill({ drives: [drive({ phase: 'degraded' })] })).toEqual({ kind: 'warn', label: 'Retrying' })
    expect(drivePill({ drives: [drive({ phase: 'backpressure' })] })).toEqual({ kind: 'live', label: 'Catching up' })
    expect(drivePill({ drives: [drive({ phase: 'pending' })] })).toEqual({ kind: 'neutral', label: 'Starting' })
    for (const phase of ['blocked_identity', 'blocked_access', 'blocked_declaration']) {
      expect(drivePill({ drives: [drive({ phase })] })).toEqual({ kind: 'warn', label: 'Needs attention' })
    }
    // A kind without source drives reports through its public state.
    expect(drivePill({ drives: [drive({ source_kind: 'none' })] })).toBeNull()
    expect(drivePill(undefined)).toBeNull()
  })

  it.each(['timer', 'collection'])('labels an armed %s drive as Scheduled before and after its first run', source_kind => {
    for (const last_run_at of [undefined, '2026-01-01T00:00:00Z']) {
      expect(drivePill({ drives: [drive({ source_kind, next_run_at: '2099-01-01T00:00:00Z', last_run_at })] }))
        .toEqual({ kind: 'on', label: 'Scheduled' })
    }
  })

  it('preserves initialization, event activity, pauses and failures over schedule wording', () => {
    const scheduled = drive({ source_kind: 'timer', next_run_at: '2099-01-01T00:00:00Z' })
    expect(drivePill({ drives: [{ ...scheduled, phase: 'pending' }] })?.label).toBe('Scheduled')
    expect(drivePill({ drives: [{ ...scheduled, phase: 'pending', next_run_at: null }] })?.label).toBe('Starting')
    expect(drivePill({ drives: [{ ...scheduled, source_kind: 'event' }] })?.label).toBe('Active')
    expect(drivePill({ drives: [{ ...scheduled, next_run_at: '2000-01-01T00:00:00Z' }] })?.label).toBe('Active')
    expect(drivePill({ drives: [{ ...scheduled, phase: 'paused', enabled: false }] })?.label).toBe('Paused')
    expect(drivePill({ drives: [{ ...scheduled, phase: 'degraded' }] })?.label).toBe('Retrying')
    expect(drivePill({ drives: [{ ...scheduled, phase: 'backpressure' }] })?.label).toBe('Catching up')
    expect(drivePill({ drives: [scheduled], delivery_failures: { count: 1 } })?.label).toBe('Needs attention')
    expect(drivePill({ drives: [scheduled, drive({ source_kind: 'event' })] })?.label).toBe('Active')
    expect(drivePill({ drives: [scheduled, drive({ source_kind: 'reconcile' })] })?.label).toBe('Scheduled')
  })

  it('explains a stuck drive without engine words', () => {
    expect(driveProblem({ drives: [drive({ phase: 'blocked_identity' })] }))
      .toBe('The account this automation runs as needs to be confirmed.')
    expect(driveProblem({ drives: [drive({ phase: 'degraded', last_error: { message: 'provider timeout' } })] }))
      .toBe('provider timeout')
    expect(driveProblem({ drives: [drive({})] })).toBe('')
  })


  it('lists the next run and the items waiting to retry', () => {
    const facts = driveFacts({ drives: [
      drive({ next_run_at: '2099-01-01T00:10:00Z', unresolved_count: 2 }),
      drive({ drive_key: 'reconcile', source_kind: 'reconcile', next_run_at: '2099-01-01T00:05:00Z', unresolved_count: 1 }),
    ] })
    expect(facts.map(f => f.label)).toEqual(['Next run', 'Waiting to retry'])
    expect(facts[1].value).toBe('3 items')
  })
})

describe('automation rows on drive status', () => {
  beforeEach(() => {
    g.__realtime__ = { on: vi.fn(() => vi.fn()) }
    g.__props__ = { config: {} }
    ;(api.get as any).mockClear()
    ;(api.post as any).mockClear()
  })

  it.each(['timer', 'collection'])('shows Scheduled in the row and drawer for an armed %s drive', async source_kind => {
    const scheduled = drive({ source_kind, next_run_at: '2099-01-01T00:00:00Z' })
    g.__api__ = {
      '/automations/s1/status': { success: true, drives: [scheduled] },
      '/automations/types': { success: true, types: [SYNC_TYPE] },
      '/api/v1/automations': { success: true, automations: [row([scheduled])] },
    }
    const w = mount(Automations)
    await flushPromises()
    expect(w.get('.kx-badge').text()).toBe('Scheduled')
    await w.get('button[aria-label="Open Lead mirror details"]').trigger('click')
    await flushPromises()
    const drawer = w.get('[data-testid="detail-drawer"]')
    expect(drawer.get('.kx-badge').text()).toBe('Scheduled')
    expect(drawer.text()).toContain('Next run')
    w.unmount()
  })

  it('shows a generically paused drive as Paused though its public state is unchanged', async () => {
    g.__api__ = {
      '/automations/types': { success: true, types: [SYNC_TYPE] },
      '/api/v1/automations': { success: true, automations: [row([drive({ phase: 'paused', enabled: false })])] },
    }
    const w = mount(Automations)
    await flushPromises()
    expect(w.find('.kx-badge').text()).toContain('Paused')
    expect(w.find('button[aria-label="Resume Lead mirror"]').exists()).toBe(true)
    w.unmount()
  })

  it('reads the drive status again after a pause and reflects it', async () => {
    g.__api__ = {
      '/automations/s1/status': { success: true, drives: [drive({ phase: 'paused', enabled: false })] },
      '/automations/s1/actions/pause': { success: true, result: { success: true } },
      '/automations/types': { success: true, types: [SYNC_TYPE] },
      '/api/v1/automations': { success: true, automations: [row([drive({})])] },
    }
    const w = mount(Automations)
    await flushPromises()
    expect(w.find('.kx-badge').text()).toContain('Active')
    await w.find('button[aria-label="Pause Lead mirror"]').trigger('click')
    await flushPromises()
    expect((api.get as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/automations/s1/status')).toBe(true)
    expect(w.find('.kx-badge').text()).toContain('Paused')
    w.unmount()
  })


  it('opens the drawer on the status action with user-facing facts', async () => {
    g.__api__ = {
      '/automations/s1/status': { success: true, drives: [drive({ phase: 'blocked_identity', unresolved_count: 4 })] },
      '/automations/types': { success: true, types: [SYNC_TYPE] },
      '/api/v1/automations': { success: true, automations: [row([drive({})])] },
    }
    const w = mount(Automations)
    await flushPromises()
    await w.find('button[aria-label="Open Lead mirror details"]').trigger('click')
    await flushPromises()
    const drawer = w.find('[data-testid="detail-drawer"]')
    expect((api.get as any).mock.calls.some((c: any[]) => c[0] === '/api/v1/automations/s1/status')).toBe(true)
    expect(drawer.find('.kx-badge').text()).toContain('Needs attention')
    expect(drawer.find('[data-testid="drawer-error-card"]').text()).toContain('needs to be confirmed')
    expect(drawer.text()).toContain('Waiting to retry')
    expect(drawer.text()).not.toContain('blocked_identity')
    w.unmount()
  })
})
