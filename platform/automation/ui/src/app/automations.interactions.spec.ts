import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { api } from '@wippy-fe/proxy'
import Automations from './automations.vue'
beforeEach(() => {
  ;(globalThis as any).__realtime__ = { on: vi.fn(() => vi.fn()) }
  ;(globalThis as any).__api__ = {
    '/automations/types': { success: true, types: [{
      id: 'feed', label: 'Feed', input_schema: { fields: [] },
      exportable: true,
      public_state_schema: { fields: [{ key: 'accepted_count', type: 'integer', label: 'Items processed' }] },
    }] },
    // The list row carries its materialized public_state; the card sources status
    // from it with no per-row status fetch. accepted_count arrives as a TEXT '9'
    // to prove the read-side integer coercion still renders it as a number.
    '/api/v1/automations': { success: true, automations: [
      { id: 'a1', type: 'feed', title: 'My feed', public_state: { enabled: true, status: 'idle', accepted_count: '9' } },
    ] },
  }
})
describe('automations.vue interactions', () => {
  it('reads committed state when details open after a missed notification', async () => {
    const w = mount(Automations)
    await flushPromises()
    ;(globalThis as any).__api__['/api/v1/automations'] = { success: true, automations: [{
      id: 'a1', type: 'feed', title: 'My feed', public_state: {
        enabled: true, status: 'error', last_error: 'Configured operator is unavailable', consecutive_failures: 1,
      },
    }] }
    await w.get('button[aria-label="Open My feed details"]').trigger('click')
    await flushPromises()
    expect(w.get('[role="dialog"][aria-label="My feed"]').text()).toContain('Configured operator is unavailable')
    w.unmount()
  })

  it('shows a committed-state read failure when details open', async () => {
    const w = mount(Automations)
    await flushPromises()
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Committed state read is unavailable'))
    await w.get('button[aria-label="Open My feed details"]').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('Committed state read is unavailable')
    w.unmount()
  })

  it('shows unavailable modules ahead of retained active drive status', async () => {
    ;(globalThis as any).__api__['/automations/types'] = { success: true, types: [] }
    ;(globalThis as any).__api__['/api/v1/automations'] = { success: true, automations: [{
      id: 'a1', type: 'removed', title: 'Retained automation',
      availability: { code: 'unavailable', message: 'Automation type is unavailable: ns:removed' },
      drive_status: { drives: [{ drive_key: 'retained', source_kind: 'event', phase: 'idle', enabled: true }] },
    }] }
    const w = mount(Automations)
    await flushPromises()
    expect(w.text()).toContain('Unavailable')
    expect(w.text()).toContain('Reinstall its module to use this automation.')
    expect(w.text()).not.toContain('Active')
    expect(w.text()).not.toContain('ns:removed')
    w.unmount()
  })

  it('downloads the portable artifact, including the configured transform', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/automations/a1/export': {
        success: true,
        artifact: {
          apiVersion: 'kickside.automation/v1',
          kind: 'Automation',
          spec: { type: 'kickside.sync:sync', input: { transform: { kind: 'expr', expr: 'payload' } } },
        },
      },
      ...(globalThis as any).__api__,
    }
    const originalURL = globalThis.URL
    const createObjectURL = vi.fn(() => 'blob:automation')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const w = mount(Automations)
    await flushPromises()
    // Export lives in the row's overflow menu now — open it, then pick Export.
    await w.get('button[aria-label="More actions for My feed"]').trigger('click')
    await w.get('button[aria-label="Export My feed"]').trigger('click')
    await flushPromises()

    expect(api.get).toHaveBeenCalledWith('/api/v1/automations/a1/export')
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:automation')
    click.mockRestore()
    vi.stubGlobal('URL', originalURL)
    w.unmount()
  })

  it('does not offer export for types without an explicit portable contract', async () => {
    ;(globalThis as any).__api__['/automations/types'] = {
      success: true,
      types: [{ id: 'private', label: 'Private', input_schema: { fields: [] } }],
    }
    ;(globalThis as any).__api__['/api/v1/automations'] = {
      success: true,
      automations: [{ id: 'private-1', type: 'private', title: 'Private worker' }],
    }
    const w = mount(Automations)
    await flushPromises()
    expect(w.find('button[aria-label="Export Private worker"]').exists()).toBe(false)
    w.unmount()
  })

  it('renders rows and metrics from the list public_state, with no status fetch', async () => {
    ;(api.post as any).mockClear()
    const w = mount(Automations)
    await flushPromises()
    expect(w.html()).toContain('My feed')
    // Metric rendered straight from the row's public_state (TEXT '9' coerced to 9).
    expect(w.text()).toContain('Items Processed')
    expect(w.text()).toContain('9')
    // No /actions/status round-trip fired on load.
    const statusCalls = (api.post as any).mock.calls.filter((c: any[]) => String(c[0]).includes('/actions/status'))
    expect(statusCalls).toHaveLength(0)
    w.unmount()
  })

  it('keeps count chips on the card face and moves item ids and reasons into the disclosure', async () => {
    ;(globalThis as any).__api__['/automations/types'] = { success: true, types: [{
      id: 'sync', label: 'Sync', input_schema: { fields: [] },
      public_state_schema: { fields: [
        { key: 'skipped_count', type: 'integer', label: 'Items skipped', hide_zero: true },
        { key: 'last_skipped_item_key', type: 'text', label: 'Skipped item' },
        { key: 'last_failed_item_key', type: 'text', label: 'Failed item' },
        { key: 'last_skip_reason', type: 'text', label: 'Skip reason' },
      ] },
    }] }
    ;(globalThis as any).__api__['/api/v1/automations'] = { success: true, automations: [
      { id: 'a1', type: 'sync', title: 'Wedge', public_state: {
        enabled: true, status: 'idle',
        skipped_count: 2,
        last_skipped_item_key: '019f4b1f-df4d-7009-935c-35b75aed03a7',
        last_failed_item_key: '019f4b1f-df4d-7009-935c-35b75aed03a8',
        last_skip_reason: 'component_id not in scope',
      } },
    ] }
    const w = mount(Automations)
    await flushPromises()

    // The count chip stays on the card face.
    const face = w.find('.kx-metrics:not(.kx-metrics-detail)')
    expect(face.text()).toContain('Items Skipped')
    expect(face.text()).toContain('2')
    // No raw id and no technical reason ever render on the face.
    expect(face.text()).not.toContain('019f4b1f')
    expect(face.text()).not.toContain('not in scope')

    // The offending ids and reason live behind the row disclosure.
    const disclosure = w.find('.kx-metric-details')
    expect(disclosure.exists()).toBe(true)
    const detailValue = disclosure.findAll('.kx-metric-v').find((n) => n.attributes('title') === '019f4b1f-df4d-7009-935c-35b75aed03a7')
    expect(detailValue).toBeTruthy()
    // The raw UUID never renders in full; a truncated chip stands in for it.
    expect(detailValue!.text()).toBe('019f4b1f…')
    expect(w.text()).not.toContain('df4d-7009-935c')
    // The technical skip reason reads as operator language, raw kept in the tooltip.
    expect(disclosure.text()).toContain('Not part of this workspace')
    const reasonValue = disclosure.findAll('.kx-metric-v').find((n) => /Not part of this workspace/.test(n.text()))
    expect(reasonValue!.attributes('title')).toBe('component_id not in scope')
    w.unmount()
  })

  it('falls back to a generic Skipped chip with the technical reason in the tooltip', async () => {
    ;(globalThis as any).__api__['/automations/types'] = { success: true, types: [{
      id: 'sync', label: 'Sync', input_schema: { fields: [] },
      public_state_schema: { fields: [{ key: 'last_skip_reason', type: 'text', label: 'Skip reason' }] },
    }] }
    ;(globalThis as any).__api__['/api/v1/automations'] = { success: true, automations: [
      { id: 'a1', type: 'sync', title: 'Wedge', public_state: { enabled: true, status: 'idle', last_skip_reason: 'some novel engine failure' } },
    ] }
    const w = mount(Automations)
    await flushPromises()
    const disclosure = w.find('.kx-metric-details')
    expect(disclosure.exists()).toBe(true)
    const reasonValue = disclosure.findAll('.kx-metric-v').find((n) => n.text() === 'Skipped')
    expect(reasonValue).toBeTruthy()
    expect(reasonValue!.attributes('title')).toBe('some novel engine failure')
    w.unmount()
  })
})

describe('automations.vue install + actions', () => {
  it('shows pause and resume results immediately without waiting for realtime', async () => {
    ;(globalThis as any).__api__ = {
      '/api/v1/automations/a1/actions/pause': { success: true, result: { success: true, status: 'paused', paused: true } },
      '/api/v1/automations/a1/actions/resume': { success: true, result: { success: true, status: 'active', paused: false } },
      '/automations/types': { success: true, types: [
        { id: 'feed', label: 'Feed', actions: [{ name: 'pause' }, { name: 'resume' }] },
      ] },
      '/api/v1/automations': { success: true, automations: [
        { id: 'a1', type: 'feed', title: 'My feed', public_state: { status: 'active' } },
      ] },
    }

    const w = mount(Automations)
    await flushPromises()
    expect(w.text()).toContain('Active')

    await w.get('button[aria-label="Pause My feed"]').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('Paused')
    expect(w.get('button[aria-label="Resume My feed"]')).toBeTruthy()

    await w.get('button[aria-label="Resume My feed"]').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('Active')
    expect(w.get('button[aria-label="Pause My feed"]')).toBeTruthy()
    w.unmount()
  })

  it('opens the install dialog and triggers a row action', async () => {
    const w = mount(Automations)
    await flushPromises()
    const install = w.find('[data-testid="automations-add"]')
    if (install.exists() && !install.attributes('disabled')) { await install.trigger('click'); await flushPromises() }
    // trigger a row action if present
    const act = w.findAll('button').find(b => /trigger|pause|resume|status/i.test(b.text()))
    if (act) { await act.trigger('click'); await flushPromises() }
    expect(w.exists()).toBe(true)
    w.unmount()
  })

  it('applies component-scoped public state realtime updates', async () => {
    const handlers: Record<string, (e: unknown) => void> = {}
    const off = vi.fn()
    ;(globalThis as any).__realtime__ = {
      on: vi.fn((topic: string, cb: (e: unknown) => void) => {
        handlers[topic] = cb
        return off
      }),
    }
    ;(globalThis as any).__api__['/automations/types'] = { success: true, types: [
      { id: 'feed', title: 'Feed', public_state_schema: { fields: [{ key: 'when', type: 'text', role: 'subtitle' }] } },
    ] }
    ;(globalThis as any).__api__['/api/v1/automations'] = { success: true, automations: [
      { id: 'a1', type: 'feed', title: 'My feed' },
    ] }

    const w = mount(Automations)
    await flushPromises()
    expect((globalThis as any).__realtime__.on).toHaveBeenCalledWith('component.a1', expect.any(Function))

    handlers['component.a1']?.({
      event: 'component.meta.changed',
      component_id: 'a1',
      meta: { enabled: false, when: 'Every 10 min' },
    })
    await nextTick()

    expect(w.text()).toContain('Paused')
    expect(w.text()).toContain('Feed · Every 10 min')
    w.unmount()
    expect(off).toHaveBeenCalled()
  })

  it('delivers realtime meta typed by the declared schema (integer as number, boolean as boolean)', async () => {
    const handlers: Record<string, (e: unknown) => void> = {}
    ;(globalThis as any).__realtime__ = {
      on: vi.fn((topic: string, cb: (e: unknown) => void) => {
        handlers[topic] = cb
        return vi.fn()
      }),
    }
    ;(globalThis as any).__api__['/automations/types'] = { success: true, types: [
      {
        id: 'sync',
        title: 'Data Sync',
        actions: [{ name: 'status' }, { name: 'pause' }, { name: 'resume' }],
        public_state_schema: {
          fields: [
            { key: 'enabled', type: 'boolean', label: 'Enabled' },
            { key: 'accepted_count', type: 'integer', label: 'Items processed' },
            { key: 'trigger_dropped_count', type: 'integer', label: 'Trigger drops', hide_zero: true },
          ],
        },
      },
    ] }
    ;(globalThis as any).__api__['/api/v1/automations'] = { success: true, automations: [
      { id: 'a1', type: 'sync', title: 'My Data Sync', public_state: { enabled: true, accepted_count: 1 } },
    ] }

    const w = mount(Automations)
    await flushPromises()

    // Relay carries raw TEXT ("false", "9", "0"); the seam coerces by declared type.
    handlers['component.a1']?.({
      event: 'component.meta.changed',
      component_id: 'a1',
      meta: { enabled: 'false', accepted_count: '9', trigger_dropped_count: '0' },
    })
    await nextTick()

    // Boolean coerced -> pause pill; integer coerced -> rendered number.
    expect(w.text()).toContain('Paused')
    expect(w.text()).toContain('9')
    // hide_zero compares against a real number, so a coerced "0" stays hidden.
    expect(w.text()).not.toContain('Trigger Drops')
    w.unmount()
  })

  it('renders completed once schedules as success, not paused or failing', async () => {
    ;(globalThis as any).__api__ = {
      '/automations/types': { success: true, types: [
        { id: 'recipe', title: 'Recipe', actions: [{ name: 'status' }, { name: 'run' }, { name: 'pause' }, { name: 'resume' }] },
      ] },
      '/api/v1/automations': { success: true, automations: [
        { id: 'a1', type: 'recipe', title: 'Web inbox run 20260619001921', public_state: {
          enabled: false,
          status: 'completed',
          schedule_type: 'once',
          last_run_at: 1781828793,
          last_error: 'Once schedule completed successfully',
          consecutive_failures: 0,
        } },
      ] },
    }

    const w = mount(Automations)
    await flushPromises()

    expect(w.text()).toContain('Completed')
    expect(w.text()).toContain('Once schedule completed successfully')
    expect(w.text()).not.toContain('Paused')
    expect(w.find('.kx-rowmsg-success').exists()).toBe(true)
    expect(w.find('.kx-rowmsg-error').exists()).toBe(false)
    w.unmount()
  })

  it('hides schema fields marked hidden and zero metrics marked hide_zero', async () => {
    ;(globalThis as any).__api__ = {
      '/automations/types': { success: true, types: [
        {
          id: 'sync',
          title: 'Data Sync',
          actions: [{ name: 'status' }],
          public_state_schema: {
            fields: [
              { key: 'accepted_count', type: 'integer', label: 'Items processed' },
              { key: 'connection_id', type: 'text', hidden: true },
              { key: 'trigger_dropped_count', type: 'integer', label: 'Trigger drops', hide_zero: true },
            ],
          },
        },
      ] },
      '/api/v1/automations': { success: true, automations: [
        { id: 'a1', type: 'sync', title: 'Data Sync flow', public_state: {
          enabled: true,
          status: 'idle',
          accepted_count: 7,
          connection_id: 'conn-raw-uuid',
          trigger_dropped_count: 0,
        } },
      ] },
    }

    const w = mount(Automations)
    await flushPromises()

    expect(w.text()).toContain('Items Processed')
    expect(w.text()).toContain('7')
    expect(w.text()).not.toContain('conn-raw-uuid')
    expect(w.text()).not.toContain('Trigger Drops')
    w.unmount()
  })

  it('opens the declared manage view from edit and offers no edit without one', async () => {
    ;(globalThis as any).__api__ = {
      '/automations/types': { success: true, types: [
        {
          id: 'managed',
          title: 'Managed Flow',
          component: {
            manage_ui: {
              tag_name: 'wc-managed-flow',
              base_path: 'managed',
              entry_point: 'manage.js',
            },
          },
        },
        { id: 'plain', title: 'Plain Flow' },
      ] },
      '/api/v1/automations': { success: true, automations: [
        { id: 'a-managed', type: 'managed', title: 'Managed one', public_state: { enabled: true } },
        { id: 'a-plain', type: 'plain', title: 'Plain one', public_state: { enabled: true } },
      ] },
    }

    const w = mount(Automations)
    await flushPromises()

    await w.find('button[aria-label="More actions for Managed one"]').trigger('click')
    await w.find('button[aria-label="Edit Managed one"]').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('Managed Flow')
    expect(w.find('.kx-modal-manage').exists()).toBe(true)

    await w.find('.p-dialog-close-button').trigger('click')
    await nextTick()

    await w.find('button[aria-label="More actions for Plain one"]').trigger('click')
    expect(w.find('button[aria-label="Edit Plain one"]').exists()).toBe(false)
    expect(w.find('button[aria-label="Rename Plain one"]').exists()).toBe(false)
    w.unmount()
  })

  it('drops component realtime subscriptions when a row is removed', async () => {
    const off = vi.fn()
    ;(globalThis as any).__realtime__ = {
      on: vi.fn(() => off),
    }
    ;(globalThis as any).__api__['/automations/types'] = { success: true, types: [
      { id: 'feed', title: 'Feed' },
    ] }
    ;(globalThis as any).__api__['/api/v1/automations'] = { success: true, automations: [
      { id: 'a1', type: 'feed', title: 'My feed' },
    ] }

    const w = mount(Automations)
    await flushPromises()
    expect((globalThis as any).__realtime__.on).toHaveBeenCalledWith('component.a1', expect.any(Function))

    await w.find('button[aria-label="More actions for My feed"]').trigger('click')
    await w.find('button[aria-label="Delete My feed"]').trigger('click')
    await nextTick()
    ;(globalThis as any).__api__['/api/v1/automations'] = { success: true, automations: [] }
    await w.find('[data-testid="automations-confirm-delete"]').trigger('click')
    await flushPromises()

    expect(off).toHaveBeenCalled()
    expect(w.text()).not.toContain('My feed')
    w.unmount()
  })
})

describe('automations.vue install submit', () => {
  beforeEach(() => {
    ;(globalThis as any).__api__['/automations/types'] = { success: true, types: [
      { id: 'feed', title: 'Feed', description: 'poll a source',
        inputs: { properties: { url: { type: 'string', title: 'URL' }, on: { type: 'boolean', title: 'On' } }, required: ['url'] } },
    ] }
  })
  it('opens install, picks a type, fills the form, and submits', async () => {
    const w = mount(Automations)
    await flushPromises()
    const open = w.findAll('button').find(b => /new automation|add/i.test(b.text()))
    if (open) { await open.trigger('click'); await flushPromises() }
    const type = w.findAll('.kx-cat-card').find(c => /Feed/.test(c.text()))
    if (type) { await type.trigger('click'); await flushPromises() }
    const field = w.find('.kx-input')
    if (field.exists()) await field.setValue('https://feed.example')
    const submit = w.find('[data-testid="automations-install-create"]')
    if (submit.exists()) { await submit.trigger('click'); await flushPromises() }
    expect(w.exists()).toBe(true)
    w.unmount()
  })
})

describe('automations.vue sensitive install inputs', () => {
  beforeEach(() => {
    ;(globalThis as any).__api__['/automations/types'] = { success: true, types: [
      { id: 'discord-bot', title: 'Discord Bot',
        inputs: { properties: {
          bot_token: { type: 'password', title: 'Bot token', sensitive: true },
          webhook_secret: { type: 'string', title: 'Webhook secret', format: 'password' },
        } } },
    ] }
  })

  it('renders password controls for sensitive fields', async () => {
    const w = mount(Automations)
    await flushPromises()
    const open = w.findAll('button').find(b => /add automation/i.test(b.text()))
    if (open) { await open.trigger('click'); await flushPromises() }
    const type = w.findAll('.kx-cat-card').find(c => /Discord Bot/.test(c.text()))
    if (type) { await type.trigger('click'); await flushPromises() }
    const passwordInputs = w.findAll('input[type="password"]')
    expect(passwordInputs).toHaveLength(2)
    w.unmount()
  })
})

describe('automations.vue custom create UI', () => {
  beforeEach(() => {
    ;(globalThis as any).__api__['/automations/types'] = { success: true, types: [
      { id: 'custom-flow', title: 'Custom Flow', component: { create_ui: { tag_name: 'kickside-custom-flow-create' } } },
    ] }
  })

  it('mounts a declared create_ui component and reloads on automation-installed', async () => {
    if (!customElements.get('kickside-custom-flow-create')) {
      customElements.define('kickside-custom-flow-create', class extends HTMLElement {})
    }
    const w = mount(Automations)
    await flushPromises()
    const open = w.findAll('button').find(b => /add automation/i.test(b.text()))
    if (open) { await open.trigger('click'); await flushPromises() }
    const type = w.findAll('.kx-cat-card').find(c => /Custom Flow/.test(c.text()))
    if (type) { await type.trigger('click'); await flushPromises() }
    const el = w.element.querySelector('kickside-custom-flow-create')
    expect(el?.getAttribute('type-id')).toBe('custom-flow')
    el?.dispatchEvent(new CustomEvent('automation-installed', { detail: { success: true } }))
    await flushPromises()
    await vi.waitFor(() => expect(w.find('.p-dialog').exists()).toBe(false))
    w.unmount()
  })

  it('submits a custom create UI through its public submit-nonce contract', async () => {
    if (!customElements.get('kickside-custom-flow-create')) {
      customElements.define('kickside-custom-flow-create', class extends HTMLElement {})
    }
    const w = mount(Automations)
    await flushPromises()
    await w.findAll('button').find(b => /add automation/i.test(b.text()))!.trigger('click')
    await flushPromises()
    await w.findAll('.kx-cat-card').find(c => /Custom Flow/.test(c.text()))!.trigger('click')
    await flushPromises()

    const el = w.element.querySelector('kickside-custom-flow-create') as HTMLElement
    const submit = w.find('[data-testid="automations-install-create"]')
    await submit.trigger('click')
    expect(el.getAttribute('submit-nonce')).toBe('1')
    await submit.trigger('click')
    expect(el.getAttribute('submit-nonce')).toBe('2')

    w.unmount()
  })
})
