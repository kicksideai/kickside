export type PredicateFieldType = 'string' | 'number' | 'boolean' | 'array' | 'unknown'

export interface PredicateField {
  path: string
  label: string
  type: PredicateFieldType
}

export type PredicateOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'truthy' | 'falsy'

export interface PredicateDraft {
  field: string
  operator: PredicateOperator
  value: string
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function fieldType(schema: Record<string, unknown>): PredicateFieldType {
  const type = Array.isArray(schema.type) ? schema.type.find((v) => v !== 'null') : schema.type
  return type === 'string' || type === 'number' || type === 'integer' || type === 'boolean' || type === 'array'
    ? (type === 'integer' ? 'number' : type)
    : 'unknown'
}

/** Flatten declared leaf fields. Object containers are navigation, not comparable values. */
export function predicateFields(schema: unknown, arraysOnly = false): PredicateField[] {
  const out: PredicateField[] = []
  function walk(raw: unknown, prefix = '', depth = 0) {
    if (depth > 10) return
    const node = record(raw)
    const properties = record(node.properties)
    for (const [key, childRaw] of Object.entries(properties)) {
      const child = record(childRaw)
      const path = prefix ? `${prefix}.${key}` : key
      const type = fieldType(child)
      const title = typeof child.title === 'string' && child.title.trim() ? child.title.trim() : key.replace(/_/g, ' ')
      if (type === 'array') { if (arraysOnly) out.push({ path, label: title, type }) }
      else if (type === 'unknown' && Object.keys(record(child.properties)).length) walk(child, path, depth + 1)
      else if (!arraysOnly) out.push({ path, label: title, type })
    }
  }
  walk(schema)
  return out
}

export function operatorsFor(type: PredicateFieldType): Array<{ value: PredicateOperator; label: string }> {
  if (type === 'boolean') return [
    { value: 'truthy', label: 'is true' },
    { value: 'falsy', label: 'is false' },
  ]
  if (type === 'number') return [
    { value: 'eq', label: 'equals' }, { value: 'neq', label: 'does not equal' },
    { value: 'gt', label: 'is greater than' }, { value: 'gte', label: 'is at least' },
    { value: 'lt', label: 'is less than' }, { value: 'lte', label: 'is at most' },
  ]
  return [{ value: 'eq', label: 'equals' }, { value: 'neq', label: 'does not equal' }]
}

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

export function serializePredicate(draft: PredicateDraft, schemaType: PredicateFieldType, root: 'output' | 'state' | 'input' = 'output'): string {
  const field = draft.field.trim()
  if (!field) return ''
  const lhs = `${root}.${field}`
  if (draft.operator === 'truthy') return `${lhs} == true`
  if (draft.operator === 'falsy') return `${lhs} == false`
  const op = ({ eq: '==', neq: '!=', gt: '>', gte: '>=', lt: '<', lte: '<=' } as const)[draft.operator]
  if (!op) return ''
  const raw = draft.value.trim()
  if (!raw) return ''
  const rhs = schemaType === 'number' && Number.isFinite(Number(raw)) ? String(Number(raw)) : quote(raw)
  return `${lhs} ${op} ${rhs}`
}

/** Recover only expressions produced by this compact composer. Everything else stays Advanced. */
export function parseSimplePredicate(expr: string, root: 'output' | 'state' | 'input' = 'output'): PredicateDraft | null {
  const escapedRoot = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = expr.trim().match(new RegExp(`^${escapedRoot}\\.([A-Za-z_][\\w.]*)\\s*(==|!=|>=|<=|>|<)\\s*(.+)$`))
  if (!match) return null
  const [, field, rawOp, rawValue] = match
  if ((rawOp === '==' || rawOp === '!=') && (rawValue === 'true' || rawValue === 'false')) {
    const truthy = rawValue === 'true'
    return { field, operator: truthy === (rawOp === '==') ? 'truthy' : 'falsy', value: '' }
  }
  const operator = ({ '==': 'eq', '!=': 'neq', '>': 'gt', '>=': 'gte', '<': 'lt', '<=': 'lte' } as const)[rawOp]
  if (!operator) return null
  let value = rawValue.trim()
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) value = value.slice(1, -1)
  return { field, operator, value }
}
