// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'
import { api } from '@wippy-fe/proxy'
import TaskCreate from './TaskCreate.vue'

const require = createRequire(import.meta.url)
const { load } = require('js-yaml')
const Ajv = require('ajv')
const host = vi.hoisted(() => ({ props: null as any, emit: vi.fn() }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useProps: () => ({ value: host.props }), useEvents: () => host.emit }))
for (const tag of ['wc-agent-picker', 'wc-schema-form', 'wc-component-picker', 'wc-workflow-picker']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {})
}
const sink = { id: 'example.actions:write', title: 'Write a note', class: 'notes',
  config_schema: { thread_id: { picker: 'wc-component-picker', title: 'Notebook', required: true },
    priority: { type: 'string', title: 'Priority' } },
  input_schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' } } } }
const workflow = { id: 'example.flow:published', title: 'Prepare digest', published_version: 3,
  published_interface: { input_schema: { type: 'object', required: ['topic'], properties: { topic: { type: 'string' } } }, output_schema: { type: 'object' } } }
beforeEach(() => {
  host.props = reactive({ typeId: '', parentId: 'folder', input: '', submitNonce: '' })
  host.emit.mockReset(); vi.mocked(api.post).mockReset(); vi.mocked(api.put).mockReset()
  vi.mocked(api.get).mockReset().mockImplementation(async (url: string) => ({ data:
    url.includes('/versions/') ? { success: true, version: { version: 3, interface: workflow.published_interface } } : url.includes('/sinks') ? { sinks: [sink] } : url.includes('/workflows') ? { success: true, workflows: [workflow] } :
    { success: true, config: { enabled: false, _portable_input: { title: 'Digest', enabled: false, schedule: { type: 'cron', expression: '0 8 * * 1-5' }, target: { kind: 'agent', agent_id: 'example.agent:assistant', prompt: 'Prepare digest' } } } } }) as any)
  vi.mocked(api.post).mockResolvedValue({ data: { success: true, id: 'task' } } as any)
  vi.mocked(api.put).mockResolvedValue({ data: { success: true } } as any)
})
async function create(recurring = true) {
  host.props.typeId = `kickside.automation.${recurring ? 'recurring' : 'manual'}:task`
  const w = mount(TaskCreate, { props: { recurring } }); await flushPromises(); return w
}
type Form = Awaited<ReturnType<typeof create>>
async function submit() { host.props.submitNonce = String(Number(host.props.submitNonce) + 1); await flushPromises() }
async function config(w: Form, selector: string, value: object) {
  w.get(selector).element.dispatchEvent(new CustomEvent('config-changed', { detail: value, bubbles: true, composed: true })); await flushPromises()
}
async function agent(w: Form) {
  await config(w, 'wc-agent-picker', { agent_id: 'example.agent:assistant' })
  await w.get('[aria-label="Prompt"]').setValue('Prepare digest')
}
async function cadence(w: Form, preset: string) {
  await w.get('[data-test="tc-cron-preset"]').setValue(preset)
  if (preset !== 'custom') await w.get('[data-test="tc-cron-time"]').setValue('08:00')
}
function payload(recurring: boolean) {
  const body = vi.mocked(api.post).mock.calls.at(-1)![1] as any
  const doc = load(readFileSync(resolve(__dirname, `../../../src/${recurring ? 'recurring' : 'manual'}/_index.yaml`), 'utf8'))
  const binding = doc.entries.find((entry: any) => entry.name === 'task')
  const validate = new Ajv({ strict: false }).compile(binding.meta.inputs)
  expect(validate(body.input), JSON.stringify(validate.errors)).toBe(true)
  expect(body.type).toBe(`kickside.automation.${recurring ? 'recurring' : 'manual'}:task`)
  expect(body.parent_id).toBe('folder')
  return body.input
}

describe('AUTOMATION-TASK-CREATE-FORMS', () => {
  it('opens a new schedule in operator words without inventing a time', async () => {
    const w = await create()
    expect((w.get('[aria-label="Cadence"]').element as HTMLSelectElement).value).toBe('daily')
    expect((w.get('[aria-label="Time (UTC)"]').element as HTMLInputElement).value).toBe('')
  })
  it.each([
    ['daily', '0 8 * * *'], ['weekdays', '0 8 * * 1-5'], ['weekly', '0 8 * * 3'], ['custom', '15 6 * * 1,3,5'],
  ])('builds %s from the shared schedule editor', async (preset, expression) => {
    const w = await create(); await agent(w); await cadence(w, preset)
    if (preset === 'weekly') await w.get('[data-test="tc-cron-weekday"]').setValue('3')
    if (preset === 'custom') await w.get('[data-test="tc-custom-cron"]').setValue(expression)
    await submit(); expect(payload(true).schedule).toEqual({ type: 'cron', expression })
  })
  it.each([['m', '15m'], ['h', '15h']])('builds an every-N %s interval accepted by the binding', async (unit, expression) => {
    const w = await create(); await agent(w)
    await w.get('[data-test="tc-specific-toggle"]').setValue(false)
    await w.get('[data-test="tc-periodic-n"]').setValue(15)
    await w.get('[data-test="tc-periodic-unit"]').setValue(unit)
    await submit(); expect(payload(true).schedule).toEqual({ type: 'interval', expression })
  })
  it('rejects an empty schedule, a missing time, a missing weekly day, and an empty interval', async () => {
    const w = await create(); await agent(w); await submit()
    await w.get('[data-test="tc-cron-preset"]').setValue('daily'); await submit()
    await cadence(w, 'weekly'); await submit()
    await w.get('[data-test="tc-specific-toggle"]').setValue(false); await submit()
    expect(api.post).not.toHaveBeenCalled(); expect(host.emit).toHaveBeenCalledWith('automation-installed', expect.objectContaining({ success: false }))
  })
  for (const recurring of [true, false]) {
    describe(recurring ? 'recurring' : 'manual', () => {
      it('uses config + keyed schema for the shared agent picker and posts an agent prompt', async () => {
        const w = await create(recurring)
        expect(JSON.parse(w.get('wc-agent-picker').attributes('schema')!).properties.agent_id).toMatchObject({ picker: 'wc-agent-picker' })
        expect(JSON.parse(w.get('wc-agent-picker').attributes('config')!)).toEqual({})
        await agent(w); if (recurring) await cadence(w, 'weekdays')
        await submit(); expect(payload(recurring).target).toEqual({ kind: 'agent', agent_id: 'example.agent:assistant', prompt: 'Prepare digest' })
        expect(host.emit).toHaveBeenCalledWith('submit-state', { saving: true })
        expect(host.emit).toHaveBeenCalledWith('automation-installed', { success: true, id: 'task' })
        expect(host.emit).toHaveBeenCalledWith('created', { id: 'task' })
      })
      it('selects the existing published workflow picker and pins its published version', async () => {
        const w = await create(recurring); await w.get('[aria-label="Target kind"]').setValue('workflow'); await flushPromises()
        expect(JSON.parse(w.get('wc-workflow-picker').attributes('schema')!).properties.flow_ref).toMatchObject({ picker: 'wc-workflow-picker' })
        expect(JSON.parse(w.get('wc-workflow-picker').attributes('config')!)).toEqual({})
        await config(w, 'wc-workflow-picker', { flow_ref: { kind: 'flow', id: workflow.id, version: 3 } })
        expect(api.get).toHaveBeenCalledWith(`/api/v1/workflows/${encodeURIComponent(workflow.id)}/versions/3`)
        if (recurring) await cadence(w, 'daily')
        await submit(); expect(api.post).not.toHaveBeenCalled()
        await config(w, '[data-test="task-target-input"] wc-schema-form', { topic: 'News' })
        await submit(); expect(payload(recurring).target).toEqual({ kind: 'workflow', flow_ref: { kind: 'flow', id: workflow.id, version: 3 }, input: { topic: 'News' } })
      })
      it('uses the destination picker and declared keyed config and input forms for a writable action', async () => {
        const w = await create(recurring); await w.get('[aria-label="Target kind"]').setValue('action'); await flushPromises()
        const { default: PickerSelect } = await import('@widgets/app/PickerSelect.vue')
        const picker = w.getComponent(PickerSelect)
        expect(picker.props('items')).toEqual([expect.objectContaining({ id: sink.id, title: sink.title })])
        await picker.get('[role="combobox"]').trigger('click'); await flushPromises()
        await picker.get('[role="option"]').trigger('click'); await flushPromises()
        if (recurring) await cadence(w, 'daily')
        await submit(); expect(api.post).not.toHaveBeenCalled()
        expect(JSON.parse(w.get('wc-component-picker').attributes('meta')!)).toMatchObject({ type: 'thread', thread_class: 'notes' })
        await config(w, 'wc-component-picker', { thread_id: 'notebook' })
        await config(w, '[data-test="task-target-input"] wc-schema-form', { content: 'Digest' })
        await submit(); expect(payload(recurring).target).toEqual({ kind: 'action', port: sink.id, config: { thread_id: 'notebook' }, input: { content: 'Digest' } })
      })
      it('refuses incomplete targets in every kind and clears a target on kind changes', async () => {
        const w = await create(recurring); if (recurring) await cadence(w, 'daily')
        await submit(); await config(w, 'wc-agent-picker', { agent_id: 'example.agent:assistant' }); await submit()
        await w.get('[aria-label="Prompt"]').setValue('   '); await submit()
        await w.get('[aria-label="Target kind"]').setValue('workflow'); await submit()
        await w.get('[aria-label="Target kind"]').setValue('action'); await submit()
        await w.get('[aria-label="Target kind"]').setValue('agent'); await submit()
        expect(api.post).not.toHaveBeenCalled()
      })
      it('surfaces server rejection without a success event', async () => {
        const w = await create(recurring); await agent(w); if (recurring) await cadence(w, 'daily')
        vi.mocked(api.post).mockResolvedValueOnce({ data: { success: false, error: { message: 'Target is unavailable' } } } as any)
        await submit(); expect(host.emit).toHaveBeenCalledWith('automation-installed', { success: false, error: 'Target is unavailable' })
        expect(host.emit).not.toHaveBeenCalledWith('created', expect.anything())
      })
    })
  }
  it('can select a previous workflow after leaving an in-flight version read', async () => {
    const w = await create(false)
    await w.get('[aria-label="Target kind"]').setValue('workflow')
    vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, version: { version: 1, interface: { input_schema: { type: 'object' } } } } } as any)
    const first = { flow_ref: { kind: 'flow', id: 'first', version: 1 } }
    await config(w, 'wc-workflow-picker', first)
    let finish: (value: any) => void = () => {}
    vi.mocked(api.get).mockReturnValueOnce(new Promise(resolve => { finish = resolve }) as any)
    await config(w, 'wc-workflow-picker', { flow_ref: { kind: 'flow', id: 'second', version: 1 } })
    await w.get('[aria-label="Target kind"]').setValue('agent')
    await w.get('[aria-label="Target kind"]').setValue('workflow')
    vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, version: { version: 1, interface: { input_schema: { type: 'object' } } } } } as any)
    await config(w, 'wc-workflow-picker', first)
    finish({ data: { success: true, version: { version: 1, interface: workflow.published_interface } } }); await flushPromises()
    await submit()
    expect(payload(false).target).toEqual({ kind: 'workflow', ...first, input: {} })
  })
  it.each([true, false])('declares the task view through the existing component contract (%s)', (recurring) => {
    const name = recurring ? 'recurring' : 'manual'
    const doc = load(readFileSync(resolve(__dirname, `../../../src/${name}/_index.yaml`), 'utf8'))
    const binding = doc.entries.find((entry: any) => entry.name === 'task')
    const view = doc.entries.find((entry: any) => entry.name === 'create_view')
    expect(binding.meta.component.create.view).toBe(`kickside.automation.${name}:create_view`)
    if (recurring) expect(binding.meta.component.manage.view).toBe(binding.meta.component.create.view)
    expect(view.meta).toMatchObject({ type: 'view.component', tag_name: `kickside-${name}-task-create`,
      base_path: 'kickside-automation-manager', entry_point: `${name}_task_create.js` })
    for (const attr of ['type-id', 'parent-id', 'input', 'submit-nonce', 'config']) expect(view.props.properties[attr]).toBeDefined()
  })
  it('loads and reconfigures a recurring declaration without changing placement or enabling a paused task', async () => {
    host.props.config = JSON.stringify({ id: 'task' })
    const w = await create(); expect(w.get('[aria-label="Title"]').element).toHaveProperty('value', 'Digest')
    await w.get('[data-test="tc-cron-time"]').setValue('09:30')
    await w.get('form').trigger('submit'); await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/automations/task', { input: { title: 'Digest', enabled: false,
      schedule: { type: 'cron', expression: '30 9 * * 1-5' }, target: { kind: 'agent', agent_id: 'example.agent:assistant', prompt: 'Prepare digest' } } })
    expect(api.post).not.toHaveBeenCalled(); expect(host.emit).toHaveBeenCalledWith('change', { id: 'task' }); expect(host.emit).toHaveBeenCalledWith('close', {})
  })
  it('opens and saves an existing interval unchanged through the cadence model', async () => {
    host.props.config = JSON.stringify({ id: 'task' })
    vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, config: { enabled: true,
      _portable_input: { schedule: { type: 'interval', expression: '15m' }, target: { kind: 'agent', agent_id: 'assistant', prompt: 'Digest' } } } } } as any)
    const w = await create()
    expect(w.get('[data-test="tc-periodic-n"]').element).toHaveProperty('value', '15')
    expect(w.get('[data-test="tc-periodic-unit"]').element).toHaveProperty('value', 'm')
    expect(w.get('[data-test="tc-specific-toggle"]').element).toHaveProperty('checked', false)
    await w.get('form').trigger('submit'); await flushPromises()
    expect(api.put).toHaveBeenCalledWith('/api/v1/automations/task', { input: { title: '', enabled: true,
      schedule: { type: 'interval', expression: '15m' }, target: { kind: 'agent', agent_id: 'assistant', prompt: 'Digest' } } })
  })
  it('withholds editing if the stored declaration cannot load', async () => {
    host.props.config = JSON.stringify({ id: 'task' }); vi.mocked(api.get).mockRejectedValue(new Error('Read denied'))
    const w = await create(); expect(w.find('form').exists()).toBe(false); expect(w.get('[role="alert"]').text()).toContain('Read denied')
    await submit(); expect(api.post).not.toHaveBeenCalled(); expect(api.put).not.toHaveBeenCalled()
  })
})
