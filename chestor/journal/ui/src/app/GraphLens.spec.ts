import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import GraphLens from './GraphLens.vue'
import type { GraphEdge, GraphNode } from './types'

// Icons resolve over the network at runtime; the canvas is read here for the
// arrangement it reports, so they stand in as empty marks.
vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', render: () => h('i') } }))

const NOW = 1_787_000_000

const node = (id: string, kind = 'observation'): GraphNode =>
  ({ id, kind, label: id, child_count: 0, revision: 1, created_at: 1, updated_at: 1 })

enableAutoUnmount(afterEach)

async function lens(props: Record<string, unknown> = {}) {
  const wrapper = mount(GraphLens, {
    props: {
      nodes: [node('a'), node('b')] as GraphNode[],
      edges: [] as GraphEdge[],
      presence: [],
      now: NOW,
      ...props,
    },
    attachTo: document.body,
  })
  await nextTick()
  await nextTick()
  return wrapper
}

const zoom = (wrapper: Awaited<ReturnType<typeof lens>>) => wrapper.find('.jr-zoom-value').text()

describe('graph viewport memory', () => {
  it('reopens a focus at the zoom the reader left it at', async () => {
    const wrapper = await lens({ viewport: { zoom: 1.8, x: 40, y: -20 } })
    expect(zoom(wrapper)).toBe('180%')
  })

  it('takes a restored arrangement over fitting the graph to the pane', async () => {
    // A remembered view belongs to the reader, so the solve that follows seats
    // the graph without moving the view back to a fresh fit.
    const wrapper = await lens({ viewport: { zoom: 2.4, x: 0, y: 0 } })
    await wrapper.setProps({ nodes: [node('a'), node('b'), node('c')] })
    await nextTick()
    expect(zoom(wrapper)).toBe('240%')
  })

  it('hands back the arrangement the reader makes, so it can be returned to', async () => {
    const wrapper = await lens()
    await wrapper.findAll('.jr-canvas-tools .jr-tool')
      .find(button => button.attributes('aria-label') === 'Zoom in')!
      .trigger('click')
    const handed = wrapper.emitted('viewport')
    expect(handed).toBeTruthy()
    const last = handed![handed!.length - 1][0] as { zoom: number }
    expect(last.zoom).toBeGreaterThan(1)
    expect(zoom(wrapper)).toBe(`${Math.round(last.zoom * 100)}%`)
  })

  it('opens at a fit of its own when this focus has never been read', async () => {
    // An empty memory is not an arrangement, so the canvas fits the graph the
    // way it does for a focus nobody has opened.
    const fitted = await lens()
    const empty = await lens({ viewport: {} })
    expect(zoom(empty)).toBe(zoom(fitted))
  })
})


describe('shared map reading', () => {
  it('keeps fitting and inspection while omitting the assembly write action', async () => {
    const view = await lens({ readOnly: true })
    expect(view.find('.jr-assemble-run').exists()).toBe(false)
    expect(view.find('.jr-canvas-tools').exists()).toBe(true)
  })
})
