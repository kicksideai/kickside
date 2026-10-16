// Pure presentation mapping for the Keeper-aligned run inspector. API decoding stays in
// api/runs; this file turns that contract into small, testable UI records.

import type { RunExecution, RunTimelineEvent } from '../api/api'

export function keeperDataflowHref(dataflowId: string | null | undefined): string | null {
  return dataflowId ? `/api/v1/dataflows/${encodeURIComponent(dataflowId)}` : null
}

export function runExportFilename(runId: string): string {
  const safe = (runId || 'run').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '') || 'run'
  return `flow-run-${safe}.redacted.json`
}

export interface TimelineEventView {
  key: string
  occurredAt?: string
  source: string
  type: string
  engineNodeId?: string
  raw?: unknown
}

export function timelineEventViews(events: RunTimelineEvent[]): TimelineEventView[] {
  return events.map((event, index) => ({
    key: `${event.seq || index}:${event.type}:${event.engine_node_id || ''}`,
    occurredAt: event.occurred_at,
    source: event.source || 'engine',
    type: event.type || 'event',
    engineNodeId: event.engine_node_id,
    ...(event.raw !== undefined ? { raw: event.raw } : {}),
  }))
}

export function processIdentity(execution: RunExecution | null | undefined): string {
  const process = execution?.process
  if (!process) return ''
  return [process.id, process.host, process.pid ? `pid ${process.pid}` : ''].filter(Boolean).join(' · ')
}
