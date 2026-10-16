// Schema-typed connect validation. When a user drags a connection, the upstream
// output schema is checked against the downstream input schema — deterministically,
// from the registry-declared schemas the catalog carries. This is the open
// differentiator: n8n/Dify only fail at runtime. When either side declares no schema
// the connection is allowed (neutral) — we never block on absence of information.

import { decodeSchema, typeCompatible } from './schema-policy'

export type ConnectStatus = 'ok' | 'error' | 'neutral'

export interface ConnectVerdict {
  status: ConnectStatus
  message?: string
}

interface JsonSchema {
  type?: string
  properties?: Record<string, unknown>
  required?: string[]
}

// A schema is only informative if it declares a type or properties.
function hasShape(s: JsonSchema | null): s is JsonSchema {
  return !!s && (typeof s.type === 'string' || (!!s.properties && typeof s.properties === 'object'))
}

// The upstream side is what the source node emits (output/item schema); the
// downstream side is what the target node accepts (input schema). Scalar-type
// compatibility is the shared mapping rule (typeCompatible), so the connect badge and
// the field mapper's per-pair verdict never diverge.
export function validateConnection(sourceOutput: unknown, targetInput: unknown): ConnectVerdict {
  const src = decodeSchema(sourceOutput) as JsonSchema | null
  const tgt = decodeSchema(targetInput) as JsonSchema | null
  if (!hasShape(src) || !hasShape(tgt)) return { status: 'neutral' }

  const st = src.type
  const tt = tgt.type
  if (st && tt && !typeCompatible(st, tt)) {
    return { status: 'error', message: `Type mismatch: upstream emits ${st}, this step expects ${tt}.` }
  }

  // An any-typed producer or consumer carries no field structure to check against.
  if (st === 'any' || tt === 'any') return { status: 'ok' }

  const targetIsObject = tt === 'object' || (!!tgt.properties && !tt)
  if (targetIsObject) {
    const srcProps = src.properties || {}
    for (const req of tgt.required || []) {
      if (!(req in srcProps)) {
        return { status: 'error', message: `Missing field “${req}”: upstream output has no “${req}”.` }
      }
    }
  }

  return { status: 'ok' }
}

// The per-edge compatibility badge, derived from the schema verdict. A schema mismatch
// is never a refusal — it is a mapping the per-edge assist resolves — so it reads as
// 'needs-mapping'; a compatible or uninformative pair reads as 'ok'.
export type EdgeCompat = 'ok' | 'needs-mapping'

export function edgeCompat(sourceOutput: unknown, targetInput: unknown): EdgeCompat {
  return validateConnection(sourceOutput, targetInput).status === 'error' ? 'needs-mapping' : 'ok'
}

// The endpoints of a proposed connection, as VueFlow reports them. On a stored edge
// (VueFlow re-runs this validator over every edge during setEdges on load) the id is
// present; a freshly drawn connection carries none.
export interface ConnectionLike {
  id?: string
  source: string | null
  target: string | null
  sourceHandle?: string | null
  targetHandle?: string | null
}

// The endpoints of an edge already on the canvas.
export interface EdgeLike {
  id?: string
  source_id: string
  target_id: string
  source_port?: string
  target_port?: string
}

// VueFlow handle ids describe where a line is drawn, not which semantic route an
// edge takes. Plain steps render two equivalent source handles and two equivalent
// target handles so either layout direction is usable. Those ids must never cross
// the Workflow document boundary as ports: only declared handles such as `true`,
// `failed`, `body`, or a module-owned output id are semantic.
const PRESENTATION_HANDLES = new Set(['out-bottom', 'out-right', 'in-top', 'in-left'])

export function isPresentationHandle(handle: string | null | undefined): boolean {
  return !!handle && PRESENTATION_HANDLES.has(handle)
}

export function semanticPort(handle: string | null | undefined): string | undefined {
  const value = handle || undefined
  return value && !PRESENTATION_HANDLES.has(value) ? value : undefined
}

// Structural legality of a drop, independent of schemas: both sides must be present, a
// step cannot connect to itself, and the same source/target port pair cannot be drawn
// twice. A schema mismatch is structurally legal — it is flagged, never refused.
//
// VueFlow applies this validator to every stored edge during setEdges, not only to a
// user-drawn connection. A stored edge whose ports equal its rendered handle ids would
// otherwise match itself in the edge set and read as a duplicate — rejecting it and
// collapsing the edges layer — so an edge identical to the one being validated (same id)
// is excluded from the duplicate scan. A freshly drawn connection carries no id, so a
// real duplicate is still refused.
export function isStructurallyValid(conn: ConnectionLike, edges: EdgeLike[]): boolean {
  if (!conn.source || !conn.target) return false
  if (conn.source === conn.target) return false
  const sp = semanticPort(conn.sourceHandle)
  const tp = semanticPort(conn.targetHandle)
  return !edges.some((e) =>
    !(conn.id != null && e.id === conn.id) &&
    e.source_id === conn.source &&
    e.target_id === conn.target &&
    semanticPort(e.source_port) === sp &&
    semanticPort(e.target_port) === tp)
}
