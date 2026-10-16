// Pure graph geometry and layout for the folded workflow document. VueFlow projection
// and run-overlay styling live in canvas/graph-projection.

import dagre from '@dagrejs/dagre'
import type { LayoutPosition, WfDoc, WfEdge, WfNode } from '../types'
import type { ContainerBox, DerivedContainer } from '../domain/graph-data'
import { kindDef, outPortsFor, type OutPort } from '../domain/node-policy'
import { isForEachKind } from '../domain/node-policy'
import { FAILED_PORT, isFlowKind } from '../domain/node-policy'
import { BASE_NODE_HEIGHT, BASE_NODE_WIDTH, nodeDimensionsForPorts, PORT_NODE_MAX_WIDTH, type NodeDimensions } from './node-geometry'

// Padding around a loop/parallel body, plus the header strip above it.
const CONTAINER_PAD = 26
const CONTAINER_HEAD = 26
// Drag slack for a clamped member: how far outside the current huddle a member may be
// dragged before the container extent holds it back.
const CONTAINER_MARGIN = 120

// The Finished / Failed ports a Flow node exposes, derived from the nested Flow's
// interface (its Finish and Error boundary schemas).
function flowPorts(node: WfNode): OutPort[] {
  const ports: OutPort[] = [{ id: 'result', label: 'Finished' }]
  if (node.child_interface?.error_schema != null || node.error_schema != null) {
    ports.push({ id: 'failed', label: 'Failed' })
  }
  return ports
}

// A Flow is bound only by the same exact reference the compiler accepts. `ref` is
// display identity and never changes executable meaning.
export function isBoundFlow(node: WfNode): boolean {
  if (!isFlowKind(node.kind)) return false
  const cfg = (node.config || {}) as Record<string, unknown>
  const workflowRef = cfg.flow_ref
  if (!workflowRef || typeof workflowRef !== 'object' || Array.isArray(workflowRef)) return false
  const exact = workflowRef as Record<string, unknown>
  return exact.kind === 'flow'
    && typeof exact.id === 'string' && exact.id.length > 0
    && typeof exact.version === 'number' && Number.isInteger(exact.version) && exact.version > 0
}

export function nodeOutPorts(node: WfNode): OutPort[] {
  if (isBoundFlow(node)) return flowPorts(node).filter((port) => port.id !== FAILED_PORT.id)
  return outPortsFor(node.kind, node.ref).filter((port) => port.id !== FAILED_PORT.id)
}

// The out port a step continues through when it is inserted mid-route: a container kind
// continues through its exit, every other step through its first out port. Undefined is the
// single default port.
export function nodeContinuationPort(node: WfNode): string | undefined {
  const declared = isBoundFlow(node) ? undefined : kindDef(node.kind, node.ref).continuation
  return declared || nodeOutPorts(node)[0]?.id || undefined
}

export function nodeDeclaresFailedPort(node: WfNode): boolean {
  if (isBoundFlow(node)) return flowPorts(node).some((port) => port.id === FAILED_PORT.id)
  return outPortsFor(node.kind, node.ref).some((port) => port.id === FAILED_PORT.id)
}

export function nodeDimensionsFor(node: WfNode): NodeDimensions {
  const outPorts = nodeOutPorts(node)
  return nodeDimensionsForPorts(outPorts, nodeDeclaresFailedPort(node))
}

function hasSaved(p: LayoutPosition | undefined): p is LayoutPosition {
  return !!p && Number.isFinite(p.x) && Number.isFinite(p.y)
}

// Fallback placement for nodes the user has not dragged yet: a top-down dagre layout so
// a freshly loaded graph reads as a clean DAG instead of a stacked grid. Computed in
// memory only — never persisted, so a real drag stays authoritative.
export function positionFor(doc: WfDoc, id: string, index: number, auto: Record<string, LayoutPosition>): LayoutPosition {
  const saved = doc.positions[id]
  if (hasSaved(saved)) return saved
  if (auto[id]) return auto[id]
  return { x: 60 + (index % 4) * 280, y: 60 + Math.floor(index / 4) * 170 }
}

// The resolved on-canvas position of every step (saved, else dagre-auto, else grid) —
// the same coordinates buildFlowData renders. Exposed so container hit-testing and
// drag-clamping run against exactly what the user sees.
export function resolvePositions(doc: WfDoc, direction: 'TB' | 'LR' = 'TB'): Record<string, LayoutPosition> {
  const needsAuto = Object.keys(doc.nodes).some((id) => !hasSaved(doc.positions[id]))
  const auto = needsAuto ? autoLayout(doc, direction) : {}
  const pos: Record<string, LayoutPosition> = {}
  Object.values(doc.nodes).forEach((node, i) => { pos[node.id] = positionFor(doc, node.id, i, auto) })
  return pos
}

function edgesBySource(doc: WfDoc): Record<string, WfEdge[]> {
  const out: Record<string, WfEdge[]> = {}
  for (const e of Object.values(doc.edges)) (out[e.source_id] ||= []).push(e)
  return out
}

// The bounding box that encloses a set of members, padded, with room above for the
// header strip. Always encloses every member by construction.
function boxFor(doc: WfDoc, members: string[], pos: Record<string, LayoutPosition>): ContainerBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const id of members) {
    const p = pos[id]
    if (!p) continue
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y)
    const dimensions = nodeDimensionsFor(doc.nodes[id])
    maxX = Math.max(maxX, p.x + dimensions.width); maxY = Math.max(maxY, p.y + dimensions.height)
  }
  if (!Number.isFinite(minX)) { minX = 0; minY = 0; maxX = BASE_NODE_WIDTH; maxY = BASE_NODE_HEIGHT }
  return {
    x: minX - CONTAINER_PAD,
    y: minY - CONTAINER_PAD - CONTAINER_HEAD,
    width: maxX - minX + CONTAINER_PAD * 2,
    height: maxY - minY + CONTAINER_PAD * 2 + CONTAINER_HEAD,
  }
}

// Body membership for every parallel/cycle, with single-parent resolution. Each
// container closes over its body subgraph exactly as the compiler does — a forward
// closure from its `body`-port edges (graph.lua) — but a step already claimed by an
// earlier container is not re-claimed, mirroring the backend's single-parent rule
// (parallel_body_shared) so the canvas never draws two boxes around one step.
// Containers are processed in id order so the winner is deterministic.
export function deriveContainers(
  doc: WfDoc,
  pos: Record<string, LayoutPosition>,
  outEdges?: Record<string, WfEdge[]>,
): { containers: DerivedContainer[]; parentOf: Record<string, string> } {
  const out = outEdges || edgesBySource(doc)
  const parentOf: Record<string, string> = {}
  const containers: DerivedContainer[] = []
  const containerIds = Object.values(doc.nodes)
    .filter((n) => isForEachKind(n.kind) || n.kind === 'cycle')
    .map((n) => n.id)
    .sort()
  for (const cid of containerIds) {
    const members: string[] = []
    const seen = new Set<string>()
    const stack = (out[cid] || []).filter((e) => e.source_port === 'body').map((e) => e.target_id)
    while (stack.length) {
      const id = stack.pop() as string
      if (id === cid || seen.has(id) || !doc.nodes[id]) continue
      seen.add(id)
      if (parentOf[id]) continue
      parentOf[id] = cid
      members.push(id)
      for (const e of out[id] || []) stack.push(e.target_id)
    }
    if (!members.length) continue
    containers.push({ id: cid, kind: doc.nodes[cid].kind, members, box: boxFor(doc, members, pos) })
  }
  return { containers, parentOf }
}

// The region a member is clamped within (its container's extent): the bounding box of
// the container card plus every member, widened by a margin so members keep drag slack
// without escaping. Computed from the OTHER members and the card, so a dragged member
// cannot stretch its own bounds past the clamp.
export function clampRegionFor(
  doc: WfDoc,
  containerId: string,
  members: string[],
  pos: Record<string, LayoutPosition>,
  exclude?: string,
  margin = CONTAINER_MARGIN,
): ContainerBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  const anchor = pos[containerId]
  const add = (id: string, x: number, y: number) => {
    const dimensions = nodeDimensionsFor(doc.nodes[id])
    minX = Math.min(minX, x); minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + dimensions.width); maxY = Math.max(maxY, y + dimensions.height)
  }
  if (anchor) add(containerId, anchor.x, anchor.y)
  for (const id of members) {
    if (id === exclude) continue
    const p = pos[id]
    if (p) add(id, p.x, p.y)
  }
  if (!Number.isFinite(minX)) { minX = 0; minY = 0; maxX = BASE_NODE_WIDTH; maxY = BASE_NODE_HEIGHT }
  const moving = exclude && doc.nodes[exclude] ? nodeDimensionsFor(doc.nodes[exclude]) : null
  return {
    x: minX - margin,
    y: minY - margin,
    width: Math.max(maxX - minX + margin * 2, moving?.width || 0),
    height: Math.max(maxY - minY + margin * 2, moving?.height || 0),
  }
}

// Clamps a node's top-left so the whole card stays inside a region.
export function clampToRegion(x: number, y: number, region: ContainerBox, dimensions: Pick<NodeDimensions, 'width' | 'height'> = { width: BASE_NODE_WIDTH, height: BASE_NODE_HEIGHT }): { x: number; y: number } {
  const maxX = Math.max(region.x, region.x + region.width - dimensions.width)
  const maxY = Math.max(region.y, region.y + region.height - dimensions.height)
  return {
    x: Math.min(Math.max(x, region.x), maxX),
    y: Math.min(Math.max(y, region.y), maxY),
  }
}

// The innermost container whose box contains a canvas point, or null. Drives the
// drop-to-join affordance: releasing a step inside a loop/parallel box wires it into
// that body. Smallest box wins so a nested drop targets the tighter container.
export function containerAt(
  doc: WfDoc,
  point: { x: number; y: number },
  pos: Record<string, LayoutPosition>,
  outEdges?: Record<string, WfEdge[]>,
): string | null {
  const { containers } = deriveContainers(doc, pos, outEdges)
  let hit: DerivedContainer | null = null
  for (const c of containers) {
    const b = c.box
    if (point.x < b.x || point.x > b.x + b.width || point.y < b.y || point.y > b.y + b.height) continue
    if (!hit || b.width * b.height < hit.box.width * hit.box.height) hit = c
  }
  return hit?.id ?? null
}

// Dagre-driven auto layout over the flat DAG. Notes are excluded — they are free
// annotations, not part of the flow rank.
export interface AutoLayoutBounds {
  width: number
  height: number
  minZoom: number
}

// Weakly-connected graph components. Dagre deliberately treats disconnected roots as one
// rank, which turns a useful canvas into a page-wide strip. We lay each real component out
// with dagre, then shelf-pack those component rectangles into the readable viewport.
function graphComponents(doc: WfDoc, ids: string[]): string[][] {
  const neighbours = new Map(ids.map((id) => [id, new Set<string>()]))
  for (const edge of Object.values(doc.edges)) {
    if (!neighbours.has(edge.source_id) || !neighbours.has(edge.target_id)) continue
    neighbours.get(edge.source_id)?.add(edge.target_id)
    neighbours.get(edge.target_id)?.add(edge.source_id)
  }
  const seen = new Set<string>(), components: string[][] = []
  for (const root of ids) {
    if (seen.has(root)) continue
    const component: string[] = [], stack = [root]; seen.add(root)
    while (stack.length) {
      const id = stack.pop() as string; component.push(id)
      for (const next of neighbours.get(id) || []) if (!seen.has(next)) { seen.add(next); stack.push(next) }
    }
    components.push(component)
  }
  return components
}

export function autoLayout(doc: WfDoc, direction: 'TB' | 'LR', bounds?: AutoLayoutBounds): Record<string, LayoutPosition> {
  const ids = Object.keys(doc.nodes)
  if (!ids.length) return {}
  const positions: Record<string, LayoutPosition> = {}
  const packed = graphComponents(doc, ids).map((component) => {
    const include = new Set(component)
    const g = new dagre.graphlib.Graph()
    g.setGraph({ rankdir: direction, nodesep: 48, ranksep: 84, marginx: 0, marginy: 0 })
    g.setDefaultEdgeLabel(() => ({}))
    for (const id of component) g.setNode(id, nodeDimensionsFor(doc.nodes[id]))
    const edges = new Set<string>()
    for (const edge of Object.values(doc.edges)) {
      if (!include.has(edge.source_id) || !include.has(edge.target_id)) continue
      const key = `${edge.source_id}->${edge.target_id}`
      if (edges.has(key)) continue
      edges.add(key); g.setEdge(edge.source_id, edge.target_id)
    }
    dagre.layout(g)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    const local: Record<string, LayoutPosition> = {}
    for (const id of component) {
      const n = g.node(id); if (!n) continue
      const x = n.x - n.width / 2, y = n.y - n.height / 2
      local[id] = { x, y }
      minX = Math.min(minX, x); minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + n.width); maxY = Math.max(maxY, y + n.height)
    }
    for (const p of Object.values(local)) { p.x -= minX; p.y -= minY }
    return { ids: component, local, width: maxX - minX, height: maxY - minY }
  })

  const zoom = Math.max(0.01, bounds?.minZoom || 1)
  const maxWidth = Math.max(PORT_NODE_MAX_WIDTH, (bounds?.width || 1200) / zoom - 80)
  const maxHeight = Math.max(BASE_NODE_HEIGHT, (bounds?.height || 800) / zoom - 80)
  // Tight shelves are essential at phone widths: keeping the readable 0.55 floor is more
  // valuable than decorative whitespace between unrelated roots.
  const gap = maxWidth <= PORT_NODE_MAX_WIDTH + 8
    ? 6
    : Math.max(12, Math.min(48, Math.floor(Math.min(maxWidth, maxHeight) * 0.04)))
  let x = 40, y = 40, laneExtent = 0
  for (const component of packed) {
    if (direction === 'TB') {
      if (x > 40 && x + component.width > 40 + maxWidth) { x = 40; y += laneExtent + gap; laneExtent = 0 }
      for (const id of component.ids) positions[id] = { x: Math.round(x + component.local[id].x), y: Math.round(y + component.local[id].y) }
      x += component.width + gap; laneExtent = Math.max(laneExtent, component.height)
    } else {
      if (y > 40 && y + component.height > 40 + maxHeight) { y = 40; x += laneExtent + gap; laneExtent = 0 }
      for (const id of component.ids) positions[id] = { x: Math.round(x + component.local[id].x), y: Math.round(y + component.local[id].y) }
      y += component.height + gap; laneExtent = Math.max(laneExtent, component.width)
    }
  }
  return positions
}
