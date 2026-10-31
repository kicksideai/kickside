// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, it, expect } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Inbox from './inbox.vue'

describe('Inbox list excerpts', () => {
  it('renders Markdown through the shared renderer inside an inert excerpt', async () => {
    const content = '[Review documents](/knowledge/example/review) with **suggestions**.'
    ;(globalThis as any).__api__ = {
      '/api/v1/inbox/item-types': { item_types: [] },
      '/api/v1/inbox?status=': { success: true, items: [
        { id: 'review', item_type: 'notice', title: 'Review files', status: 'pending', priority: 'normal', content },
      ], total_count: 1 },
    }
    const view = mount(Inbox)
    await flushPromises()
    const excerpt = view.get('.kx-preview')
    expect(excerpt.attributes('source')).toBe(content)
    expect(excerpt.attributes('inert')).toBeDefined()
    expect(excerpt.element.tagName.toLowerCase()).toBe('wc-render-markdown')
    view.unmount()
  })
})
