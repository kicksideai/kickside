// Definition-plane types for the workflow builder. The canvas is a DAG of steps:
// executable nodes are either an exact Block reference or an exact nested Flow;
// structural nodes carry only their owned control configuration. Edges carry mappings. Notes
// are neutral sticky annotations behind the graph. Everything mutates through the
// {type, body} command envelope and is materialized back from the {seq, type, body}
// event stream the backend broadcasts.

// Business steps use one exact `block` kind plus a registry reference. There is no trigger kind: a
// workflow is a pure typed function (Start -> Finish | Error); triggers live only in
// the automation layer, bound to a published workflow.
export type NodeKind =
  | 'block'
  | 'cycle'
  | 'for_each'
  | 'flow'
  | 'branch'
  | 'combine'
  | 'start'
  | 'finish'
  | 'error'

export interface WfNode {
  id: string
  kind: NodeKind
  title: string
  // Exact Block id. Nested Flow identity lives in config.flow_ref.
  ref?: string
  ref_label?: string
  config?: Record<string, unknown>
  // Resolved from the catalog at placement time; drives connect-time validation.
  input_schema?: unknown
  output_schema?: unknown
  error_schema?: unknown
  // The picker/config-schema tag family this node's config panel mounts.
  config_schema?: unknown
  icon?: string
  // Interface-contract markers, set by the backend snapshot decorator for boundary
  // nodes (start/finish/error). Pinned nodes render locked and are never deletable.
  pinned?: boolean
  deletable?: boolean
  boundary?: BoundaryMarker | null
  // A nested Flow's resolved interface plus the result/failed ports derived from it.
  child_interface?: ChildInterface | null
  ports?: NodePort[]
}

export interface BoundaryMarker {
  role: string
  pinned?: boolean
  schema_key?: string
  removable?: boolean
}

export interface ChildInterface {
  input_schema?: unknown
  output_schema?: unknown
  error_schema?: unknown
  input_keys?: string[]
  output_keys?: string[]
  error_keys?: string[]
  version?: number
}

export interface NodePort {
  id: string
  label?: string
  direction?: string
  schema?: unknown
}

export interface WfEdge {
  id: string
  source_id: string
  target_id: string
  source_port?: string
  target_port?: string
  transform?: string
}

// A note is either a sticky annotation ('note', the default) or a colored background
// frame region ('frame'). Both ride the same persistence stack, split by `kind`.
export type NoteKind = 'note' | 'frame'

export interface WfNote {
  id: string
  text: string
  kind?: NoteKind
  width?: number
  height?: number
  color?: string
}

export interface LayoutPosition {
  x: number
  y: number
  width?: number
  height?: number
}

export type LayoutDirection = 'TB' | 'LR'

export interface Viewport {
  x: number
  y: number
  zoom: number
}

// The folded definition document the canvas renders. Kept as records keyed by id so
// per-event patches are O(1) and stable across incremental realtime updates.
export interface WfDoc {
  nodes: Record<string, WfNode>
  edges: Record<string, WfEdge>
  notes: Record<string, WfNote>
  positions: Record<string, LayoutPosition>
  viewport: Viewport | null
  direction: LayoutDirection
  params: Record<string, unknown>
  labels: string[]
  headSeq: number
  // The latest definition-edit sequence, excluding non-projected publish markers — the
  // server's own marker-excluded value from /state, advanced in lockstep by every applied
  // edit event (never by the version.published marker). The version panel compares it to a
  // published version's def_seq to tell whether the draft carries unpublished edits, trusting
  // the server's has_draft_changes rule rather than re-deriving it client-side.
  definitionEditSeq: number
  canUndo: boolean
  canRedo: boolean
}

// One definition event as delivered by an apply response or the workflow topic.
export interface WfEvent {
  seq: number
  type: string
  body: Record<string, unknown>
}

// The apply/undo/redo response envelope.
export interface ApplyResult {
  events: WfEvent[]
  head_seq: number
  can_undo: boolean
  can_redo: boolean
}

export interface WorkflowSummary {
  id: string
  title: string
  status?: string
  // Flat, definition-owned organization labels (W18) — grouping/filter metadata only,
  // never hierarchy or access. Folded from the def event stream onto the list read.
  labels?: string[]
  updated_at?: string
  node_count?: number
  run_count?: number
  head_seq?: number
  interface?: WorkflowInterface | null
  published_version?: number
  published_def_seq?: number
  published_interface?: WorkflowInterface | null
  has_draft_changes?: boolean
  // Access-checked workspace placement, folded onto the list row by the backend: the
  // immediate parent container's id and display name (breadcrumb mirrors parent_name —
  // the immediate parent, not a full path). All three are absent when the workflow is
  // unplaced (root) or the actor cannot read the parent — never a leaked title.
  parent_id?: string
  parent_name?: string
  breadcrumb?: string
  last_run?: WorkflowRunSummary | null
}

export interface WorkflowInterface {
  input_schema?: unknown
  output_schema?: unknown
  error_schema?: unknown
  input_count?: number
  output_count?: number
  error_count?: number
  input_keys?: string[]
  output_keys?: string[]
  error_keys?: string[]
}

export interface WorkflowRunSummary {
  run_id: string
  status: string
  error?: string | null
  started_at?: string | null
  finished_at?: string | null
}

// Commands and server events have distinct wire dialects, derived from the server declaration.
export { CMD, EVENT, COMMAND_TO_EVENT } from './vocabulary.generated'
