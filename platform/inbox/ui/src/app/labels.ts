import type { MetaFieldTypes } from '@widgets/app/componentRealtime'

// Declared field types for the inbox component's public meta (see
// kickside.inbox.persist:projection sync_public_meta). The realtime relay carries
// every value as a raw string; subscribeComponentMeta coerces these keys so the
// handler reads numbers directly.
export const INBOX_META_FIELD_TYPES: MetaFieldTypes = {
  item_count: 'integer',
  pending_count: 'integer',
  resolved_count: 'integer',
  urgent_count: 'integer',
  high_count: 'integer',
}

// Human labels for the inbox item status enum (kickside.inbox.types STATUS:
// pending / resolved / approved / rejected / dismissed). The server declares the enum
// values; the UI owns their display strings so no raw enum reaches the user.
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  resolved: 'Resolved',
  approved: 'Approved',
  rejected: 'Rejected',
  dismissed: 'Dismissed',
}

export function statusLabel(status?: string): string {
  const key = status || ''
  return STATUS_LABEL[key] || key
}

// Fallback display for an item_type with no declared title: de-snake-case the raw
// token to Title Case (precall_brief_review -> "Precall Brief Review") so no machine
// token reaches the reader. A declared item-type title is preferred over this.
export function humanizeItemType(itemType?: string): string {
  const raw = (itemType || '').trim()
  if (!raw) return ''
  return raw.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
