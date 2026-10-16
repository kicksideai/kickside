import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Select from 'primevue/select'
import Assist from './assist.vue'

// The builder is a transform field: a strategy Select, one editor, one Generate action.
// It has no Confirm/Cancel -- it live-emits `transform-confirmed` on every change so the
// host form owns install. A tiny api stub (keyed by url substring) mocks the endpoints.

const SOURCE = { type: 'object', properties: { id: { type: 'string' } } }
const SINK = { type: 'object', properties: { key: { type: 'string' } } }

function setProps(p: Record<string, unknown>): void { (globalThis as any).__props__ = p }
function setApi(a: Record<string, unknown>): void { (globalThis as any).__api__ = a }
function events(): { name: string; detail: any }[] { return (globalThis as any).__events__ }
function lastConfirmed() { return [...events()].reverse().find(e => e.name === 'transform-confirmed') }

type W = ReturnType<typeof mount>
function byTest(w: W, id: string) { return w.find(`[data-test="${id}"]`) }
async function pick(w: W, choice: string): Promise<void> {
  // The strategy picker is a PrimeVue Select; drive it by emitting its
  // v-model update rather than simulating the overlay listbox interaction.
  w.getComponent(Select).vm.$emit('update:modelValue', choice)
  await flushPromises()
}

function mountReady(extra: Record<string, unknown> = {}): W {
  setProps({ sourceSchema: JSON.stringify(SOURCE), sinkSchema: JSON.stringify(SINK), inputShape: 'record', samples: [{payload:{id:'real-item'}}], ...extra })
  return mount(Assist)
}

describe('kickside-transform-assist builder', () => {
  it('requires real samples before generation', async () => {
    const w = mountReady({samples: []})
    expect(byTest(w, 'generate').attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('Provide real source samples')
    w.unmount()
  })
  beforeEach(() => {
    ;(globalThis as any).__events__ = []
    setApi({})
    setProps({})
  })

  it('defaults to expression and swaps the editor per selected strategy', async () => {
    const w = mountReady()
    expect(byTest(w, 'expr-editor').exists()).toBe(true)
    await pick(w, 'auto')
    expect(byTest(w, 'auto-hint').exists()).toBe(true)

    await pick(w, 'expr')
    expect(byTest(w, 'expr-editor').exists()).toBe(true)

    await pick(w, 'llm')
    expect(byTest(w, 'llm-editor').exists()).toBe(true)
    expect(w.find('wc-model-picker').exists()).toBe(true)

    await pick(w, 'code')
    expect(byTest(w, 'code-editor').exists()).toBe(true)
    expect(w.text()).toContain('__cx_args')

    await pick(w, 'none')
    expect(byTest(w, 'passthrough').exists()).toBe(true)
  })

  it('shows declared source fields directly under payload in the expression example', async () => {
    const w = mountReady({ sourceSchema: JSON.stringify({ type: 'object', properties: { title: { type: 'string' } } }) })
    await pick(w, 'expr')
    expect(byTest(w, 'expr-editor').attributes('placeholder')).toBe('{ content: payload.title }')
    w.unmount()
  })

  it('live-emits the current transform on every edit (no confirm button)', async () => {
    const w = mountReady()
    expect(w.find('[data-test="confirm"]').exists()).toBe(false)

    await pick(w, 'expr')
    await byTest(w, 'expr-editor').setValue('{ key: payload.id }')
    await flushPromises()
    expect(lastConfirmed()!.detail.transform).toEqual({ kind: 'expr', expr: '{ key: payload.id }' })
    expect(lastConfirmed()!.detail.strategy).toBe('expr')
  })

  it('live-emits an llm transform with the default model', async () => {
    const w = mountReady()
    await pick(w, 'llm')
    await byTest(w, 'llm-editor').setValue('Summarize the item.')
    await flushPromises()
    expect(lastConfirmed()!.detail.transform).toEqual({ kind: 'llm', prompt: 'Summarize the item.', model: 'class:fast' })
  })

  it('emits {kind:none} for pass-through', async () => {
    const w = mountReady()
    await pick(w, 'none')
    expect(lastConfirmed()!.detail.transform).toEqual({ kind: 'none' })
  })

  it('seeds the editor from a value prop (edit-back) and emits it', async () => {
    const w = mountReady({ value: { kind: 'code', code: 'return { key = __cx_args.payload.id }' } })
    await flushPromises()
    expect(byTest(w, 'code-editor').exists()).toBe(true)
    expect((byTest(w, 'code-editor').element as HTMLTextAreaElement).value).toContain('__cx_args.payload.id')
  })

  it('keeps code capabilities limited to selected tools', async () => {
    const w = mountReady({ value: { kind: 'code', code: 'return {}', tool_ids: ['test:tool'] } })
    await byTest(w, 'code-editor').setValue('return { key = __cx_args.payload.id }')
    await flushPromises()
    expect(lastConfirmed()!.detail.transform).toEqual({
      kind: 'code',
      code: 'return { key = __cx_args.payload.id }',
      tool_ids: ['test:tool'],
    })
  })

  it('seeds an llm value prop with prompt and model', async () => {
    const w = mountReady({ value: JSON.stringify({ kind: 'llm', prompt: 'Map it.', model: 'class:smart' }) })
    await flushPromises()
    expect((byTest(w, 'llm-editor').element as HTMLTextAreaElement).value).toBe('Map it.')
    expect((w.find('wc-model-picker').attributes('value'))).toBe('class:smart')
  })

  it('generate fills the editor, switches strategy from the response and shows Validated', async () => {
    setApi({ 'transform/assist': { ok: true, validated: true, strategy: 'expr', transform: { kind: 'expr', expr: '{ key: payload.id }' }, rationale: 'field overlap' } })
    const w = mountReady()
    await byTest(w, 'generate').trigger('click')
    await flushPromises()

    expect(byTest(w, 'expr-editor').exists()).toBe(true)
    expect((byTest(w, 'expr-editor').element as HTMLTextAreaElement).value).toBe('{ key: payload.id }')
    expect(byTest(w, 'rationale').text()).toContain('field overlap')
    expect(byTest(w, 'status').text()).toContain('Validated')
  })

  it('asks for strategy judgment only after selecting auto', async () => {
    setApi({ 'transform/assist': { ok: true, validated: true, transform: { kind: 'expr', expr: '{ key: payload.id }' } } })
    const w = mountReady()
    await pick(w, 'auto')
    await byTest(w, 'generate').trigger('click')
    await flushPromises()
    const { api } = await import('@wippy-fe/proxy') as any
    const call = api.post.mock.calls.filter((c: any[]) => String(c[0]).includes('transform/assist')).pop()
    expect(call[1].strategy).toBe('auto')
    expect(call[1].samples).toEqual([{payload:{id:'real-item'}}])
    w.unmount()
  })

  it('generate on the code strategy asks the endpoint for code' , async () => {
    setApi({ 'transform/assist': { ok: true, validated: true, strategy: 'code', transform: { kind: 'code', code: 'return { key = __cx_args.payload.id }' } } })
    const w = mountReady()
    await pick(w, 'code')
    await byTest(w, 'generate').trigger('click')
    await flushPromises()

    const { api } = await import('@wippy-fe/proxy') as any
    const call = api.post.mock.calls.filter((c: any[]) => String(c[0]).includes('transform/assist')).pop()
    expect(call[1].strategy).toBe('code')
    expect(call[1].input_shape).toBe('record')
    expect((byTest(w, 'code-editor').element as HTMLTextAreaElement).value).toContain('__cx_args.payload.id')
  })

  it('auto-validates a hand-edit and surfaces errors inline', async () => {
    setApi({ 'transform/validate': { ok: true, valid: false, errors: ['sink field key missing'] } })
    const w = mountReady()
    await pick(w, 'expr')
    await byTest(w, 'expr-editor').setValue('{ nope: 1 }')
    await vi.advanceTimersByTimeAsync(600)
    await flushPromises()
    expect(byTest(w, 'status').text()).toContain('Needs review')
    expect(w.text()).toContain('sink field key missing')
  })

  it('auto-validates a valid hand-edit and previews the first output', async () => {
    setApi({ 'transform/validate': { ok: true, valid: true, outputs: [{ key: 'abc' }] } })
    const w = mountReady()
    await pick(w, 'expr')
    await byTest(w, 'expr-editor').setValue('{ key: payload.id }')
    await vi.advanceTimersByTimeAsync(600)
    await flushPromises()
    expect(byTest(w, 'status').text()).toContain('Validated')
    expect(byTest(w, 'output-preview').text()).toContain('"key":"abc"')
  })

  it('disables generate and prompts when schemas are missing but still allows editing', async () => {
    setProps({})
    const w = mount(Assist)
    await pick(w, 'expr')
    expect(byTest(w, 'generate').attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('Pick a source and destination')
    await byTest(w, 'expr-editor').setValue('{ key: 1 }')
    await flushPromises()
    expect(lastConfirmed()!.detail.transform).toEqual({ kind: 'expr', expr: '{ key: 1 }' })
  })

  it('needs the sink input shape to generate or validate', async () => {
    setProps({ sourceSchema: JSON.stringify(SOURCE), sinkSchema: JSON.stringify(SINK) })
    const w = mount(Assist)
    await pick(w, 'expr')
    expect(byTest(w, 'generate').attributes('disabled')).toBeDefined()
  })

  it('surfaces an endpoint error on generate failure', async () => {
    setApi({ 'transform/assist': { ok: false, error: 'model unavailable' } })
    const w = mountReady()
    await byTest(w, 'generate').trigger('click')
    await flushPromises()
    expect(byTest(w, 'error').text()).toContain('model unavailable')
  })
})
