import type { WfDoc, WfEdge, WfNode } from '../types'
import { blockPortSchema, FAILED_PAYLOAD_SCHEMA, isFailedSourcePort } from './node-policy'

export interface NodeContractProjection {
  [key: string]: unknown
  kind: WfNode['kind']
  ref?: string
  icon?: string
  input_schema?: unknown
  output_schema?: unknown
  config_schema?: unknown
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

export function decodeSchema(raw: unknown): Record<string, unknown> | null {
  if (typeof raw === 'string') {
    const text = raw.trim()
    if (!text) return null
    try { return asObject(JSON.parse(text)) } catch { return null }
  }
  return asObject(raw)
}

export function typeCompatible(a: string, b: string): boolean {
  if (a === b) return true
  const numeric = new Set(['number', 'integer'])
  if (numeric.has(a) && numeric.has(b)) return true
  return a === 'any' || b === 'any'
}

function schemaKind(schema: Record<string, unknown>): string {
  const type = schema.type
  if (typeof type === 'string' && type) return type
  if (Array.isArray(type) && typeof type[0] === 'string') return type[0]
  if (schema.properties && typeof schema.properties === 'object') return 'object'
  return 'schema'
}

export function schemaSummary(schema: unknown): string {
  const decoded = decodeSchema(schema)
  if (!decoded) return 'No schema'
  const kind = schemaKind(decoded)
  const properties = asObject(decoded.properties) || {}
  const keys = Object.keys(properties)
  if (!keys.length) return kind
  const shown = keys.slice(0, 3).join(', ')
  return `${kind}: ${shown}${keys.length > 3 ? ` +${keys.length - 3}` : ''}`
}

// Boundary schemas are authored inside node.config, while ordinary step schemas are
// catalog projections on the node itself. Read both through one seam so a just-edited
// Start/Finish/Error contract is immediately visible to connection planning, the
// inspector and persistent edge validation without waiting for a server refetch.
export function effectiveNodeOutputSchema(node: WfNode | undefined): unknown {
  if (!node) return undefined
  if (node.kind === 'start') return node.config?.input_schema ?? node.output_schema
  return node.output_schema
}

export function effectiveNodeInputSchema(node: WfNode | undefined, _upstreamSchema?: unknown): unknown {
  if (!node) return undefined
  if (node.kind === 'finish') return node.config?.output_schema ?? node.input_schema
  if (node.kind === 'error') return node.config?.error_schema ?? node.input_schema
  return node.input_schema
}

export function needsDeclaredInputContract(node: WfNode | undefined, schema: unknown): boolean {
  if (!node || schema != null) return false
  return node.kind === 'block' || node.kind === 'flow'
}

// The schema an edge carries out of its source. A declared block port wins; the
// Failed port carries the failure envelope; a Branch routes its tested value
// through unchanged — the compiler dissolves the node and reroutes
// predecessor → successor, so edge validation reads the branch's own upstream
// instead of pretending the branch produces nothing.
export function edgeSourceSchema(
  doc: WfDoc,
  edge: Pick<WfEdge, 'source_id' | 'source_port'>,
  seen: Set<string> = new Set(),
): unknown {
  const source = doc.nodes[edge.source_id]
  const declared = blockPortSchema(source?.ref, edge.source_port)
  if (declared != null) return declared
  if (isFailedSourcePort(edge.source_port)) return FAILED_PAYLOAD_SCHEMA
  if (source?.kind === 'branch') {
    if (seen.has(source.id)) return undefined
    seen.add(source.id)
    const incoming = Object.values(doc.edges).find((e) => e.target_id === source.id)
    return incoming ? edgeSourceSchema(doc, incoming, seen) : undefined
  }
  return effectiveNodeOutputSchema(source)
}

// A new Finish starts with an empty object contract. Connecting a step whose output is
// already declared should make that pass-through result the workflow contract, rather
// than opening an empty mapping inspector and asking the author to repeat the schema.
export function finishSchemaAdoption(source: unknown, target: WfNode | undefined): Record<string, unknown> | null {
  if (!target || target.kind !== 'finish') return null
  const current = decodeSchema(effectiveNodeInputSchema(target))
  const currentProperties = current?.properties && typeof current.properties === 'object' && !Array.isArray(current.properties)
    ? current.properties as Record<string, unknown>
    : {}
  if (!current || current.type !== 'object' || Object.keys(currentProperties).length > 0) return null
  const candidate = decodeSchema(source)
  if (!candidate) return null
  const candidateProperties = candidate.properties && typeof candidate.properties === 'object' && !Array.isArray(candidate.properties)
    ? candidate.properties as Record<string, unknown>
    : {}
  const hasShape = candidate.type !== 'object' || Object.keys(candidateProperties).length > 0
  return hasShape ? candidate : null
}

// Refresh read-side Block/Flow projections in memory from the current catalog. This never
// emits a command and never changes authored instance config.
export function hydrateNodeContracts(nodes: Record<string, WfNode>, catalog: NodeContractProjection[]): number {
  const byRef = new Map(catalog.filter((item) => !!item.ref).map((item) => [`${item.kind}:${item.ref}`, item]))
  const byKind = new Map(catalog.filter((item) => !item.ref).map((item) => [String(item.kind), item]))
  let hydrated = 0
  for (const node of Object.values(nodes)) {
    const item = (node.ref ? byRef.get(`${node.kind}:${node.ref}`) : undefined) || byKind.get(String(node.kind))
    if (!item) continue
    let changed = false
    for (const key of ['input_schema', 'output_schema', 'config_schema'] as const) {
      if (item[key] !== undefined && node[key] !== item[key]) {
        node[key] = item[key]
        changed = true
      }
    }
    if (item.icon && node.icon !== item.icon) { node.icon = item.icon; changed = true }
    if (changed) hydrated++
  }
  return hydrated
}
