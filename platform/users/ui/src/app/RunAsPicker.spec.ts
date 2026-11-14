import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import RunAsPicker from './RunAsPicker.vue'

const mocks = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: mocks.get } }))
const me = { kind: 'user', id: 'operator', label: 'Me' }
const bot = { kind: 'user', id: 'executor', label: 'Sales bot' }
function response(candidates = [bot], next_cursor?: string) {
  return { data: { success: true, me, candidates, next_cursor } }
}
beforeEach(() => { mocks.get.mockReset(); mocks.get.mockResolvedValue(response()) })
afterEach(() => { document.body.innerHTML = '' })

describe('BOT-RUN-AS-CANDIDATES shared run-as picker', () => {
  it('keeps Me as the default and emits one ordinary User principal only after a selection', async () => {
    const w = mount(RunAsPicker, { props: { componentId: 'root' }, attachTo: document.body })
    await flushPromises()
    expect(mocks.get).toHaveBeenCalledWith('/api/v1/users/run-as-candidates',
      { params: { component_id: 'root', q: '', limit: 100 } })
    expect(w.get('[role="combobox"]').text()).toContain('Me')
    expect(w.emitted('change')).toBeUndefined()
    await w.get('[role="combobox"]').trigger('click')
    await flushPromises()
    await w.findAll('[role="option"]').find(option => option.text().includes('Sales bot'))!.trigger('click')
    expect(w.emitted('change')).toEqual([[{ principal: { kind: 'user', id: 'executor' }, label: 'Sales bot' }]])
    w.unmount()
  })
  it('shows only server-authorized options and reports failures without substituting directory results', async () => {
    mocks.get.mockResolvedValueOnce(response([])).mockRejectedValueOnce(new Error('Authority unavailable'))
    const w = mount(RunAsPicker, { attachTo: document.body })
    await flushPromises()
    await w.get('[role="combobox"]').trigger('click')
    await flushPromises()
    expect(w.get('[role="alert"]').text()).toContain('Authority unavailable')
    expect(w.findAll('[role="option"]')).toHaveLength(0)
    expect(w.emitted('error')).toHaveLength(1)
    expect(mocks.get.mock.calls.every(([url]) => url === '/api/v1/users/run-as-candidates')).toBe(true)
    w.unmount()
  })
  it('discards an old-root response when the root changes and never auto-selects a stale principal', async () => {
    let old!: (value: ReturnType<typeof response>) => void
    mocks.get.mockImplementationOnce(() => new Promise(resolve => { old = resolve }))
      .mockResolvedValueOnce(response([]))
    const w = mount(RunAsPicker, { props: { componentId: 'old-root', value: 'executor' } })
    await w.setProps({ componentId: 'new-root' })
    await flushPromises()
    old(response())
    await flushPromises()
    expect(w.get('[role="combobox"]').text()).toContain('Selection unavailable')
    expect(w.emitted('change')).toBeUndefined()
    expect(w.emitted('load')).toHaveLength(1)
    w.unmount()
  })
  it('appends pages, keeps one Me option and passes the server cursor with the current root/query', async () => {
    mocks.get.mockResolvedValueOnce(response([], 'page-2'))
      .mockResolvedValueOnce(response([], 'page-2')).mockResolvedValueOnce(response([bot]))
    const w = mount(RunAsPicker, { props: { componentId: 'root' }, attachTo: document.body })
    await flushPromises()
    await w.get('[role="combobox"]').trigger('click')
    await flushPromises()
    await w.get('[data-testid="picker-more"]').trigger('click')
    await flushPromises()
    expect(mocks.get.mock.calls.at(-1)?.[1]).toEqual({ params: {
      component_id: 'root', q: '', limit: 100, cursor: 'page-2',
    } })
    expect(w.findAll('[role="option"]')).toHaveLength(2)
    w.unmount()
  })
})
