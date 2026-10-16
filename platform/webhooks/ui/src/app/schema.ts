export const DEFAULT_SCHEMA = {
  type: 'object',
  additionalProperties: true,
  properties: {},
}

export function prettySchema(value: unknown): string {
  try { return JSON.stringify(value || DEFAULT_SCHEMA, null, 2) } catch { return JSON.stringify(DEFAULT_SCHEMA, null, 2) }
}

export function parseSchemaText(text: string): { schema?: unknown; error?: string } {
  const raw = text.trim()
  if (!raw) return { schema: DEFAULT_SCHEMA }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { error: 'Schema must be a JSON object.' }
    return { schema: parsed }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Invalid JSON schema.' }
  }
}

// A single top-level property of the payload schema, flattened for display.
export interface SchemaField {
  key: string
  type: string
  required: boolean
  description?: string
}

// Flatten a JSON Schema's top-level `properties` into a readable field list.
// Returns an empty list when the schema declares no properties (i.e. it accepts
// any object); callers render an "accepts any payload" note in that case.
export function schemaFields(value: unknown): SchemaField[] {
  if (!value || typeof value !== 'object') return []
  const schema = value as Record<string, unknown>
  const props = schema.properties
  if (!props || typeof props !== 'object') return []
  const required = Array.isArray(schema.required) ? (schema.required as unknown[]).map(String) : []
  return Object.entries(props as Record<string, unknown>).map(([key, def]) => {
    const d = (def && typeof def === 'object' ? def : {}) as Record<string, unknown>
    const t = d.type
    return {
      key,
      type: Array.isArray(t) ? t.join(' | ') : (typeof t === 'string' ? t : 'any'),
      required: required.includes(key),
      description: typeof d.description === 'string' ? d.description : undefined,
    }
  })
}
