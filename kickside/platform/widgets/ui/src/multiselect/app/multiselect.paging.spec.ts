import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import MultiSelect from './MultiSelect.vue'

const emitSpy = vi.hoisted(() => vi.fn())
vi.mock('../constants.ts', () => ({
  useComponentProps: () => (globalThis as any).__props_ref__,
  useComponentEvents: () => emitSpy,
}))

const DISCOVER = '/api/v1/connections/conn-1/discover_resources'

interface Resource { id: string; name: string; full_path?: string; description?: string; selectable?: boolean; drillable?: boolean }

function envelope(resources: Resource[], next_cursor?: string) {
  return {
    data: {
      success: true,
      resources,
      items: resources.map(r => ({ id: r.id, label: r.name, selectable: r.selectable === true, drillable: r.drillable === true })),
      next_cursor,
    },
  }
}

function mountWith(props: Record<string, unknown>) {
  ;(globalThis as any).__props_ref__.value = props
  return mount(MultiSelect, { attachTo: document.body })
}

async function openPanel(w: ReturnType<typeof mount>) {
  await w.find('input').trigger('focus')
  await flushPromises()
}

function rowTitles(w: ReturnType<typeof mount>): string[] {
  return w.findAll('.ms-row .ms-row-title').map(n => n.text())
}

beforeEach(() => {
  emitSpy.mockReset()
  vi.mocked(api.get).mockReset()
  vi.mocked(api.post).mockReset()
})

describe('wc-multiselect over a connection discovery', () => {
  it('pages with Load more by the returned cursor', async () => {
    vi.mocked(api.post).mockImplementation(async (_url: string, body: any) => body.cursor === 'p2'
      ? envelope([{ id: '3', name: 'gamma', full_path: 'acme/gamma', selectable: true }])
      : envelope([{ id: '1', name: 'alpha', full_path: 'acme/alpha', selectable: true }, { id: '2', name: 'beta', full_path: 'acme/beta', selectable: true }], 'p2'))
    const w = mountWith({ connectionId: 'conn-1', idKey: 'full_path', pageSize: 2 })
    await openPanel(w)
    expect(api.post).toHaveBeenCalledWith(DISCOVER, { limit: 2 })
    expect(rowTitles(w)).toEqual(['alpha', 'beta'])
    expect(w.find('.ms-count').text()).toBe('2 shown · 0 selected')

    await w.find('.ms-more').trigger('click')
    await flushPromises()
    expect(api.post).toHaveBeenLastCalledWith(DISCOVER, { limit: 2, cursor: 'p2' })
    expect(rowTitles(w)).toEqual(['alpha', 'beta', 'gamma'])
    expect(w.find('.ms-more').exists()).toBe(false)
    w.unmount()
  })

  it('selects several rows by their id-key value and reports them with labels', async () => {
    vi.mocked(api.post).mockResolvedValue(envelope([
      { id: '1', name: 'alpha', full_path: 'acme/alpha', selectable: true },
      { id: '2', name: 'beta', full_path: 'acme/beta', selectable: true },
    ]) as never)
    const w = mountWith({ connectionId: 'conn-1', idKey: 'full_path', selected: '["acme/beta"]' })
    await openPanel(w)
    const rows = w.findAll('.ms-row')
    expect(rows[1].attributes('aria-pressed')).toBe('true')
    await rows[0].trigger('click')
    expect(emitSpy).toHaveBeenLastCalledWith('change', { selected: ['acme/beta', 'acme/alpha'], labels: ['beta', 'alpha'] })
    await rows[1].trigger('click')
    expect(emitSpy).toHaveBeenLastCalledWith('change', { selected: ['acme/alpha'], labels: ['alpha'] })
    expect(w.findAll('.ms-chip-label').map(n => n.text())).toEqual(['alpha'])
    w.unmount()
  })

  it('shows a non-selectable row disabled with the reason and never selects it', async () => {
    vi.mocked(api.post).mockResolvedValue(envelope([{ id: 'x', name: 'wiki', selectable: false }]) as never)
    const w = mountWith({ connectionId: 'conn-1', unselectableHint: 'Not a repository; it cannot be tracked.' })
    await openPanel(w)
    const row = w.find('.ms-row-off')
    expect(row.attributes('disabled')).toBeDefined()
    expect(row.text()).toContain('Not a repository; it cannot be tracked.')
    await row.trigger('click')
    expect(emitSpy).not.toHaveBeenCalledWith('change', expect.anything())
    w.unmount()
  })

  it('drills into a container and walks back with the breadcrumb', async () => {
    vi.mocked(api.post).mockImplementation(async (_url: string, body: any) => body.parent_id === 'ws'
      ? envelope([{ id: '9', name: 'inside', full_path: 'ws/inside', selectable: true }])
      : envelope([{ id: 'ws', name: 'Workspace', drillable: true }]))
    const w = mountWith({ connectionId: 'conn-1', idKey: 'full_path' })
    await openPanel(w)
    const container = w.find('.ms-row')
    expect(container.attributes('aria-label')).toBe('Open Workspace')
    await container.trigger('click')
    await flushPromises()
    expect(api.post).toHaveBeenLastCalledWith(DISCOVER, { limit: 20, parent_id: 'ws' })
    expect(rowTitles(w)).toEqual(['inside'])
    expect(w.find('.ms-crumb-here').text()).toBe('Workspace')
    expect(w.find('.ms-crumb-here').attributes('aria-current')).toBe('location')

    await w.find('button.ms-crumb').trigger('click')
    await flushPromises()
    expect(api.post).toHaveBeenLastCalledWith(DISCOVER, { limit: 20 })
    expect(w.find('.ms-crumbs').exists()).toBe(false)
    expect(rowTitles(w)).toEqual(['Workspace'])
    w.unmount()
  })

  it('offers a separate open control on a row that is both selectable and a container', async () => {
    vi.mocked(api.post).mockImplementation(async (_url: string, body: any) => body.parent_id === 'sp'
      ? envelope([{ id: 'pg', name: 'Page', selectable: true }])
      : envelope([{ id: 'sp', name: 'Space', selectable: true, drillable: true }]))
    const w = mountWith({ connectionId: 'conn-1' })
    await openPanel(w)
    await w.find('.ms-row').trigger('click')
    expect(emitSpy).toHaveBeenLastCalledWith('change', { selected: ['sp'], labels: ['Space'] })
    await w.find('.ms-row-drill').trigger('click')
    await flushPromises()
    expect(api.post).toHaveBeenLastCalledWith(DISCOVER, { limit: 20, parent_id: 'sp' })
    w.unmount()
  })

  it('filters loaded rows locally in search="local" mode and says so', async () => {
    vi.mocked(api.post).mockResolvedValue(envelope([
      { id: '1', name: 'alpha', selectable: true },
      { id: '2', name: 'beta', selectable: true },
    ], 'p2') as never)
    const w = mountWith({ connectionId: 'conn-1', search: 'local' })
    await openPanel(w)
    await w.find('input').setValue('alp')
    await flushPromises()
    expect(api.post).toHaveBeenCalledTimes(1)
    expect(rowTitles(w)).toEqual(['alpha'])
    const hint = w.find('.ms-hint')
    expect(hint.attributes('role')).toBe('status')
    expect(hint.text()).toBe('This source cannot search, so only the 2 loaded items are filtered. Load more to search further.')
    w.unmount()
  })

  it('shows the failure with the server message and retries on request', async () => {
    vi.mocked(api.post)
      .mockRejectedValueOnce({ response: { data: { error: 'the provider could not list its resources' } } })
      .mockResolvedValue(envelope([{ id: '1', name: 'alpha', selectable: true }]) as never)
    const w = mountWith({ connectionId: 'conn-1' })
    await openPanel(w)
    const alert = w.find('.ms-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('the provider could not list its resources')
    expect(w.find('.ms-state').exists()).toBe(false)
    expect(emitSpy).toHaveBeenCalledWith('error', expect.objectContaining({ message: 'the provider could not list its resources' }))

    await alert.find('.ms-link').trigger('click')
    await flushPromises()
    expect(w.find('.ms-alert').exists()).toBe(false)
    expect(rowTitles(w)).toEqual(['alpha'])
    w.unmount()
  })

  it('names an empty level instead of leaving the panel blank', async () => {
    vi.mocked(api.post).mockResolvedValue(envelope([]) as never)
    const w = mountWith({ connectionId: 'conn-1' })
    await openPanel(w)
    expect(w.find('.ms-state').text()).toBe('Nothing to choose from.')
    w.unmount()
  })
})

describe('wc-multiselect over a list source', () => {
  it('searches server-side with the debounced text', async () => {
    vi.mocked(api.get).mockImplementation(async (url: string) => ({ data: { items: url.includes('q=be') ? [{ id: 'b', name: 'beta' }] : [{ id: 'a', name: 'alpha' }, { id: 'b', name: 'beta' }] } }) as never)
    const w = mountWith({ source: '/api/v1/things' })
    await openPanel(w)
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/things?limit=20')
    await w.find('input').setValue('be')
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/things?q=be&limit=20')
    expect(rowTitles(w)).toEqual(['beta'])
    expect(w.find('.ms-hint').exists()).toBe(false)
    w.unmount()
  })

  it('switches to local filtering when the source declares it cannot search', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { repositories: [{ id: 'a', name: 'alpha' }, { id: 'b', name: 'beta' }], search: false } } as never)
    const w = mountWith({ source: '/api/v1/repos', responseKey: 'repositories' })
    await openPanel(w)
    await w.find('input').setValue('bet')
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(rowTitles(w)).toEqual(['beta'])
    expect(w.find('.ms-hint').text()).toBe('This source cannot search, so only the 2 loaded items are filtered.')
    w.unmount()
  })
})
