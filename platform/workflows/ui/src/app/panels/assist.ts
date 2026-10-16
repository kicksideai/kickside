// Per-connection AI assist (D6). Every edge carries an assist affordance: on a schema
// mismatch the user is offered "Resolve with AI" to generate the input_transform from
// the upstream output schema to the downstream input schema; otherwise the same call is
// offered plainly as "Map fields with AI" — schemas are rarely persisted, so the UI
// never claims compatibility it can't back up, it just offers the tool. The call posts
// to the workflow's edge-assist endpoint; until that endpoint is wired the request 404s
// and surfaces a truthful "not available yet" rather than a fabricated transform.

import { api } from '@wippy-fe/proxy'
import { httpStatus } from '../api/http-error'
import { humanizeAssistError } from './assist-error'

export interface AssistEdge {
  id: string
  source_id: string
  target_id: string
  transform?: string
}

export type AssistResult =
  | { transform: string }
  | { error: string }

export type EdgeIntentPreview =
  | { kind: 'mapping'; transform: string; summary: string }
  | { kind: 'condition'; predicate: string; summary: string }
  | { kind: 'failure_route'; available: boolean; source_port: 'failed'; summary: string }
  | { kind: 'insert_node'; block_id: string; block_title: string; summary: string }

export type EdgeIntentResult = EdgeIntentPreview | { error: string }
export interface AvailableStep { kind: string; title: string }

const MAP_FAILED = 'The assistant couldn’t generate a mapping.'

// Cover the backend attempts (assist.lua LLM_TIMEOUT_SECONDS x LLM_ATTEMPTS).
export const ASSIST_TIMEOUT_MS = 110_000

function assistError(e: unknown): string {
  if (httpStatus(e) === 404) return 'The mapping assistant isn’t available yet.'
  const data = (e as { response?: { data?: { error?: unknown; message?: unknown } } } | null)?.response?.data
  if (data) return humanizeAssistError(data, e instanceof Error && e.message ? e.message : MAP_FAILED)
  return e instanceof Error && e.message ? e.message : MAP_FAILED
}

// Real run samples passed alongside the schemas. The common case has no declared
// schema — an agent's output is free-form — so the upstream node's real output from the
// most recent run is what the backend maps from. A sample is only sent when present.
export interface AssistSamples {
  upstreamSample?: unknown
  downstreamSample?: unknown
}

// The one call the assist chip makes. POSTs the edge, both endpoint schemas, and any
// real run samples, and returns the generated transform, or a truthful error.
export async function assistEdgeMapping(
  workflowId: string,
  edge: AssistEdge,
  upstreamSchema: unknown,
  downstreamSchema: unknown,
  samples: AssistSamples = {},
  signal?: AbortSignal,
): Promise<AssistResult> {
  try {
    const payload: Record<string, unknown> = {
      edge: {
        source_id: edge.source_id,
        target_id: edge.target_id,
        transform: edge.transform || '',
      },
      upstream_schema: upstreamSchema ?? null,
      downstream_schema: downstreamSchema ?? null,
    }
    if (samples.upstreamSample !== undefined) payload.upstream_sample = samples.upstreamSample
    if (samples.downstreamSample !== undefined) payload.downstream_sample = samples.downstreamSample
    const { data } = await api.post(`/api/v1/workflows/${encodeURIComponent(workflowId)}/assist/edge`, payload, { timeout: ASSIST_TIMEOUT_MS, signal })
    if (data && data.success === false) return { error: humanizeAssistError(data, MAP_FAILED) }
    if (data && typeof data.transform === 'string') return { transform: data.transform }
    return { error: 'The assistant returned no mapping.' }
  } catch (e) {
    return { error: assistError(e) }
  }
}

// Topology-aware connection assist. Classification and validation happen server-side;
// this client only carries the available palette steps and renders the returned
// preview. No result mutates the graph until the user accepts it.
export async function assistEdgeIntent(
  workflowId: string,
  edge: AssistEdge,
  upstreamSchema: unknown,
  downstreamSchema: unknown,
  intent: string,
  sourceFailureAvailable: boolean,
  availableSteps: AvailableStep[],
  samples: AssistSamples = {},
  signal?: AbortSignal,
): Promise<EdgeIntentResult> {
  try {
    const payload: Record<string, unknown> = {
      mode: 'intent',
      edge: {
        source_id: edge.source_id,
        target_id: edge.target_id,
        transform: edge.transform || '',
      },
      intent,
      upstream_schema: upstreamSchema ?? null,
      downstream_schema: downstreamSchema ?? null,
      source_failure_available: sourceFailureAvailable,
      available_steps: availableSteps,
    }
    if (samples.upstreamSample !== undefined) payload.upstream_sample = samples.upstreamSample
    if (samples.downstreamSample !== undefined) payload.downstream_sample = samples.downstreamSample
    const { data } = await api.post(`/api/v1/workflows/${encodeURIComponent(workflowId)}/assist/edge`, payload, { timeout: ASSIST_TIMEOUT_MS, signal })
    if (data && data.success === false) return { error: humanizeAssistError(data, MAP_FAILED) }
    if (data?.kind === 'mapping' && typeof data.transform === 'string') {
      return { kind: 'mapping', transform: data.transform, summary: typeof data.summary === 'string' ? data.summary : '' }
    }
    if (data?.kind === 'condition' && typeof data.predicate === 'string') {
      return { kind: 'condition', predicate: data.predicate, summary: typeof data.summary === 'string' ? data.summary : '' }
    }
    if (data?.kind === 'failure_route' && typeof data.available === 'boolean' && data.source_port === 'failed') {
      return { kind: 'failure_route', available: data.available, source_port: 'failed', summary: typeof data.summary === 'string' ? data.summary : '' }
    }
    if (data?.kind === 'insert_node' && typeof data.block_id === 'string' && typeof data.block_title === 'string') {
      return { kind: 'insert_node', block_id: data.block_id, block_title: data.block_title, summary: typeof data.summary === 'string' ? data.summary : '' }
    }
    return { error: 'The assistant returned no usable connection preview.' }
  } catch (e) {
    return { error: assistError(e) }
  }
}

// Whether an assist result carries a usable transform.
export function isAssistTransform(r: AssistResult): r is { transform: string } {
  return 'transform' in r && typeof r.transform === 'string'
}

export function isEdgeIntentPreview(r: EdgeIntentResult): r is EdgeIntentPreview {
  return 'kind' in r
}
