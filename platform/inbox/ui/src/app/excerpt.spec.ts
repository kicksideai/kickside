// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Inbox from './inbox.vue'

const api = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (refresh: () => Promise<void>) => { void refresh() } }))
vi.mock('@kickside/ui-kit/componentRealtime', () => ({ subscribeComponentMeta: vi.fn(() => vi.fn()) }))
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span aria-hidden="true" />' } }))

afterEach(() => api.get.mockReset())

function serve(items: Record<string, unknown>[]) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/api/v1/inbox/item-types') return { data: { item_types: [] } }
    if (url.startsWith('/api/v1/inbox?status=')) return { data: { success: true, items, total_count: items.length } }
    throw new Error('unexpected request ' + url)
  })
}

describe('Inbox list excerpts', () => {
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

it('shows an unavailable folder until Retry returns an empty snapshot', async () => {
  api.get.mockImplementation(async (url: string) => {
    if (url.endsWith('/item-types')) return { data: { item_types: [] } }
    throw new Error('Inbox unavailable')
  })
  const view = mount(Inbox, { global: { plugins: [PrimeVuePlugin] } })
  try {
    await flushPromises()
    expect(view.text()).toContain('Inbox unavailable')
    expect(view.find('.kx-sub').exists()).toBe(false)
    expect(view.find('.kx-list-empty').exists()).toBe(false)
    expect(view.find('.kx-detail-empty').exists()).toBe(false)
    const retry = view.get('button[aria-label="Retry"]')
    serve([])
    await retry.trigger('click')
    await flushPromises()
    expect(api.get).toHaveBeenLastCalledWith('/api/v1/inbox?status=pending')
    expect(view.get('.kx-list-empty').text()).toContain('nothing to review')
    expect(view.get('.kx-sub').text()).toBe('0 pending')
    expect(view.text()).not.toContain('Inbox unavailable')
  } finally {
    view.unmount()
  }
})
