import { api } from '@wippy-fe/proxy'
import { httpStatus } from '../api/http-error'
import { ASSIST_UNAVAILABLE, humanizeAssistError } from './assist-error'

export interface ConfigAssistRequest {
  workflowId: string
  nodeId: string
  intent: string
  // The visible predecessor contract helps the same generalized assistant write
  // context expressions against fields that actually exist. It remains context only:
  // the server still resolves the node and its authoritative config schema itself.
  upstreamSchema?: unknown
}

export type ConfigAssistResult =
  | { config: Record<string, unknown>; notes?: string; configSchema?: Record<string, unknown> }
  | { error: string; unavailable?: boolean }

export function isConfigAssistOk(result: ConfigAssistResult): result is { config: Record<string, unknown>; notes?: string; configSchema?: Record<string, unknown> } {
  return 'config' in result
}

const DRAFT_FAILED = 'The assistant couldn’t draft these settings.'

export async function assistConfig(request: ConfigAssistRequest): Promise<ConfigAssistResult> {
  let data: unknown
  try {
    data = (await api.post(`/api/v1/workflows/${encodeURIComponent(request.workflowId)}/assist/config`, {
      intent: request.intent,
      node_id: request.nodeId,
      ...(request.upstreamSchema ? { upstream_schema: request.upstreamSchema } : {}),
    }, { timeout: 105_000 })).data
  } catch (error) {
    const body = (error as { response?: { data?: { error?: unknown; code?: unknown; message?: unknown } } } | null)?.response?.data
    if (body && typeof body === 'object' && (typeof body.message === 'string' || typeof body.code === 'string')) {
      return { error: humanizeAssistError(body, DRAFT_FAILED) }
    }
    if (httpStatus(error) === 404) return { error: ASSIST_UNAVAILABLE, unavailable: true }
    if (body) return { error: humanizeAssistError(body, DRAFT_FAILED) }
    return { error: error instanceof Error && error.message ? error.message : DRAFT_FAILED }
  }
  if (!data || typeof data !== 'object') return { error: ASSIST_UNAVAILABLE, unavailable: true }
  const result = data as Record<string, unknown>
  if (result.success === false) return { error: humanizeAssistError(result, DRAFT_FAILED) }
  if (!result.config || typeof result.config !== 'object' || Array.isArray(result.config)) {
    return { error: 'The assistant returned no settings.' }
  }
  return {
    config: result.config as Record<string, unknown>,
    notes: typeof result.notes === 'string' && result.notes.trim() ? result.notes.trim() : undefined,
    ...(result.config_schema && typeof result.config_schema === 'object' && !Array.isArray(result.config_schema)
      ? { configSchema: result.config_schema as Record<string, unknown> }
      : {}),
  }
}
