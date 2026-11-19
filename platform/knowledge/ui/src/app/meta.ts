import type { MetaFieldTypes } from '@kickside/ui-kit/componentRealtime'
import type { KnowledgeBase } from './knowledge.types'

// Declared field types for a KB component's public meta count fields (see
// kickside.knowledge.registry.knowledge_bases). The realtime relay carries every
// value as a raw string; subscribeComponentMeta coerces these keys so patches
// read numbers directly.
export const KNOWLEDGE_META_FIELD_TYPES: MetaFieldTypes = {
  document_count: 'integer',
  embedding_count: 'integer',
  claim_count: 'integer',
}

export const KNOWLEDGE_COUNT_KEYS = Object.keys(KNOWLEDGE_META_FIELD_TYPES)


export const STORE_STAT_KEYS = [
  'document_count', 'embedding_count', 'claim_count', 'failed_count',
  'node_count', 'edge_count', 'concept_count', 'chunk_count', 'summary_count',
] as const

export function applyStoreStats<T extends KnowledgeBase>(row: T, snapshot?: KnowledgeBase): T {
  const updated = { ...row, stat_items: snapshot?.stat_items }
  for (const key of STORE_STAT_KEYS) {
    const value = snapshot?.[key]
    if (value === undefined) delete updated[key]
    else updated[key] = value
  }
  return updated
}
