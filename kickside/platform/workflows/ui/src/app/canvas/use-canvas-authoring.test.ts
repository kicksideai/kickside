import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useCanvasAuthoring } from './use-canvas-authoring'

function setup(readOnly = false) {
  const apply = vi.fn()
  const confirmNodeRemoval = vi.fn()
  const doc = {
    nodes: { 'node-1': { id: 'node-1', kind: 'block', title: 'Agent' } },
    edges: { 'edge-1': { id: 'edge-1', source_id: 'a', target_id: 'b' } },
    notes: {},
  }
  const authoring = useCanvasAuthoring({
    doc: () => doc as never,
    revision: ref(0),
    readOnly: () => readOnly,
    apply,
    openInspector: vi.fn(),
    reportError: vi.fn(),
    confirmNodeRemoval,
  })
  return { apply, authoring, confirmNodeRemoval }
}

describe('useCanvasAuthoring removeSelectedNode', () => {
  it('waits for confirmation before applying the canonical node command', () => {
    const { apply, authoring, confirmNodeRemoval } = setup()
    authoring.select('node', 'node-1')
    authoring.removeSelectedNode()

    expect(confirmNodeRemoval).toHaveBeenCalledOnce()
    expect(apply).not.toHaveBeenCalled()
    expect(authoring.selectedNodeId.value).toBe('node-1')

    const accept = confirmNodeRemoval.mock.calls[0][1]
    accept()

    expect(apply).toHaveBeenCalledWith([{ type: 'node.remove', body: { id: 'node-1' } }])
    expect(authoring.selectedNodeId.value).toBeNull()
  })
})

describe('useCanvasAuthoring removeEdge', () => {
  it('routes an alternate-surface deletion through the canonical edge command', () => {
    const { apply, authoring } = setup()
    authoring.select('edge', 'edge-1')
    authoring.removeEdge('edge-1')

    expect(apply).toHaveBeenCalledWith([{ type: 'edge.remove', body: { id: 'edge-1' } }])
    expect(authoring.selectedEdgeId.value).toBeNull()
  })

  it('does not mutate missing edges or read-only documents', () => {
    const editable = setup()
    editable.authoring.removeEdge('missing')
    expect(editable.apply).not.toHaveBeenCalled()

    const readOnly = setup(true)
    readOnly.authoring.removeEdge('edge-1')
    expect(readOnly.apply).not.toHaveBeenCalled()
  })
})
