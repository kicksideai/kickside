// Run reads and launches: a workflow's run list and per-run detail, the per-node data
// rows the inspector and edge assist read, and the two launch doors (simulate the draft
// canvas / run the published version). Row/node decoding lives here; payload decoding
// delegates to run-detail so the mapping is unit-tested without this module's proxy.

import { decodeRunNodeRows, type RunNodeDataRow } from '../domain/run-payload'
export type { RunNodeDataRow } from '../domain/run-payload'
import { get, post } from './http'

// One node's live state within a run, from the dataflow node headers. def_node_id maps
// back to the definition node id the canvas keys on; status is the engine's own node
// status string, normalized by the run overlay.
export interface RunNodeHeader {
  engine_node_id: string
  parent_engine_node_id?: string
  def_node_id: string
  type: string
  status: string
  title: string
}

export interface FlowRunRef { kind: 'flow'; id: string; version: number }
export interface FlowDraftRef { kind: 'flow'; id: string; def_seq: number }
export interface AutomationRunRef { kind: 'automation'; id: string; revision: number }

interface RunBase {
  run_id: string
  automation_ref?: AutomationRunRef
  origin?: string
  status: string
  error?: string | null
  started_at?: string | null
  finished_at?: string | null
  // The completed run's Finish payload, present only on a terminal-completed run detail
  // (GET .../runs/{run_id} adds it via runs.output_for_run). Absent — never null — for
  // running and failed runs. This is the embed's read seam for rendering the result.
  output?: unknown
  dataflow_id?: string
  // The engine's live status for an active run (the runs list reads it while the run is
  // not terminal); "waiting" means the run is parked on a signal such as an Await.
  dataflow_status?: string
}

export type RunRow = RunBase & (
  | { flow_ref: FlowRunRef; draft_ref?: never }
  | { draft_ref: FlowDraftRef; flow_ref?: never }
)

export interface RunExecution {
  dataflow_id?: string
  parent_dataflow_id?: string
  process?: { id?: string; host?: string; pid?: string }
}

export interface RunTimelineEvent {
  seq: number
  occurred_at?: string
  source: string
  type: string
  engine_node_id?: string
  raw?: unknown
}

export interface RunTimeline {
  events: RunTimelineEvent[]
  count: number
  limit: number
  offset: number
  next_offset: number | null
}

export async function listRuns(id: string, limit = 20): Promise<RunRow[]> {
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/runs?limit=${limit}`)
  const rows = Array.isArray(data.runs) ? (data.runs as Record<string, unknown>[]) : []
  return rows.map(asRunRow)
}

export async function getRun(id: string, runId: string): Promise<{ run: RunRow; input?: Record<string, unknown>; errorRouted: boolean; nodes: RunNodeHeader[]; execution: RunExecution }> {
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/runs/${encodeURIComponent(runId)}`)
  const run = asRunRow((data.run as Record<string, unknown>) || {})
  const nodes = (Array.isArray(data.nodes) ? (data.nodes as Record<string, unknown>[]) : []).map((n) => ({
    engine_node_id: String(n.engine_node_id || ''),
    parent_engine_node_id: n.parent_engine_node_id != null ? String(n.parent_engine_node_id) : undefined,
    def_node_id: String(n.def_node_id || ''),
    type: String(n.type || ''),
    status: String(n.status || ''),
    title: String(n.title || ''),
  }))
  const input = data.input && typeof data.input === 'object' && !Array.isArray(data.input)
    ? data.input as Record<string, unknown>
    : undefined
  return { run, input, errorRouted: data.error_routed === true, nodes, execution: asExecution(data.execution) }
}

export async function getRunTimeline(id: string, runId: string, limit = 100, offset = 0): Promise<RunTimeline> {
  const safeLimit = Math.max(1, Math.min(200, limit))
  const safeOffset = Math.max(0, offset)
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/runs/${encodeURIComponent(runId)}/events?limit=${safeLimit}&offset=${safeOffset}`)
  const timeline = (data.timeline && typeof data.timeline === 'object' ? data.timeline : {}) as Record<string, unknown>
  const events = Array.isArray(timeline.events) ? (timeline.events as Record<string, unknown>[]) : []
  return {
    events: events.map((event) => ({
      seq: Number(event.seq || 0),
      occurred_at: event.occurred_at != null ? String(event.occurred_at) : undefined,
      source: String(event.source || 'engine'),
      type: String(event.type || 'event'),
      engine_node_id: event.engine_node_id != null ? String(event.engine_node_id) : undefined,
      ...(event.raw !== undefined ? { raw: event.raw } : {}),
    })),
    count: Number(timeline.count || 0),
    limit: Number(timeline.limit || safeLimit),
    offset: Number(timeline.offset || safeOffset),
    next_offset: timeline.next_offset != null ? Number(timeline.next_offset) : null,
  }
}

export async function exportRun(id: string, runId: string): Promise<unknown> {
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/runs/${encodeURIComponent(runId)}/export`)
  if (data.export === undefined) throw new Error('the server did not return a run export')
  return data.export
}

// One dataflow data row for a node within a run: its data type (node.output,
// node.input, …), the branch discriminator (result.success / result.error), when it was
// written, and its decoded content. JSON content arrives as a string and is parsed so
// callers read a value, not raw text.
// The data rows a node produced within a run, ordered oldest-first. def_node_id maps to
// the definition node the canvas keys on. Feeds edge assist the upstream node's real
// output and the run inspector its per-node I/O, error and timing. Decoding lives in
// run-detail so the mapping is unit-tested without this module's proxy dependency.
export async function getRunNodeData(id: string, runId: string, defNodeId: string): Promise<RunNodeDataRow[]> {
  if (!id || !runId || !defNodeId) return []
  const data = await get(`/api/v1/workflows/${encodeURIComponent(id)}/runs/${encodeURIComponent(runId)}/nodes/${encodeURIComponent(defNodeId)}/data`)
  const rows = Array.isArray(data.data) ? (data.data as Record<string, unknown>[]) : []
  return decodeRunNodeRows(rows)
}

function asRunRow(r: Record<string, unknown>): RunRow {
  const provenance = asRunProvenance(r)
  const automationRef = r.automation_ref == null ? undefined : asAutomationRef(r.automation_ref)
  return {
    run_id: String(r.run_id || ''),
    ...provenance,
    ...(automationRef ? { automation_ref: automationRef } : {}),
    origin: r.origin != null ? String(r.origin) : undefined,
    status: String(r.status || 'pending'),
    error: r.error != null ? String(r.error) : null,
    started_at: r.started_at != null ? String(r.started_at) : null,
    finished_at: r.finished_at != null ? String(r.finished_at) : null,
    ...(r.output !== undefined ? { output: r.output } : {}),
    dataflow_id: r.dataflow_id != null ? String(r.dataflow_id) : undefined,
    ...(r.dataflow_status != null ? { dataflow_status: String(r.dataflow_status) } : {}),
  }
}

function asFlowRef(value: unknown): FlowRunRef {
  const ref = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  const id = typeof ref.id === 'string' ? ref.id : ''
  const version = Number(ref.version)
  if (ref.kind !== 'flow' || !id || !Number.isInteger(version) || version < 1) {
    throw new Error('the server returned an invalid Workflow reference')
  }
  return { kind: 'flow', id, version }
}

function asDraftRef(value: unknown): FlowDraftRef {
  const ref = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  const id = typeof ref.id === 'string' ? ref.id : ''
  const defSeq = Number(ref.def_seq)
  if (ref.kind !== 'flow' || !id || !Number.isInteger(defSeq) || defSeq < 0) {
    throw new Error('the server returned an invalid Workflow draft reference')
  }
  return { kind: 'flow', id, def_seq: defSeq }
}

function asAutomationRef(value: unknown): AutomationRunRef {
  const ref = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  const id = typeof ref.id === 'string' ? ref.id : ''
  const revision = Number(ref.revision)
  if (ref.kind !== 'automation' || !id || !Number.isInteger(revision) || revision < 1) {
    throw new Error('the server returned an invalid Automation reference')
  }
  return { kind: 'automation', id, revision }
}

function asRunProvenance(value: Record<string, unknown>): { flow_ref: FlowRunRef } | { draft_ref: FlowDraftRef } {
  if (value.flow_ref != null && value.draft_ref == null) return { flow_ref: asFlowRef(value.flow_ref) }
  if (value.draft_ref != null && value.flow_ref == null) return { draft_ref: asDraftRef(value.draft_ref) }
  throw new Error('the server must return exactly one Workflow run reference')
}

function asExecution(value: unknown): RunExecution {
  const execution = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  const process = execution.process && typeof execution.process === 'object' && !Array.isArray(execution.process)
    ? execution.process as Record<string, unknown>
    : null
  return {
    dataflow_id: execution.dataflow_id != null ? String(execution.dataflow_id) : undefined,
    parent_dataflow_id: execution.parent_dataflow_id != null ? String(execution.parent_dataflow_id) : undefined,
    ...(process ? { process: {
      id: process.id != null ? String(process.id) : undefined,
      host: process.host != null ? String(process.host) : undefined,
      pid: process.pid != null ? String(process.pid) : undefined,
    } } : {}),
  }
}

export interface SimulateOptions {
  input?: Record<string, unknown>
}

// Compile the CURRENT canvas into an owner-only transient run and return its run_id
// to poll like any run. This explicit endpoint is the sole working-document path.
export async function simulateWorkflow(id: string, opts: SimulateOptions = {}): Promise<string> {
  const b: Record<string, unknown> = {}
  if (opts.input !== undefined) b.input = opts.input
  const data = await post(`/api/v1/workflows/${encodeURIComponent(id)}/simulate`, b)
  const runId = String(data.run_id || '')
  if (!runId) throw new Error('the server did not return a run id')
  return runId
}

// Launch one exact immutable published Flow version.
export async function launchRun(id: string, version: number, input: Record<string, unknown> = {}): Promise<string> {
  if (!Number.isInteger(version) || version < 1) throw new Error('a published Workflow version is required')
  const data = await post(`/api/v1/workflows/${encodeURIComponent(id)}/run`, { version, input })
  const runId = String(data.run_id || '')
  if (!runId) throw new Error('the server did not return a run id')
  return runId
}
