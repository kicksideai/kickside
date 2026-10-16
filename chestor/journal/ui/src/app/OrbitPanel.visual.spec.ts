import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import OrbitPanel from './OrbitPanel.vue'
import type { GraphNode } from './types'

vi.mock('@iconify/vue', () => ({ Icon: { setup: () => () => h('i') } }))
describe('journal record presentation', () => {
  it('shows authored context without exposing storage addresses or object payloads', async () => {
    const node = { id: 'internal-record-address', parent_id: 'internal-parent-address', label: 'Booking decision', kind: 'decision', summary: 'Northwind adopts a shared calendar.', attrs: { owner: 'Morgan', provenance: { secret: 'internal-payload' } }, child_count: 0, revision: 1, created_at: 1791133200, updated_at: 1791133200 } as GraphNode
    const view = mount(OrbitPanel, { props: { node, nodes: [node], edges: [], graphId: 'internal-graph-address', now: 1791133300 } })
    const record = view.findAll('button').find(button => button.text() === 'Record')!
    await record.trigger('click')
    expect(view.text()).toContain('Morgan')
    expect(view.text()).not.toContain('internal-record-address')
    expect(view.text()).not.toContain('internal-graph-address')
    expect(view.text()).not.toContain('internal-payload')
    view.unmount()
  })
})
