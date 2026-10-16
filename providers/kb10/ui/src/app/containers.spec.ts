import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import KbWiki from './KbWiki.vue'
import KbDocument from './KbDocument.vue'

// Container roots transitively render most of the kb10 component tree; mounting
// them exercises toolbars, panels, lists, empty states, and the graph canvas.
beforeEach(() => {
  ;(globalThis as any).__kbProps__ = { config: { kb_id: 'kb1' } }
  ;(globalThis as any).__kbApi__ = {
    '/graph': { success: true, nodes: [
      { id: 'root', label: 'Root', is_root: true, node_type: 'concept' },
      { id: 'c1', label: 'Topic', concept_type: 'topic', node_type: 'concept' },
    ], edges: [{ id: 'e1', from_node_id: 'c1', to_node_id: 'root', edge_type: 'subtopic_of' }] },
    '/browse': { success: true, nodes: [] },
    '/documents': { success: true, nodes: [] },
  }
})

// The graph canvas lives inside KbWiki under its graph view; force that view
// via the persisted preference so the unified root renders the force canvas.
describe('KbWiki graph view (container)', () => {
  beforeEach(() => { localStorage.setItem('kb10:wiki:view', 'graph') })

  it('loads the graph and renders the canvas + chrome', async () => {
    const w = mount(KbWiki)
    await flushPromises()
    await new Promise(r => setTimeout(r, 20))
    expect(w.find('svg').exists()).toBe(true)
    w.unmount()
  })

  it('shows the empty state when the graph has no nodes', async () => {
    ;(globalThis as any).__kbApi__ = { '/graph': { success: true, nodes: [], edges: [] } }
    const w = mount(KbWiki)
    await flushPromises()
    expect(w.html().length).toBeGreaterThan(0)
    w.unmount()
  })

  it('surfaces the engine-missing notice on a known error', async () => {
    ;(globalThis as any).__kbApi__ = { '/graph': { success: false, error: 'graph engine not found' } }
    const w = mount(KbWiki)
    await flushPromises()
    expect(w.html().length).toBeGreaterThan(0)
    w.unmount()
  })

  it('shows the enrichment attention banner with the reason and retries via POST /enrichment', async () => {
    ;(globalThis as any).__kbApi__ = {
      '/graph': { success: true, nodes: [], edges: [], enrichment: { error: 'placement failed: No models found for class: nano' } },
      '/enrichment': { success: true, requested: 2, documents: 2 },
    }
    const w = mount(KbWiki)
    await flushPromises()
    expect(w.text()).toContain('Graph enrichment failed: placement failed: No models found for class: nano')

    const retry = w.get('button.kc-notice-action')
    await retry.trigger('click')
    await flushPromises()
    const { api } = await import('@wippy-fe/proxy')
    expect((api.post as any)).toHaveBeenCalledWith('/api/v1/kb10/kb1/enrichment')
    // The retry clears the standing flag; the banner drops immediately.
    expect(w.find('button.kc-notice-action').exists()).toBe(false)
    w.unmount()
  })

  it('shows the dangling-enrichment-agent banner without a retry action', async () => {
    ;(globalThis as any).__kbApi__ = {
      '/graph': {
        success: true, nodes: [], edges: [],
        enrichment: { agent_missing: true, agent_error: 'configured enrichment agent is unavailable: gone-agent' },
      },
    }
    const w = mount(KbWiki)
    await flushPromises()
    expect(w.text()).toContain('configured enrichment agent is unavailable: gone-agent')
    expect(w.find('button.kc-notice-action').exists()).toBe(false)
    w.unmount()
  })
})

describe('KbWiki reader view (container)', () => {
  beforeEach(() => { localStorage.setItem('kb10:wiki:view', 'wiki') })

  it('mounts and loads its graph', async () => {
    const w = mount(KbWiki)
    await flushPromises()
    await new Promise(r => setTimeout(r, 20))
    expect(w.html().length).toBeGreaterThan(0)
    w.unmount()
  })
})

describe('KbDocument (container)', () => {
  it('mounts the library view', async () => {
    const w = mount(KbDocument)
    await flushPromises()
    expect(w.html().length).toBeGreaterThan(0)
    w.unmount()
  })
})
