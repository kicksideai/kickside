import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import JournalApp from './JournalApp.vue'
import GraphLens from './GraphLens.vue'
import { api } from '@wippy-fe/proxy'
const suppliedProps = vi.hoisted(() => ({ entryId: 'entry-1', mode: 'full', readOnly: false }))

/**
 * One journal, answered from memory: a graph whose records include the node a
 * task projects into, one agent, and one span of that agent's work on that
 * task. It is the smallest journal in which a lane bar leads somewhere.
 */
vi.mock('@wippy-fe/proxy', () => {
  const node = (id: string, label: string, kind = 'observation') => ({
    id, label, kind, child_count: 0, revision: 1, created_at: 1, updated_at: 1,
  })
  const graph = { id: 'map', title: 'Map', kind: 'current-work', lifecycle: 'active', revision: 1, node_count: 2, edge_count: 0, updated_at: 1 }
  const span = {
    span_id: 'sp_1',
    agent_id: 'ana',
    cursor_id: 'jc_ana',
    task_id: 'migrate-ledger',
    state: 'open',
    started_at: 1_786_990_000,
    last_activity_at: 1_786_999_000,
    fact_count: 4,
    working_on: { kind: 'task', text: 'Migrating the ledger' },
  }
  const answer = (url: string) => {
    if (url.includes('/health')) return { success: true, health: { status: 'ok' } }
    if (url.includes('/cursors')) return { success: true, cursors: { items: [] } }
    if (url.includes('/spans')) return { success: true, spans: { items: [span], counts: { open: 1, sealed: 0, total: 1 } } }
    if (url.includes('/activity')) return { success: true, activity: { buckets: [], width_s: 3600, bucket: 'hour' } }
    if (url.includes('/tree')) return { success: true, tree: { children: [] } }
    if (url.includes('/assemble')) return { success: true, assembly: null }
    if (url.includes('/graphs/')) {
      return {
        success: true,
        result: {
          graph,
          nodes: [node('n1', 'First'), node('task:migrate-ledger', 'Migrate the ledger', 'task')],
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
      post: vi.fn(() => Promise.resolve({ data: { success: true, assembly: null } })),
    },
    on: () => () => {},
  }
})

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useProps: () => ref(suppliedProps),
  useHostVisibilityRefresh: (task: () => void) => { void task(); return ref(true) },
}))

vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', render: () => h('i') } }))

enableAutoUnmount(afterEach)

const settle = async () => { for (let turn = 0; turn < 10; turn++) await nextTick() }

describe('lane bars', () => {
  it('opens the task a span was worked on, where that task lives', async () => {
    const wrapper = mount(JournalApp, { attachTo: document.body })
    await settle()

    await wrapper.findAll('.jr-lens-switch button')
      .find(button => button.attributes('aria-label') === 'Lanes lens')!
      .trigger('click')
    await settle()

    const bar = wrapper.find('.jr-lane-span')
    expect(bar.exists()).toBe(true)
    await bar.trigger('click')
    await settle()

    // The bar led to the task's record, opened in the lens that holds the
    // structure, with the record orbit standing on it.
    expect(wrapper.find('.jr-lens-switch button.active').text()).toContain('Outline')
    expect(wrapper.find('.jr-orbit-drawer').exists()).toBe(true)
    expect(wrapper.find('.jr-tree-row.selected').text()).toContain('Migrate the ledger')
  })
})


describe('shared journal reading', () => {
  it('blocks recomputing the stored map for a shared reader', async () => {
    suppliedProps.readOnly = true
    try {
      const view = mount(JournalApp)
      await settle()
      await view.findAll('.jr-lens-switch button').find(button => button.attributes('aria-label') === 'Graph lens')!.trigger('click')
      await settle()
      const graph = view.findComponent(GraphLens)
      expect(graph.props('readOnly')).toBe(true)
      vi.mocked(api.post).mockClear()
      graph.vm.$emit('recompute')
      await settle()
      expect(api.post).not.toHaveBeenCalled()
    } finally { suppliedProps.readOnly = false }
  })
})

describe('journal menu focus', () => {
  it('returns keyboard focus to the journal after opening record details', async () => {
    const view = mount(JournalApp, { attachTo: document.body })
    await settle()
    await view.findAll('.jr-lens-switch button').find(button => button.attributes('aria-label') === 'Graph lens')!.trigger('click')
    await settle()
    view.findComponent(GraphLens).vm.$emit('menu', 'n1', new MouseEvent('contextmenu', { clientX: 500, clientY: 300 }))
    await settle()
    const details = view.get('.jr-context-menu button')
    ;(details.element as HTMLElement).focus()
    await details.trigger('click')
    await settle()
    expect(document.activeElement).toBe(view.get('.jr-app').element)
  })
})
