import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SyncCreate from './SyncCreate.vue'

// The Source stage is the embedded <kickside-trigger-config> element: it owns source
// picking, cadence, and history, and reports the whole trigger spec through a DOM
// `change` event ({ spec, valid, error }). SyncCreate reads the spec's `source` binding
// back against its own catalog for the hints that live OUTSIDE the trigger — the
// transform-assist's input output_schema. So a valid trigger change is the precondition
// for the Transform stage.
//
// The Transform stage IS the reusable kickside-transform-assist element, mounted once
// both a source (reported by the trigger WC) and a sink are set and fed the real source
// output_schema + the sink write-input schema (as JSON attributes). The element owns
// generate/edit for every strategy; confirming its DOM event stores the whole transform
// config, which is handed back via the `value` attribute (edit-back) and installed
// unchanged. Stubs stand in for the trigger WC (to receive the change dispatch) and the
// assist element (to capture attributes and fire the confirmed/cancelled events).

if (!customElements.get('kickside-trigger-config')) {
  customElements.define('kickside-trigger-config', class extends HTMLElement {})
}
if (!customElements.get('wc-component-picker')) {
  customElements.define('wc-component-picker', class extends HTMLElement {})
}
if (!customElements.get('kickside-transform-assist')) {
  customElements.define('kickside-transform-assist', class extends HTMLElement {})
}

const SOURCE = {
  id: 'kickside.fireflies.source:transcripts_source', title: 'Fireflies', name: 'Fireflies',
  surface: 'collection', class: 'connection',
  config_schema: { connection_id: { type: 'string', title: 'Connection', picker: 'wc-component-picker' } },
  output_schema: { type: 'object', properties: { title: { type: 'string' }, id: { type: 'string' }, tags: { type: 'array' } } },
}
const SINK = {
  id: 'kickside.knowledge.sink:kb_embed_sink', title: 'Knowledge base', name: 'Knowledge base',
  surface: 'store', class: 'knowledge-base',
  config_schema: { kb_id: { type: 'string', title: 'Knowledge base', picker: 'wc-component-picker' } },
  operations: { upsert: {} },
  input_shape: 'content',
}

// Report a valid trigger spec whose `source` is the given catalog source id, so
// SyncCreate resolves the source row (output_schema, reconcile hints) the Transform stage
// depends on — the same DOM contract the real trigger WC emits.
async function fireTrigger(w: ReturnType<typeof mount>, sourceId: string) {
  const el = w.element.querySelector('kickside-trigger-config')
  if (!el) throw new Error('trigger config element not mounted')
  el.dispatchEvent(new CustomEvent('change', { detail: { spec: { v: 2, source: sourceId, config: {} }, valid: true } }))
  await flushPromises()
  await nextTick()
}

async function mountFlow(source: Record<string, unknown>, sink?: Record<string, unknown>) {
  ;(globalThis as any).__api__ = {
    '/automations/source-samples': { success: true, samples: [{ title: 'Actual source record', id: 'sample-record' }] },
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

describe('SyncCreate transform assist', () => {
  beforeEach(() => {
    ;(globalThis as any).__props__ = { config: {} }
    ;(globalThis as any).__api__ = {}
  })

  it('does not mount the assist until both a source and a sink are selected', async () => {
    // A valid source is reported, but no sink is picked, so the assist stays closed.
    const w = await mountFlow(SOURCE)
    expect(w.element.querySelector('kickside-transform-assist')).toBeNull()
    w.unmount()
  })

  it('mounts the assist with the source output_schema and the sink input schema', async () => {
    const w = await mountFlow(SOURCE, SINK)
    const el = w.element.querySelector('kickside-transform-assist')
    expect(el).not.toBeNull()

    const src = JSON.parse(el!.getAttribute('source-schema') || '{}')
    expect(Object.keys(src.properties)).toEqual(['title', 'id', 'tags'])

    const snk = JSON.parse(el!.getAttribute('sink-schema') || '{}')
    expect(snk.required).toEqual(['content'])
    // The assist validates each output into the sink's declared input shape.
    expect(el!.getAttribute('input-shape')).toBe('content')

    expect(JSON.parse(el!.getAttribute('samples') || 'null')).toEqual([{ payload: { title: 'Actual source record', id: 'sample-record' } }])

    expect(el!.getAttribute('hint')).toContain('Fireflies')
    w.unmount()
  })

  it('prefers a sink-declared input_schema over the default content shape', async () => {
    const richSink = { ...SINK, input_schema: { type: 'object', properties: { body: { type: 'string' } }, required: ['body'] } }
    const w = await mountFlow(SOURCE, richSink)
    const el = w.element.querySelector('kickside-transform-assist')
    const snk = JSON.parse(el!.getAttribute('sink-schema') || '{}')
    expect(snk.required).toEqual(['body'])
    w.unmount()
  })

  // A confirmed config is stored whole and handed back via `value` (edit-back), so the
  // element restores the same selection on re-open and buildTransform installs it as-is.
  async function confirmAndRead(transform: Record<string, unknown>) {
    const w = await mountFlow(SOURCE, SINK)
    const el = w.element.querySelector('kickside-transform-assist')!
    el.dispatchEvent(new CustomEvent('transform-confirmed', { detail: { transform } }))
    await nextTick()
    const value = JSON.parse(el.getAttribute('value') || 'null')
    w.unmount()
    return value
  }

  it('stores a confirmed expression mapping and hands it back as value', async () => {
    expect(await confirmAndRead({ kind: 'expr', expr: 'payload.title' }))
      .toEqual({ kind: 'expr', expr: 'payload.title' })
  })

  it('stores a confirmed llm mapping including prompt and model', async () => {
    expect(await confirmAndRead({ kind: 'llm', prompt: 'Summarize the item', model: 'class:smart' }))
      .toEqual({ kind: 'llm', prompt: 'Summarize the item', model: 'class:smart' })
  })

  it('stores a confirmed sandboxed code mapping', async () => {
    const code = 'return { content = __cx_args.payload.title }'
    expect(await confirmAndRead({ kind: 'code', code }))
      .toEqual({ kind: 'code', code })
  })

  it('stores a confirmed pass-through as { kind: none }', async () => {
    expect(await confirmAndRead({ kind: 'none' })).toEqual({ kind: 'none' })
  })

  // The detection reads the destination's declared requirements: a sink whose
  // input fields are all optional (every one falls back to its configuration)
  // accepts a pass-through item, so no mapping warning is shown.
  it('does not warn about optional destination fields', async () => {
    const w = await mountFlow(SOURCE, {
      ...SINK,
      input_schema: { type: 'object', properties: { content: { type: 'string' }, title: { type: 'string' }, priority: { type: 'string' } } },
    })
    const detect = w.find('.kx-detect')
    expect(detect.exists()).toBe(true)
    expect(detect.classes()).not.toContain('kx-detect-warn')
    expect(detect.text()).not.toContain('Destination needs')
    w.unmount()
  })

  it('warns about required destination fields the source does not carry', async () => {
    const w = await mountFlow(SOURCE, {
      ...SINK,
      input_schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' }, title: { type: 'string' } } },
    })
    const detect = w.find('.kx-detect')
    expect(detect.classes()).toContain('kx-detect-warn')
    expect(detect.text()).toContain('Destination needs content')
    expect(detect.text()).not.toContain('title')
    w.unmount()
  })

  it('points at the destination field that can supply a missing requirement', async () => {
    const w = await mountFlow(SOURCE, {
      ...SINK,
      input_schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' } } },
      config_schema: { content: { picker: 'wc-schema-form', type: 'string', title: 'Message', supplies: 'content' } },
    })
    const detect = w.find('.kx-detect')
    expect(detect.classes()).toContain('kx-detect-warn')
    expect(detect.text()).toContain('or fill Message')
    w.unmount()
  })
})
