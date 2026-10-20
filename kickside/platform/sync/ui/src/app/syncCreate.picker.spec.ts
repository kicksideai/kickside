import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import { nextTick } from 'vue'
import SyncCreate from './SyncCreate.vue'

// Source picking, its instance picker, and cadence moved wholesale into the embedded
// <kickside-trigger-config> element (covered by the WC's own suite). What this form
// still owns is the DESTINATION picker: a sink port's config_schema is a FLAT field map
// ({ kb_id: { picker, title, ... } }), and the selector picker field mounts its
// declared picker WC scoped to the sink's consuming class. These tests prove the sink's
// declared field title + class reach the mounted component picker as its scope meta
// (so the prompt reads "Select a <title>…"), and that a port with no title yields an
// empty title. WcMount only mounts a registered custom element, so stubs stand in for
// the trigger WC and the wc-component-picker and capture the attributes the mount applies.

if (!customElements.get('kickside-trigger-config')) {
  customElements.define('kickside-trigger-config', class extends HTMLElement {})
}
if (!customElements.get('wc-schema-form')) {
  customElements.define('wc-schema-form', class extends HTMLElement {})
}
if (!customElements.get('wc-component-picker')) {
  customElements.define('wc-component-picker', class extends HTMLElement {})
}

function pickerMeta(el: Element | null): { thread_class?: string; title?: string } {
  const raw = el?.getAttribute('meta')
  return raw ? JSON.parse(raw) : {}
}

// The trigger WC reports a valid spec whose `source` is the given catalog source id, so
// SyncCreate resolves the source row the reconcile capability derivation reads back.
async function fireTrigger(w: ReturnType<typeof mount>, sourceId: string) {
  const el = w.element.querySelector('kickside-trigger-config')
  if (!el) throw new Error('trigger config element not mounted')
  el.dispatchEvent(new CustomEvent('change', { detail: { spec: { v: 2, source: sourceId, config: {} }, valid: true } }))
  await flushPromises()
  await nextTick()
}

async function mountWithIo(source: Record<string, unknown>, sink?: Record<string, unknown>) {
  ;(globalThis as any).__api__ = {
    '/automations/sources': { sources: [source] },
    '/automations/sinks': { sinks: sink ? [sink] : [] },
  }
  const w = mount(SyncCreate)
  await flushPromises()
  await nextTick()
  await flushPromises()
  await fireTrigger(w, source.id as string)
  return w
}

// A minimal source row the trigger change points at; its own picker lives in the WC,
// so the only wc-component-picker this form renders is the sink's.
const SOURCE = {
  id: 'kickside.fireflies.source:transcripts_source', title: 'Fireflies transcripts',
  surface: 'collection', class: 'connection',
}

describe('SyncCreate destination-picker scope meta', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = { config: {} }
    ;(globalThis as any).__api__ = {}
  })

  it('mounts the trigger editor without the retired cadence allowlist', async () => {
    const w = await mountWithIo(SOURCE)
    const el = w.element.querySelector('kickside-trigger-config')
    expect(el?.getAttribute('allowed')).toBe('source')
    expect(el?.hasAttribute('allowed-schedule-types')).toBe(false)
    w.unmount()
  })

  it('passes the sink flat-map field title to the scoped component picker', async () => {
    const w = await mountWithIo(SOURCE, {
      id: 'kickside.knowledge.sink:kb_embed_sink', title: 'Knowledge base', name: 'Knowledge base',
      surface: 'store', class: 'knowledge-base',
      config_schema: { kb_id: { type: 'string', title: 'Knowledge base', picker: 'wc-component-picker' } },
      operations: { upsert: {} },
    })
    const meta = pickerMeta(w.element.querySelector('wc-component-picker'))
    expect(meta.thread_class).toBe('knowledge-base')
    expect(meta.title).toBe('Knowledge base')
    w.unmount()
  })

  it('yields an empty title when the sink flat-map field declares none', async () => {
    const w = await mountWithIo(SOURCE, {
      id: 'kickside.channels.sink:post_sink', title: 'Channel post', name: 'Channel post',
      surface: 'store', class: 'kickside.channels:channel',
      config_schema: { thread_id: { picker: 'wc-component-picker' } },
      operations: { upsert: {} },
    })
    const meta = pickerMeta(w.element.querySelector('wc-component-picker'))
    expect(meta.thread_class).toBe('kickside.channels:channel')
    expect(meta.title).toBe('')
    w.unmount()
  })

  it('hands a picker-less sink flat map to the schema form as an object schema', async () => {
    const w = await mountWithIo(SOURCE, {
      id: 'kickside.inbox.sink:inbox_item', title: 'Create Inbox Item', name: 'Create Inbox Item',
      surface: 'store',
      config_schema: {
        content: { picker: 'wc-schema-form', type: 'string', title: 'Message', supplies: 'content' },
        item_type: { picker: 'wc-schema-form', type: 'string', title: 'Item type' },
      },
      operations: { upsert: {} },
    })
    const form = w.element.querySelector('.kx-stage-cfg wc-schema-form')
    const schema = JSON.parse(form?.getAttribute('schema') || '{}')
    expect(Object.keys(schema.properties || {})).toEqual(['content', 'item_type'])
    expect(schema.properties.content.title).toBe('Message')
    w.unmount()
  })

  it('shows deletion reconciliation only when the source and destination declare the capability', async () => {
    const source = {
      id: 'kickside.fireflies.source:transcripts_source', title: 'Fireflies transcripts',
      surface: 'collection', class: 'connection',
      config_schema: { connection_id: { type: 'string', title: 'Connection', picker: 'wc-component-picker' } },
      reconcile: { pull_keys: 'kickside.fireflies.source:pull_keys' },
    }
    const sink = {
      id: 'kickside.knowledge.sink:kb_embed_sink', title: 'Knowledge base',
      surface: 'store', class: 'knowledge-base',
      config_schema: { kb_id: { type: 'string', title: 'Knowledge base', picker: 'wc-component-picker' } },
      operations: { upsert: {}, delete: {} },
    }
    const w = await mountWithIo(source, sink)
    expect(w.text()).toContain('Reconcile deleted source items')
    await w.find('input.kx-check').setValue(true)
    await nextTick()
    expect((w.find('input.kx-check').element as HTMLInputElement).checked).toBe(true)
    expect(w.find('[aria-label="Reconcile cadence"]').exists()).toBe(false)
    w.unmount()

    const noDeleteSink = { ...sink, operations: { upsert: {} } }
    const unsupported = await mountWithIo(source, noDeleteSink)
    expect(unsupported.text()).not.toContain('Reconcile deleted source items')
    unsupported.unmount()
  })
})


it('creates a trigger automation with the exact destination supplied by its owning component', async () => {
  const ref = { kind: 'flow', id: 'wf-42', version: 3 }
  const host = { input: JSON.stringify({ sink_port: 'fixture:run', sink_config: { flow_ref: ref } }), parentId: 'wf-42' }
  Object.assign(globalThis, { __props__: host, __api__: {
    '/automations/sources': { sources: [SOURCE] },
    '/automations/sinks': { sinks: [{ id: 'fixture:run', title: 'Run', config_schema: { flow_ref: { type: 'object', required: true } }, operations: { upsert: {} } }] },
    '/api/v1/automations': { success: true, id: 'created-trigger' },
  } })
  const wrapper = mount(SyncCreate)
  await flushPromises()
  await wrapper.get('[data-test="pl-title"]').setValue('Workflow trigger')
  await fireTrigger(wrapper, SOURCE.id)
  const assist = wrapper.element.querySelector('kickside-transform-assist')
  if (!assist) throw new Error('Transform assist missing')
  assist.dispatchEvent(new CustomEvent('transform-confirmed', { detail: { transform: { kind: 'none' } } }))
  await flushPromises()
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  expect(api.post).toHaveBeenCalledWith('/api/v1/automations', expect.objectContaining({ parent_id: 'wf-42', input: expect.objectContaining({ sink_port: 'fixture:run', sink_config: { flow_ref: ref } }) }))
  wrapper.unmount()
})

if (!customElements.get('wc-agent-picker')) {
  customElements.define('wc-agent-picker', class extends HTMLElement {})
}

describe('SyncCreate required destination picker', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = { config: {} }
    vi.clearAllMocks()
  })

  async function readyForm(field = 'agent_id', required = true) {
    const wrapper = await mountWithIo(SOURCE, {
      id: 'fixture:destination', title: 'Run Agent',
      config_schema: { [field]: { type: 'string', required, picker: 'wc-agent-picker' } },
      operations: { upsert: {} },
    })
    await wrapper.get('[data-test="pl-title"]').setValue('Content automation')
    wrapper.element.querySelector('kickside-transform-assist')!.dispatchEvent(new CustomEvent('transform-confirmed', {
      detail: { transform: { kind: 'none' } },
    }))
    await flushPromises()
    return wrapper
  }

  it.each([{}, { selected: ['user_agent:example-agent'], labels: ['Example agent'] }, { agent_id: '' }, { agent_id: null }, { agent_id: [] }, { content: 'Options alone' }])(
    'refuses installation without the required primary field: %j', async config => {
      const wrapper = await readyForm()
      wrapper.element.querySelector('wc-agent-picker')!.dispatchEvent(new CustomEvent('change', { detail: config }))
      await flushPromises()
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      expect(api.post).not.toHaveBeenCalledWith('/api/v1/automations', expect.anything())
      expect(wrapper.get('[role="alert"]').text()).toBe('Destination configuration is required.')
      wrapper.unmount()
    },
  )

  it.each(['agent_id', 'reviewer'])('submits the required picker field %s unchanged', async field => {
    const wrapper = await readyForm(field)
    const picker = wrapper.element.querySelector('wc-agent-picker')!
    expect(picker.getAttribute('config')).toBe('{}')
    expect(JSON.parse(picker.getAttribute('schema')!).properties[field].required).toBe(true)
    const sinkConfig = { [field]: 'user_agent:example-agent' }
    picker.dispatchEvent(new CustomEvent('change', { detail: sinkConfig }))
    await flushPromises()
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/automations', expect.objectContaining({
      input: expect.objectContaining({ sink_config: sinkConfig }),
    }))
    wrapper.unmount()
  })

  it('permits an empty optional primary picker', async () => {
    const wrapper = await readyForm('agent_id', false)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/api/v1/automations', expect.objectContaining({
      input: expect.objectContaining({ sink_config: {} }),
    }))
    wrapper.unmount()
  })
})
