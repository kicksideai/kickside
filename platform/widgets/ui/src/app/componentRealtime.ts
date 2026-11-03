import { on } from '@wippy-fe/proxy'

export interface ComponentMetaEvent {
  event: 'component.meta.changed'
  component_id: string
  meta: Record<string, unknown>
  deleted: string[]
}

// Declared type per public-meta field key, e.g. { accepted_count: 'integer' }.
export type MetaFieldTypes = Record<string, string>

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

// kickside_component_meta stores every value as TEXT, and the generic
// component.meta.changed relay carries those raw strings. The fetch path coerces
// server-side (coerce_public_field_read_value); this mirrors that coercion for the
// realtime path so both consumers read the same declared field types. Values are
// coerced only for keys present in fieldTypes; unknown keys pass through untouched.
function coerceMetaValue(fieldType: string | undefined, value: unknown): unknown {
  if (value === null || value === undefined) return value
  switch (fieldType) {
    case 'boolean':
    case 'checkbox':
      if (typeof value === 'boolean') return value
      if (value === 'true') return true
      if (value === 'false') return false
      return value
    case 'number':
    case 'integer': {
      if (typeof value === 'number') return value
      if (typeof value === 'string' && value.trim() !== '') {
        const n = Number(value)
        if (!Number.isNaN(n)) return n
      }
      return value
    }
    case 'object':
    case 'array':
      if (typeof value === 'string') {
        try {
          const decoded: unknown = JSON.parse(value)
          if (decoded && typeof decoded === 'object') return decoded
        } catch { /* leave the raw string when it is not valid JSON */ }
      }
      return value
    default:
      return value
  }
}

function coerceMeta(meta: Record<string, unknown>, fieldTypes?: MetaFieldTypes): Record<string, unknown> {
  if (!fieldTypes) return meta
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta)) {
    out[key] = coerceMetaValue(fieldTypes[key], value)
  }
  return out
}

export function componentMetaEvent(
  msg: unknown,
  componentId?: string,
  fieldTypes?: MetaFieldTypes,
): ComponentMetaEvent | null {
  if (componentId !== undefined && !componentId) return null
  const root = isRecord(msg) ? msg : {}
  const candidates = [
    root,
    isRecord(root.data) ? root.data : null,
    isRecord(root.payload) ? root.payload : null,
    isRecord(root.detail) ? root.detail : null,
  ].filter(Boolean) as Record<string, unknown>[]

  for (const item of candidates) {
    if (item.event !== 'component.meta.changed') continue
    const id = String(item.component_id || '')
    const topic = String(root.topic || item.topic || '')
    if (componentId === undefined) {
      if (!id && (!topic.startsWith('component.') || topic === 'component.')) continue
    } else {
      if (id && id !== componentId) continue
      if (!id && topic !== `component.${componentId}`) continue
    }
    return {
      event: 'component.meta.changed',
      component_id: id || componentId || topic.slice('component.'.length),
      meta: coerceMeta(isRecord(item.meta) ? item.meta : {}, fieldTypes),
      deleted: Array.isArray(item.deleted) ? item.deleted.map(String) : [],
    }
  }
  return null
}

export function subscribeComponentMeta(
  componentId: string,
  cb: (event: ComponentMetaEvent) => void,
  fieldTypes?: MetaFieldTypes,
): (() => void) | null {
  if (!componentId) return null
  const off = on(`component.${componentId}`, (msg: unknown) => {
    const event = componentMetaEvent(msg, componentId, fieldTypes)
    if (event) cb(event)
  })
  return typeof off === 'function' ? off : null
}
