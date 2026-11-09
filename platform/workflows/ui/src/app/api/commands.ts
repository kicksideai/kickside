// Pure builders for the {type, body} command envelope POST /workflows/{id}/apply
// accepts. Client mints UUIDs for every add so an optimistic node is stable from the
// instant it is placed — the seq the backend returns simply confirms it.

import type { CommandType } from '../vocabulary.generated'
import { RETRY_FIELDS, CMD, type LayoutDirection, type NodeKind, type NoteKind, type WfNode, type WfEdge } from '../types'

export interface Command {
  type: CommandType
  body: Record<string, unknown>
}

export function uid(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto
  return c && typeof c.randomUUID === 'function'
    ? c.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function addNode(node: {
  id?: string
  kind: NodeKind
  title: string
  ref?: string
  config?: Record<string, unknown>
} & Pick<WfNode, typeof RETRY_FIELDS[number]>): Command {
  const body: Record<string, unknown> = { id: node.id || uid(), kind: node.kind, title: node.title }
  if (node.ref) body.ref = node.ref
  if (node.config) body.config = node.config
  for (const field of RETRY_FIELDS) if (node[field] !== undefined) body[field] = node[field]
  return { type: CMD.NODE_ADD, body }
}

export function updateNode(id: string, patch: Partial<WfNode>): Command {
  return { type: CMD.NODE_UPDATE, body: { id, ...patch } }
}

export function removeNode(id: string): Command {
  return { type: CMD.NODE_REMOVE, body: { id } }
}

export function addEdge(edge: {
  id?: string
  source_id: string
  target_id: string
  source_port?: string
  target_port?: string
  transform?: string
}): Command {
  const body: Record<string, unknown> = { id: edge.id || uid(), source_id: edge.source_id, target_id: edge.target_id }
  if (edge.source_port) body.source_port = edge.source_port
  if (edge.target_port) body.target_port = edge.target_port
  if (edge.transform) body.transform = edge.transform
  return { type: CMD.EDGE_ADD, body }
}

export function updateEdge(id: string, patch: Partial<WfEdge>): Command {
  return { type: CMD.EDGE_UPDATE, body: { id, ...patch } }
}

export function removeEdge(id: string): Command {
  return { type: CMD.EDGE_REMOVE, body: { id } }
}

// The note text travels the wire as `body` — the field name the definition store and
// its event stream persist it under. The in-memory doc keeps it as `text`.
export function addNote(note: { id?: string; text: string; kind?: NoteKind; width?: number; height?: number; color?: string }): Command {
  const body: Record<string, unknown> = { id: note.id || uid(), body: note.text }
  if (note.kind) body.kind = note.kind
  if (note.width) body.width = note.width
  if (note.height) body.height = note.height
  if (note.color) body.color = note.color
  return { type: CMD.NOTE_ADD, body }
}

export function updateNote(id: string, patch: { text?: string; kind?: NoteKind; width?: number; height?: number; color?: string }): Command {
  const body: Record<string, unknown> = { id }
  if (patch.text !== undefined) body.body = patch.text
  if (patch.kind !== undefined) body.kind = patch.kind
  if (patch.width !== undefined) body.width = patch.width
  if (patch.height !== undefined) body.height = patch.height
  if (patch.color !== undefined) body.color = patch.color
  return { type: CMD.NOTE_UPDATE, body }
}

export function removeNote(id: string): Command {
  return { type: CMD.NOTE_REMOVE, body: { id } }
}

export function setPosition(nodeId: string, x: number, y: number, width?: number, height?: number): Command {
  const body: Record<string, unknown> = { node_id: nodeId, x: Math.round(x), y: Math.round(y) }
  if (Number.isFinite(width) && width) body.width = Math.round(width as number)
  if (Number.isFinite(height) && height) body.height = Math.round(height as number)
  return { type: CMD.LAYOUT_SET_POSITION, body }
}

export function setDirection(direction: LayoutDirection): Command {
  return { type: CMD.LAYOUT_SET_DIRECTION, body: { direction } }
}
