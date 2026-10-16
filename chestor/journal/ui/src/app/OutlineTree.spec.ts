import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import OutlineTree from './OutlineTree.vue'
import type { GraphNode } from './types'

// Icons resolve over the network at runtime; the outline is read here for its
// rows, so they stand in as empty marks.
vi.mock('@iconify/vue', () => ({ Icon: { name: 'Icon', render: () => h('i') } }))

const VIEWPORT = 600
const ROW_HEIGHT = 44

/** One anchor holding `count - 1` records, the shape a busy focus window has. */
function ledger(count: number): GraphNode[] {
  const nodes: GraphNode[] = [{ id: 'root', label: 'Focus', kind: 'anchor', child_count: count - 1, revision: 1, created_at: 1, updated_at: 1 }]
  for (let index = 1; index < count; index++) {
    nodes.push({ id: `record-${index}`, parent_id: 'root', label: `Record ${index}`, kind: 'approach', child_count: 0, revision: 1, created_at: 1, updated_at: 1 })
  }
  return nodes
}

// The first frame is drawn before the pane has been measured, so every reading
// starts once the outline knows the height it scrolls in.
async function outline(nodes: GraphNode[]) {
  const wrapper = mount(OutlineTree, { props: { nodes }, attachTo: document.body })
  await nextTick()
  return wrapper
}

type Outline = Awaited<ReturnType<typeof outline>>
const padding = (wrapper: Outline) =>
  wrapper.findAll('.jr-vlist-pad').reduce((total, pad) => total + parseFloat((pad.element as HTMLElement).style.height || '0'), 0)

// A document without layout measures every pane as nothing, so the outlines
// below are read in a pane of one height.
let measured: PropertyDescriptor | undefined
beforeEach(() => {
  measured = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => VIEWPORT })
})
afterEach(() => { if (measured) Object.defineProperty(HTMLElement.prototype, 'clientHeight', measured) })
enableAutoUnmount(afterEach)

describe('outline of a long focus window', () => {
  it('draws one paneful while the scroll length still measures every record', async () => {
    const wrapper = await outline(ledger(5000))
    const drawn = wrapper.findAll('.jr-tree-row')
    expect(drawn.length).toBeGreaterThan(VIEWPORT / ROW_HEIGHT)
    expect(drawn.length).toBeLessThan(30)
    expect(padding(wrapper) + drawn.length * ROW_HEIGHT).toBe(5000 * ROW_HEIGHT)
  })

  it('reports the full set on the rows it draws instead of truncating the list', async () => {
    const wrapper = await outline(ledger(5000))
    const first = wrapper.find('.jr-tree-row')
    expect(first.attributes('aria-setsize')).toBe('5000')
    expect(first.attributes('aria-posinset')).toBe('1')
    expect(wrapper.text()).not.toMatch(/\d+\s+more/)
  })

  it('walks the arrow keys onto records far past the first paneful', async () => {
    const wrapper = await outline(ledger(5000))
    for (let index = 0; index < 120; index++) {
      const row = wrapper.find(`[data-row="${index}"]`)
      expect(row.exists()).toBe(true)
      await row.trigger('keydown', { key: 'ArrowDown' })
    }
    const reached = wrapper.find('[data-row="120"]')
    expect(reached.exists()).toBe(true)
    expect(reached.attributes('tabindex')).toBe('0')
    expect(document.activeElement).toBe(reached.element)
    expect(wrapper.findAll('.jr-tree-row').length).toBeLessThan(30)
  })
})

describe('outline across a projection refresh', () => {
  const branch: GraphNode[] = [
    { id: 'root', label: 'Focus', kind: 'anchor', child_count: 2, revision: 1, created_at: 1, updated_at: 1 },
    { id: 'first', parent_id: 'root', label: 'First', kind: 'approach', child_count: 0, revision: 1, created_at: 1, updated_at: 1 },
    { id: 'second', parent_id: 'root', label: 'Second', kind: 'approach', child_count: 0, revision: 1, created_at: 1, updated_at: 1 },
  ]

  it('keeps the branches the reader closed closed when the projection refreshes', async () => {
    const wrapper = await outline(branch)
    await wrapper.find('[data-row="0"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.findAll('.jr-tree-row').length).toBe(1)
    // The same records arrive again, in a new array, as they do every few
    // seconds. Nothing about the reading changed, so nothing about it reopens.
    await wrapper.setProps({ nodes: branch.map(node => ({ ...node })) })
    await nextTick()
    expect(wrapper.findAll('.jr-tree-row').length).toBe(1)
    expect(wrapper.find('[data-row="0"]').attributes('aria-expanded')).toBe('false')
  })

  it('opens a branch that has just entered the window by the default rule', async () => {
    const wrapper = await outline(branch)
    const grown: GraphNode[] = [
      ...branch.map(node => ({ ...node })),
      { id: 'arrival', parent_id: 'root', label: 'Arrival', kind: 'anchor', child_count: 1, revision: 1, created_at: 1, updated_at: 1 },
      { id: 'under', parent_id: 'arrival', label: 'Under', kind: 'approach', child_count: 0, revision: 1, created_at: 1, updated_at: 1 },
    ]
    await wrapper.setProps({ nodes: grown })
    await nextTick()
    expect(wrapper.findAll('.jr-tree-row').map(row => row.text())).toEqual(
      expect.arrayContaining([expect.stringContaining('Arrival'), expect.stringContaining('Under')]),
    )
  })

  it('reopens a focus at the scroll the reader left it at', async () => {
    const wrapper = mount(OutlineTree, {
      props: { nodes: ledger(5000), viewport: { scrollTop: 44 * 200 } },
      attachTo: document.body,
    })
    await nextTick()
    const scroller = wrapper.find('.jr-vlist').element as HTMLElement
    expect(scroller.scrollTop).toBe(44 * 200)
    const drawn = wrapper.findAll('.jr-tree-row').map(row => Number(row.attributes('data-row')))
    expect(Math.min(...drawn)).toBeGreaterThan(150)
  })
})

describe('outline keyboard structure', () => {
  const branch: GraphNode[] = [
    { id: 'root', label: 'Focus', kind: 'anchor', child_count: 2, revision: 1, created_at: 1, updated_at: 1 },
    { id: 'first', parent_id: 'root', label: 'First', kind: 'approach', child_count: 0, revision: 1, created_at: 1, updated_at: 1 },
    { id: 'second', parent_id: 'root', label: 'Second', kind: 'approach', child_count: 0, revision: 1, created_at: 1, updated_at: 1 },
  ]

  it('closes a branch on the left key and opens it again on the right', async () => {
    const wrapper = await outline(branch)
    await wrapper.find('[data-row="0"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.findAll('.jr-tree-row').length).toBe(1)
    await wrapper.find('[data-row="0"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.findAll('.jr-tree-row').length).toBe(3)
  })

  it('climbs from a child back to the record that owns it', async () => {
    const wrapper = await outline(branch)
    await wrapper.find('[data-row="2"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.find('[data-row="0"]').attributes('tabindex')).toBe('0')
  })

  it('selects the row the reader is standing on, and only then', async () => {
    const wrapper = await outline(branch)
    await wrapper.find('[data-row="0"]').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('select')).toBeUndefined()
    await wrapper.find('[data-row="1"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toEqual([['first']])
  })
})
