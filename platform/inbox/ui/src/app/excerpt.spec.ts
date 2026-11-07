// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Inbox from './inbox.vue'

const api = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@wippy-fe/proxy', () => ({ api, loadByTagName: vi.fn(async () => {}) }))
vi.mock('@wippy-fe/webcomponent-vue', () => ({ useHostVisibilityRefresh: (refresh: () => Promise<void>) => { void refresh() } }))
vi.mock('@widgets/app/componentRealtime', () => ({ subscribeComponentMeta: vi.fn(() => vi.fn()) }))
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
