import type { IoSchema } from '@widgets/app/ports'

// The create-shaped install input of a Data Sync. Install POSTs it, reconfigure PUTs the
// same shape back, and the engine stores it verbatim as the automation's portable
// declaration — so the editor rehydrates from exactly what it submits.

export interface ViewComponentRef {
  tag_name?: string
  base_path?: string
  entry_point?: string
  title?: string
}

// A sink is a store port descriptor: the port id (sent as sink_port, whose
// binding is the writable backing) and the picker-field `config_schema`. The sync
// opens the binding's writable server-side at write time.
export interface SinkRow {
  id: string
  surface?: string
  // The consuming class, so a wc-component-picker primary field scopes its listing.
  class?: string
  title?: string
  name?: string
  icon?: string
  description?: string
  group?: string
  provider?: string
  config_schema?: IoSchema
  operations?: Record<string, unknown>
  // A sink may declare a richer write-input schema than the default { content }; the
  // assist uses it verbatim as the target when present.
  input_schema?: unknown
  // The sink's declared input shape: a record, or content a string becomes.
  input_shape?: 'record' | 'content'
  component?: { create_ui?: ViewComponentRef }
}

// The kickside.transform strategies a sync declares. The transform assist confirms one
// of these configs whole; SyncCreate stores and submits it unchanged.
export type SyncTransform =
  | { kind: 'none' }
  | { kind: 'expr'; expr: string }
  // Runtime LLM transforms must carry the complete owner-selected policy; the
  // backend rejects an absent or partial record instead of selecting a default.
  | { kind: 'llm'; prompt: string; model?: string; temperature?: number; max_tokens?: number; generation_policy?: Record<string, unknown> }
  | { kind: 'code'; code: string; tool_ids?: string[] }

function isSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value)
}

export interface SyncInput {
  title: string
  trigger: Record<string, unknown>
  sink_port: string
  sink_config: Record<string, unknown>
  transform: SyncTransform
  output_schema?: unknown
  reconcile?: true
  // Whether the sync runs; the sync schema requires the explicit choice.
  enabled: boolean
}

export interface SyncInputParts {
  title: string
  trigger: Record<string, unknown>
  sinkPort: string
  sinkConfig: Record<string, unknown>
  transform: SyncTransform | null
  outputSchema?: unknown
  reconcile?: true
  enabled: boolean
}

// read_config returns the automation's normalized state with its stored install
// declaration under this engine-owned key (exportable types only).
const PORTABLE_INPUT_KEY = '_portable_input'

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function asTransform(value: unknown): SyncTransform | null {
  const t = asObject(value)
  return t && typeof t.kind === 'string' ? t as SyncTransform : null
}

function asReconcile(value: unknown): true | undefined {
  return value === true ? true : undefined
}

export function buildSyncInput(parts: SyncInputParts): SyncInput {
  if (!parts.transform) throw new Error('transform selection is required')
  const input: SyncInput = {
    title: parts.title.trim(),
    trigger: parts.trigger,
    sink_port: parts.sinkPort,
    sink_config: parts.sinkConfig,
    transform: parts.transform,
    enabled: parts.enabled,
  }
  if (parts.reconcile) input.reconcile = parts.reconcile
  // The source's item shape gates the "Data Sync Finished" port's output face; it is
  // absent only while the trigger editor has not reported a source yet.
  if (parts.outputSchema !== undefined) input.output_schema = parts.outputSchema
  return input
}

// The stored declaration of an installed sync, as returned by
// GET /api/v1/automations/{id}/config, with the sync's live enabled state (pause and
// resume change it outside the declaration, so an edit must not flip it). Null when
// the automation carries no declaration, so the editor reports it instead of
// falling back to an install.
export function storedSyncInput(config: unknown): SyncInput | null {
  const live = asObject(config)
  const stored = asObject(live?.[PORTABLE_INPUT_KEY])
  const trigger = asObject(stored?.trigger)
  const sinkPort = typeof stored?.sink_port === 'string' ? stored.sink_port : ''
  const transform = asTransform(stored?.transform)
  const enabled = live?.enabled
  if (!stored || !trigger || !sinkPort || !transform || typeof enabled !== 'boolean') return null
  return buildSyncInput({
    title: typeof stored.title === 'string' ? stored.title : '',
    trigger,
    sinkPort,
    sinkConfig: asObject(stored.sink_config) ?? {},
    transform,
    outputSchema: stored.output_schema,
    reconcile: asReconcile(stored.reconcile),
    enabled,
  })
}
