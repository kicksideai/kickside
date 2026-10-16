export interface Item {
  id: string
  item_type: string
  title: string
  content?: string
  priority: string
  status: string
  metadata?: Record<string, unknown>
  created_at?: number
  resolved_at?: number
  action?: string
  form?: Record<string, unknown>
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isItem(value: unknown): value is Item {
  if (!isRecord(value)) return false
  return ['id', 'item_type', 'title', 'priority', 'status'].every(key => typeof value[key] === 'string')
    && ['content', 'action'].every(key => value[key] === undefined || typeof value[key] === 'string')
    && ['created_at', 'resolved_at'].every(key => value[key] === undefined || typeof value[key] === 'number')
    && ['metadata', 'form'].every(key => value[key] === undefined || isRecord(value[key]))
}
