// The realtime definition sync engine (Beacon-grade). One reducer serves both
// planes:
//   1. optimistic-apply the events an apply/undo/redo POST returns, immediately;
//   2. patch incrementally from the workflow topic, filtered so nothing is applied
//      twice and your own layout drags don't echo back as a visible jump.
//
// Invariants:
//   * lastAppliedSeq monotonically tracks the highest applied seq. Any event with
//     seq <= lastAppliedSeq is a duplicate (the WS re-delivery of an event the POST
//     response already applied) and is dropped.
//   * Layout position echoes: on save we record {nodeId, x, y, ts}. An incoming
//     layout.position-set matching a recorded echo within the 500ms window is
//     acknowledged (its seq advances) but its visual patch is skipped — the local
//     drag is already the truth. This survives the race where the WS delta arrives
//     before the HTTP response registers its seq.
//   * Unknown event kinds don't corrupt state; the caller is told to refetch /state.

import { mappingExprText, renameRootVar } from '@widgets/app/field-mapper'
import type { ApplyResult, LayoutPosition, WfDoc, WfEdge, WfEvent, WfNode, WfNote } from '../types'
import { EVENT, COMMAND_TO_EVENT } from '../types'
import type { Command } from '../api/commands'

export const ECHO_WINDOW_MS = 500
const EDIT_EVENTS = new Set<string>(Object.values(COMMAND_TO_EVENT))

// A stored edge transform arrives as the backend mapping-spec object (an `input`-rooted
// expr) or a bare string; render it as the authoring-grammar text the edge mapper edits,
// which is `output`-rooted. An empty spec lowers to '' (pass-through). This is the single
// read-side bridge — the write path sends `output`-rooted text the backend re-roots to
// `input`, so the round-trip is lossless and never stringifies the object to
// "[object Object]".
function edgeTransformText(raw: unknown): string {
  const expr = mappingExprText(raw)
  return expr ? renameRootVar(expr, 'input', 'output') : ''
}

export function emptyDoc(): WfDoc {
  return { nodes: {}, edges: {}, notes: {}, positions: {}, viewport: null, direction: 'TB', params: {}, labels: [], headSeq: 0, definitionEditSeq: 0, canUndo: false, canRedo: false }
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const NODE_KINDS = new Set<WfNode['kind']>([
  'block',
  'branch',
  'cycle',
  'combine',
  'for_each',
  'flow',
  'start',
  'finish',
  'error',
])

function nodeKind(v: unknown): WfNode['kind'] | null {
  return typeof v === 'string' && NODE_KINDS.has(v as WfNode['kind'])
    ? (v as WfNode['kind'])
    : null
}

// Normalize the GET /state envelope (arrays + a layout block) into the keyed doc.
export function docFromState(state: unknown): WfDoc {
  const s = asRecord(state)
  const doc = emptyDoc()
  for (const raw of Array.isArray(s.nodes) ? s.nodes : []) {
    const n = normalizeNode(asRecord(raw))
    if (n) doc.nodes[n.id] = n
  }
  for (const raw of Array.isArray(s.edges) ? s.edges : []) {
    const e = normalizeEdge(asRecord(raw))
    if (e) doc.edges[e.id] = e
  }
  for (const raw of Array.isArray(s.notes) ? s.notes : []) {
    const note = normalizeNote(asRecord(raw))
    if (note) doc.notes[note.id] = note
  }
  const layout = asRecord(s.layout)
  const positions = asRecord(layout.positions ?? s.layout)
  for (const [id, pos] of Object.entries(positions)) {
    const p = asRecord(pos)
    if ('x' in p && 'y' in p) doc.positions[id] = clampPos(p)
  }
  const vp = asRecord(s.viewport ?? layout.viewport)
  if ('zoom' in vp || ('x' in vp && 'y' in vp)) doc.viewport = { x: num(vp.x), y: num(vp.y), zoom: num(vp.zoom, 1) }
  doc.direction = layout.direction === 'LR' ? 'LR' : 'TB'
  doc.params = asRecord(s.params)
  doc.labels = Array.isArray(s.labels) ? s.labels.filter((v): v is string => typeof v === 'string') : []
  doc.headSeq = num(s.head_seq)
  // The server excludes publication markers from the definition edit head.
  doc.definitionEditSeq = num(s.definition_edit_seq)
  doc.canUndo = s.can_undo === true
  doc.canRedo = s.can_redo === true
  return doc
}

function normalizeNode(b: Record<string, unknown>): WfNode | null {
  const id = String(b.id || '')
  const kind = nodeKind(b.kind)
  if (!id || !kind) return null
  const node: WfNode = { id, kind, title: String(b.title ?? 'Step') }
  if (b.ref != null) node.ref = String(b.ref)
  if (b.ref_label != null) node.ref_label = String(b.ref_label)
  if (b.config != null) node.config = asRecord(b.config)
  if (b.input_schema !== undefined) node.input_schema = b.input_schema
  if (b.output_schema !== undefined) node.output_schema = b.output_schema
  if (b.config_schema !== undefined) node.config_schema = b.config_schema
  if (b.icon != null) node.icon = String(b.icon)
  // Interface-contract data from the decorated snapshot lets the canvas render pinned
  // boundaries and derived call ports.
  if (b.pinned != null) node.pinned = b.pinned === true
  if (b.deletable != null) node.deletable = b.deletable === true
  if (b.boundary != null && typeof b.boundary === 'object') node.boundary = b.boundary as WfNode['boundary']
  if (b.child_interface != null && typeof b.child_interface === 'object') node.child_interface = b.child_interface as WfNode['child_interface']
  if (Array.isArray(b.ports)) node.ports = b.ports as WfNode['ports']
  return node
}

function normalizeEdge(b: Record<string, unknown>): WfEdge | null {
  const id = String(b.id || '')
  const source = String(b.source_id || '')
  const target = String(b.target_id || '')
  if (!id || !source || !target) return null
  const edge: WfEdge = { id, source_id: source, target_id: target }
  if (b.source_port != null) edge.source_port = String(b.source_port)
  if (b.target_port != null) edge.target_port = String(b.target_port)
  if (b.transform != null) edge.transform = edgeTransformText(b.transform)
  return edge
}

function normalizeNote(b: Record<string, unknown>): WfNote | null {
  const id = String(b.id || '')
  if (!id) return null
  // The store persists note text under `body`.
  const note: WfNote = { id, text: String(b.body ?? '') }
  if (b.kind === 'frame') note.kind = 'frame'
  else if (b.kind === 'note') note.kind = 'note'
  if (b.width != null) note.width = num(b.width)
  if (b.height != null) note.height = num(b.height)
  if (b.color != null && b.color !== '') note.color = String(b.color)
  return note
}

function clampPos(p: Record<string, unknown>): LayoutPosition {
  const pos: LayoutPosition = { x: num(p.x), y: num(p.y) }
  if (p.width != null) pos.width = num(p.width)
  if (p.height != null) pos.height = num(p.height)
  return pos
}

export interface ApplyOutcome {
  changed: boolean
  unknown: boolean
}

// Apply one event's body to the doc, in place. Returns whether it changed anything
// and whether the kind was unrecognized (caller refetches on unknown).
export function applyEvent(doc: WfDoc, ev: WfEvent): ApplyOutcome {
  const b = asRecord(ev.body)
  switch (ev.type) {
    case EVENT.NODE_ADDED: {
      const node = normalizeNode(b)
      if (!node) return { changed: false, unknown: false }
      doc.nodes = { ...doc.nodes, [node.id]: node }
      return { changed: true, unknown: false }
    }
    case EVENT.NODE_UPDATED: {
      const id = String(b.id || '')
      const existing = doc.nodes[id]
      if (!existing) return { changed: false, unknown: false }
      const patch: Partial<WfNode> = {}
      for (const k of ['kind', 'title', 'ref', 'ref_label', 'config', 'input_schema', 'output_schema', 'config_schema', 'icon', 'pinned', 'deletable', 'boundary', 'child_interface', 'ports'] as const) {
        if (k in b) (patch as Record<string, unknown>)[k] = b[k]
      }
      doc.nodes = { ...doc.nodes, [id]: { ...existing, ...patch } }
      return { changed: true, unknown: false }
    }
    case EVENT.NODE_REMOVED: {
      const id = String(b.id || '')
      if (!doc.nodes[id]) return { changed: false, unknown: false }
      const nodes = { ...doc.nodes }
      delete nodes[id]
      doc.nodes = nodes
      const positions = { ...doc.positions }
      delete positions[id]
      doc.positions = positions
      doc.edges = Object.fromEntries(
        Object.entries(doc.edges).filter(([, edge]) => edge.source_id !== id && edge.target_id !== id),
      )
      return { changed: true, unknown: false }
    }
    case EVENT.EDGE_ADDED: {
      const edge = normalizeEdge(b)
      if (!edge) return { changed: false, unknown: false }
      doc.edges = { ...doc.edges, [edge.id]: edge }
      return { changed: true, unknown: false }
    }
    case EVENT.EDGE_UPDATED: {
      const id = String(b.id || '')
      const existing = doc.edges[id]
      if (!existing) return { changed: false, unknown: false }
      const patch: Partial<WfEdge> = {}
      for (const k of ['source_id', 'target_id', 'source_port', 'target_port'] as const) {
        if (k in b) (patch as Record<string, unknown>)[k] = b[k]
      }
      if ('transform' in b) patch.transform = edgeTransformText(b.transform)
      doc.edges = { ...doc.edges, [id]: { ...existing, ...patch } }
      return { changed: true, unknown: false }
    }
    case EVENT.EDGE_REMOVED: {
      const id = String(b.id || '')
      if (!doc.edges[id]) return { changed: false, unknown: false }
      const edges = { ...doc.edges }
      delete edges[id]
      doc.edges = edges
      return { changed: true, unknown: false }
    }
    case EVENT.NOTE_ADDED: {
      const note = normalizeNote(b)
      if (!note) return { changed: false, unknown: false }
      doc.notes = { ...doc.notes, [note.id]: note }
      return { changed: true, unknown: false }
    }
    case EVENT.NOTE_UPDATED: {
      const id = String(b.id || '')
      const existing = doc.notes[id]
      if (!existing) return { changed: false, unknown: false }
      const patch: Partial<WfNote> = {}
      if ('body' in b) patch.text = String(b.body ?? '')
      else if ('text' in b) patch.text = String(b.text ?? '')
      if (b.kind === 'frame' || b.kind === 'note') patch.kind = b.kind
      if ('width' in b) patch.width = num(b.width)
      if ('height' in b) patch.height = num(b.height)
      if ('color' in b) patch.color = String(b.color ?? '')
      doc.notes = { ...doc.notes, [id]: { ...existing, ...patch } }
      return { changed: true, unknown: false }
    }
    case EVENT.NOTE_REMOVED: {
      const id = String(b.id || '')
      if (!doc.notes[id]) return { changed: false, unknown: false }
      const notes = { ...doc.notes }
      delete notes[id]
      doc.notes = notes
      return { changed: true, unknown: false }
    }
    case EVENT.LAYOUT_POSITION_SET: {
      const id = String(b.node_id || '')
      if (!id) return { changed: false, unknown: false }
      // set-position patches the layout row: absent width/height keep their saved
      // values, so a plain move never resizes a note or frame.
      const prior = doc.positions[id]
      const next = clampPos(b)
      if (prior) {
        if (next.width == null && prior.width != null) next.width = prior.width
        if (next.height == null && prior.height != null) next.height = prior.height
      }
      doc.positions = { ...doc.positions, [id]: next }
      return { changed: true, unknown: false }
    }
    case EVENT.LAYOUT_POSITION_CLEARED: {
      const id = String(b.node_id || '')
      if (!doc.positions[id]) return { changed: false, unknown: false }
      const positions = { ...doc.positions }
      delete positions[id]
      doc.positions = positions
      return { changed: true, unknown: false }
    }
    case EVENT.LAYOUT_VIEWPORT_SET: {
      doc.viewport = { x: num(b.x), y: num(b.y), zoom: num(b.zoom, 1) }
      return { changed: true, unknown: false }
    }
    case EVENT.LAYOUT_DIRECTION_SET: {
      doc.direction = b.direction === 'LR' ? 'LR' : 'TB'
      return { changed: true, unknown: false }
    }
    case EVENT.PARAM_SET: {
      const key = String(b.key || '')
      if (!key) return { changed: false, unknown: false }
      doc.params = { ...doc.params, [key]: b.value }
      return { changed: true, unknown: false }
    }
    case EVENT.LABELS_SET: {
      doc.labels = Array.isArray(b.labels) ? b.labels.filter((v): v is string => typeof v === 'string') : []
      return { changed: true, unknown: false }
    }
    case EVENT.VERSION_PUBLISHED:
    case EVENT.VERSION_RESTORED:
      return { changed: false, unknown: false }
    default:
      return { changed: false, unknown: true }
  }
}

// Fold locally issued commands into the doc, in place: the optimistic half of an apply, and
// the projection a multi-step edit plans its later commands against.
export function foldCommands(doc: WfDoc, cmds: Command[]): void {
  for (const cmd of cmds) applyEvent(doc, { seq: 0, type: COMMAND_TO_EVENT[cmd.type], body: cmd.body })
}

interface Echo {
  nodeId: string
  x: number
  y: number
  ts: number
}

export interface IngestResult {
  applied: WfEvent[]
  needsRefetch: boolean
  changed: boolean
}

export class SyncEngine {
  doc: WfDoc = emptyDoc()
  lastAppliedSeq = 0
  private echoes: Echo[] = []
  private confirmed: WfDoc | null = null
  private pending = new Map<number, Command[]>()
  private nextEdit = 0
  private historySeq = 0

  // Pending edits are an ordered projection over the sequenced server document.
  // Both HTTP and realtime fold into the same base; neither can replace an edit
  // that has not yet been acknowledged by its HTTP response.
  stageCommands(commands: Command[]): number {
    if (!this.confirmed) this.confirmed = this.copyDoc(this.doc)
    const edit = ++this.nextEdit
    this.pending.set(edit, commands)
    this.projectPending()
    return edit
  }

  rejectCommands(edit: number): void {
    this.pending.delete(edit)
    this.projectPending()
  }

  private copyDoc(doc: WfDoc): WfDoc {
    return { ...doc, nodes: Object.fromEntries(Object.entries(doc.nodes).map(([id, node]) => [id, { ...node }])) }
  }

  private projectPending(): void {
    if (!this.confirmed) return
    this.doc = this.copyDoc(this.confirmed)
    for (const commands of this.pending.values()) foldCommands(this.doc, commands)
    if (!this.pending.size) this.confirmed = null
  }

  // Reset to a freshly fetched /state snapshot. Everything at or below head_seq is,
  // by definition, already reflected.
  reset(state: unknown): void {
    this.doc = docFromState(state)
    this.lastAppliedSeq = this.doc.headSeq
    this.echoes = []
    this.historySeq = this.doc.headSeq
    this.confirmed = this.pending.size ? this.doc : null
    this.projectPending()
  }

  // Record that the local user just committed a node to (x, y), so the matching
  // broadcast echo is suppressed. Coordinates are rounded to match the command.
  recordLayoutEcho(nodeId: string, x: number, y: number, now = Date.now()): void {
    this.echoes.push({ nodeId, x: Math.round(x), y: Math.round(y), ts: now })
  }

  private pruneEchoes(now: number): void {
    if (!this.echoes.length) return
    this.echoes = this.echoes.filter((e) => now - e.ts <= ECHO_WINDOW_MS)
  }

  private matchEcho(nodeId: string, x: number, y: number, now: number): boolean {
    const i = this.echoes.findIndex(
      (e) => e.nodeId === nodeId && e.x === Math.round(x) && e.y === Math.round(y) && now - e.ts <= ECHO_WINDOW_MS,
    )
    if (i < 0) return false
    this.echoes.splice(i, 1)
    return true
  }

  // Apply a batch of events (from an apply response or the topic). Events are
  // ordered by seq; duplicates and own echoes are handled per the invariants above.
  ingest(events: WfEvent[], opts: { now?: number } = {}): IngestResult {
    if (this.confirmed) this.doc = this.confirmed
    const now = opts.now ?? Date.now()
    this.pruneEchoes(now)
    const sorted = [...events].sort((a, b) => a.seq - b.seq)
    const applied: WfEvent[] = []
    let needsRefetch = false
    let changed = false
    for (const ev of sorted) {
      if (ev.seq <= this.lastAppliedSeq) continue
      if (ev.type === EVENT.LAYOUT_POSITION_SET) {
        const b = asRecord(ev.body)
        const id = String(b.node_id || '')
        if (id && this.matchEcho(id, num(b.x), num(b.y), now)) {
          if (this.confirmed) applyEvent(this.doc, ev)
          this.lastAppliedSeq = ev.seq
          if (ev.seq > this.doc.headSeq) this.doc.headSeq = ev.seq
          // A layout position is a definition edit — advance the edit head with it.
          if (ev.seq > this.doc.definitionEditSeq) this.doc.definitionEditSeq = ev.seq
          continue
        }
      }
      const outcome = applyEvent(this.doc, ev)
      this.lastAppliedSeq = ev.seq
      if (ev.seq > this.doc.headSeq) this.doc.headSeq = ev.seq
      // The server command/event mapping identifies definition edits. Publication and
      // restore markers advance only the raw head and refresh version metadata.
      if (EDIT_EVENTS.has(ev.type) && ev.seq > this.doc.definitionEditSeq) this.doc.definitionEditSeq = ev.seq
      if (outcome.unknown || ev.type === EVENT.VERSION_PUBLISHED || ev.type === EVENT.VERSION_RESTORED) needsRefetch = true
      else if (outcome.changed) {
        applied.push(ev)
        changed = true
      }
    }
    this.projectPending()
    return { applied, needsRefetch, changed }
  }

  // Fold an apply/undo/redo response: patch the doc from its events, then take the
  // authoritative undo/redo/head cursors from the envelope.
  applyResponse(result: ApplyResult, now = Date.now(), edit?: number): IngestResult {
    if (edit !== undefined) this.pending.delete(edit)
    const out = this.ingest(result.events || [], { now })
    if (this.confirmed) this.doc = this.confirmed
    if (Number.isFinite(result.head_seq)) {
      this.doc.headSeq = Math.max(this.doc.headSeq, result.head_seq)
      // An apply/undo/redo envelope carries only edit events (never a publish marker), so the
      // edit head tracks its head_seq.
      this.doc.definitionEditSeq = Math.max(this.doc.definitionEditSeq, result.head_seq)
      this.lastAppliedSeq = Math.max(this.lastAppliedSeq, result.head_seq)
    }
    if (result.head_seq >= this.historySeq) {
      this.historySeq = result.head_seq
      this.doc.canUndo = result.can_undo === true
      this.doc.canRedo = result.can_redo === true
    }
    this.projectPending()
    return out
  }
}
