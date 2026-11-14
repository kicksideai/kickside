import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const get = vi.fn(), post = vi.fn()
vi.mock('@wippy-fe/proxy', () => ({ api: { get: (...args: unknown[]) => get(...args), post: (...args: unknown[]) => post(...args) } }))
import PrincipalPicker from './PrincipalPicker.vue'

const stubs = { Icon: true, AnchoredPanel: { name: 'AnchoredPanel', props: ['open', 'anchor', 'minWidth', 'maxHeight'], template: '<div v-if="open"><slot /></div>' } }
const mountPicker = (props: Record<string, unknown> = {}) => mount(PrincipalPicker, { props, attachTo: document.body, global: { stubs } })

describe('PrincipalPicker', () => {
  beforeEach(() => { get.mockReset(); post.mockReset() })
  afterEach(() => { document.body.innerHTML = '' })

  it('resolves a stored scalar id to its human label', async () => {
    post.mockResolvedValue({ data: { success: true, principals: [{ type: 'user', id: 'u-1', label: 'Ada Example', sublabel: 'ada@example.test' }] } })
    const wrapper = mountPicker({ config: JSON.stringify({ assignee: 'u-1' }), schema: JSON.stringify({ properties: { assignee: { kinds: 'user' } } }) })
    await flushPromises()
    expect(post).toHaveBeenCalledWith('/api/v1/principals/resolve', { refs: [{ type: 'user', id: 'u-1' }] })
    expect(wrapper.get('.kpp-control').text()).toContain('Ada Example')
    wrapper.unmount()
  })

  it('searches the schema-declared principal kind and supports keyboard selection', async () => {
    get.mockResolvedValue({ data: { success: true, principals: [
      { type: 'user', id: 'u-1', label: 'Ada' }, { type: 'user', id: 'u-2', label: 'Grace' },
    ] } })
    const wrapper = mountPicker({ schema: JSON.stringify({ properties: { assignee: { kinds: 'user' } } }) })
    await wrapper.get('.kpp-control').trigger('click'); await flushPromises()
    expect(document.activeElement).toBe(wrapper.get('.kpp-search input').element)
    await wrapper.get('.kpp-search input').setValue('gr')
    await vi.advanceTimersByTimeAsync(200); await flushPromises()
    expect(get).toHaveBeenCalledWith('/api/v1/principals/search', { params: { q: 'gr', limit: 12, kinds: 'user' } })
    await wrapper.get('.kpp-search input').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('.kpp-search input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('change')?.[0]?.[0]).toMatchObject({ id: 'u-2', principal_id: 'u-2', assignee: 'u-2', type: 'user', label: 'Grace' })
    wrapper.unmount()
  })

  it('renders honest empty and error states', async () => {
    get.mockResolvedValueOnce({ data: { success: true, principals: [] } })
    const wrapper = mountPicker()
    await wrapper.get('.kpp-control').trigger('click'); await wrapper.get('.kpp-search input').setValue('nobody')
    await vi.advanceTimersByTimeAsync(200); await flushPromises()
    expect(wrapper.text()).toContain('No people or groups found.')
    get.mockRejectedValueOnce(new Error('offline'))
    await wrapper.get('.kpp-search input').setValue('somebody'); await vi.advanceTimersByTimeAsync(200); await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Could not search people and groups.')
    expect(wrapper.emitted('error')).toHaveLength(1)
    wrapper.unmount()
  })

  it('treats a structured API failure as an error, not an empty directory', async () => {
    get.mockResolvedValue({ data: { success: false, error: 'directory unavailable' } })
    const wrapper = mountPicker()
    await wrapper.get('.kpp-control').trigger('click'); await wrapper.get('.kpp-search input').setValue('ada')
    await vi.advanceTimersByTimeAsync(200); await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toBe('Could not search people and groups.')
    expect(wrapper.text()).not.toContain('No people or groups found.')
    wrapper.unmount()
  })

  it('does not let a concurrent search cancel stored-id label hydration', async () => {
    let finishResolve!: (value: unknown) => void
    post.mockReturnValue(new Promise((resolve) => { finishResolve = resolve }))
    get.mockResolvedValue({ data: { success: true, principals: [{ type: 'user', id: 'u-2', label: 'Grace' }] } })
    const wrapper = mountPicker({ config: JSON.stringify({ assignee: 'u-1' }), schema: JSON.stringify({ properties: { assignee: { kinds: 'user' } } }) })
    await wrapper.get('.kpp-control').trigger('click'); await wrapper.get('.kpp-search input').setValue('grace')
    await vi.advanceTimersByTimeAsync(200); await flushPromises()
    finishResolve({ data: { success: true, principals: [{ type: 'user', id: 'u-1', label: 'Ada' }] } })
    await flushPromises()
    expect(wrapper.get('.kpp-control').text()).toContain('Ada')
    wrapper.unmount()
  })

  it('invalidates old-query results immediately while the replacement query is debouncing', async () => {
    let finishAda!: (value: unknown) => void
    let finishGrace!: (value: unknown) => void
    get.mockImplementation((_url: string, request: { params: { q: string } }) => new Promise((resolve) => {
      if (request.params.q === 'ada') finishAda = resolve
      else finishGrace = resolve
    }))
    const wrapper = mountPicker({ schema: JSON.stringify({ properties: { assignee: { kinds: 'user' } } }) })
    await wrapper.get('.kpp-control').trigger('click')
    const input = wrapper.get('.kpp-search input')
    await input.setValue('ada')
    await vi.advanceTimersByTimeAsync(200)

    await input.setValue('grace')
    expect(wrapper.findAll('.kpp-row')).toHaveLength(0)
    finishAda({ data: { success: true, principals: [{ type: 'user', id: 'u-ada', label: 'Ada' }] } })
    await flushPromises()
    expect(wrapper.text()).not.toContain('Ada')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('change')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(200)
    finishGrace({ data: { success: true, principals: [{ type: 'user', id: 'u-grace', label: 'Grace' }] } })
    await flushPromises()
    expect(wrapper.get('.kpp-row').text()).toContain('Grace')
    wrapper.unmount()
  })

  it('uses the shared bounded anchored panel contract', async () => {
    const wrapper = mountPicker(); await wrapper.get('.kpp-control').trigger('click')
    const panel = wrapper.getComponent({ name: 'AnchoredPanel' })
    expect(panel.props('minWidth')).toBe(260)
    expect(panel.props('maxHeight')).toBe(320)
    wrapper.unmount()
  })

  it('offers a directed clear action and emits the schema field as empty', async () => {
    post.mockResolvedValue({ data: { success: true, principals: [{ type: 'user', id: 'u-1', label: 'Ada' }] } })
    const schema = JSON.stringify({ properties: { assignee: { kinds: 'user', empty_label: 'Use workflow runner' } } })
    const wrapper = mountPicker({ config: JSON.stringify({ assignee: 'u-1' }), schema })
    await flushPromises(); await wrapper.get('.kpp-control').trigger('click')
    expect(wrapper.get('.kpp-clear').text()).toContain('Use workflow runner')
    await wrapper.get('.kpp-clear').trigger('click')
    expect(wrapper.emitted('change')?.[0]?.[0]).toMatchObject({ id: '', principal_id: '', assignee: '', type: 'user' })
    expect(document.activeElement).toBe(wrapper.get('.kpp-control').element)
    wrapper.unmount()
  })
})
