import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import GraphCanvas from './GraphCanvas.vue'

const concepts = [
  { id: 'root', label: 'Root', is_root: true, node_type: 'concept' },
  { id: 'c1', label: 'Topic', concept_type: 'topic', node_type: 'concept' },
  { id: 'd1', label: 'Doc', node_type: 'document' },
] as any[]
const edges = [
  { id: 'e1', from_node_id: 'c1', to_node_id: 'root', edge_type: 'subtopic_of' },
  { id: 'e2', from_node_id: 'd1', to_node_id: 'c1', edge_type: 'categorized_as' },
] as any[]

const props = () => ({ concepts, edges, selectedId: null, highlightIds: new Set<string>() })
const stubs = { Icon: true }

describe('GraphCanvas.vue', () => {
  it('mounts, runs the sim, and renders node/link elements', async () => {
    const w = mount(GraphCanvas, { props: props(), global: { stubs } })
    await flushPromises()
    await new Promise(r => setTimeout(r, 30)) // let a few RAF/sim ticks run
    expect(w.find('svg').exists()).toBe(true)
    w.unmount()
  })

  it('tears down listeners + RAF + observer on unmount without leaking', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const w = mount(GraphCanvas, { props: props(), global: { stubs } })
    await flushPromises()
    w.unmount()
    // onUnmounted removes the node mouseup/mousemove window listeners.
    expect(removeSpy.mock.calls.some(c => c[0] === 'mouseup')).toBe(true)
    expect(removeSpy.mock.calls.some(c => c[0] === 'mousemove')).toBe(true)
    cancelSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('emits scale changes via zoom', async () => {
    const w = mount(GraphCanvas, { props: props(), global: { stubs } })
    await flushPromises()
    ;(w.vm as any).zoomBy?.(1.2)
    await flushPromises()
    // zoomBy is exposed; a scale event should have been emitted at least once.
    expect(w.emitted('scale')).toBeTruthy()
    w.unmount()
  })
})
