import type { EdgeIntentPreview } from '../panels/assist'
import type { WfDoc } from '../types'
import { outPortsFor } from '../domain/node-policy'
import * as C from '../api/commands'
import type { PendingEdge } from './canvas-connect'

export interface AcceptedIntentPlan {
  commands: C.Command[]
  select: { kind: 'node' | 'edge'; id: string } | null
  refit: boolean
}

export function sourceOffersFailureRoute(doc: WfDoc, sourceId: string): boolean {
  const source = doc.nodes[sourceId]
  if (!source) return false
  const ports = outPortsFor(source.kind, source.ref)
  return ports.some((port) => port.id === 'failed')
}

// Lower one accepted preview onto the existing graph command vocabulary. The assistant
// never returns commands: this pure plan is the review boundary, so a preview cannot mutate
// the document and no topology is hidden from history/undo/export.
export function acceptedEdgeIntentPlan(
  doc: WfDoc,
  pending: PendingEdge,
  preview: EdgeIntentPreview,
  mint: () => string = C.uid,
): AcceptedIntentPlan | null {
  const edge = doc.edges[pending.id]
  if (!edge) return null

  if (preview.kind === 'mapping') {
    return {
      commands: [C.updateEdge(edge.id, { transform: preview.transform })],
      select: { kind: 'edge', id: edge.id },
      refit: false,
    }
  }

  if (preview.kind === 'failure_route') {
    const source = doc.nodes[edge.source_id]
    if (!preview.available || !source || !sourceOffersFailureRoute(doc, source.id)) return null
    return {
      commands: [
        // A success-path transform is not valid for the stable {code,message} failure
        // envelope. Clear it and let the normal mapper loudness guide any recovery input.
        C.updateEdge(edge.id, { source_port: 'failed', transform: '' }),
      ],
      select: { kind: 'edge', id: edge.id },
      refit: false,
    }
  }

  if (preview.kind === 'condition') {
    const conditionId = mint()
    const incomingId = mint()
    const trueId = mint()
    const commands: C.Command[] = [
      C.removeEdge(edge.id),
      C.addNode({
        id: conditionId,
        kind: 'branch',
        title: 'Condition',
        config: { predicate: preview.predicate },
      }),
      C.addEdge({
        id: incomingId,
        source_id: edge.source_id,
        target_id: conditionId,
        source_port: edge.source_port,
      }),
      C.addEdge({
        id: trueId,
        source_id: conditionId,
        target_id: edge.target_id,
        source_port: 'true',
        target_port: edge.target_port,
        transform: edge.transform,
      }),
    ]
    const sourcePosition = doc.positions[edge.source_id]
    const targetPosition = doc.positions[edge.target_id]
    if (sourcePosition && targetPosition) {
      commands.push(C.setPosition(
        conditionId,
        (sourcePosition.x + targetPosition.x) / 2,
        (sourcePosition.y + targetPosition.y) / 2,
      ))
    }
    return {
      commands,
      select: { kind: 'node', id: conditionId },
      refit: true,
    }
  }

  // insert_node is deliberately a directed palette suggestion in this first slice. It
  // cannot mutate until a concrete declared catalog item (including its config contract)
  // has been chosen by the author.
  return { commands: [], select: null, refit: false }
}
