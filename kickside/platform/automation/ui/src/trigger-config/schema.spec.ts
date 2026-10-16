import { describe, expect, it, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PickerSelect from '@widgets/app/PickerSelect.vue'
import TriggerConfig from './app/TriggerConfig.vue'
import { webComponent } from './index'
import type { SourceRow } from './spec'

// The published PROPS_SCHEMA governs which host attributes reach the Vue props:
// webcomponent-core parseProps iterates ONLY schema.properties, so an attribute
// absent from the schema is never forwarded. This proves history-default is
// declared and that an explicit host-provided value reaches the editor.

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  WippyVueElement: class {},
  define: () => {},
  useProps: () => ({ value: (globalThis as any).__props__ }),
  useEvents: () => (name: string, detail?: unknown) => {
    ;((globalThis as any).__emits__ as Array<[string, unknown]>).push([name, detail])
  },
}))

for (const tag of ['wc-schema-form', 'wc-component-picker', 'wc-connection-picker']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
}

const POLL_SOURCE = 'providers.fireflies:transcripts'
const CATALOG: SourceRow[] = [
  {
    id: POLL_SOURCE, surface: 'collection', class: 'providers.fireflies', title: 'Fireflies transcripts',
    group: 'Fireflies',
    config_schema: { connection_id: { picker: 'wc-connection-picker', title: 'Connection' } },
  },
]

// Mirrors webcomponent-core parseProps: only schema-declared attributes are read,
// each stored under its camelCased key; an unset attribute falls back to the
// schema default (undefined when none is declared).
function forwardThroughSchema(schema: any, hostAttrs: Record<string, string>): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  for (const [attr, def] of Object.entries(schema.properties as Record<string, any>)) {
    const camel = attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    if (!(attr in hostAttrs)) {
      if (def.default !== undefined) props[camel] = def.default
      continue
    }
    props[camel] = hostAttrs[attr]
  }
  return props
}

function changes(): Array<{ spec: Record<string, unknown>; valid: boolean; error?: string }> {
  return ((globalThis as any).__emits__ as Array<[string, unknown]>)
    .filter(([n]) => n === 'change')
    .map(([, d]) => d as { spec: Record<string, unknown>; valid: boolean; error?: string })
}
function lastChange() {
  const all = changes()
  return all[all.length - 1]
}
async function pick(w: ReturnType<typeof mount>, title: string) {
  const picker = w.findComponent(PickerSelect)
  expect(picker.exists(), 'source PickerSelect').toBe(true)
  await picker.get('[role="combobox"]').trigger('click')
  await flushPromises()
  const opt = picker.findAll('[role="option"]').find(option => option.text().includes(title))
  expect(opt, `picker option "${title}"`).toBeTruthy()
  await opt!.trigger('click')
  await nextTick()
  await flushPromises()
}
function dispatch(w: ReturnType<typeof mount>, selector: string, event: string, detail: unknown) {
  const el = w.element.querySelector(selector)
  expect(el, `mounted element ${selector}`).toBeTruthy()
  el!.dispatchEvent(new CustomEvent(event, { detail }))
}

beforeEach(() => {
  ;(globalThis as any).__emits__ = []
  ;(globalThis as any).__api__ = { '/api/v1/automations/sources': { success: true, sources: CATALOG } }
})

describe('published props schema', () => {
  it('forwards an explicit history value from the host', async () => {
    const El = (await webComponent()) as any
    const schema = El.wippyConfig.propsSchema

    // A host may explicitly choose a collection replay boundary.
    const forwarded = forwardThroughSchema(schema, { allowed: 'source', 'history-default': 'none' })
    // The attribute reaches props only when the schema declares it.
    expect(forwarded.historyDefault).toBe('none')

    ;(globalThis as any).__props__ = forwarded
    const w = mount(TriggerConfig)
    await flushPromises()
    await pick(w, 'Fireflies transcripts')
    dispatch(w, 'wc-connection-picker', 'config-changed', { connection_id: 'c-1' })
    await flushPromises()
    expect(lastChange().spec.backfill).toBe('none')
    w.unmount()
  })
})
