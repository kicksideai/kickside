import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, nextTick } from 'vue'
import { useJournal } from './useJournal'

/**
 * One journal, answered from memory. Every read the workspace makes is routed
 * here, so a reading session can be walked end to end without a server.
 */
const subscription = vi.hoisted(() => vi.fn(() => () => {}))
vi.mock('@wippy-fe/proxy', () => {
  const node = (id: string, label: string) => ({
    id, label, kind: 'observation', child_count: 0, revision: 1, created_at: 1, updated_at: 1,
  })
  const graph = { id: 'map', title: 'Map', kind: 'current-work', lifecycle: 'active', revision: 1, node_count: 3, edge_count: 0, updated_at: 1 }
  const answer = (url: string) => {
    if (url.includes('/health')) return { success: true, health: { status: 'ok' } }
    if (url.includes('/cursors')) return { success: true, cursors: { items: [] } }
    if (url.includes('/spans')) return { success: true, spans: { items: [], counts: { open: 0, sealed: 0, total: 0 } } }
    if (url.includes('/activity')) return { success: true, activity: { buckets: [], width_s: 3600, bucket: 'hour' } }
    if (url.includes('/tree')) return { success: true, tree: { children: [] } }
    if (url.includes('/assemble')) return { success: true, assembly: null }
    if (url.includes('/graphs/')) {
      return {
        success: true,
        result: {
          graph,
          nodes: [node('n1', 'First'), node('n2', 'Second'), node('n3', 'Third')],
          edges: [],
          levels: 4,
          limits: { nodes: 160, edges: 480 },
          collapsed_node_count: 0,
          collapsed_edge_count: 0,
        },
      }
    }
    if (url.includes('/graphs')) return { success: true, graphs: [graph] }
    return { success: true, journal: { stats: { total: 0, task_count: 0 }, events: [], graphs: [graph] } }
  }
  return {
    api: {
      get: (url: string) => Promise.resolve({ data: answer(url) }),
      post: () => Promise.resolve({ data: { success: true, assembly: null } }),
    },
    on: (...args: unknown[]) => subscription(...(args as [])),
  }
})

/** A component that does nothing but stand where the workspace stands. */
function reader() {
  let journal!: ReturnType<typeof useJournal>
  const harness = defineComponent({
    setup() {
      journal = useJournal(computed(() => 'entry-1'))
      return () => null
    },
  })
  const wrapper = mount(harness)
  return { wrapper, journal }
}

const settle = async () => { for (let turn = 0; turn < 8; turn++) await nextTick() }

describe('returning to a place', () => {
  it('reopens a focus with the record and the arrangement the reader left there', async () => {
    const { wrapper, journal } = reader()
    await journal.loadAll()
    await settle()
    expect(journal.graphId.value).toBe('map')

    journal.changeLens('outline')
    journal.selectNode('n2')
    journal.rememberViewport({ zoom: 2.2, x: 40, y: -18 })
    await settle()

    await journal.descend('n3')
    await settle()
    expect(journal.selectedId.value).toBe('n3')
    expect(journal.viewport.value.zoom).toBeUndefined()

    await journal.back()
    await settle()

    // The reader is back where they were, reading what they were reading, at
    // the scale they were reading it.
    expect(journal.selectedId.value).toBe('n2')
    expect(journal.viewport.value).toMatchObject({ zoom: 2.2, x: 40, y: -18, selectedId: 'n2' })

    wrapper.unmount()
  })

  it('keeps each lens’s arrangement of a focus out of the others', async () => {
    const { wrapper, journal } = reader()
    await journal.loadAll()
    await settle()

    journal.changeLens('graph')
    journal.rememberViewport({ zoom: 3, x: 0, y: 0 })
    journal.changeLens('outline')
    journal.rememberViewport({ scrollTop: 880 })
    await settle()
    expect(journal.viewport.value.zoom).toBeUndefined()
    expect(journal.viewport.value.scrollTop).toBe(880)

    journal.changeLens('graph')
    await settle()
    expect(journal.viewport.value.zoom).toBe(3)
    expect(journal.viewport.value.scrollTop).toBeUndefined()

    wrapper.unmount()
  })
})

it('propagates a failed journal live subscription', () => {
  const captured = vi.fn()
  subscription.mockImplementationOnce(() => { throw new Error('Live subscription is unavailable.') })
  const harness = defineComponent({ setup() { useJournal(computed(() => 'entry-1')); return () => null } })
  expect(() => mount(harness, { global: { config: { errorHandler: captured } } })).toThrow('Live subscription is unavailable.')
  expect(captured).toHaveBeenCalledWith(expect.objectContaining({ message: 'Live subscription is unavailable.' }), expect.anything(), 'mounted hook')
})
