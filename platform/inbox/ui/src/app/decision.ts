const LONG_VALUE_THRESHOLD = 80

export function humanizeKey(key: string): string {
  const cleaned = key.replace(/[_-]+/g, ' ').trim()
  if (!cleaned) return key
  return cleaned
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

function stringifyValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return JSON.stringify(v, null, 2)
}

export interface ContextRow {
  key: string
  label: string
  value: string
  long: boolean
}

export type ContextView =
  | { kind: 'empty' }
  | { kind: 'text'; text: string }
  | { kind: 'rows'; rows: ContextRow[] }

// A string context renders as a paragraph, a plain object as label/value rows, and
// anything else (array, number, ...) falls back to a compact printed form so the
// approver always sees something legible instead of raw JSON braces.
export function formatContext(context: unknown): ContextView {
  if (context === null || context === undefined || context === '') return { kind: 'empty' }
  if (typeof context === 'string') return { kind: 'text', text: context }
  if (typeof context === 'object' && !Array.isArray(context)) {
    const rows = Object.entries(context as Record<string, unknown>).map(([key, value]) => {
      const text = stringifyValue(value)
      return { key, label: humanizeKey(key), value: text, long: text.length > LONG_VALUE_THRESHOLD || text.includes('\n') }
    })
    return rows.length ? { kind: 'rows', rows } : { kind: 'empty' }
  }
  return { kind: 'text', text: stringifyValue(context) }
}

export type DecisionFieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox'

type DecisionValue = string | number | boolean

function isDecisionValue(value: unknown): value is DecisionValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

export interface DecisionField {
  key: string
  label: string
  type: DecisionFieldType
  required: boolean
  options: DecisionValue[]
  default?: DecisionValue
}

function fieldDefault(type: DecisionFieldType, schema: Record<string, unknown>, options: DecisionValue[]): DecisionValue | undefined {
  const value = schema.default
  if (type === 'checkbox') return typeof value === 'boolean' ? value : undefined
  if (type === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
    return schema.type === 'integer' && !Number.isInteger(value) ? undefined : value
  }
  if (type === 'select') return isDecisionValue(value) && options.includes(value) ? value : undefined
  return typeof value === 'string' ? value : undefined
}

function fieldType(schema: Record<string, unknown>): DecisionFieldType | null {
  if (Array.isArray(schema.enum)) return 'select'
  if (schema.type === 'number' || schema.type === 'integer') return 'number'
  if (schema.type === 'boolean') return 'checkbox'
  if (schema.type === 'string') return schema.format === 'textarea' ? 'textarea' : 'text'
  return null
}

// Decision forms are bounded JSON Schema objects. Inbox owns this projection into its
// native controls; Block execution only transports the schema and submitted object.
export function decisionFields(form: unknown): DecisionField[] {
  if (form && typeof form === 'object' && !Array.isArray(form)) {
    const schema = form as Record<string, unknown>
    const properties = schema.properties
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return []
    const required = new Set(Array.isArray(schema.required) ? schema.required.filter((key): key is string => typeof key === 'string') : [])
    return Object.entries(properties as Record<string, unknown>).flatMap(([key, raw]) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
      const field = raw as Record<string, unknown>
      const type = fieldType(field)
      if (!type) return []
      const options = type === 'select' && Array.isArray(field.enum) ? field.enum.filter(isDecisionValue) : []
      const declared = fieldDefault(type, field, options)
      return [{
        key,
        label: typeof field.title === 'string' && field.title ? field.title : humanizeKey(key),
        type,
        required: required.has(key),
        options,
        ...(declared === undefined ? {} : { default: declared }),
      }]
    })
  }
  return []
}

export function defaultFormValues(fields: DecisionField[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const f of fields) values[f.key] = f.default ?? (f.type === 'checkbox' ? false : '')
  return values
}

export function missingRequired(fields: DecisionField[], values: Record<string, unknown>): boolean {
  return fields.some((f) => {
    if (!f.required) return false
    const v = values[f.key]
    if (f.type === 'checkbox') return v !== true
    return v === undefined || v === null || String(v).trim() === ''
  })
}
