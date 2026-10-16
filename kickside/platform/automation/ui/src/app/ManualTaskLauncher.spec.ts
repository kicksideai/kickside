import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import Launcher from './ManualTaskLauncher.vue'
const api = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api, loadByTagName: vi.fn() }))
const picker = defineComponent({ props: ['tag', 'attrs'], emits: ['change'], template: '<div />' })
const target = { kind: 'workflow', flow_ref: { kind: 'flow', id: 'flow', version: 2 }, input: { text: 'fixed' } }
const principal = { kind: 'user', id: 'executor' }
function create() { return mount(Launcher, { props: { target: JSON.stringify(target), parent: 'flow', title: 'Published task' }, global: { stubs: { WcMount: picker } } }) }
async function choose(w: ReturnType<typeof create>) { w.getComponent(picker).vm.$emit('change', { principal, label: 'Executor' }); await flushPromises() }
function run(w: ReturnType<typeof create>) { return w.get('button').trigger('click') }
beforeEach(() => { api.post.mockReset(); api.post.mockImplementation(async (path: string, body: any) => ({ data: path.endsWith('/selected')
  ? { success: true, id: body.component_id } : { success: true, result: { state: 'succeeded' } } })) })
describe('BOT-MANUAL-TASK-LAUNCHER', () => {
  it('requires explicit selection and mounts the existing pre-install Users picker', async () => {
    const w = create(); await flushPromises()
    expect(w.getComponent(picker).props()).toMatchObject({ tag: 'wc-run-as-picker', attrs: { root: '' } })
    expect(w.get('button').attributes('disabled')).toBeDefined(); expect(api.post).not.toHaveBeenCalled(); w.unmount()
  })
  it('stages a fixed selected task before one explicit wake and reports only queue admission', async () => {
    const w = create(); await choose(w); await run(w); await flushPromises()
    const installed = api.post.mock.calls[0]
    expect(installed).toEqual(['/api/v1/automations/selected', { type: 'kickside.automation.manual:task', input: { title: 'Published task', target }, parent_id: 'flow', principal,
      component_id: expect.any(String), request_id: expect.any(String) }])
    expect(api.post.mock.calls[1]).toEqual(['/api/v1/automations/' + installed[1].component_id + '/actions/run_now', { request_id: expect.any(String) }])
    expect(w.text()).toContain('Run queued'); expect(w.text()).not.toContain('completed')
    expect(w.emitted('queued')).toEqual([[{ id: installed[1].component_id }]])
    await run(w); expect(api.post).toHaveBeenCalledTimes(2); w.unmount()
  })
  it('does not wake rejected or mismatched installation receipts', async () => {
    for (const data of [{ success: false, error: { message: 'Selection revoked' } }, { success: true, id: 'another-root' }]) {
      api.post.mockResolvedValueOnce({ data }); const w = create(); await choose(w); await run(w); await flushPromises()
      expect(w.get('[role="alert"]').text()).not.toBe(''); expect(w.emitted('queued')).toBeUndefined(); w.unmount()
    }
    expect(api.post).toHaveBeenCalledTimes(2)
  })
  it('retries an uncertain install with identical root and request UUIDs and no early wake', async () => {
    api.post.mockRejectedValueOnce(new Error('Connection lost'))
    const w = create(); await choose(w); await run(w); await flushPromises()
    expect(w.get('[role="alert"]').text()).toContain('Connection lost'); expect(w.emitted('queued')).toBeUndefined()
    await run(w); await flushPromises(); expect(api.post.mock.calls[0]).toEqual(api.post.mock.calls[1]); expect(api.post).toHaveBeenCalledTimes(3); w.unmount()
  })
  it('retains a wake UUID for pending admission without restaging or reporting success', async () => {
    api.post.mockImplementationOnce(async (_: string, body: any) => ({ data: { success: true, id: body.component_id } }))
      .mockResolvedValueOnce({ data: { success: true, result: { state: 'pending' } } })
    const w = create(); await choose(w); await run(w); await flushPromises()
    expect(w.text()).toContain('Run admission is pending'); expect(w.emitted('queued')).toBeUndefined()
    await run(w); await flushPromises(); expect(api.post.mock.calls[1]).toEqual(api.post.mock.calls[2]); expect(api.post).toHaveBeenCalledTimes(3); w.unmount()
  })
  it('discards delayed install responses after a target change without waking the old task', async () => {
    let resolve!: (value: unknown) => void
    api.post.mockImplementationOnce(() => new Promise(r => { resolve = r }))
    const w = create(); await choose(w); await run(w)
    const root = api.post.mock.calls[0][1].component_id
    await w.setProps({ target: JSON.stringify({ ...target, input: { text: 'new' } }) })
    resolve({ data: { success: true, id: root } }); await flushPromises()
    expect(api.post).toHaveBeenCalledTimes(1); expect(w.emitted('queued')).toBeUndefined(); expect(w.get('button').attributes('disabled')).toBeDefined(); w.unmount()
  })
  it('refuses missing parent and malformed target without network mutation', async () => {
    for (const props of [{ parent: '' }, { target: 'null' }, { target: '{bad' }]) {
      const w = create(); await w.setProps(props); await choose(w); await flushPromises()
      expect(w.get('button').attributes('disabled')).toBeDefined(); expect(w.get('[role="alert"]').text()).not.toBe(''); w.unmount()
    }
    expect(api.post).not.toHaveBeenCalled()
  })
})
