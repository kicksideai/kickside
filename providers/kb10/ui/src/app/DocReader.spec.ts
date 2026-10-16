import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@wippy-fe/proxy'
import DocReader from './DocReader.vue'
import type { BrowseNode } from './types'

const node: BrowseNode = { id: 'sheet', node_type: 'document', metadata: { title: 'Catalog' } }
const chunks: BrowseNode[] = Array.from({ length: 200 }, (_, i) => ({
  id: `chunk-${i}`, node_type: 'chunk', content: `Chunk ${i}`, metadata: { index: i },
}))

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async (url: string) => ({ data:
    url.includes('node_id=') ? { success: true, node: { ...node, content: 'Document body' } } :
    url.includes('node_type=summary') ? { success: true, nodes: [{ id: 'summary', node_type: 'summary', content: 'Summary' }], total: 1 } :
    { success: true, nodes: chunks, total: 7525 },
  }))
})

describe('document chunk totals', () => {
  it('shows the server chunk total in the header and tab while fetching a bounded page', async () => {
    const view = mount(DocReader, { props: { kbId: 'kb', node } })
    await flushPromises()
    expect(view.get('.dr-facts').text()).toContain('7,525 chunks')
    expect(view.get('.tb').text()).toContain('7525')
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('node_type=chunk'))
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('limit=200'))
    expect(view.text()).toContain('Summary')
    view.unmount()
  })

  it('expands and collapses a chunk through its heading button', async () => {
    const view = mount(DocReader, { props: { kbId: 'kb', node } })
    await flushPromises()
    await view.findAll('.tb button').find(tab => tab.text().includes('Chunks'))!.trigger('click')
    const heading = view.get('.dr-chunk-h')
    await heading.trigger('click')
    expect(heading.attributes('aria-expanded')).toBe('true')
    expect(view.get('.dr-chunk').classes()).toContain('open')
    await heading.trigger('click')
    expect(heading.attributes('aria-expanded')).toBe('false')
    expect(view.get('.dr-chunk').classes()).not.toContain('open')
    view.unmount()
  })

  it('clears the previous total when switching documents', async () => {
    const view = mount(DocReader, { props: { kbId: 'kb', node } })
    await flushPromises()
    vi.mocked(api.get).mockImplementation(async (url: string) => ({ data:
      url.includes('node_id=') ? { success: true, node: { ...node, content: 'Empty document' } } :
      { success: true, nodes: [], total: 0 },
    }))
    await view.setProps({ node: { ...node, id: 'empty' } })
    await flushPromises()
    expect(view.get('.dr-facts').text()).not.toContain('chunks')
    view.unmount()
  })
})
