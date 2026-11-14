import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { api } from '@wippy-fe/proxy'
import PickerSelect from '@widgets/app/PickerSelect.vue'
import SyncCreate from './SyncCreate.vue'
import SyncManage from './SyncManage.vue'
import { storedSyncInput } from './syncInput'

// The automation manager mounts the kind's manage view with config { id }. It reads
// the automation's stored install declaration — the create-shaped input the engine keeps
// and read_config returns under `_portable_input` — seeds every stage from it, and saves
// through the reconfigure endpoint; a changed name also renames the automation.
// Destination and reconcile ownership cannot change in place, so both are shown locked.

if (!customElements.get('kickside-trigger-config')) {
  customElements.define('kickside-trigger-config', class extends HTMLElement {})
}
if (!customElements.get('wc-component-picker')) {
  customElements.define('wc-component-picker', class extends HTMLElement {})
}
if (!customElements.get('kickside-transform-assist')) {
  customElements.define('kickside-transform-assist', class extends HTMLElement {})
}

// Keep the system clock separate from the per-test clock for rollback coverage.
const SystemDate = Date

const SOURCE = {
  id: 'kickside.fireflies.source:transcripts_source', title: 'Fireflies', name: 'Fireflies',
  surface: 'collection', class: 'connection',
  config_schema: { connection_id: { type: 'string', title: 'Connection', picker: 'wc-component-picker' } },
  output_schema: { type: 'object', properties: { title: { type: 'string' } } },
  reconcile: { pull_keys: 'kickside.fireflies.source:pull_keys' },
}
const SINK = {
  id: 'kickside.knowledge.sink:kb_embed_sink', title: 'Knowledge base', name: 'Knowledge base',
  surface: 'store', class: 'knowledge-base',
  config_schema: { kb_id: { type: 'string', title: 'Knowledge base', picker: 'wc-component-picker' } },
  operations: { upsert: {}, delete: {}, list_keys: { function: 'kickside.knowledge.sink:kb_embed_list_keys' } },
}

const STORED_INPUT = {
  title: 'Fireflies to KB',
  trigger: {
    v: 2,
    source: SOURCE.id,
    config: { connection_id: 'conn-1' },
    schedule: { type: 'ticker', expression: '30m' },
    backfill: 'all',
    poll: {
      page_size: 23,
      max_pages_per_run: 4,
      max_items_per_run: 100,
    },
    delivery: { retry_after_ms: 60_000 },
  },
  sink_port: SINK.id,
  sink_config: { kb_id: 'kb-7' },
  transform: { kind: 'expr', expr: '{content: payload.title}' },
  output_schema: { type: 'object', properties: { title: { type: 'string' } } },
  reconcile: true as const,
}

function catalogs() {
  return {
    '/automations/source-samples': { success: true, samples: [{ title: 'Source item' }] },
    '/automations/sources': { sources: [SOURCE] },
    '/automations/sinks': { sinks: [SINK] },
  }
}

async function mountEditor(props: Record<string, unknown>, config: unknown = { enabled: true, _portable_input: STORED_INPUT }) {
  ;(globalThis as any).__api__ = {
    ...catalogs(),
    '/automations/auto-1/config': { success: true, id: 'auto-1', config },
  }
  ;(globalThis as any).__props__ = props
  const w = mount(SyncManage)
  await flushPromises()
  await nextTick()
  await flushPromises()
  return w
}

async function fireTrigger(w: ReturnType<typeof mount>, detail: Record<string, unknown>) {
  const el = w.element.querySelector('kickside-trigger-config')
  if (!el) throw new Error('trigger config element not mounted')
  el.dispatchEvent(new CustomEvent('change', { detail }))
  await flushPromises()
  await nextTick()
}

async function confirmTransform(w: ReturnType<typeof mount>, transform: Record<string, unknown>) {
  const el = w.element.querySelector('kickside-transform-assist')
  if (!el) throw new Error('transform assist element not mounted')
  el.dispatchEvent(new CustomEvent('transform-confirmed', { detail: { transform } }))
  await flushPromises()
  await nextTick()
}

describe('SyncManage', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = { config: {} }
    ;(globalThis as any).__api__ = {}
    vi.mocked(api.post).mockClear()
    vi.mocked(api.put).mockClear()
    vi.mocked((api as any).patch).mockClear()
  })

  it('seeds every stage from the stored install declaration', async () => {
    const w = await mountEditor({ config: { id: 'auto-1' } })

    expect((w.find('[data-test="pl-title"]').element as HTMLInputElement).value).toBe('Fireflies to KB')

    const trigger = w.element.querySelector('kickside-trigger-config')!
    expect(JSON.parse(trigger.getAttribute('value') || '{}')).toEqual(STORED_INPUT.trigger)
    // Structural trigger fields remain locked while editing an installed sync.
    expect(trigger.getAttribute('reconfigure')).toBe('true')

    const assist = w.element.querySelector('kickside-transform-assist')!
    expect(JSON.parse(assist.getAttribute('value') || 'null')).toEqual(STORED_INPUT.transform)

    const picker = w.findComponent(PickerSelect)
    expect(picker.props('modelValue')).toBe(SINK.id)
    w.unmount()
  })

  it('reads the automation id from the value alias as well', async () => {
    const w = await mountEditor({ value: JSON.stringify({ id: 'auto-1' }) })
    expect((w.find('[data-test="pl-title"]').element as HTMLInputElement).value).toBe('Fireflies to KB')
    w.unmount()
  })

  it('locks the destination and the reconcile declaration', async () => {
    const w = await mountEditor({ config: { id: 'auto-1' } })

    expect(w.findComponent(PickerSelect).props('disabled')).toBe(true)
    // The destination config editor is not offered: its values are part of the
    // destination identity the backend refuses to change in place.
    expect(w.element.querySelector('wc-component-picker')).toBeNull()
    expect(w.text()).toContain('reinstall')

    const reconcileCheck = w.find('input.kx-check')
    expect((reconcileCheck.element as HTMLInputElement).checked).toBe(true)
    expect((reconcileCheck.element as HTMLInputElement).disabled).toBe(true)
    w.unmount()
  })

  it('saves through the reconfigure endpoint with the create-shaped input', async () => {
    const w = await mountEditor({ config: { id: 'auto-1' } })
    await fireTrigger(w, {
      spec: { ...STORED_INPUT.trigger, schedule: { type: 'ticker', expression: '15m' } },
      valid: true,
      output_schema: SOURCE.output_schema,
    })

    await w.find('form').trigger('submit')
    await flushPromises()

    expect(vi.mocked(api.post).mock.calls).toEqual([[
      '/api/v1/automations/source-samples', { source: SOURCE.id, config: { connection_id: 'conn-1' }, limit: 1 },
    ]])
    expect(vi.mocked((api as any).patch)).not.toHaveBeenCalled()
    expect(vi.mocked(api.put)).toHaveBeenCalledTimes(1)
    const [url, body] = vi.mocked(api.put).mock.calls[0] as [string, any]
    expect(url).toBe('/api/v1/automations/auto-1')
    expect(body.input).toEqual({
      title: 'Fireflies to KB',
      trigger: { ...STORED_INPUT.trigger, schedule: { type: 'ticker', expression: '15m' } },
      sink_port: SINK.id,
      sink_config: { kb_id: 'kb-7' },
      transform: STORED_INPUT.transform,
      output_schema: SOURCE.output_schema,
      reconcile: STORED_INPUT.reconcile,
      enabled: true,
    })
    w.unmount()
  })

  it('saves when the system wall clock moves backwards after mounting', async () => {
    const wallClock = vi.spyOn(SystemDate, 'now').mockReturnValue(2_000_000_000_000)
    try {
      const w = await mountEditor({ config: { id: 'auto-1' } })
      await fireTrigger(w, { spec: STORED_INPUT.trigger, valid: true, output_schema: SOURCE.output_schema })
      wallClock.mockReturnValue(1_999_999_999_000)
      await w.find('form').trigger('submit')
      await flushPromises()
      expect(vi.mocked(api.put)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(api.put).mock.calls[0]).toEqual([
        '/api/v1/automations/auto-1', { input: { ...STORED_INPUT, enabled: true } },
      ])
      w.unmount()
    } finally {
      wallClock.mockRestore()
    }
  })

  it('keeps a paused sync paused: the declaration carries the live enabled state', async () => {
    const w = await mountEditor({ config: { id: 'auto-1' } }, { enabled: false, _portable_input: { ...STORED_INPUT, enabled: true } })
    await fireTrigger(w, { spec: STORED_INPUT.trigger, valid: true, output_schema: SOURCE.output_schema })
    await w.find('form').trigger('submit')
    await flushPromises()
    expect((vi.mocked(api.put).mock.calls[0] as [string, any])[1].input.enabled).toBe(false)
    w.unmount()
  })

  it('renames the automation when the name changes', async () => {
    const w = await mountEditor({ config: { id: 'auto-1' } })
    await fireTrigger(w, { spec: STORED_INPUT.trigger, valid: true, output_schema: SOURCE.output_schema })
    await w.find('[data-test="pl-title"]').setValue('Transcripts to KB')
    await w.find('form').trigger('submit')
    await flushPromises()

    expect(vi.mocked(api.put)).toHaveBeenCalledTimes(1)
    expect((vi.mocked(api.put).mock.calls[0] as [string, any])[1].input.title).toBe('Transcripts to KB')
    expect(vi.mocked((api as any).patch)).toHaveBeenCalledTimes(1)
    const [url, body] = vi.mocked((api as any).patch).mock.calls[0] as [string, any]
    expect(url).toBe('/api/v1/automations/auto-1')
    expect(body).toEqual({ title: 'Transcripts to KB' })
    w.unmount()
  })

  it('surfaces a failed config read instead of offering a form that would save a partial declaration', async () => {
    // A config read that carries no stored declaration (nothing to seed from).
    const w = await mountEditor({ config: { id: 'auto-1' } }, { title: 'Fireflies to KB' })
    expect(w.find('[data-test="manage-error"]').text()).toContain('configuration')
    expect(w.find('form').exists()).toBe(false)
    expect(vi.mocked(api.post)).not.toHaveBeenCalled()
    expect(vi.mocked(api.put)).not.toHaveBeenCalled()
    w.unmount()
  })

  it('counts a destination field the configuration supplies as carried', async () => {
    const needsContent = {
      ...SINK,
      input_schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' } } },
      config_schema: { ...SINK.config_schema, content: { type: 'string', title: 'Message', supplies: 'content' } },
    }
    ;(globalThis as any).__api__ = {
      '/automations/source-samples': { success: true, samples: [{ title: 'Source item' }] },
      '/automations/sources': { sources: [SOURCE] },
      '/automations/sinks': { sinks: [needsContent] },
      '/automations/auto-1/config': { success: true, id: 'auto-1', config: {
        enabled: true,
        _portable_input: { ...STORED_INPUT, transform: { kind: 'none' }, sink_config: { kb_id: 'kb-7', content: 'Uploaded' } },
      } },
    }
    ;(globalThis as any).__props__ = { config: { id: 'auto-1' } }
    const w = mount(SyncManage)
    await flushPromises()
    await nextTick()
    await flushPromises()
    await fireTrigger(w, { spec: STORED_INPUT.trigger, valid: true, output_schema: SOURCE.output_schema })
    const detect = w.find('.kx-detect')
    expect(detect.exists()).toBe(true)
    expect(detect.classes()).not.toContain('kx-detect-warn')
    w.unmount()
  })

  it('offers only a mapping for a missing requirement, since the destination is locked', async () => {
    const needsContent = {
      ...SINK,
      input_schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' } } },
      config_schema: { ...SINK.config_schema, content: { type: 'string', title: 'Message', supplies: 'content' } },
    }
    ;(globalThis as any).__api__ = {
      '/automations/source-samples': { success: true, samples: [{ title: 'Source item' }] },
      '/automations/sources': { sources: [SOURCE] },
      '/automations/sinks': { sinks: [needsContent] },
      '/automations/auto-1/config': { success: true, id: 'auto-1', config: {
        enabled: true,
        _portable_input: { ...STORED_INPUT, transform: { kind: 'none' }, sink_config: { kb_id: 'kb-7' } },
      } },
    }
    ;(globalThis as any).__props__ = { config: { id: 'auto-1' } }
    const w = mount(SyncManage)
    await flushPromises()
    await nextTick()
    await flushPromises()
    await fireTrigger(w, { spec: STORED_INPUT.trigger, valid: true, output_schema: SOURCE.output_schema })
    const detect = w.find('.kx-detect')
    expect(detect.classes()).toContain('kx-detect-warn')
    expect(detect.text()).toContain('Destination needs content')
    expect(detect.text()).not.toContain('fill Message')
    w.unmount()
  })

  it('does not synthesize a pass-through transform for incomplete stored input', () => {
    expect(storedSyncInput({
      _portable_input: {
        title: 'Incomplete',
        trigger: { v: 2, source: SOURCE.id },
        sink_port: SINK.id,
        sink_config: { kb_id: 'kb-7' },
      },
    })).toBeNull()
  })

  it('the create view installs a new automation with the trigger output schema', async () => {
    ;(globalThis as any).__api__ = catalogs()
    ;(globalThis as any).__props__ = { config: {} }
    const w = mount(SyncCreate)
    await flushPromises()
    await nextTick()
    await flushPromises()

    await w.find('[data-test="pl-title"]').setValue('New sync')
    await fireTrigger(w, {
      spec: { v: 2, source: SOURCE.id, config: { connection_id: 'conn-1' } },
      valid: true,
      output_schema: SOURCE.output_schema,
    })
    // The single destination auto-selects; its picker config is confirmed here.
    const sinkPicker = w.element.querySelector('wc-component-picker')!
    sinkPicker.dispatchEvent(new CustomEvent('config-changed', { detail: { kb_id: 'kb-7' } }))
    await flushPromises()
    await confirmTransform(w, { kind: 'none' })

    await w.find('form').trigger('submit')
    await flushPromises()

    expect(vi.mocked(api.put)).not.toHaveBeenCalled()
    expect(vi.mocked(api.post)).toHaveBeenCalledTimes(2)
    expect(vi.mocked(api.post).mock.calls[0]).toEqual([
      '/api/v1/automations/source-samples', { source: SOURCE.id, config: { connection_id: 'conn-1' }, limit: 1 },
    ])
    const [url, body] = vi.mocked(api.post).mock.calls[1] as [string, any]
    expect(url).toBe('/api/v1/automations')
    expect(body.type).toBe('kickside.sync:sync')
    expect(body.input.output_schema).toEqual(SOURCE.output_schema)
    expect(body.input.sink_port).toBe(SINK.id)
    // The sync schema requires the enabled choice; a new sync starts running.
    expect(body.input.enabled).toBe(true)
    w.unmount()
  })
})
