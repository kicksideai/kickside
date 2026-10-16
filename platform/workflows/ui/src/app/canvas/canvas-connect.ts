// Connect-drag interaction for the workflow canvas, extracted from WorkflowCanvas so the
// component keeps only its reactive core. Owns the live ghost-connection hint state, the
// VueFlow connect handlers, and the W11.1 intent-edge flow: on connect it runs the auto-map
// heuristic and either applies an obvious mapping silently (with a visible reveal + a
// persistent WHY trace) or drops the edge into a pending state with the intent popover. The
// doc/apply/select seam is passed in.
import { onBeforeUnmount, onMounted, reactive, ref, type Ref } from 'vue'
import type { Connection } from '@vue-flow/core'
import type { SyncEngine } from '../mapping/sync'
import type { WfDoc } from '../types'
import { deriveContainers, containerAt, nodeContinuationPort, resolvePositions } from '../mapping/graph-sync'
import { foldCommands } from '../mapping/sync'
import { isPresentationHandle, isStructurallyValid, semanticPort, validateConnection, type ConnectionLike, type ConnectStatus } from '../domain/connection-policy'
import { autoMap, type AutoMapResult } from '../mapping/auto-map'
import { edgeSourceSchema, effectiveNodeInputSchema, finishSchemaAdoption, needsDeclaredInputContract } from '../domain/schema-policy'
import { isBoundaryKind, outPortsFor } from '../domain/node-policy'
import type { RunRow } from '../api/api'
import * as C from '../api/commands'
import type { EdgeIntentPreview } from '../panels/assist'
import { acceptedEdgeIntentPlan } from './edge-intent-plan'

// The slice of a built VueFlow edge the intent decoration mutates — just its id and class.
// `class` is typed loosely because VueFlow's Edge.class is a broad HTML-class union; the
// decorator only ever reads/writes a plain string.
interface FlowEdgeLike { id: string | number; class?: unknown }

// 'warn' marks a structurally legal but schema-mismatched drop — allowed, flagged for
// mapping, never refused.
export type DragStatus = ConnectStatus | 'warn'

// The edge the intent popover is anchored to: freshly drawn, schema-ambiguous, awaiting a
// plain-language description of what should flow across it.
export interface PendingEdge {
  id: string
  sourceId: string
  targetId: string
  sourceSchema: unknown
  targetSchema: unknown
  sourceRoot: string
  sourceFailureAvailable: boolean
  unresolved: AutoMapResult['unresolved']
}

// Session provenance for an edge the heuristic mapped silently: it drives the transient
// reveal moment and the persistent hover/click WHY trace. Not persisted — the mapping
// itself lives on the edge; this is the "just now, here's what I did" affordance.
export interface AutoMappedEdge {
  id: string
  sourceId: string
  targetId: string
  result: AutoMapResult
}

export interface ConnectCtx {
  engine: SyncEngine
  apply: (cmds: C.Command[], refit?: boolean) => void
  select: (kind: 'node' | 'edge' | 'note', id: string) => void
  layoutDir: Ref<'TB' | 'LR'>
  viewingRun: Ref<RunRow | null>
}

// The outcome of a landed connection, computed purely from the doc so the decision is
// unit-testable without the canvas. `plain` connects with no mapping (nothing obvious to
// map, or the target takes no input); `auto` carries the applied transform; `ambiguous`
// hands off to the intent popover with the blocking required fields named.
export interface ConnectPlan {
  edgeId: string
  cmds: C.Command[]
  action: 'plain' | 'auto' | 'ambiguous' | 'adopt-finish' | 'contract-unavailable'
  result: AutoMapResult
  sourceId: string
  targetId: string
  sourceSchema: unknown
  targetSchema: unknown
  sourceFailureAvailable: boolean
}

// When a connection makes its target a new body member, position the target inside the
// container so the next rebuild doesn't dagre-relocate it off-screen. Returns null when the
// target already sits inside the container it is joining, so a deliberate placement is left
// untouched. Pure over the doc + layout direction.
function bodyJoinPosition(doc: WfDoc, conn: Connection, layoutDir: 'TB' | 'LR'): { x: number; y: number } | null {
  const source = conn.source as string
  const target = conn.target as string
  if (!source || !target) return null
  const positions = resolvePositions(doc, layoutDir)
  const { parentOf } = deriveContainers(doc, positions)
  const parent = conn.sourceHandle === 'body' ? source : parentOf[source]
  if (!parent || parentOf[target] === parent) return null
  if (containerAt(doc, positions[target], positions) === parent) return null
  const anchor = positions[source]
  return anchor ? { x: anchor.x, y: anchor.y + 120 } : null
}

// Build the full command batch for a landed connection and classify it against the auto-map
// heuristic. Structurally illegal drops (self-loop / duplicate) return null — the caller
// refuses them. Everything else is a legal edge: the commands add it (opting the Failed face
// in when drawn from that handle, snapping a body join into place) and, when the mapping is
// unambiguous, carry the applied transform.
export function planConnect(doc: WfDoc, conn: Connection, layoutDir: 'TB' | 'LR'): ConnectPlan | null {
  const sourceNode = doc.nodes[conn.source as string]
  const targetNode = doc.nodes[conn.target as string]
  const sourcePort = isPresentationHandle(conn.sourceHandle) && sourceNode?.kind === 'start'
    ? 'out'
    : semanticPort(conn.sourceHandle)
  const targetPort = isPresentationHandle(conn.targetHandle) && (targetNode?.kind === 'finish' || targetNode?.kind === 'error')
    ? 'in'
    : semanticPort(conn.targetHandle)
  const semanticConnection: ConnectionLike = {
    source: conn.source,
    target: conn.target,
    sourceHandle: sourcePort,
    targetHandle: targetPort,
  }
  if (!isStructurallyValid(semanticConnection, Object.values(doc.edges))) return null
  const edgeId = C.uid()
  const cmds: C.Command[] = [C.addEdge({
    id: edgeId,
    source_id: conn.source as string,
    target_id: conn.target as string,
    source_port: sourcePort,
    target_port: targetPort,
  })]
  const snap = bodyJoinPosition(doc, conn, layoutDir)
  if (snap) cmds.push(C.setPosition(conn.target as string, snap.x, snap.y))

  const src = doc.nodes[conn.source as string]
  const tgt = doc.nodes[conn.target as string]
  // A route drawn from the Failed handle carries the { code, message } envelope, and a
  // Branch source reads through to its upstream — edgeSourceSchema owns both rules.
  const sourceSchema = edgeSourceSchema(doc, { source_id: conn.source as string, source_port: conn.sourceHandle || undefined })
  let targetSchema = effectiveNodeInputSchema(tgt, sourceSchema)
  const adoptedFinishSchema = finishSchemaAdoption(sourceSchema, tgt)
  if (adoptedFinishSchema && tgt) {
    cmds.push(C.updateNode(tgt.id, { config: { ...(tgt.config || {}), output_schema: adoptedFinishSchema } }))
    targetSchema = adoptedFinishSchema
  }
  const result = autoMap(sourceSchema, targetSchema, 'output')
  const sourcePorts = src ? outPortsFor(src.kind, src.ref) : []
  const sourceFailureAvailable = !!src && sourcePorts.some((port) => port.id === 'failed')

  let action: ConnectPlan['action'] = adoptedFinishSchema
    ? 'adopt-finish'
    : needsDeclaredInputContract(tgt, targetSchema)
      ? 'contract-unavailable'
      : 'plain'
  if (!adoptedFinishSchema && action !== 'contract-unavailable' && result.status === 'auto') {
    cmds.push(C.updateEdge(edgeId, { transform: result.transform }))
    action = 'auto'
  } else if (!adoptedFinishSchema && action !== 'contract-unavailable' && result.status === 'ambiguous') {
    action = 'ambiguous'
  }
  return { edgeId, cmds, action, result, sourceId: conn.source as string, targetId: conn.target as string, sourceSchema, targetSchema, sourceFailureAvailable }
}

// Insert a step into an existing connection as one batch: the step's own placement commands,
// the connection's removal, then source -> step and step -> target, each planned exactly as a
// hand-drawn connection so auto-mapping, Finish schema mapping and body joins apply. The
// inbound leg keeps the connection's source port, the outbound leg its target port, and the
// step hands the route on through its continuation port. Null when the connection is gone or
// the step is a boundary, which has no input or no output to sit mid-route with.
export function planSplice(doc: WfDoc, edgeId: string, stepId: string, placement: C.Command[], layoutDir: 'TB' | 'LR'): C.Command[] | null {
  const edge = doc.edges[edgeId]
  if (!edge) return null
  const draft: WfDoc = { ...doc }
  const cmds: C.Command[] = [...placement, C.removeEdge(edgeId)]
  foldCommands(draft, cmds)
  const step = draft.nodes[stepId]
  if (!step || isBoundaryKind(step.kind)) return null
  const inbound = planConnect(draft, {
    source: edge.source_id, sourceHandle: edge.source_port ?? null, target: stepId, targetHandle: null,
  }, layoutDir)
  if (!inbound) return null
  foldCommands(draft, inbound.cmds)
  const outbound = planConnect(draft, {
    source: stepId, sourceHandle: nodeContinuationPort(step) ?? null, target: edge.target_id, targetHandle: edge.target_port ?? null,
  }, layoutDir)
  if (!outbound) return null
  return [...cmds, ...inbound.cmds, ...outbound.cmds]
}

export function useCanvasConnect(ctx: ConnectCtx) {
  const { engine, apply, select, layoutDir, viewingRun } = ctx

  const connectStatus = ref<DragStatus | null>(null)
  const connectMessage = ref('')
  const connectXY = ref<{ x: number; y: number } | null>(null)

  // ── Intent-edge state (W11.1) ──
  // One explanation layer at a time. Keeping old auto-map reveals while opening a new
  // intent prompt made two cards occupy the same edge midpoint and obscured both. The
  // mapping itself remains persisted and inspectable; this state is only the active,
  // transient explanation.
  const pendingEdge = ref<PendingEdge | null>(null)
  const autoMapped = reactive(new Map<string, AutoMappedEdge>())
  const intentRev = ref(0)
  function bumpIntent() { intentRev.value++ }

  function connectLineStyle() {
    const hue =
      connectStatus.value === 'error' ? 'var(--wf-danger)'
      : connectStatus.value === 'warn' ? 'var(--wf-amber)'
      : connectStatus.value === 'ok' ? 'var(--p-success-500)'
      : 'var(--wf-line-strong)'
    return { stroke: hue, strokeWidth: 2, strokeDasharray: '4 3' }
  }

  // Only a structurally illegal drop (self-loop / duplicate) is refused — that keeps the
  // mid-drag red preview. A schema mismatch is a legal connection flagged 'warn' for
  // mapping. A callable step whose current contract is unavailable is also loud: connecting
  // still succeeds, but the editor never pretends there is nothing to map.
  function checkConnection(conn: Connection): DragStatus {
    if (!isStructurallyValid(conn as ConnectionLike, Object.values(engine.doc.edges))) {
      connectStatus.value = 'error'
      connectMessage.value = conn.source && conn.source === conn.target
        ? 'A step can’t connect to itself.'
        : 'These steps are already connected.'
      return 'error'
    }
    const tgt = engine.doc.nodes[conn.target || '']
    const srcSchema = edgeSourceSchema(engine.doc, { source_id: conn.source || '', source_port: conn.sourceHandle || undefined })
    const targetSchema = effectiveNodeInputSchema(tgt, srcSchema)
    if (needsDeclaredInputContract(tgt, targetSchema)) {
      connectStatus.value = 'warn'
      connectMessage.value = 'Input fields are still loading — connect to keep the route visible.'
      return 'warn'
    }
    const verdict = validateConnection(srcSchema, targetSchema)
    if (verdict.status === 'error') {
      connectStatus.value = 'warn'
      connectMessage.value = 'Needs a mapping — connect, then describe what flows here.'
      return 'warn'
    }
    connectStatus.value = verdict.status
    connectMessage.value = ''
    return verdict.status
  }
  // VueFlow calls this hook two ways: for a live interactive drag (a bare Connection with
  // no id, built fresh from the pointer's handle) and, on every v-model:edges set — i.e.
  // every rebuild — to re-validate each already-stored edge (which always carries its id).
  // Refusing unconditionally while viewingRun (read-only) rejected every stored edge from
  // the second path, so VueFlow's store held zero edges and a past run rendered none. A
  // stored edge is already valid by construction and is never re-derived here; only a
  // genuinely new drag is subject to the read-only refusal and the compat check.
  function isValidConnection(conn: Connection): boolean {
    if ('id' in conn) return true
    if (viewingRun.value) return false
    return checkConnection(conn) !== 'error'
  }
  function resetConnectHint() {
    connectStatus.value = null
    connectMessage.value = ''
    connectXY.value = null
  }

  function onConnect(conn: Connection) {
    resetConnectHint()
    if (viewingRun.value) return
    const plan = planConnect(engine.doc, conn, layoutDir.value)
    if (!plan) return
    autoMapped.clear()
    pendingEdge.value = null
    apply(plan.cmds)
    if (plan.action === 'auto') {
      // Silent apply: no panel, no interruption — the reveal moment + trace carry the news.
      autoMapped.set(plan.edgeId, { id: plan.edgeId, sourceId: plan.sourceId, targetId: plan.targetId, result: plan.result })
      pendingEdge.value = null
      bumpIntent()
    } else if (plan.action === 'ambiguous') {
      pendingEdge.value = {
        id: plan.edgeId,
        sourceId: plan.sourceId,
        targetId: plan.targetId,
        sourceSchema: plan.sourceSchema,
        targetSchema: plan.targetSchema,
        sourceRoot: 'output',
        sourceFailureAvailable: plan.sourceFailureAvailable,
        unresolved: plan.result.unresolved,
      }
      bumpIntent()
    } else if (plan.action === 'plain' || plan.action === 'contract-unavailable') {
      select('edge', plan.edgeId)
    }
  }

  // ── Intent flow controls (consumed by the popover + reveal) ──
  function dismissPending() {
    pendingEdge.value = null
    bumpIntent()
  }
  function clearIntentOverlays() {
    const changed = !!pendingEdge.value || autoMapped.size > 0
    pendingEdge.value = null
    autoMapped.clear()
    if (changed) bumpIntent()
  }
  function acceptPending(preview: EdgeIntentPreview) {
    const p = pendingEdge.value
    if (!p) return
    const plan = acceptedEdgeIntentPlan(engine.doc, p, preview)
    if (!plan) return
    if (plan.commands.length) apply(plan.commands, plan.refit)
    if (plan.select) select(plan.select.kind, plan.select.id)
    pendingEdge.value = null
    bumpIntent()
  }
  function openPendingMapper() {
    const p = pendingEdge.value
    if (!p) return
    select('edge', p.id)
    pendingEdge.value = null
    bumpIntent()
  }
  function dismissAutoMapped(id: string) {
    if (autoMapped.delete(id)) bumpIntent()
  }
  function openAutoMapped(id: string) {
    select('edge', id)
    if (autoMapped.delete(id)) bumpIntent()
  }
  // Drop provenance for edges the doc no longer carries (deleted, or reverted on a failed
  // apply), so a stale trace never anchors to nothing. Called from the canvas rebuild —
  // silent by design: the rebuild's own revision bump already reruns the anchored render.
  function pruneIntent(existingEdgeIds: Set<string>) {
    for (const id of [...autoMapped.keys()]) {
      if (!existingEdgeIds.has(id)) autoMapped.delete(id)
    }
    if (pendingEdge.value && !existingEdgeIds.has(pendingEdge.value.id)) pendingEdge.value = null
  }
  // Append the intent classes onto the built flow edges: a calm flowing dash on the pending
  // edge, a subtle marker on an auto-mapped one. Mutates in place; safe to call every rebuild.
  function decorateEdges(edges: FlowEdgeLike[]) {
    for (const e of edges) {
      const id = String(e.id)
      const extra = pendingEdge.value?.id === id ? 'wf-edge--pending'
        : autoMapped.has(id) ? 'wf-edge--auto'
        : ''
      if (!extra) continue
      const cur = typeof e.class === 'string' ? e.class : ''
      e.class = cur ? `${cur} ${extra}` : extra
    }
  }

  function onConnectEnd() {
    resetConnectHint()
  }
  function onCanvasMouseMove(e: MouseEvent) {
    if (connectStatus.value) connectXY.value = { x: e.clientX, y: e.clientY }
  }

  // Safety net: pointerup always fires on release, even when VueFlow drops connect-end.
  onMounted(() => window.addEventListener('pointerup', resetConnectHint))
  onBeforeUnmount(() => window.removeEventListener('pointerup', resetConnectHint))

  return {
    connectStatus,
    connectMessage,
    connectXY,
    connectLineStyle,
    isValidConnection,
    resetConnectHint,
    onConnect,
    onConnectEnd,
    onCanvasMouseMove,
    // intent-edge
    pendingEdge,
    autoMapped,
    intentRev,
    dismissPending,
    clearIntentOverlays,
    acceptPending,
    openPendingMapper,
    dismissAutoMapped,
    openAutoMapped,
    pruneIntent,
    decorateEdges,
  }
}
