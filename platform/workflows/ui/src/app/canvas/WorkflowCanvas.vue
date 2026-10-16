<script setup lang="ts">
import { computed, markRaw, nextTick, proxyRefs, ref, shallowRef, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useVueFlow } from '@vue-flow/core'
import type { EdgeTypesObject, NodeTypesObject } from '@vue-flow/core'
import { restoreOverlayFocusAfterHide } from '../overlay-focus'
import WorkflowNode from '../nodes/WorkflowNode.vue'
import NoteNode from '../nodes/NoteNode.vue'
import FrameNode from '../nodes/FrameNode.vue'
import ContainerNode from '../nodes/ContainerNode.vue'
import MappingCompletenessEdge from './MappingCompletenessEdge.vue'
import { SyncEngine } from '../mapping/sync'
import { workflowEdits } from './workflow-edits'
import { WorkflowEditJournal } from './workflow-edit-journal'
import { finishPreviousWorkflowWriter, registerWorkflowWriter, useWorkflowEditLifecycle } from './useWorkflowEditLifecycle'
import { asRecord, get } from '../api/http'
import { buildFlowData } from './graph-projection'
import { hydrateNodeContracts } from '../domain/schema-policy'
import { idleRunState, type RunState } from '../runs/run-overlay'
import { humanTitle } from '../domain/labels'
import type { CatalogItem } from '../catalog/catalog'
import * as C from '../api/commands'
import { applyCommands, getState, humanError, redo, undo, type RunExecution, type RunNodeHeader, type RunRow } from '../api/api'
import { useCanvasConnect } from './canvas-connect'
import { useCanvasPlacement } from './canvas-placement'
import { useCanvasKeyboard } from './canvas-keyboard'
import { useCanvasRun } from './canvas-run'
import { useResponsiveRails } from './use-responsive-rails'
import { readableFitOptions } from './canvas-fit'
import { useCanvasAuthoring } from './use-canvas-authoring'
import { useCanvasShell } from './use-canvas-shell'
import { useCanvasInspectorState } from './useCanvasInspectorState'
import { useCanvasPublishing } from './useCanvasPublishing'
import { useCanvasOverlayActions } from './useCanvasOverlayActions'
import { useCanvasLayoutActions } from './useCanvasLayoutActions'
import { useCanvasConnectionEditor } from './useCanvasConnectionEditor'
import { useCanvasCreateMenu } from './useCanvasCreateMenu'
import { useCanvasIntentAnchors } from './useCanvasIntentAnchors'
import { useWorkflowCanvasRealtime } from './useWorkflowCanvasRealtime'
import WorkflowCanvasView from './WorkflowCanvasView.vue'

const props = defineProps<{ workflowId: string }>()
const emit = defineEmits<{ (e: 'back'): void; (e: 'open-workflow', id: string): void }>()

const engine = new SyncEngine()
const rev = ref(0)
const loading = ref(true)
const error = ref('')
const overlayInvoker = shallowRef<HTMLElement | null>(null)
const overlayFallback = shallowRef<HTMLElement | null>(null)
let overlayFocusGeneration = 0

function rememberOverlayInvoker(fallback: HTMLElement | null = null) {
  overlayFocusGeneration += 1
  const root = rootEl.value?.getRootNode() as ShadowRoot | undefined
  overlayInvoker.value = root?.activeElement instanceof HTMLElement ? root.activeElement : null
  overlayFallback.value = fallback ?? rootEl.value?.querySelector<HTMLElement>(
    'button[aria-label="More workflow actions"]',
  ) ?? null
}

// PrimeVue owns focus trapping and restoration. In the embedded Wippy iframe its
// document.activeElement stops at the workflow host, so PrimeVue cannot always see
// the shadow-root invoker. Wait past its hide transition and intervene only if the
// workflow shadow root still has no focused element.
async function restoreOverlayFocusFallback() {
  const generation = overlayFocusGeneration
  const target = overlayInvoker.value
  const fallback = overlayFallback.value ?? rootEl.value?.querySelector<HTMLElement>(
    'button[aria-label="More workflow actions"]',
  ) ?? null
  await nextTick()
  const root = rootEl.value?.getRootNode() as ShadowRoot | undefined
  const restored = await restoreOverlayFocusAfterHide({
    root: root ?? null,
    target,
    fallback,
    isCurrent: () => generation === overlayFocusGeneration,
  })
  if (!restored) return
  overlayFocusGeneration += 1
  overlayInvoker.value = null
  overlayFallback.value = null
}

const flowNodes = shallowRef<ReturnType<typeof buildFlowData>['flowNodes']>([])
const flowEdges = shallowRef<ReturnType<typeof buildFlowData>['flowEdges']>([])
// Per-node publish-gate marks: node id -> directed issue message, set from a publish
// refusal so the offending node carries the reason (not only the summary banner). Cleared
// on a fresh load and on a successful publish.
const publishIssues = ref<Map<string, string>>(new Map())

const layoutDir = computed(() => { rev.value; return engine.doc.direction })

const catalog = ref<CatalogItem[]>([])
const catalogErrors = ref<string[]>([])
const catalogLoading = ref(true)
const availableSteps = computed(() => {
  const unique = new Map<string, string>()
  for (const item of catalog.value) {
    const kind = String(item.kind)
    if (item.ref || kind === 'start' || kind === 'finish' || kind === 'error') continue
    if (!unique.has(kind)) unique.set(kind, item.title)
  }
  return [...unique].map(([kind, title]) => ({ kind, title }))
})

const runState = ref<RunState>(idleRunState())
// A positive, non-error notice (e.g. a published version) shown in its own banner.
const notice = ref('')
const toast = useToast()
const confirm = useConfirm()
watch(notice, (message) => {
  if (!message) return
  toast.add({ severity: 'success', summary: 'Workflow updated', detail: message, life: 5000 })
  notice.value = ''
})

const viewingRun = ref<RunRow | null>(null)
const viewingExecution = ref<RunExecution | null>(null)
const viewingNodeHeaders = ref<RunNodeHeader[]>([])

const {
  panelOpen,
  paletteOpen,
  historyOpen,
  addTriggerOpen,
  shareOpen,
  shareHost,
} = useCanvasShell()

const {
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
  onPaneClick,
  updateNode,
  updateEdge,
  updateNote,
  removeSelectedNode,
  removeSelectedEdge,
  removeEdge,
  removeSelectedNote,
  deleteSelection,
} = useCanvasAuthoring({
  doc: () => engine.doc,
  revision: rev,
  readOnly: () => !!viewingRun.value,
  apply: (commands) => apply(commands),
  openInspector: () => { panelOpen.value = true },
  reportError: (message) => { error.value = message },
  confirmNodeRemoval: (node, accept) => {
    confirm.require({
      group: 'node-delete',
      header: 'Delete step?',
      message: `Delete “${humanTitle(node.title, node.ref)}” and its connections? You can undo this change.`,
      rejectLabel: 'Cancel',
      acceptLabel: 'Delete step',
      accept,
    })
  },
})

const {
  publishBusy, publishedVersion, exportBusy,
  loadPublishedState, exportDefinition, definitionEditSeq, doPublish,
} = useCanvasPublishing({
  engine,
  workflowId: props.workflowId,
  revision: rev,
  error,
  notice,
  historyOpen,
  publishIssues,
  rebuild,
  select,
})

// VueFlow's NodeComponent typing is stricter than a plain SFC; the runtime only
// needs the raw component, so the map is cast to the store's expected shape.
const nodeTypes = { wfNode: markRaw(WorkflowNode), wfNote: markRaw(NoteNode), wfFrame: markRaw(FrameNode), wfContainer: markRaw(ContainerNode) } as unknown as NodeTypesObject
const edgeTypes = { 'mapping-completeness': markRaw(MappingCompletenessEdge) } as unknown as EdgeTypesObject
const flowId = `wf-${props.workflowId}`
const { fitView, screenToFlowCoordinate, getViewport, onNodesInitialized, findNode, getSelectedNodes } = useVueFlow(flowId)
// Bumped on every viewport move so the intent overlays (popover / auto-map reveal) recompute
// their edge-midpoint anchor while the user pans or zooms.
const viewportRev = ref(0)
function onViewportMove() { viewportRev.value++ }
// The initial load frames the graph only once VueFlow has measured the node
// dimensions — a nextTick fit fires too early and no-ops, leaving off-origin nodes
// clipped under the palette. onNodesInitialized is the measured signal.
let didInitialFit = false
onNodesInitialized(() => {
  if (didInitialFit || loading.value) return
  didInitialFit = true
  nextTick(() => fit())
})

const inspector = useCanvasInspectorState({
  engine,
  revision: rev,
  selectedNode,
  selectedEdge,
  runState,
  viewingRun,
  viewingNodeHeaders,
  error,
  loading,
  panelOpen,
  select,
})
const {
  selectedEdgeUpstream, selectedEdgeDownstream, selectedEdgeSourceTitle, selectedEdgeTargetTitle,
  selectedNodeUpstream, selectedCombineConflict, selectedRunStatus, selectedRunHeader,
  failedNode, failedNodeTitle, failedReason, errorView, openFailedDetails,
  countLabel, canUndo, canRedo, isEmpty,
} = inspector

function rebuild(refit = false) {
  // Registry interfaces evolve independently of stored graph events. Re-project the
  // current catalog on every rebuild so loaded and remotely-added nodes use the same
  // contracts as a node placed in this session.
  hydrateNodeContracts(engine.doc.nodes, catalog.value)
  // The overlay renders for a live simulate OR a historical run being viewed —
  // runState.active itself stays false for the latter (it's not live), so it can't
  // gate the overlay alone.
  const showOverlay = runState.value.active || !!viewingRun.value
  const built = buildFlowData(engine.doc, showOverlay ? runState.value : undefined, layoutDir.value, publishIssues.value, !!viewingRun.value)
  // Intent-edge overlay: drop provenance for edges the doc no longer carries, then paint the
  // pending/auto classes onto the freshly built edges so the flowing dash and the auto marker
  // render (W11.1).
  pruneIntent(new Set(built.flowEdges.map((e) => String(e.id))))
  decorateEdges(built.flowEdges)
  flowNodes.value = built.flowNodes
  flowEdges.value = built.flowEdges
  rev.value++
  if (refit) nextTick(() => requestAnimationFrame(() => requestAnimationFrame(() => {
    try { fitView(canvasFitOptions()) } catch { /* no-op */ }
  })))
}

// Load is strictly read-only: it folds the fetched /state into the doc and rebuilds
// the canvas. Default positions for unplaced nodes stay in-memory (graph-sync fills
// them) and are never written back — a position is persisted only on a real user
// drag. An in-flight guard collapses concurrent load calls into one fetch per mount.
let loadInFlight: Promise<void> | null = null
let journal: WorkflowEditJournal | null = null
let writerKey = ''
async function load(refit = false): Promise<void> {
  if (loadInFlight) return loadInFlight
  loadInFlight = (async () => {
    loading.value = true
    try {
      if (!journal) {
        const me = await get('/api/v1/user/me')
        const user = asRecord(me.user)
        const owner = String(user.id || user.email || '')
        if (!owner) throw new Error('Unable to identify the Workflow editor session.')
        writerKey = `${owner}:${props.workflowId}`
        await finishPreviousWorkflowWriter(writerKey)
        journal = new WorkflowEditJournal(owner, props.workflowId, localStorage)
      }
      const state = await getState(props.workflowId)
      engine.reset(state)
      if (!initializedWriter) {
        const pending = journal.read(engine.doc)
        journal.write(pending)
        initializedWriter = true
        registerWorkflowWriter(writerKey, saveEdits)
        for (const commands of pending) void saveEdits(commands)
      }
      publishIssues.value = new Map()
      error.value = ''
      rebuild(refit)
    } catch (e) {
      error.value = humanError(e, 'Couldn’t load this Workflow.')
    } finally {
      loading.value = false
    }
  })()
  try { await loadInFlight } finally { loadInFlight = null }
}

let initializedWriter = false
const saveEdits = workflowEdits({
  checkpoint: commands => {
    if (!journal) throw new Error('Workflow edits are not ready to save.')
    journal.write(commands)
  },
  engine,
  request: async (commands) => {
    const result = await applyCommands(props.workflowId, commands)
    error.value = ''
    return result
  },
  rebuild,
  recover: async (cause) => {
    const msg = humanError(cause, 'Couldn’t save the change.')
    await load()
    error.value = msg
  },
})

useWorkflowEditLifecycle(saveEdits, () => writerKey)

async function leaveCanvas(action: () => void) {
  if (await saveEdits.flush()) action()
}

async function apply(cmds: C.Command[], refit = false) {
  if (viewingRun.value) { error.value = 'Exit run view to edit this Workflow.'; return }
  if (!cmds.length) return
  if (!initializedWriter || loading.value) { error.value = 'Wait for Workflow edits to finish loading.'; return }
  try { await saveEdits(cmds, refit) }
  catch (cause) { error.value = humanError(cause, 'Couldn’t preserve the pending change.') }
}

async function runHistory(action: 'undo' | 'redo') {
  if (viewingRun.value) return
  if (action === 'undo' && !engine.doc.canUndo) return
  if (action === 'redo' && !engine.doc.canRedo) return
  try {
    if (!await saveEdits.flush()) return
    await (action === 'undo' ? undo : redo)(props.workflowId)
    // Undo/redo may rewind the log; refetch the folded truth to stay exact.
    await load()
  } catch (e) {
    error.value = humanError(e, action === 'undo' ? 'Nothing to undo.' : 'Nothing to redo.')
  }
}

let prepareCanvasAction = async (): Promise<boolean> => false

const { canvasEl, placeItem, placeNote, placeFrame, onDrop, onDragOver } = useCanvasPlacement({
  engine, layoutDir, apply, select, catalog, getViewport, screenToFlowCoordinate,
})

const { onNodeDragStop, runAutoLayout, toggleDir, fit } = useCanvasLayoutActions({
  engine,
  layoutDir,
  viewingRun,
  canvasEl,
  apply,
  prepareCanvasAction: () => prepareCanvasAction(),
  fitView,
  canvasFitOptions,
})

function canvasFitOptions(duration = 250) {
  const width = canvasEl.value?.getBoundingClientRect().width || 0
  const uiScale = typeof document === 'undefined'
    ? 1
    : Number.parseFloat(getComputedStyle(document.documentElement).zoom || '1') || 1
  return readableFitOptions(duration, width > 0 && width <= 640 ? 0.02 : 0.2, uiScale)
}
const {
  connectStatus, connectMessage, connectXY, connectLineStyle, isValidConnection,
  onConnect: connectFromDrag, onConnectEnd: settleConnectHint, onCanvasMouseMove,
  pendingEdge, autoMapped, intentRev, dismissPending, acceptPending, openPendingMapper,
  dismissAutoMapped, openAutoMapped, clearIntentOverlays, pruneIntent, decorateEdges,
} = useCanvasConnect({
  engine, apply, select, layoutDir, viewingRun,
})

const {
  connectionsOpen, connectionSources, connectionTargets, connectionEdges, connectionTargetHandle,
  openConnections, closeConnections, createConnection,
} = useCanvasConnectionEditor({
  engine,
  revision: rev,
  layoutDir,
  clearIntentOverlays,
  rememberOverlayInvoker,
  restoreOverlayFocusFallback,
  onConnect: connectFromDrag,
})

const {
  pendingOverlaySize, autoOverlaySizes, pendingAnchor, autoMapAnchored, connectHintPosition,
  measurePending, measureAuto,
} = useCanvasIntentAnchors({
  engine,
  flowNodes,
  canvasEl,
  findNode,
  getViewport,
  revision: rev,
  viewportRevision: viewportRev,
  intentRevision: intentRev,
  pendingEdge,
  autoMapped,
  connectXY,
  rebuild,
})

const {
  runsOpen, runRows, runsLoading, runsError,
  simOpen, simBusy, simInput, simInputKey, simError, simInputValid,
  startInputSchema, startHasFields, canRunSimulate,
  stopRun, toggleRuns: toggleRunsPanel, viewRun, openSim: openRunDialog, closeSim, rerunSameInput, onSimInput, onSimValid, runSimulate,
} = useCanvasRun({
  engine, workflowId: props.workflowId, rev, runState, viewingRun, viewingExecution, viewingNodeHeaders, rebuild, clearSelection, error, panelOpen, historyOpen,
})

const {
  openShare, toggleHistory, closeHistory, openAddTrigger, closeAddTrigger,
  openSim, closeRunDialog, toggleRuns, closeRuns,
} = useCanvasOverlayActions({
  workflowId: props.workflowId,
  shareOpen,
  shareHost,
  historyOpen,
  addTriggerOpen,
  runsOpen,
  simOpen,
  publishedVersion,
  error,
  clearIntentOverlays,
  rememberOverlayInvoker,
  restoreOverlayFocusFallback,
  openRunDialog,
  closeSim,
  toggleRunsPanel,
})
const publishedRunOpen = ref(false)
function openPublishedRun(invoker: HTMLElement | null = null) {
  if (!publishedVersion.value || viewingRun.value) return
  clearIntentOverlays(); rememberOverlayInvoker(invoker)
  publishedRunOpen.value = true
  historyOpen.value = false; runsOpen.value = false; simOpen.value = false; addTriggerOpen.value = false
}
function closePublishedRun() { publishedRunOpen.value = false; void restoreOverlayFocusFallback() }
const { rootEl, onKeyDown, focusPaletteSearch } = useCanvasKeyboard({
  deleteSelection, runHistory, paletteOpen, hasSelection, clearSelection,
  fit: () => fit(),
  zoomSelection: () => {
    const ids = getSelectedNodes.value.map(n => n.id)
    if (ids.length) void fitView({ nodes: ids, padding: 0.4, duration: 200, maxZoom: 1.2 })
  },
})

const {
  paneMenu, openPaneMenu, onPaneContextMenu, onNodeContextMenu, closePaneMenu,
  menuAddStep, menuAddNote, menuAddFrame, dropPicker, onConnectStart, onConnect,
  onConnectEnd, closeDropPicker, dropPickerPick,
} = useCanvasCreateMenu({
  viewingRun,
  catalog,
  paletteOpen,
  screenToFlowCoordinate,
  placeItem,
  placeNote,
  placeFrame,
  focusPaletteSearch,
  onConnect: connectFromDrag,
  settleConnectHint,
})

const responsiveRails = useResponsiveRails({
  rootEl, panelOpen, paletteOpen, hasSelection, viewingRun,
  reframe: () => {
    try { fitView(canvasFitOptions(180)) } catch { /* inert before VueFlow mounts */ }
  },
})
const { narrow: narrowEditor, inspectorVisible, togglePalette, openInspector, closeInspector } = responsiveRails
prepareCanvasAction = responsiveRails.prepareCanvasAction

function showSuggestedNode(kind: string) {
  const item = catalog.value.find((candidate) => !candidate.ref && String(candidate.kind) === kind)
  dismissPending()
  paletteOpen.value = true
  notice.value = item ? `Suggested step: ${item.title}. Choose it from the palette.` : 'Choose the suggested step from the palette.'
}

useWorkflowCanvasRealtime({
  workflowId: props.workflowId,
  engine,
  catalog,
  catalogErrors,
  catalogLoading,
  load,
  loadPublishedState,
  rebuild,
})

const viewModel = proxyRefs({
  rootEl, canvasEl, shareHost,
  runState, viewingRun, onKeyDown,
  paletteOpen, countLabel, canUndo, canRedo, layoutDir, runsOpen, simBusy,
  publishedVersion, exportBusy, historyOpen, publishBusy, publishedRunOpen, openPublishedRun, closePublishedRun,
  togglePalette, runHistory, fit, runAutoLayout, toggleDir, openConnections,
  toggleRuns, openAddTrigger, openShare, openSim, exportDefinition, toggleHistory, doPublish,
  connectionsOpen, connectionSources, connectionTargets, connectionEdges, connectionTargetHandle,
  removeEdge, closeConnections, createConnection,
  runRows, runsLoading, runsError, viewRun, closeRuns,
  simOpen, startInputSchema, simInput, simInputKey, startHasFields, simInputValid, simError,
  canRunSimulate, closeRunDialog, runSimulate, onSimInput, onSimValid,
  definitionEditSeq, closeHistory, addTriggerOpen, closeAddTrigger, shareOpen,
  dropPicker, catalog, dropPickerPick, closeDropPicker,
  paneMenu, closePaneMenu, menuAddStep, menuAddNote, menuAddFrame,
  stopRun,
  error, errorView, catalogLoading, catalogErrors, placeItem, placeNote, placeFrame,
  onDrop, onDragOver, onCanvasMouseMove, flowId, flowNodes, flowEdges, nodeTypes,
  edgeTypes, connectLineStyle, isValidConnection, onNodeClick, onEdgeClick, onPaneClick,
  onPaneContextMenu, onNodeContextMenu, onConnectStart, onConnect, onConnectEnd,
  onNodeDragStop, onViewportMove, isEmpty, failedNode, failedNodeTitle, failedReason,
  openFailedDetails, connectStatus, connectHintPosition, connectMessage, autoMapAnchored,
  measureAuto, openAutoMapped, dismissAutoMapped, pendingEdge, pendingAnchor,
  availableSteps, pendingOverlaySize, measurePending, acceptPending, showSuggestedNode,
  openPendingMapper, dismissPending, loading, panelOpen, hasSelection, openInspector,
  narrowEditor, closeInspector, selectedNode, selectedRunStatus, selectedRunHeader,
  viewingExecution, clearSelection, rerunSameInput, selectedEdge, selectedNote,
  selectedEdgeUpstream, selectedEdgeDownstream, selectedEdgeSourceTitle, selectedEdgeTargetTitle,
  selectedNodeUpstream, selectedCombineConflict, updateNode, removeSelectedNode,
  updateEdge, removeSelectedEdge, updateNote, removeSelectedNote,
})
</script>

<template>
  <WorkflowCanvasView
    :workflow-id="props.workflowId"
    :model="viewModel"
    @back="leaveCanvas(() => emit('back'))"
    @open-workflow="(id) => leaveCanvas(() => emit('open-workflow', id))"
  />
</template>
