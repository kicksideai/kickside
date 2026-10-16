// Run control for the workflow canvas: live simulation, past runs, and run-with-input.
// Lifecycle changes arrive through the workflow thread relay; each notification causes one
// authoritative run read. No status observer or timer exists in this surface.
import { computed, onBeforeUnmount, ref, type Ref } from 'vue'
import { on } from '@wippy-fe/proxy'
import type { SyncEngine } from '../mapping/sync'
import { getRun, humanError, listRuns, simulateWorkflow, type RunExecution, type RunNodeHeader, type RunRow, type SimulateOptions } from '../api/api'
import { startNodeId, idleRunState, isLiveRunStatus, isWorkflowRunUpdate, runStateFromHeaders, type RunState } from '../runs/run-overlay'

export interface RunCtx {
  engine: SyncEngine
  workflowId: string
  rev: Ref<number>
  runState: Ref<RunState>
  viewingRun: Ref<RunRow | null>
  viewingExecution: Ref<RunExecution | null>
  viewingNodeHeaders: Ref<RunNodeHeader[]>
  rebuild: (refit?: boolean) => void
  clearSelection: () => void
  error: Ref<string>
  panelOpen: Ref<boolean>
  historyOpen: Ref<boolean>
}

export function useCanvasRun(ctx: RunCtx) {
  const { engine, workflowId, rev, runState, viewingRun, viewingExecution, viewingNodeHeaders, rebuild, clearSelection, error, panelOpen, historyOpen } = ctx

  // Simulate compiles the current canvas into a transient real run. The initial read and
  // subsequent relay-driven reads project real Dataflow node state onto the canvas.
  const runId = ref<string | null>(null)
  let refreshInFlight = false
  function stopRun() {
    runId.value = null
    viewingRun.value = null
    viewingExecution.value = null
    viewingNodeHeaders.value = []
    runState.value = idleRunState()
    clearSelection()
    rebuild()
  }

  async function refreshActiveRun() {
    const id = runId.value
    if (!id || refreshInFlight) return
    refreshInFlight = true
    try {
      const { run, nodes, errorRouted } = await getRun(workflowId, id)
      if (runId.value !== id) return
      const live = isLiveRunStatus(run.status)
      runState.value = runStateFromHeaders(engine.doc, nodes, run.status, errorRouted)
      rebuild()
      if (!live && run.status !== 'completed') error.value = run.error || `Run ${run.status}.`
    } catch (e) {
      error.value = humanError(e, 'Couldn’t refresh this run.')
    } finally {
      refreshInFlight = false
    }
  }

  const off: Array<() => void> = []
  try {
    const threadOff = on(`kickside.thread.${workflowId}`, (message: unknown) => {
      if (isWorkflowRunUpdate(message, workflowId)) void refreshActiveRun()
    })
    if (typeof threadOff === 'function') off.push(threadOff)
    const visibilityOff = on('@visibility', (visible: unknown) => {
      if (visible === true) void refreshActiveRun()
    })
    if (typeof visibilityOff === 'function') off.push(visibilityOff)
  } catch { /* inert in tests and outside the host */ }

  // ── Runs panel: browse past runs, load one as a read-only overlay ──
  const runsOpen = ref(false)
  const runRows = ref<RunRow[]>([])
  const runsLoading = ref(false)
  const runsError = ref('')

  async function loadRuns() {
    runsLoading.value = true
    runsError.value = ''
    try {
      runRows.value = await listRuns(workflowId, 20)
    } catch (e) {
      runsError.value = humanError(e, 'Couldn’t load runs.')
    } finally {
      runsLoading.value = false
    }
  }
  function toggleRuns() {
    runsOpen.value = !runsOpen.value
    if (runsOpen.value) { simOpen.value = false; historyOpen.value = false; void loadRuns() }
  }

  async function viewRun(row: RunRow) {
    runsOpen.value = false
    stopRun() // clears any live simulate and any run already being viewed
    viewingRun.value = row
    panelOpen.value = true
    try {
      const { run, nodes, execution, errorRouted } = await getRun(workflowId, row.run_id)
      // The user may have picked another run, or exited, while this was in flight.
      if (viewingRun.value?.run_id !== row.run_id) return
      viewingRun.value = run
      viewingExecution.value = execution
      viewingNodeHeaders.value = nodes
      runState.value = runStateFromHeaders(engine.doc, nodes, run.status, errorRouted)
      rebuild()
    } catch (e) {
      error.value = humanError(e, 'Couldn’t load this run.')
    }
  }

  // ── Run-with-input affordance ──
  // The primary run action compiles the CURRENT canvas into a transient real run (no
  // publish, no version) with an input the user provides. The input is edited against the
  // Start boundary node's declared schema — as a form, or as raw JSON. A Start-schema
  // validation failure (start_input_invalid) keeps the dialog open with the reason inline;
  // a workflow with no Start (or an empty Start schema) runs with {}.
  const simOpen = ref(false)
  const simBusy = ref(false)
  const simInput = ref<Record<string, unknown>>({})
  const simInputKey = ref(0)
  const simError = ref('')
  // False while the JSON editor holds text that doesn't parse to an object — Run fails closed.
  const simInputValid = ref(true)

  const startNode = computed(() => {
    void rev.value
    const id = startNodeId(engine.doc)
    return id ? engine.doc.nodes[id] || null : null
  })
  const startInputSchema = computed(() => {
    const n = startNode.value
    if (!n) return undefined
    const cfg = (n.config || {}) as Record<string, unknown>
    return cfg.input_schema ?? n.input_schema
  })
  function schemaHasObjectFields(schema: unknown): boolean {
    if (!schema || typeof schema !== 'object') return false
    const properties = (schema as { properties?: unknown }).properties
    return !!properties && typeof properties === 'object' && Object.keys(properties as Record<string, unknown>).length > 0
  }
  const startHasFields = computed(() => schemaHasObjectFields(startInputSchema.value))
  const canRunSimulate = computed(() => !simBusy.value && simInputValid.value)

  function openSimWith(input: Record<string, unknown>) {
    if (viewingRun.value) stopRun()
    runsOpen.value = false
    historyOpen.value = false
    error.value = ''
    simError.value = ''
    simInput.value = input
    simInputValid.value = true
    simInputKey.value++
    simOpen.value = true
  }
  function openSim() {
    if (runState.value.active) { stopRun(); return }
    openSimWith({})
  }
  function closeSim() { simOpen.value = false }

  // Re-run affordance from a run view: prefill the Run-with-input dialog with the run's
  // own canonical workflow input so the same run can be
  // repeated, or nudged, without re-typing. Falls through to an empty payload when the
  // Start input can't be read, rather than blocking the re-run.
  async function rerunSameInput(run: RunRow) {
    let input: Record<string, unknown> = {}
    try {
      const detail = await getRun(workflowId, run.run_id)
      if (detail.input) input = detail.input
    } catch { /* fall through with an empty payload */ }
    openSimWith(input)
  }

  function onSimInput(value: Record<string, unknown>) {
    simInput.value = value || {}
  }
  function onSimValid(ok: boolean) {
    simInputValid.value = ok
  }

  async function runSimulate() {
    const opts: SimulateOptions = {}
    opts.input = simInput.value || {}
    simError.value = ''
    simBusy.value = true
    try {
      runId.value = await simulateWorkflow(workflowId, opts)
      runState.value = runStateFromHeaders(engine.doc, [], 'running')
      simOpen.value = false
      rebuild()
      await refreshActiveRun()
    } catch (e) {
      simError.value = humanError(e, 'Couldn’t start the run.')
    } finally {
      simBusy.value = false
    }
  }

  onBeforeUnmount(() => { for (const unsubscribe of off) unsubscribe() })

  return {
    runId,
    runsOpen,
    runRows,
    runsLoading,
    runsError,
    simOpen,
    simBusy,
    simInput,
    simInputKey,
    simError,
    simInputValid,
    startInputSchema,
    startHasFields,
    canRunSimulate,
    stopRun,
    loadRuns,
    toggleRuns,
    viewRun,
    openSim,
    closeSim,
    rerunSameInput,
    onSimInput,
    onSimValid,
    runSimulate,
  }
}
