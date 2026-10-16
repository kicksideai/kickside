// The one shared mapping model (W2/W3 MAPPING primitive; W11 one grammar). A mapping
// compiles to expr-lang: an object expression `{ key: <rhs>, ... }` whose right-hand
// sides reference the SOURCE by its root — an edge's upstream `output`, a binding's
// trigger `input`. A source pill is sugar over this grammar: clicking one writes its
// path expression into a target row; the expression stays visible and editable. This
// module is the single home for the value transforms, consumed by workflow edges and
// automation bindings, so both generate the identical grammar.

function asObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

// A JSON schema may arrive as a string. Decode it, tolerantly.
export function decodeSchema(raw: unknown): Record<string, unknown> | null {
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return null
    try { return asObject(JSON.parse(t)) } catch { return null }
  }
  return asObject(raw)
}

// The presentational type of a schema field: its declared type, or `object` when it
// only declares properties, or `any` when it declares neither.
function normType(def: Record<string, unknown>): string {
  const t = def.type
  if (typeof t === 'string' && t) return t
  if (Array.isArray(t) && t.length && typeof t[0] === 'string') return t[0] as string
  if (asObject(def.properties)) return 'object'
  return 'any'
}

// ─── Source side: the upstream schema as clickable pills (nested) ───────────────────
export interface SourceField {
  // The leaf key (e.g. `email`).
  name: string
  // The dotted path from the root, without the root (e.g. `user.email`).
  path: string
  // The full expression, root included (e.g. `output.user.email`) — what a pill writes.
  expr: string
  type: string
  description?: string
  depth: number
  // Nested object fields, drilled to `maxDepth`.
  children: SourceField[]
  expandable: boolean
}

function fieldsOf(
  schema: Record<string, unknown>,
  root: string,
  prefix: string,
  depth: number,
  maxDepth: number,
): SourceField[] {
  const props = asObject(schema.properties)
  if (!props) return []
  const out: SourceField[] = []
  for (const [name, raw] of Object.entries(props)) {
    const def = asObject(raw) || {}
    const path = prefix ? `${prefix}.${name}` : name
    const type = normType(def)
    const children = type === 'object' && asObject(def.properties) && depth + 1 < maxDepth
      ? fieldsOf(def, root, path, depth + 1, maxDepth)
      : []
    out.push({
      name,
      path,
      expr: `${root}.${path}`,
      type,
      description: typeof def.description === 'string' ? def.description : undefined,
      depth,
      children,
      expandable: children.length > 0,
    })
  }
  return out
}

// The source schema's fields as a pill tree. An object schema drills into nested object
// properties up to `maxDepth`; a non-object (scalar/any) schema carries no fields —
// `rootSourceField` names the whole value instead.
export function buildSourceTree(schema: unknown, root = 'output', maxDepth = 4): SourceField[] {
  const s = decodeSchema(schema)
  if (!s) return []
  return fieldsOf(s, root, '', 0, maxDepth)
}

// The whole-value pill for a source schema that declares a type but no fields (a scalar
// or `any` upstream output) — so a mapping can still reference `output` directly. Null
// when the schema is absent or already an object with fields.
export function rootSourceField(schema: unknown, root = 'output'): SourceField | null {
  const s = decodeSchema(schema)
  if (!s) return null
  if (asObject(s.properties)) return null
  const type = normType(s)
  if (type === 'object') return null
  return {
    name: root,
    path: '',
    expr: root,
    type,
    description: typeof s.description === 'string' ? s.description : undefined,
    depth: 0,
    children: [],
    expandable: false,
  }
}

// ─── Target side: the downstream schema as rows ─────────────────────────────────────
export interface TargetField {
  key: string
  title: string
  type?: string
  required: boolean
  description?: string
}

// The input fields a downstream step / Start declares, for the mapping rows. Reads a
// standard object schema ({ properties, required }); order preserved.
export function targetFields(schema: unknown): TargetField[] {
  const s = decodeSchema(schema)
  if (!s) return []
  const props = asObject(s.properties)
  if (!props) return []
  const required = new Set(Array.isArray(s.required) ? s.required.map(String) : [])
  const out: TargetField[] = []
  for (const [key, defRaw] of Object.entries(props)) {
    const def = asObject(defRaw) || {}
    out.push({
      key,
      title: typeof def.title === 'string' && def.title ? def.title : key,
      type: typeof def.type === 'string' ? def.type : undefined,
      required: required.has(key),
      description: typeof def.description === 'string' ? def.description : undefined,
    })
  }
  return out
}

// ─── Per-target mapping rows (the one grammar) ──────────────────────────────────────
// A row is `static` (a JSON-ish literal), `expr` (a raw expr-lang right-hand side over
// the source root — what a pill writes, and the per-row escape hatch), or `skip`.
export type MappingMode = 'static' | 'expr' | 'skip'
export interface MappingField {
  key: string
  mode: MappingMode
  value: string
  // The declared type of the target field, used to render/emit the static literal.
  type?: string
}

function staticLiteral(value: string, type?: string): string {
  const raw = value ?? ''
  if (type === 'number' || type === 'integer') {
    const n = Number(raw)
    return Number.isFinite(n) && raw.trim() !== '' ? String(n) : '0'
  }
  if (type === 'boolean') return raw === 'true' || raw === '1' ? 'true' : 'false'
  // Everything else is emitted as a quoted string literal.
  return JSON.stringify(String(raw))
}

// One field's expr-lang right-hand side, or null when the field contributes nothing.
export function mappingFieldExpr(field: MappingField): string | null {
  if (field.mode === 'skip') return null
  if (field.mode === 'expr') {
    const expr = (field.value || '').trim()
    return expr || null
  }
  if ((field.value ?? '') === '') return null
  return staticLiteral(field.value, field.type)
}

// Compile the mapping rows into the expr-lang object expression `{ k: rhs, ... }`. An
// empty mapping (no contributing rows) lowers to the empty string — each surface reads
// that as "no transform" / "pass through".
export function buildObjectExpression(fields: MappingField[]): string {
  const parts: string[] = []
  for (const f of fields) {
    if (!f.key) continue
    const rhs = mappingFieldExpr(f)
    if (rhs === null) continue
    parts.push(`${f.key}: ${rhs}`)
  }
  return parts.length ? `{ ${parts.join(', ')} }` : ''
}

// A default mapping row per target field: a required field opens ready for a value
// (empty `static`, so it still reads as unmapped until filled); an optional field starts
// skipped.
export function defaultMappingFields(fields: TargetField[]): MappingField[] {
  return fields.map((f) => ({ key: f.key, mode: f.required ? 'static' : 'skip', value: '', type: f.type }))
}

// Which required target fields still have nothing mapped — the completeness gate.
export function unmappedRequired(fields: TargetField[], mapping: MappingField[]): string[] {
  const byKey = new Map(mapping.map((m) => [m.key, m]))
  const out: string[] = []
  for (const f of fields) {
    if (!f.required) continue
    const m = byKey.get(f.key)
    if (!m || mappingFieldExpr(m) === null) out.push(f.title || f.key)
  }
  return out
}

// The at-a-glance completeness line ('' when every required field is mapped).
export function completenessLine(fields: TargetField[], mapping: MappingField[]): string {
  const missing = unmappedRequired(fields, mapping)
  if (!missing.length) return ''
  return `${missing.length} required field${missing.length === 1 ? '' : 's'} unmapped`
}

// An empty transform means the upstream value passes through unchanged. Surface that as
// real mapping information whenever the source declares a same-name, compatible field;
// otherwise a perfectly valid pass-through looks incomplete merely because it has no
// explicit object expression. The returned rows are presentation sugar only—the caller
// keeps the stored transform empty until the user actually edits a row.
export function passThroughMapping(sourceSchema: unknown, targetSchema: unknown, root = 'output'): MappingField[] {
  const source = decodeSchema(sourceSchema)
  const sourceProps = source ? asObject(source.properties) : null
  if (!sourceProps) return []
  const rows: MappingField[] = []
  for (const target of targetFields(targetSchema)) {
    const sourceDef = asObject(sourceProps[target.key])
    if (!sourceDef) continue
    const sourceType = normType(sourceDef)
    const targetType = target.type || 'any'
    if (!typeCompatible(sourceType, targetType)) continue
    rows.push({ key: target.key, mode: 'expr', value: `${root}.${target.key}`, type: target.type })
  }
  return rows
}

// ─── Type compatibility (single rule; connect-validation reuses this) ───────────────
export function typeCompatible(a: string, b: string): boolean {
  if (a === b) return true
  const numeric = new Set(['number', 'integer'])
  if (numeric.has(a) && numeric.has(b)) return true
  // A concrete producer feeding an untyped/any consumer is fine.
  if (a === 'any' || b === 'any') return true
  return false
}

export type PillCompat = 'ok' | 'mismatch' | 'neutral'

// The per-pair badge for a proposed source->target mapping. An absent or `any` type on
// either side carries no basis for a verdict — neutral, never a claimed match.
export function pillCompat(sourceType: string | undefined, targetType: string | undefined): PillCompat {
  if (!sourceType || !targetType || sourceType === 'any' || targetType === 'any') return 'neutral'
  return typeCompatible(sourceType, targetType) ? 'ok' : 'mismatch'
}

// ─── Stored transform → authoring expression text ──────────────────────────────────
// A persisted mapping is either the bare expr-lang string or the backend's mapping-spec
// object `{ v, mode, expr }` (its canonical stored shape). Extract the expression text; a
// spec that carries none (empty, or a non-expr mode) reads as no transform. Never coerces
// the object with `String(...)` — that is what rendered "[object Object]" into the mapper.
export function mappingExprText(raw: unknown): string {
  const normalize = (value: string): string => {
    const text = value.trim()
    // Identity expressions carry the producer value through unchanged.
    if (!text || text === 'input' || text === 'output') return ''
    return text
  }
  if (typeof raw === 'string') return normalize(raw)
  const o = asObject(raw)
  if (o && typeof o.expr === 'string') return normalize(o.expr)
  return ''
}

// Rename a root variable across an expression, honoring identifier boundaries and skipping
// quoted string contents — so `input` becomes `output` while `inputs` and a quoted
// `"input"` stay intact. Mirrors the backend mapping bridge (mapping.lua replace_ident);
// the stored expr is `input`-rooted, the edge mapper authors against `output`.
export function renameRootVar(expr: string, from: string, to: string): string {
  if (!expr || !from) return expr
  const isIdent = (ch: string) => /[A-Za-z0-9_$]/.test(ch)
  let out = ''
  let quote = ''
  let i = 0
  while (i < expr.length) {
    const ch = expr[i]
    if (quote) {
      out += ch
      if (ch === quote && expr[i - 1] !== '\\') quote = ''
      i++
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; out += ch; i++; continue }
    if (expr.startsWith(from, i)
      && (i === 0 || !isIdent(expr[i - 1]))
      && (i + from.length >= expr.length || !isIdent(expr[i + from.length]))) {
      out += to
      i += from.length
      continue
    }
    out += ch
    i++
  }
  return out
}

// ─── Round-trip parse of the object grammar (reseeding rows from a stored expression) ──
export interface ParsedPair { key: string; rhs: string }

// Split `s` on `sep` at bracket/quote depth 0. Null when the string is unbalanced.
function splitTopLevel(s: string, sep: string): string[] | null {
  const out: string[] = []
  let depth = 0
  let quote = ''
  let start = 0
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (quote) {
      if (ch === '\\') { i++; continue }
      if (ch === quote) quote = ''
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue }
    if (ch === '(' || ch === '[' || ch === '{') { depth++; continue }
    if (ch === ')' || ch === ']' || ch === '}') { depth--; if (depth < 0) return null; continue }
    if (ch === sep && depth === 0) { out.push(s.slice(start, i)); start = i + 1 }
  }
  if (depth !== 0 || quote) return null
  out.push(s.slice(start))
  return out
}

// The index of the first `:` at depth 0 (the key separator — a later ternary `:` sits
// deeper in the right-hand side or after it, never before the key colon). -1 when none.
function topLevelColon(s: string): number {
  let depth = 0
  let quote = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (quote) {
      if (ch === '\\') { i++; continue }
      if (ch === quote) quote = ''
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue }
    if (ch === '(' || ch === '[' || ch === '{') { depth++; continue }
    if (ch === ')' || ch === ']' || ch === '}') { depth--; continue }
    if (ch === ':' && depth === 0) return i
  }
  return -1
}

// Parse `{ k: rhs, ... }` (the grammar this module emits, and simple hand-written
// equivalents) into key/rhs pairs. Null when the expression is not a flat object literal
// with identifier keys — the caller then keeps it as a raw, un-decomposed expression.
export function parseObjectExpression(expr: string): ParsedPair[] | null {
  const s0 = (expr || '').trim()
  if (!s0.startsWith('{') || !s0.endsWith('}')) return null
  const inner = s0.slice(1, -1).trim()
  if (!inner) return []
  const parts = splitTopLevel(inner, ',')
  if (parts === null) return null
  const pairs: ParsedPair[] = []
  for (const part of parts) {
    const t = part.trim()
    if (!t) continue
    const ci = topLevelColon(t)
    if (ci < 0) return null
    let key = t.slice(0, ci).trim()
    const rhs = t.slice(ci + 1).trim()
    if (!rhs) return null
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
      key = key.slice(1, -1)
    }
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) return null
    pairs.push({ key, rhs })
  }
  return pairs
}

export interface SeededMapping {
  rows: MappingField[]
  // Non-empty when the stored expression can't be decomposed into the target rows (a
  // complex expression, or keys the target schema doesn't declare): the surface edits it
  // as one raw expression instead of losing it.
  raw: string
}

// Seed the mapping rows for a target schema from a stored object expression. A blank
// expression opens the default rows; a decomposable one fills the matching rows and keeps
// their right-hand sides visible/editable; anything else is preserved verbatim as `raw`.
export function seedRows(targetSchema: unknown, expr?: string): SeededMapping {
  const targets = targetFields(targetSchema)
  const base = defaultMappingFields(targets)
  const e = (expr || '').trim()
  if (!e) return { rows: base, raw: '' }
  const parsed = parseObjectExpression(e)
  if (!parsed) return { rows: base, raw: e }
  if (targets.length) {
    const targetKeys = new Set(targets.map((t) => t.key))
    if (parsed.some((p) => !targetKeys.has(p.key))) return { rows: base, raw: e }
    const byKey = new Map(parsed.map((p) => [p.key, p.rhs]))
    const rows = base.map((r) => byKey.has(r.key)
      ? { key: r.key, mode: 'expr' as MappingMode, value: byKey.get(r.key) as string, type: r.type }
      : r)
    return { rows, raw: '' }
  }
  // A schemaless target (no declared fields): reflect the parsed pairs as the rows.
  return { rows: parsed.map((p) => ({ key: p.key, mode: 'expr' as MappingMode, value: p.rhs })), raw: '' }
}
