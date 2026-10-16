import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SearchLens from './SearchLens.vue'
import type { GraphNode } from './types'

describe('recall result presentation', () => {
  it('keeps parent addresses out of the result while preserving result navigation', async () => {
    const node = { id: 'result-id', parent_id: 'internal-parent-address', label: 'Northwind booking', kind: 'decision', summary: 'Fictional delivery context.', updated_at: 1791133200, revision: 1 } as GraphNode
    const view = mount(SearchLens, { props: { results: [node], query: 'booking', mode: 'exact' } })
    expect(view.text()).toContain('Northwind booking')
    expect(view.text()).not.toContain('internal-parent-address')
    await view.get('button').trigger('click')
    expect(view.emitted('select')).toEqual([['result-id']])
    view.unmount()
  })
})
