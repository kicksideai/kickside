import { parseSchema } from '@widgets/app/ports'

export function schemaFieldMap(schema: unknown): Record<string, Record<string, unknown>> | undefined {
  const parsed = parseSchema(schema)
  const props = parsed?.properties
  if (!props || typeof props !== 'object') return undefined
  const required = new Set(Array.isArray(parsed.required) ? parsed.required.map(String) : [])
  const out: Record<string, Record<string, unknown>> = {}
  for (const [key, raw] of Object.entries(props)) {
    const field = raw && typeof raw === 'object' ? { ...(raw as Record<string, unknown>) } : {}
    if (required.has(key)) field.required = true
    out[key] = field
  }
  return Object.keys(out).length ? out : undefined
}

export function configRowFromSchema(schema: unknown): { config_schema: Record<string, Record<string, unknown>> } | null {
  const config_schema = schemaFieldMap(schema)
  return config_schema ? { config_schema } : null
}
