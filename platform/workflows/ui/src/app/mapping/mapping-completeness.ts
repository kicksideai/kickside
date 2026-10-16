// Persistent, document-derived mapping completeness for canvas edges. This deliberately
// uses the FieldMapper's own stored-expression parser and required-field gate, so the
// warning count agrees with the mapper a click opens. Auto-map already uses the same
// target-field model and typeCompatible rule when it produces a transform; here we only
// answer whether the transform that was actually stored covers the required target keys.

import { mappingExprText, passThroughMapping, seedRows, targetFields, unmappedRequired } from '@widgets/app/field-mapper'
import type { WfEdge } from '../types'

export interface EdgeMappingCompleteness {
  required: string[]
  unmappedRequired: string[]
}

// A non-object expression is intentionally treated as complete, matching FieldMapper's
// raw-expression mode: it cannot safely decompose the expression into rows, but must not
// claim particular fields are absent. An empty transform is the mapper's default rows and
// therefore leaves every required target field visibly unmapped.
export function edgeMappingCompleteness(
  edge: Pick<WfEdge, 'source_port' | 'transform'>,
  targetSchema: unknown,
  sourceSchema?: unknown,
): EdgeMappingCompleteness {
  const fields = targetFields(targetSchema)
  const required = fields.filter((field) => field.required).map((field) => field.title || field.key)
  if (!required.length) return { required, unmappedRequired: [] }

  const expr = mappingExprText(edge.transform)
  const seeded = seedRows(targetSchema, expr)
  const passThrough = !expr.trim() ? passThroughMapping(sourceSchema, targetSchema) : []
  const byKey = new Map(passThrough.map((row) => [row.key, row]))
  const rows = seeded.rows.map((row) => byKey.get(row.key) || row)
  return {
    required,
    unmappedRequired: seeded.raw ? [] : unmappedRequired(fields, rows),
  }
}
