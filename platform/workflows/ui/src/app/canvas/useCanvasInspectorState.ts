import { computed, type ComputedRef, type Ref } from 'vue'
import type { SyncEngine } from '../mapping/sync'
import { combineExclusiveBranchConflict } from '../nodes/combine-node'
import { effectiveNodeInputSchema, effectiveNodeOutputSchema } from '../domain/schema-policy'
import { isFailedSourcePort, FAILED_PAYLOAD_SCHEMA } from '../domain/node-policy'
import { parseRunError } from '../runs/run-detail'
import type { RunState } from '../runs/run-overlay'
import type { RunNodeHeader, RunRow } from '../api/api'
import { humanTitle } from '../domain/labels'

interface InspectorStateOptions {
  engine: SyncEngine
  revision: Ref<number>
  selectedNode: ComputedRef<any>
  selectedEdge: ComputedRef<any>
  runState: Ref<RunState>
  viewingRun: Ref<RunRow | null>
  viewingNodeHeaders: Ref<RunNodeHeader[]>
  error: Ref<string>
  loading: Ref<boolean>
  panelOpen: Ref<boolean>
  select: (kind: 'node', id: string) => void
}

export function useCanvasInspectorState(options: InspectorStateOptions) {
  const {
    engine, revision, selectedNode, selectedEdge, runState, viewingRun,
    viewingNodeHeaders, error, loading, panelOpen, select,
  } = options

  // Endpoint schemas of the selected edge feed the connection panel's assist chip
  // and its live compatibility read.
  const selectedEdgeUpstream = computed(() => {
    void revision.value
    const edge = selectedEdge.value
    if (!edge) return undefined
    // A Failed edge carries the stable { code, message } envelope, not the source
    // node's own output, so both the compatibility read and assist map use it.
    if (isFailedSourcePort(edge.source_port)) return FAILED_PAYLOAD_SCHEMA
    return effectiveNodeOutputSchema(engine.doc.nodes[edge.source_id])
  })
  const selectedEdgeDownstream = computed(() => {
    void revision.value
    const edge = selectedEdge.value
    return edge ? effectiveNodeInputSchema(engine.doc.nodes[edge.target_id], selectedEdgeUpstream.value) : undefined
  })
  const selectedEdgeSourceTitle = computed(() => {
    void revision.value
    const edge = selectedEdge.value
    const node = edge ? engine.doc.nodes[edge.source_id] : null
    return node ? humanTitle(node.title, node.ref) : ''
  })
  const selectedEdgeTargetTitle = computed(() => {
    void revision.value
    const edge = selectedEdge.value
    const node = edge ? engine.doc.nodes[edge.target_id] : null
    return node ? humanTitle(node.title, node.ref) : ''
  })
  const selectedNodeUpstream = computed(() => {
    void revision.value
    const node = selectedNode.value
    if (!node) return undefined
    const incoming = Object.values(engine.doc.edges).filter((edge) => edge.target_id === node.id)
    if (incoming.length !== 1) return undefined
    return effectiveNodeOutputSchema(engine.doc.nodes[incoming[0].source_id])
  })
  // The Branch title whose exclusive true/false arms are the selected combine's only
  // inputs, or null — the panel's wait-all guard-rail hint.
  const selectedCombineConflict = computed(() => {
    void revision.value
    const node = selectedNode.value
    if (!node) return null
    const branchId = combineExclusiveBranchConflict(engine.doc, node.id)
    if (!branchId) return null
    const branch = engine.doc.nodes[branchId]
    return humanTitle(branch?.title, branch?.ref) || 'a Condition'
  })

  // These run-overlay values drive the read-only inspector and failure strip.
  const selectedRunStatus = computed(() => {
    void revision.value
    return selectedNode.value ? runState.value.node[selectedNode.value.id] : undefined
  })
  const selectedRunHeader = computed(() => selectedNode.value
    ? viewingNodeHeaders.value.find((header) => header.def_node_id === selectedNode.value?.id) || null
    : null)
  const failedNode = computed(() => {
    void revision.value
    const status = runState.value.node
    for (const id of Object.keys(engine.doc.nodes)) {
      if (status[id] === 'failed') return engine.doc.nodes[id] || null
    }
    return null
  })
  const failedNodeTitle = computed(() => {
    const node = failedNode.value
    return node ? (humanTitle(node.title, node.ref) || 'A step') : ''
  })
  const runErrorView = computed(() => parseRunError(viewingRun.value?.error))
  const failedReason = computed(() => (runErrorView.value.generic ? '' : runErrorView.value.message))
  const errorView = computed(() => parseRunError(error.value))

  function openFailedDetails() {
    const node = failedNode.value
    if (node) { select('node', node.id); panelOpen.value = true }
  }

  const counts = computed(() => {
    void revision.value
    return { nodes: Object.keys(engine.doc.nodes).length, edges: Object.keys(engine.doc.edges).length }
  })
  function plural(count: number, word: string): string {
    return `${count} ${word}${count === 1 ? '' : 's'}`
  }
  const countLabel = computed(() => `${plural(counts.value.nodes, 'step')} · ${plural(counts.value.edges, 'connection')}`)
  const canUndo = computed(() => {
    void revision.value
    return engine.doc.canUndo
  })
  const canRedo = computed(() => {
    void revision.value
    return engine.doc.canRedo
  })
  const isEmpty = computed(() => {
    void revision.value
    return !loading.value && counts.value.nodes === 0 && Object.keys(engine.doc.notes).length === 0
  })

  return {
    selectedEdgeUpstream, selectedEdgeDownstream, selectedEdgeSourceTitle, selectedEdgeTargetTitle,
    selectedNodeUpstream, selectedCombineConflict, selectedRunStatus, selectedRunHeader,
    failedNode, failedNodeTitle, failedReason, runErrorView, errorView, openFailedDetails,
    counts, countLabel, canUndo, canRedo, isEmpty,
  }
}
