// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import NodePanel from './NodePanel.vue'
import EdgePanel from './EdgePanel.vue'
import SchemaPanel from './SchemaPanel.vue'

vi.mock('@iconify/vue', () => ({ Icon: { setup: () => () => h('i') } }))
vi.mock('@wippy-fe/proxy', () => ({ api: { get: vi.fn() }, loadByTagName: vi.fn() }))
const node = { id: 'n1', name: 'Northwind bookings', type: 'note' }
const edge = { id: 'e1', source_id: 'n1', target_id: 'n2', type: 'relation' }

describe('graph appearance and reading controls', () => {
  it('emits a theme colour from a human-labelled node preset', async () => {
    const view = mount(NodePanel, { props: { node, nodeTypes: [], materialTypes: [], materials: [], hasChildren: false, expanded: false } })
    await view.get('.kg-disclosure').trigger('click')
    expect(view.find('input[type="color"]').exists()).toBe(false)
    await view.get('button[aria-label="Use node color Accent"]').trigger('click')
    expect(view.emitted('update')).toEqual([[{ properties: { accent: 'var(--p-primary-color)' } }]])
    view.unmount()
  })
  it('keeps relation endpoints readable without edit controls for a reader', () => {
    const view = mount(EdgePanel, { props: { edge, edgeTypes: [], materialTypes: [], materials: [], sourceName: 'Bookings', targetName: 'Customers', readOnly: true } })
    expect(view.text()).toContain('Bookings')
    expect(view.text()).toContain('Customers')
    expect(view.find('input').exists()).toBe(false)
    expect(view.find('.kg-disclosure').exists()).toBe(false)
    view.unmount()
  })
  it('uses a named theme select for type colours and preserves the type identity', async () => {
    const view = mount(SchemaPanel, { props: { nodeTypes: [{ id: 'note', title: 'Note' }], edgeTypes: [], materialTypes: [] } })
    expect(view.find('input[type="color"]').exists()).toBe(false)
    await view.get('select[aria-label="Note color"]').setValue('var(--p-primary-color)')
    expect(view.emitted('type-update')).toEqual([[{ kind: 'node', id: 'note', patch: { color: 'var(--p-primary-color)' } }]])
    view.unmount()
  })
})
