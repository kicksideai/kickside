import type { RunNodeHeader, RunTimelineEvent } from '../api/api'
import { looksLikeId } from '../domain/labels'
import { runFailureCause } from './run-history'
import { normalizeNodeStatus } from './run-overlay'

export function runExportFilename(runId: string): string {
  const safe = (runId || 'run').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '') || 'run'
  return `flow-run-${safe}.redacted.json`
}

export interface TimelineEventView {
  key: string
  occurredAt?: string
  title: string
  outcome: string
}

const activityLabels: Record<string, string> = {
  'flow.started': 'Started',
  'flow.finished': 'Completed',
  'flow.failed': 'Failed',
  'node.created': 'Ready',
  'data.dataflow.input': 'Input received',
  'data.dataflow.output': 'Output recorded',
  'data.node.input': 'Input received',
  'data.node.result': 'Output recorded',
  'data.node.error': 'Failure recorded',
  'data.agent.action': 'Agent activity recorded',
}

export function timelineEventViews(events: RunTimelineEvent[], headers: RunNodeHeader[] = []): TimelineEventView[] {
  const nodes = new Map(headers.map(header => [header.engine_node_id, header]))
  function stepTitle(id: string): string {
    const visited = new Set<string>()
    let node = nodes.get(id)
    while (node && !visited.has(node.engine_node_id)) {
      visited.add(node.engine_node_id)
      const title = node.title.trim()
      if (title && !looksLikeId(title)) return title
      node = nodes.get(node.parent_engine_node_id || '')
    }
    return 'Step'
  }
  return events.map((event, index) => {
    const raw = event.raw && typeof event.raw === 'object' && !Array.isArray(event.raw)
      ? event.raw as Record<string, unknown> : {}
    let outcome = activityLabels[event.type] || 'Activity recorded'
    if (event.type === 'node.updated') {
      const status = typeof raw.status === 'string' ? raw.status : ''
      const normalized = normalizeNodeStatus(status)
      outcome = status === 'waiting' ? 'Waiting' : normalized === 'idle' ? 'Updated'
        : normalized.charAt(0).toUpperCase() + normalized.slice(1)
    }
    if (event.type === 'flow.failed') {
      const cause = runFailureCause({ status: 'failed', error: typeof raw.error === 'string' ? raw.error : undefined })
      if (cause) outcome += `: ${cause}`
    }
    return {
      key: `${event.seq || index}:${event.type}:${event.engine_node_id || ''}`,
      occurredAt: event.occurred_at,
      title: event.engine_node_id ? stepTitle(event.engine_node_id) : 'Workflow',
      outcome,
    }
  })
}
