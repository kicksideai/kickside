import type { MetaFieldTypes } from '@widgets/app/componentRealtime'

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
