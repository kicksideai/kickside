import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import DetailDrawer from './DetailDrawer.vue'
import ExecutionHistory from './ExecutionHistory.vue'

const retained = { version: 2, principal: { kind: 'user', id: 'old-bot' },
  authorized_by: { kind: 'user', id: 'old-authorizer' }, component_id: 'root' }
const delivery = { drive_key: 'main', round_token: 'one', source_port: 'source', item_key: 'item',
  identity_key: 'delivery', round_at: '2026-10-10T00:00:00Z', state: 'resolved',
  evidence_status: 'recorded', evidence: { identity: retained, generation: 4 } }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(api.get).mockImplementation(async (_url: string, options?: { params?: { kind?: string } }) => ({ data: {
    success: true, kind: options?.params?.kind,
    entries: options?.params?.kind === 'deliveries' ? [delivery] : [{ request_id: 'request', generation: 5,
      state: 'succeeded', created_at: '2026-10-10T00:00:00Z', initiation: { actor_id: 'trigger' } }],
  } }) as any)
  vi.mocked(api.post).mockResolvedValue({ data: { success: true, principals: [
    { type: 'user', id: 'old-bot', label: 'Previous executor' },
    { type: 'user', id: 'old-authorizer', label: 'Previous authorizer' },
    { type: 'user', id: 'trigger', label: 'Independent trigger' },
  ] } })
})

describe('AUTOMATION-PROTECTED-HISTORY Activity', () => {
  it('shows one plain history with delivery and control identities through the Users resolver', async () => {
    const drawer = mount(DetailDrawer, { props: { automation: { id: 'root', title: 'History', access_level: 15 } } })
    const activity = drawer.findAll('[role="tab"]').find(tab => tab.text() === 'Activity')!
    await activity.trigger('click'); await flushPromises()
    const history = drawer.get('[aria-label="History"]')
    expect(history.text()).toContain('Previous executor')
    expect(history.text()).toContain('Previous authorizer')
    expect(history.text()).toContain('Independent trigger')
    expect(history.get('h3').text()).toBe('History')
    expect(history.findAll('article')).toHaveLength(2)
    for (const text of ['Control requests', 'Committed deliveries', 'Round starts', 'Recorded admission', 'resolved', 'succeeded']) expect(history.text()).not.toContain(text)
    expect(history.text()).toContain('Completed')
    expect(history.text()).toContain('Accepted')
    expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining('/identity'), expect.anything())
    expect(api.post).toHaveBeenCalledWith('/api/v1/principals/resolve', { refs: expect.arrayContaining([
      { type: 'user', id: 'old-bot' }, { type: 'user', id: 'old-authorizer' }, { type: 'user', id: 'trigger' },
    ]) })
  })
  it('interleaves runs and requests by time and pages both through one control', async () => {
    vi.mocked(api.get).mockImplementation(async (_url: string, options?: { params?: { kind?: string; page_token?: string } }) => {
      const kind = options?.params?.kind
      const next = !!options?.params?.page_token
      return { data: { success: true, kind,
        entries: kind === 'deliveries' ? [{ ...delivery, round_token: next ? 'two' : 'one',
          round_at: next ? '2026-10-08T00:00:00Z' : '2026-10-10T00:00:00Z' }]
          : [{ request_id: next ? 'two' : 'one', generation: next ? 1 : 2, state: 'succeeded',
            created_at: next ? '2026-10-07T00:00:00Z' : '2026-10-11T00:00:00Z', initiation: { actor_id: 'trigger' } }],
        next_page_token: next ? undefined : kind + '-next',
      } } as any
    })
    const history = mount(ExecutionHistory, { props: { root: 'root' } }); await flushPromises()
    expect(history.findAll('time').map(time => time.attributes('datetime'))).toEqual(['2026-10-11T00:00:00Z', '2026-10-10T00:00:00Z'])
    expect(history.findAll('button')).toHaveLength(1)
    await history.get('button').trigger('click'); await flushPromises()
    expect(history.findAll('time').map(time => time.attributes('datetime'))).toEqual([
      '2026-10-11T00:00:00Z', '2026-10-10T00:00:00Z', '2026-10-08T00:00:00Z', '2026-10-07T00:00:00Z',
    ])
    for (const kind of ['deliveries', 'controls']) expect(api.get).toHaveBeenCalledWith('/api/v1/automations/root/history', {
      params: { kind, page_size: 25, page_token: kind + '-next' },
    })
    expect(history.find('button').exists()).toBe(false)
  })
  it('does not mount or fetch private history for READ or WRITE access', async () => {
    for (const access_level of [1, 2, 3, 7]) {
      const drawer = mount(DetailDrawer, { props: { automation: { id: 'root', access_level } } })
      await drawer.findAll('[role="tab"]').find(tab => tab.text() === 'Activity')!.trigger('click')
      await flushPromises()
      expect(drawer.find('[aria-label="History"]').exists()).toBe(false)
      expect(api.get).not.toHaveBeenCalled()
      drawer.unmount()
    }
  })
  it('clears detailed history when the live row loses ADMIN', async () => {
    const drawer = mount(DetailDrawer, { props: { automation: { id: 'root', access_level: 15 } } })
    await drawer.findAll('[role="tab"]').find(tab => tab.text() === 'Activity')!.trigger('click')
    await flushPromises()
    expect(drawer.text()).toContain('Previous executor')
    await drawer.setProps({ automation: { id: 'root', access_level: 1 } })
    await flushPromises()
    expect(drawer.text()).not.toContain('Previous executor')
    expect(drawer.find('[aria-label="History"]').exists()).toBe(false)
  })
  it('shows read failures without showing successful or fabricated history', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('History read unavailable'))
    const drawer = mount(DetailDrawer, { props: { automation: { id: 'root', access_level: 15 } } })
    await drawer.findAll('[role="tab"]').find(tab => tab.text() === 'Activity')!.trigger('click')
    await flushPromises()
    expect(drawer.get('[role="alert"]').text()).toContain('History read unavailable')
    expect(drawer.text()).not.toContain('Previous executor')
  })
  it('labels unavailable and unverified accounts without claiming recorded identity', async () => {
    vi.mocked(api.get).mockImplementation(async (_url: string, options?: { params?: { kind?: string } }) => ({ data: { success: true,
      kind: options?.params?.kind, entries: options?.params?.kind === 'deliveries'
        ? ['absent', 'inferred', 'unresolved'].map((evidence_status, index) => ({ ...delivery,
          item_key: String(index), evidence_status, evidence: evidence_status === 'inferred' ? { identity: retained } : undefined })) : [],
    } }) as any)
    const drawer = mount(DetailDrawer, { props: { automation: { id: 'root', access_level: 15 } } })
    await drawer.findAll('[role="tab"]').find(tab => tab.text() === 'Activity')!.trigger('click')
    await flushPromises()
    expect(drawer.text()).toContain('Account not recorded')
    expect(drawer.text()).toContain('Previous executor (unverified)')
    expect(drawer.text()).toContain('Previous authorizer (unverified)')
    expect(drawer.text()).toContain('Account unavailable')
    expect(drawer.text()).not.toContain('Recorded admission')
  })
  it('uses complete delivery keys and the server cursor when loading another page', async () => {
    vi.mocked(api.get).mockImplementation(async (_url: string, options?: { params?: { kind?: string; page_token?: string } }) => ({ data: {
      success: true, kind: options?.params?.kind, entries: options?.params?.kind === 'deliveries'
        ? [{ ...delivery, round_token: options?.params?.page_token ? 'two' : 'one' }] : [],
      next_page_token: options?.params?.kind === 'deliveries' && !options.params.page_token ? 'next' : undefined,
    } }) as any)
    const history = mount(ExecutionHistory, { props: { root: 'root' } })
    await flushPromises()
    await history.findAll('button').find(button => button.text() === 'More history')!.trigger('click')
    await flushPromises()
    expect(history.findAll('[aria-label="Run by"]')).toHaveLength(2)
    expect(api.get).toHaveBeenCalledWith('/api/v1/automations/root/history', { params: { kind: 'deliveries', page_size: 25, page_token: 'next' } })
    expect(history.findAll('button').some(button => button.text() === 'More history')).toBe(false)
  })
  it('clears previously loaded private records when a later page is denied', async () => {
    vi.mocked(api.get).mockImplementation(async (_url: string, options?: { params?: { kind?: string; page_token?: string } }) => {
      if (options?.params?.page_token) throw new Error('History access denied')
      return { data: { success: true, kind: options?.params?.kind,
        entries: options?.params?.kind === 'deliveries' ? [delivery] : [],
        next_page_token: options?.params?.kind === 'deliveries' ? 'next' : undefined } } as any
    })
    const history = mount(ExecutionHistory, { props: { root: 'root' } })
    await flushPromises()
    expect(history.text()).toContain('Previous executor')
    await history.findAll('button').find(button => button.text() === 'More history')!.trigger('click')
    await flushPromises()
    expect(history.get('[role="alert"]').text()).toContain('History access denied')
    expect(history.text()).not.toContain('Previous executor')
  })
  it('does not let a late response for the previous root replace current history', async () => {
    let finish: (value: unknown) => void = () => { throw new Error('Old-root read does not start') }
    const pending = new Promise(resolve => { finish = resolve })
    vi.mocked(api.get).mockImplementation(async (url: string, options?: { params?: { kind?: string } }) => {
      if (url.includes('/old/') && options?.params?.kind === 'deliveries') return pending as any
      return { data: { success: true, kind: options?.params?.kind,
        entries: options?.params?.kind === 'deliveries' ? [{ ...delivery, item_key: 'current-item', state: 'resolved' }] : [] } } as any
    })
    const history = mount(ExecutionHistory, { props: { root: 'old' } })
    await history.setProps({ root: 'current' }); await flushPromises()
    expect(history.findAll('article')).toHaveLength(1)
    expect(history.text()).toContain('Completed')
    expect(history.text()).not.toContain('Failed')
    expect(history.text()).not.toContain('current-item')
    finish({ data: { success: true, kind: 'deliveries', entries: [{ ...delivery, item_key: 'old-item', state: 'failed' }] } })
    await flushPromises()
    expect(history.findAll('article')).toHaveLength(1)
    expect(history.text()).toContain('Completed')
    expect(history.text()).not.toContain('Failed')
    expect(history.text()).not.toContain('current-item')
    expect(history.text()).not.toContain('old-item')
  })
  it('shows unavailable account labels without exposing ids and reports resolver errors', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true, principals: [] } })
    const history = mount(ExecutionHistory, { props: { root: 'root' } })
    await flushPromises()
    expect(history.get('[aria-label="Run by"]').text()).toBe('Account unavailable')
    expect(history.get('[aria-label="Run by"]').attributes('title')).toBeUndefined()
    expect(history.get('[aria-label="Authorized by"]').attributes('title')).toBeUndefined()
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Principal directory unavailable'))
    await history.setProps({ root: 'another' }); await flushPromises()
    expect(history.get('[role="alert"]').text()).toContain('Principal directory unavailable')
    expect(history.find('[aria-label="Run by"]').exists()).toBe(false)
  })
  it('shows a recorded textual delivery error without treating the page as unavailable', async () => {
    vi.mocked(api.get).mockImplementation(async (_url: string, options?: { params?: { kind?: string } }) => ({ data: {
      success: true, kind: options?.params?.kind,
      entries: options?.params?.kind === 'deliveries' ? [{ ...delivery, state: 'waiting', error: 'Destination has no capacity' }] : [],
    } }) as any)
    const history = mount(ExecutionHistory, { props: { root: 'root' } })
    await flushPromises()
    expect(history.text()).toContain('Destination has no capacity')
    expect(history.find('[role="alert"]').exists()).toBe(false)
  })
})
