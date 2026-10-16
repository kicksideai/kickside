import { computed, ref, type Ref } from 'vue'
import type { EdgeMouseEvent, NodeMouseEvent } from '@vue-flow/core'
import type { WfDoc, WfNode } from '../types'
import * as C from '../api/commands'

interface CanvasAuthoringOptions {
  doc: () => WfDoc
  revision: Ref<number>
  readOnly: () => boolean
  apply: (commands: C.Command[]) => void | Promise<void>
  openInspector: () => void
  reportError: (message: string) => void
  confirmNodeRemoval: (node: WfNode, accept: () => void) => void
}

export function useCanvasAuthoring(options: CanvasAuthoringOptions) {
  const selectedNodeId = ref<string | null>(null)
  const selectedEdgeId = ref<string | null>(null)
  const selectedNoteId = ref<string | null>(null)

  const selectedNode = computed(() => {
    void options.revision.value
    return selectedNodeId.value ? options.doc().nodes[selectedNodeId.value] || null : null
  })
  const selectedEdge = computed(() => {
    void options.revision.value
    return selectedEdgeId.value ? options.doc().edges[selectedEdgeId.value] || null : null
  })
  const selectedNote = computed(() => {
    void options.revision.value
    return selectedNoteId.value ? options.doc().notes[selectedNoteId.value] || null : null
  })
  const hasSelection = computed(() =>
    !!(selectedNode.value || selectedEdge.value || selectedNote.value))

  function select(kind: 'node' | 'edge' | 'note', id: string) {
    selectedNodeId.value = kind === 'node' ? id : null
    selectedEdgeId.value = kind === 'edge' ? id : null
    selectedNoteId.value = kind === 'note' ? id : null
    options.openInspector()
  }

  function clearSelection() {
    selectedNodeId.value = null
    selectedEdgeId.value = null
    selectedNoteId.value = null
  }

  function onNodeClick(event: NodeMouseEvent) {
    if (event.node.type === 'wfContainer') return
    const isNote = event.node.type === 'wfNote' || event.node.type === 'wfFrame'
    if (options.readOnly()) {
      if (!isNote) select('node', event.node.id)
      return
    }
    select(isNote ? 'note' : 'node', event.node.id)
  }

  function onEdgeClick(event: EdgeMouseEvent) {
    if (!options.readOnly()) select('edge', event.edge.id)
  }

  function updateNode(patch: Record<string, unknown>) {
    if (selectedNode.value) void options.apply([C.updateNode(selectedNode.value.id, patch)])
  }

  function updateEdge(patch: Record<string, unknown>) {
    if (selectedEdge.value) void options.apply([C.updateEdge(selectedEdge.value.id, patch)])
  }

  function updateNote(patch: Record<string, unknown>) {
    if (selectedNote.value) void options.apply([C.updateNote(selectedNote.value.id, patch)])
  }

  function isPinnedNode(node: { kind?: string; pinned?: boolean; boundary?: unknown } | null): boolean {
    if (!node) return false
    return node.kind === 'start'
      || node.kind === 'finish'
      || node.kind === 'error'
      || node.pinned === true
      || !!node.boundary
  }

  function removeSelectedNode() {
    const node = selectedNode.value
    if (!node) return
    if (isPinnedNode(node)) {
      options.reportError('Start, Finish, and Error steps are locked and can’t be deleted.')
      return
    }
    options.confirmNodeRemoval(node, () => {
      if (options.readOnly() || !options.doc().nodes[node.id]) return
      if (selectedNodeId.value === node.id) clearSelection()
      void options.apply([C.removeNode(node.id)])
    })
  }

  function removeSelectedEdge() {
    const edge = selectedEdge.value
    if (!edge) return
    clearSelection()
    void options.apply([C.removeEdge(edge.id)])
  }

  function removeEdge(edgeId: string) {
    if (options.readOnly() || !options.doc().edges[edgeId]) return
    if (selectedEdgeId.value === edgeId) clearSelection()
    void options.apply([C.removeEdge(edgeId)])
  }

  function removeSelectedNote() {
    const note = selectedNote.value
    if (!note) return
    clearSelection()
    void options.apply([C.removeNote(note.id)])
  }

  function deleteSelection() {
    if (options.readOnly()) return
    if (selectedEdge.value) removeSelectedEdge()
    else if (selectedNote.value) removeSelectedNote()
    else if (selectedNode.value) removeSelectedNode()
  }

  return {
    selectedNodeId,
    selectedEdgeId,
    selectedNoteId,
    selectedNode,
    selectedEdge,
    selectedNote,
    hasSelection,
    select,
    clearSelection,
    onNodeClick,
    onEdgeClick,
    onPaneClick: clearSelection,
    updateNode,
    updateEdge,
    updateNote,
    removeSelectedNode,
    removeSelectedEdge,
    removeEdge,
    removeSelectedNote,
    deleteSelection,
  }
}
