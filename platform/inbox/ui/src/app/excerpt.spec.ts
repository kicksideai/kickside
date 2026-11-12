// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Inbox from './inbox.vue'

const api = vi.hoisted(() => ({ get: vi.fn() }))
const topics = vi.hoisted(() => ({ on: vi.fn((_topic: string, _reload: () => void) => vi.fn()) }))
const realtime = vi.hoisted(() => ({ subscribe: vi.fn((_id: string,
  _notify: (event: { meta: Record<string, unknown> }) => void,
  _types: Record<string, string>) => vi.fn()) }))
vi.mock('@wippy-fe/proxy', () => ({ api, on: topics.on, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (refresh: () => Promise<void>) => { void refresh() } }))
vi.mock('@kickside/ui-kit/componentRealtime', () => ({ subscribeComponentMeta: realtime.subscribe }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))

afterEach(() => { api.get.mockReset(); realtime.subscribe.mockClear(); topics.on.mockClear() })

function serve(items: Record<string, unknown>[]) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/api/v1/inbox/item-types') return { data: { item_types: [] } }
    if (url.startsWith('/api/v1/inbox?status=')) return { data: { success: true, items, total_count: items.length } }
    throw new Error('unexpected request ' + url)
  })
}

describe('Inbox list excerpts', () => {
  it('reloads the live authorized list on a contentless addressed invalidation and unsubscribes', async () => {
    serve([])
    const view = mount(Inbox, { global: { plugins: [PrimeVuePlugin] } })
    await flushPromises()
    const subscription = topics.on.mock.calls.find(call => call[0] === 'inbox.changed')
    expect(subscription).toBeDefined()
    serve([{ id: 'new', item_type: 'notice', title: 'New addressed review', status: 'pending', priority: 'normal' }])
    subscription![1]()
    await flushPromises()
    expect(view.text()).toContain('New addressed review')
    const off = topics.on.mock.results[topics.on.mock.calls.indexOf(subscription!)].value
    view.unmount()
    expect(off).toHaveBeenCalledOnce()
  })
  it('subscribes to personal and group summaries and reloads shared totals on either invalidation', async () => {
    api.get.mockImplementation(async (url: string) => ({ data: url.endsWith('/item-types')
      ? { item_types: [] }
      : { items: [], pending_count: 2, item_count: 2, component_id: 'personal', component_ids: ['personal', 'team'] } }))
    const view = mount(Inbox, { global: { plugins: [PrimeVuePlugin] } })
    await flushPromises()
    expect(realtime.subscribe.mock.calls.map(call => call[0])).toEqual(['personal', 'team'])
    const before = api.get.mock.calls.length
    const notify = realtime.subscribe.mock.calls[1][1] as (event: { meta: { pending_count: number } }) => void
    notify({ meta: { pending_count: 99 } })
    await flushPromises()
    expect(api.get.mock.calls.length).toBeGreaterThan(before)
    expect(view.get('.kx-sub').text()).toContain('2 pending')
    const unsubscribe = realtime.subscribe.mock.results.map(result => result.value)
    view.unmount()
    for (const stop of unsubscribe) expect(stop).toHaveBeenCalledOnce()
  })
  it('previews each item with the first line its Markdown body leads with', async () => {
    serve([
      { id: 'review', item_type: 'notice', title: 'Review files', status: 'pending', priority: 'normal',
        content: '[Review documents](/knowledge/example/review) with **suggestions**.' },
      { id: 'decision', item_type: 'notice', title: 'Approve stock', status: 'pending', priority: 'normal',
        content: '- account: Kestrel Labs\n\n**lines**\n\n| amount | name |\n| --- | --- |\n| 52800 | UX |' },
      { id: 'empty', item_type: 'notice', title: 'No body', status: 'pending', priority: 'normal' },
    ])
    const view = mount(Inbox, { global: { plugins: [PrimeVuePlugin] } })
    await flushPromises()
    const rows = view.findAll('.kx-item')
    expect(rows).toHaveLength(3)
    const preview = (title: string) => rows.find(row => row.text().includes(title))!.find('.kx-preview')
    expect(preview('Review files').text()).toBe('[Review documents](/knowledge/example/review) with **suggestions**.')
    expect(preview('Approve stock').text()).toBe('account: Kestrel Labs')
    expect(preview('No body').exists()).toBe(false)
    expect(view.find('.kx-item wc-render-markdown').exists()).toBe(false)
    view.unmount()
  })
})
