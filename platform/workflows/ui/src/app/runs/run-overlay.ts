// The run-overlay state machine. The canvas renders purely from a RunState — traveling
// data pulses on active edges, breathing status rings on running nodes — folded from a
// real run's live dataflow node headers. The workflow thread relay announces lifecycle
// appends; the canvas reads the affected run once and maps its node headers here.

import type { WfDoc } from '../types'
import type { RunNodeHeader } from '../api/api'
import { kindWaits } from '../domain/node-policy'

export type NodeRunStatus = 'idle' | 'pending' | 'running' | 'awaiting' | 'completed' | 'failed'
export type EdgeRunStatus = 'idle' | 'active' | 'done'

const TERMINAL_RUN_STATUSES = new Set(['completed', 'failed', 'cancelled', 'canceled', 'terminated'])

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

// Threads publish this notification after lifecycle events are durably appended. It carries
// no run snapshot: consumers read the authoritative run projection once per notification.
export function isWorkflowRunUpdate(message: unknown, workflowId: string): boolean {
  if (!workflowId) return false
  const root = record(message)
  const nested = record(root.data)
  const payload = Object.keys(nested).length ? nested : root
  const threadId = String(payload.thread_id || root.thread_id || '')
  const topic = String(root.topic || payload.topic || '')
  const eventType = String(payload.event_type || root.event_type || '')
  return eventType === 'events.appended'
    && (threadId === workflowId || (!threadId && topic === `kickside.thread.${workflowId}`))
}

export function isLiveRunStatus(status: string): boolean {
  return !TERMINAL_RUN_STATUSES.has(status.toLowerCase())
}

// The engine's node status vocabulary folded onto the overlay's six states. Unknown
// statuses read as idle rather than guessing.
export function normalizeNodeStatus(status: string): NodeRunStatus {
  const s = status.toLowerCase()
  if (s === 'completed' || s === 'complete' || s === 'done' || s === 'success' || s === 'succeeded') return 'completed'
  if (s === 'failed' || s === 'error' || s === 'cancelled' || s === 'canceled' || s === 'terminated') return 'failed'
  if (s === 'running' || s === 'active' || s === 'executing' || s === 'started') return 'running'
  if (s === 'pending' || s === 'queued' || s === 'waiting' || s === 'blocked' || s === 'ready') return 'pending'
  return 'idle'
}

// Fold live dataflow node headers into a RunState the canvas renders. Node status maps
// through normalizeNodeStatus keyed on def_node_id; an edge lights active while its
// target is running/pending off a completed source, and done once both ends complete.
export function runStateFromHeaders(doc: WfDoc, headers: RunNodeHeader[], runStatus: string, errorRouted = false): RunState {
  const status = runStatus.toLowerCase()
  const active = isLiveRunStatus(status)
  const node: Record<string, NodeRunStatus> = {}
  for (const id of Object.keys(doc.nodes)) node[id] = 'idle'
  for (const h of headers) {
    if (!h.def_node_id || !(h.def_node_id in doc.nodes)) continue
    let status = normalizeNodeStatus(h.status)
    // A declared wait Block reads as "awaiting" rather than "running", but only
    // while the run is live; a terminal run has no pause.
    if (active && kindWaits(doc.nodes[h.def_node_id].kind, doc.nodes[h.def_node_id].ref) && (status === 'running' || status === 'pending')) {
      status = 'awaiting'
    }
    node[h.def_node_id] = status
  }
  // Start/Finish/Error are interface declarations and intentionally have no engine
  // headers. Project them from the authoritative run lifecycle so the canvas remains
  // truthful without inventing persisted boundary nodes.
  for (const definition of Object.values(doc.nodes)) {
    if (definition.kind === 'start' && runStatus) node[definition.id] = 'completed'
    else if (definition.kind === 'finish') {
      if (status === 'completed') node[definition.id] = 'completed'
      else if (active) node[definition.id] = 'pending'
    } else if (definition.kind === 'error' && status === 'failed' && errorRouted) {
      node[definition.id] = 'failed'
    }
  }
  const edge: Record<string, EdgeRunStatus> = {}
  for (const e of Object.values(doc.edges)) {
    const src = node[e.source_id] || 'idle'
    const tgt = node[e.target_id] || 'idle'
    if ((src === 'completed' && (tgt === 'completed' || tgt === 'failed')) || (src === 'failed' && tgt === 'failed')) edge[e.id] = 'done'
    else if (src === 'completed' && (tgt === 'running' || tgt === 'pending' || tgt === 'awaiting')) edge[e.id] = 'active'
    else edge[e.id] = 'idle'
  }
  return { active, node, edge }
}

export interface RunState {
  active: boolean
  node: Record<string, NodeRunStatus>
  edge: Record<string, EdgeRunStatus>
}

export function idleRunState(): RunState {
  return { active: false, node: {}, edge: {} }
}

// A run enters through the Start boundary node — it declares the run input. Returns the
// sole Start node's id, or empty when none is placed yet (a workflow with no Start runs
// with an empty input).
export function startNodeId(doc: WfDoc): string {
  return Object.values(doc.nodes).find((n) => n.kind === 'start')?.id || ''
}
