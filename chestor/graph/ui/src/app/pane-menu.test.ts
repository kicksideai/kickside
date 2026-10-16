import { describe, expect, it, vi } from 'vitest'
import { connectMenuItems, paneMenuItems } from './pane-menu'

describe('pane context menu', () => {
  it('offers generic creation at the graph root when no types are declared', () => {
    const addNode = vi.fn()
    const items = paneMenuItems({ viewRoot: null, nodeTypes: [], navigateUp: vi.fn(), addNode })
    expect(items.map(i => i.label)).toEqual(['Add node'])
    items[0].action()
    expect(addNode).toHaveBeenCalledWith()
  })

  it('keeps creation available inside a drilled node', () => {
    const addNode = vi.fn()
    const items = paneMenuItems({ viewRoot: 'agent-1', nodeTypes: [], navigateUp: vi.fn(), addNode })
    expect(items.map(i => i.label)).toEqual(['← Go up', 'Add node'])
    items[1].action()
    expect(addNode).toHaveBeenCalledWith()
  })

  it('lists each declared type instead of the generic entry', () => {
    const addNode = vi.fn()
    const items = paneMenuItems({
      viewRoot: 'agent-1',
      nodeTypes: [{ id: 'note', title: 'Note' }, { id: 'task' }],
      navigateUp: vi.fn(),
      addNode,
    })
    expect(items.map(i => i.label)).toEqual(['← Go up', 'Add Note', 'Add task'])
    items[2].action()
    expect(addNode).toHaveBeenCalledWith('task')
  })
})

describe('wire-drop connect menu', () => {
  it('offers generic connected creation without declared types', () => {
    const addConnected = vi.fn()
    const items = connectMenuItems({ nodeTypes: [], addConnected })
    expect(items.map(i => i.label)).toEqual(['Add node'])
    items[0].action()
    expect(addConnected).toHaveBeenCalledWith()
  })

  it('offers each declared type wired to the drag source', () => {
    const addConnected = vi.fn()
    const items = connectMenuItems({ nodeTypes: [{ id: 'service', title: 'Service' }], addConnected })
    expect(items.map(i => i.label)).toEqual(['Add Service'])
    items[0].action()
    expect(addConnected).toHaveBeenCalledWith('service')
  })
})
