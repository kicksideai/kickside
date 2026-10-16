// For-each runs the steps in its body once
// per item of an upstream array and continues with the collected results.

import type { WfNode } from '../types'

export { isForEachKind } from '../domain/node-policy'

function cfgOf(config: unknown): Record<string, unknown> {
  return config && typeof config === 'object' && !Array.isArray(config) ? (config as Record<string, unknown>) : {}
}

// The canonical batch default for a For-each node (materialize.lua DEFAULT_FOR_EACH_BATCH_SIZE).
export const FOR_EACH_DEFAULT_BATCH = 8
export interface ForEachConfig {
  sourceKey: string
  batchSize: number
  continueOnError: boolean
}

// The values a stored node renders with: honest parallel/fail-fast defaults.
export function readForEach(_kind: string | undefined, config: unknown): ForEachConfig {
  const c = cfgOf(config)
  const rawBatch = Number(c.batch_size)
  const batchSize = Number.isFinite(rawBatch) && rawBatch > 0 ? rawBatch : FOR_EACH_DEFAULT_BATCH
  const continueOnError = c.continue_on_error === true
  return { sourceKey: String(c.source_array_key || ''), batchSize, continueOnError }
}

// The node patch a For-each edit commits: kind, source key, batch, and error policy.
export function forEachNodePatch(config: unknown, next: ForEachConfig): Partial<WfNode> {
  const merged: Record<string, unknown> = {
    ...cfgOf(config),
    source_array_key: next.sourceKey.trim(),
    batch_size: Math.max(1, Math.round(next.batchSize) || 1),
    continue_on_error: next.continueOnError,
  }
  return { kind: 'for_each', config: merged }
}
