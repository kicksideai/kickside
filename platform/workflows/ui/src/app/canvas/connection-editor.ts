import { humanTitle } from '../domain/labels'
import { nodeOutPorts } from '../mapping/graph-sync'
import { FAILED_PORT } from '../domain/node-policy'
import type { WfDoc } from '../types'

export interface ConnectionSourceOption {
  key: string
  nodeId: string
  handle: string
  label: string
}

export interface ConnectionTargetOption {
  nodeId: string
  label: string
}

export interface ConnectionEdgeOption {
  id: string
  label: string
}

export interface ConnectionRequest {
  source: string
  sourceHandle: string
  target: string
  targetHandle: string
}

export function buildConnectionEdgeOptions(
  doc: Pick<WfDoc, 'nodes' | 'edges'>,
): ConnectionEdgeOption[] {
  return Object.values(doc.edges).map((edge) => {
    const source = doc.nodes[edge.source_id]
    const target = doc.nodes[edge.target_id]
    const sourceLabel = source
      ? humanTitle(source.title, source.ref)
      : 'Missing source step'
    const targetLabel = target
      ? humanTitle(target.title, target.ref)
      : 'Missing destination step'
    const port = edge.source_port
      ? edge.source_port === FAILED_PORT.id
        ? FAILED_PORT.label
        : (source
          ? nodeOutPorts(source).find((option) => option.id === edge.source_port)?.label
          : undefined) || edge.source_port
      : 'Output'

    return {
      id: edge.id,
      label: `${sourceLabel} — ${port} to ${targetLabel}`,
    }
  })
}
