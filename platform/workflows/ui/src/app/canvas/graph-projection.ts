import { MarkerType } from '@vue-flow/core'
import type { Edge as FlowEdge, Node as FlowNode } from '@vue-flow/core'
import type { WfDoc, WfEdge, WfNode } from '../types'
import type { GraphRunState, WfContainerData, WfNodeData, WfNoteData } from '../domain/graph-data'
import { FAILED_PORT, isBoundaryKind, isFailedSourcePort, kindDef, type OutPort } from '../domain/node-policy'
import { humanTitle } from '../domain/labels'
import { schemaSummary } from '../domain/schema-policy'
import { edgeCompat } from '../domain/connection-policy'
import { edgeMappingCompleteness } from '../mapping/mapping-completeness'
import {
  edgeSourceSchema,
  effectiveNodeInputSchema,
  needsDeclaredInputContract,
} from '../domain/schema-policy'
import {
  deriveContainers,
  isBoundFlow,
  nodeDeclaresFailedPort,
  nodeOutPorts,
  positionFor,
  resolvePositions,
} from '../mapping/graph-sync'

const NOTE_W = 200
const NOTE_H = 120
const FRAME_W = 420
const FRAME_H = 280

function flowSummary(node: WfNode): string | undefined {
  const child = node.child_interface
  const input = child?.input_schema ?? node.input_schema
  const output = child?.output_schema ?? node.output_schema
  if (input == null && output == null) return undefined
  return `${schemaSummary(input)} → ${schemaSummary(output)}`
}

export function buildFlowData(
  doc: WfDoc,
  run?: GraphRunState,
  direction: 'TB' | 'LR' = 'TB',
  issues?: Map<string, string>,
  viewingRun = false,
): { flowNodes: FlowNode[]; flowEdges: FlowEdge[] } {
  const flowNodes: FlowNode[] = []
  const nodeList = Object.values(doc.nodes)
  const pos = resolvePositions(doc, direction)
  const outEdges: Record<string, WfEdge[]> = {}
  for (const edge of Object.values(doc.edges)) (outEdges[edge.source_id] ||= []).push(edge)

  const noteList = Object.values(doc.notes)
  noteList.forEach((note, index) => {
    if (note.kind !== 'frame') return
    const saved = positionFor(doc, note.id, index, {})
    const width = saved.width || note.width || FRAME_W
    const height = saved.height || note.height || FRAME_H
    flowNodes.push({
      id: note.id,
      type: 'wfFrame',
      ariaLabel: `Frame: ${note.text || 'Untitled frame'}`,
      focusable: true,
      position: { x: saved.x, y: saved.y },
      data: { text: note.text, kind: 'frame', width, height, color: note.color } as WfNoteData,
      zIndex: 0,
      style: { width: `${width}px`, height: `${height}px` },
    })
  })

  const { containers } = deriveContainers(doc, pos, outEdges)
  for (const container of containers) {
    const node = doc.nodes[container.id]
    flowNodes.push({
      id: `__box_${container.id}`,
      type: 'wfContainer',
      position: { x: container.box.x, y: container.box.y },
      class: 'wf-container-node',
      data: {
        kind: container.kind,
        label: humanTitle(node.title, node.ref),
        icon: kindDef(container.kind).icon,
      } as WfContainerData,
      zIndex: 0,
      selectable: false,
      draggable: false,
      focusable: false,
      style: {
        width: `${container.box.width}px`,
        height: `${container.box.height}px`,
        pointerEvents: 'none',
      },
    })
  }

  noteList.forEach((note, index) => {
    if (note.kind === 'frame') return
    const saved = positionFor(doc, note.id, index, {})
    const width = saved.width || note.width || NOTE_W
    const height = saved.height || note.height || NOTE_H
    flowNodes.push({
      id: note.id,
      type: 'wfNote',
      ariaLabel: `Note: ${note.text || 'Empty note'}`,
      focusable: true,
      position: { x: saved.x, y: saved.y },
      data: { text: note.text, kind: 'note', width, height, color: note.color } as WfNoteData,
      zIndex: 0,
      style: { width: `${width}px`, height: `${height}px` },
    })
  })

  const handles: Record<string, RenderedHandles> = {}
  nodeList.forEach((node) => {
    const def = kindDef(node.kind, node.ref)
    const point = pos[node.id]
    const boundaryRole = isBoundaryKind(node.kind)
      ? node.kind as 'start' | 'finish' | 'error'
      : undefined
    const pinned = !!boundaryRole || node.pinned === true || !!node.boundary
    const boundFlow = isBoundFlow(node)
    const outPorts = nodeOutPorts(node)
    const failedPort = nodeDeclaresFailedPort(node)
    const failedWired = failedPort
      && (outEdges[node.id] || []).some((edge) => isFailedSourcePort(edge.source_port))
    const title = humanTitle(node.title, node.ref)
    const runStatus = run?.node[node.id] || 'idle'
    handles[node.id] = renderedHandles(outPorts, boundaryRole, failedPort)
    flowNodes.push({
      id: node.id,
      type: 'wfNode',
      ariaLabel: `${def.label} step: ${title}${runStatus === 'idle' ? '' : `, status ${runStatus}`}`,
      focusable: true,
      position: { x: point.x, y: point.y },
      zIndex: 1,
      data: {
        kind: node.kind,
        kindLabel: def.label,
        title,
        ref: node.ref_label || node.ref || '',
        icon: node.icon || def.icon,
        hueVar: def.hueVar,
        runStatus,
        outPorts,
        failedPort,
        failedWired,
        pinned,
        boundaryRole,
        awaitingLabel: 'Waiting',
        awaitingIcon: 'tabler:hourglass',
        sub: boundFlow ? flowSummary(node) : undefined,
        issue: issues?.get(node.id),
      } as WfNodeData,
    })
  })

  const present = new Set(nodeList.map((node) => node.id))
  const flowEdges: FlowEdge[] = []
  for (const edge of Object.values(doc.edges)) {
    if (!present.has(edge.source_id) || !present.has(edge.target_id)) continue
    const source = doc.nodes[edge.source_id]
    const target = doc.nodes[edge.target_id]
    const sourceSchema = edgeSourceSchema(doc, edge)
    const targetSchema = effectiveNodeInputSchema(target, sourceSchema)
    const contractUnavailable = needsDeclaredInputContract(target, targetSchema)
    const needsMapping = !edge.transform
      && edgeCompat(sourceSchema, targetSchema) === 'needs-mapping'
    const completeness = edgeMappingCompleteness(edge, targetSchema, sourceSchema)
    const sourceTitle = humanTitle(source.title, source.ref)
    const targetTitle = humanTitle(target.title, target.ref)
    const portLabel = isFailedSourcePort(edge.source_port)
      ? 'Failed'
      : nodeOutPorts(source).find((port) => port.id === (edge.source_port || ''))?.label
    const ariaLabel = `Connection from ${sourceTitle}${portLabel ? `, ${portLabel} output` : ''} to ${targetTitle}`
    // A read-only run view shows run truth (traversal, statuses) — editing diagnostics
    // (the dashed warning styling and the completeness badge) are edit-mode concerns and
    // never render while viewing a past run, even on a workflow with real mapping gaps.
    flowEdges.push(buildFlowEdge(
      edge,
      run,
      !viewingRun && needsMapping,
      viewingRun ? [] : completeness.unmappedRequired,
      direction,
      {
        sources: handles[edge.source_id]?.sources,
        targets: handles[edge.target_id]?.targets,
      },
      !viewingRun && contractUnavailable,
      ariaLabel,
    ))
  }
  return { flowNodes, flowEdges }
}

export interface RenderedHandles {
  sources: string[]
  targets: string[]
}

export function renderedHandles(
  outPorts: OutPort[],
  boundaryRole: 'start' | 'finish' | 'error' | undefined,
  hasFailedPort = false,
): RenderedHandles {
  const targets = boundaryRole === 'start' ? [] : ['in-top', 'in-left']
  const named = outPorts.length > 1 || (outPorts[0]?.id ?? '') !== ''
  const showSources = boundaryRole !== 'finish' && boundaryRole !== 'error'
  const sources = !showSources
    ? []
    : named
      ? outPorts.map((port) => port.id)
      : ['out-bottom', 'out-right']
  if (showSources && hasFailedPort) sources.push(FAILED_PORT.id)
  return { sources, targets }
}

function resolveHandle(
  stored: string | undefined,
  rendered: string[] | undefined,
  fallback: string,
): string {
  const desired = stored || fallback
  if (!rendered) return desired
  if (rendered.includes(desired)) return desired
  return rendered.includes(fallback) ? fallback : (rendered[0] ?? fallback)
}

export function buildFlowEdge(
  edge: WfEdge,
  run?: GraphRunState,
  needsMapping = false,
  unmappedRequired: string[] = [],
  direction: 'TB' | 'LR' = 'TB',
  handles?: { sources?: string[]; targets?: string[] },
  contractUnavailable = false,
  ariaLabel?: string,
): FlowEdge {
  const active = run?.edge[edge.id] === 'active'
  const done = run?.edge[edge.id] === 'done'
  const classes = ['wf-edge']
  if (active) classes.push('wf-edge--active')
  else if (done) classes.push('wf-edge--done')
  else if (needsMapping) classes.push('wf-edge--needs-map')
  if (unmappedRequired.length) classes.push('wf-edge--unmapped-required')
  if (contractUnavailable) classes.push('wf-edge--contract-unavailable')
  const built: FlowEdge = {
    id: edge.id,
    source: edge.source_id,
    target: edge.target_id,
    type: 'mapping-completeness',
    ariaLabel,
    focusable: true,
    animated: active,
    data: {
      active,
      done,
      needsMapping,
      unmappedRequired,
      contractUnavailable,
      transform: edge.transform || '',
    },
    class: classes.join(' '),
    style: { strokeWidth: active ? 2 : 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 12 },
    labelBgPadding: [5, 3],
    labelBgBorderRadius: 4,
  } as unknown as FlowEdge
  built.sourceHandle = resolveHandle(
    edge.source_port,
    handles?.sources,
    direction === 'LR' ? 'out-right' : 'out-bottom',
  )
  built.targetHandle = resolveHandle(
    edge.target_port,
    handles?.targets,
    direction === 'LR' ? 'in-left' : 'in-top',
  )
  return built
}
