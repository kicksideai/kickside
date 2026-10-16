import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import AddPanel from './AddPanel.vue'
import DocReader from './DocReader.vue'
import WikiReader from './WikiReader.vue'
import GraphControls from './GraphControls.vue'
import WikiNav from './WikiNav.vue'
import GraphLegend from './GraphLegend.vue'

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async (url: string) => ({ data:
    url.includes('node_id=') ? { success: true, node: { id: 'doc', node_type: 'document', content: 'Body', metadata: { title: 'Document' } } } :
    { success: true, nodes: [{ id: 'chunk', node_type: 'chunk', content: 'Chunk content' }], total: 1 },
  }))
})

describe('KB keyboard controls', () => {
  it('uses a native browse button that opens the file chooser', async () => {
    const view = mount(AddPanel, { props: { kbId: 'kb' } })
    const input = view.get('input[type="file"]')
    const click = vi.spyOn(input.element as HTMLInputElement, 'click')
    const browse = view.get('.ap-drop')
    expect(browse.element.tagName).toBe('BUTTON')
    expect(browse.attributes('type')).toBe('button')
    await browse.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    view.unmount()
  })
  it('expands document chunks through a named native button', async () => {
    const view = mount(DocReader, { props: { kbId: 'kb', node: { id: 'doc', node_type: 'document', metadata: { title: 'Document' } } } })
    await flushPromises()
    await view.findAll('.tb-tab').find(tab => tab.text().includes('Chunks'))!.trigger('click')
    const toggle = view.get('.dr-chunk button')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.text()).toContain('Chunk 1')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(view.get('.dr-chunk-body').classes()).not.toContain('clamp')
    view.unmount()
  })
  it('expands wiki chunks through a named native button', async () => {
    const view = mount(WikiReader, { props: { kbId: 'kb', concept: { id: 'concept', label: 'Topic', node_type: 'concept', metadata: {} }, edges: [{ id: 'edge', edge_type: 'categorized_as', from_node_id: 'doc', to_node_id: 'concept' }], conceptsById: new Map() } })
    await flushPromises()
    await view.findAll('.tb-tab').find(tab => tab.text().includes('Chunks'))!.trigger('click')
    const toggle = view.get('.wr-chunk button')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(view.get('.wr-chunk-body').classes()).not.toContain('clamp')
    view.unmount()
  })
  it('labels every graph action and keeps it out of form submission', async () => {
    const view = mount(GraphControls, { props: { scale: 1 } })
    for (const [index, label] of ['Zoom in', 'Zoom out', 'Fit to view'].entries()) {
      const button = view.findAll('button')[index]
      expect(button.attributes('aria-label')).toBe(label)
      expect(button.attributes('type')).toBe('button')
      await button.trigger('click')
    }
    expect(view.emitted('zoom-in')).toHaveLength(1)
    expect(view.emitted('zoom-out')).toHaveLength(1)
    expect(view.emitted('fit')).toHaveLength(1)
    view.unmount()
  })
})

describe('wiki navigation keyboard activation', () => {
  const topic = { id: 'tea', label: 'Northwind Tea', node_type: 'concept', metadata: {} } as any
  const page = { id: 'shipping', label: 'Shipping Policy', node_type: 'document', metadata: {} } as any
  for (const query of ['', 'tea']) {
    it(`focuses and opens folder and leaf options in ${query ? 'search results' : 'folder contents'}`, async () => {
      const rows = [{ concept: topic, isFolder: true, childCount: 1, path: [] }, { concept: page, isFolder: false, childCount: 0, path: [] }]
      const view = mount(WikiNav, { attachTo: document.body, props: { crumbs: [], entries: rows, selectedId: '', query, results: rows } })
      const options = view.findAll('[role="option"]')
      expect(options[0].attributes('tabindex')).toBe('0')
      ;(options[0].element as HTMLElement).focus()
      expect(document.activeElement).toBe(options[0].element)
      await options[0].trigger('keydown', { key: 'Enter' })
      expect(view.emitted('enter')).toEqual([[topic]])
      await options[0].trigger('keydown', { key: 'ArrowDown' })
      expect(document.activeElement).toBe(options[1].element)
      await options[1].trigger('keydown', { key: ' ' })
      expect(view.emitted('open')).toEqual([[page]])
      await options[1].trigger('keydown', { key: 'Home' })
      expect(document.activeElement).toBe(options[0].element)
      await options[0].get('button').trigger('keydown', { key: 'Enter' })
      expect(view.emitted('enter')).toHaveLength(1)
      view.unmount()
    })
  }
})

describe('graph legend accessible toggle', () => {
  it('labels collapsed and expanded states explicitly', async () => {
    const view = mount(GraphLegend)
    const toggle = view.get('button')
    expect(toggle.attributes('aria-label')).toBe('Show legend')
    expect(toggle.attributes('type')).toBe('button')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-label')).toBe('Hide legend')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await toggle.trigger('click')
    expect(view.find('.gx-legend-body').exists()).toBe(false)
    view.unmount()
  })
})
