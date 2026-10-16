// The auto-map heuristic — the intent-edge trust boundary (W11.1). When a connection
// lands, this decides whether the mapping is obvious enough to apply silently or must ask.
//
// The rule, deliberately conservative: a target field's candidates are the SOURCE's
// top-level fields whose canonical name matches AND whose type is compatible (the shared
// typeCompatible rule). The connection AUTO-APPLIES only when EVERY REQUIRED target field
// has exactly ONE candidate — any required-field ambiguity (zero, or more than one) blocks
// the silent apply and hands off to the intent popover. Optional fields never gate the
// decision; they are mapped opportunistically when they too resolve uniquely. This lowers
// onto the one grammar: the result carries a plain expr-lang object expression, nothing a
// user can't open and read.

import {
  targetFields, typeCompatible, buildObjectExpression, buildSourceTree, decodeSchema,
  type TargetField, type MappingField,
} from '@widgets/app/field-mapper'

// A canonical name folds case and separators so `contactId`, `contact_id` and
// `contact id` all compare equal — the "exact/canonical name match" of the spec.
export function canonicalName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

// One resolved field: the target key, the source expression that fills it, and the
// human reason it matched — the per-field WHY the affordance surfaces.
export interface AutoMapField {
  key: string
  title: string
  expr: string
  sourceName: string
  sourceType: string
  targetType: string
  required: boolean
  match: 'exact' | 'canonical'
  typed: boolean
  why: string
}

// Why a required field could not resolve, so the popover can be specific rather than
// generically "ambiguous": `none` (no name+type match), `type` (name matches, type
// conflicts), `multiple` (more than one candidate).
export type UnresolvedReason = 'none' | 'type' | 'multiple'
export interface UnresolvedTarget {
  key: string
  title: string
  reason: UnresolvedReason
  candidates: string[]
}

export type AutoMapStatus = 'auto' | 'ambiguous' | 'skip'

export interface AutoMapResult {
  status: AutoMapStatus
  // The fields that mapped (populated for `auto`).
  fields: AutoMapField[]
  // The compiled expr-lang object expression over the source root (`auto` only; '' otherwise).
  transform: string
  // Required targets that blocked a silent apply (populated for `ambiguous`).
  unresolved: UnresolvedTarget[]
}

interface Candidate {
  name: string
  expr: string
  type: string
}

// Build the WHY sentence for a resolved field. It states the two facts the apply rests
// on — a name match and a compatible type — and stays honest when a type wasn't declared
// to check (the common case, since node schemas are rarely persisted).
export function autoMapWhy(f: {
  title: string; expr: string; sourceName: string; match: 'exact' | 'canonical'; typed: boolean
}): string {
  const nameClause = f.match === 'exact'
    ? 'the names match'
    : `“${f.sourceName}” is the same field name`
  const typeClause = f.typed ? 'the types are compatible' : 'the upstream type isn’t declared, so type wasn’t checked'
  return `${f.title} ← ${f.expr} · ${nameClause} and ${typeClause}.`
}

// The top-level source fields as name+type+expression candidates. Nested fields are
// deliberately excluded: reshaping a nested value is exactly the ambiguity that should ask
// the user, not something to guess silently.
function sourceCandidates(sourceSchema: unknown, sourceRoot: string): Candidate[] {
  const tree = buildSourceTree(sourceSchema, sourceRoot)
  return tree.map((f) => ({ name: f.name, expr: f.expr, type: f.type || 'any' }))
}

// The candidates for one target field: same canonical name AND compatible type.
function candidatesFor(t: TargetField, all: Candidate[]): Candidate[] {
  const canon = canonicalName(t.key)
  const tType = t.type || 'any'
  return all.filter((c) => canonicalName(c.name) === canon && typeCompatible(c.type, tType))
}

// Why a required field with no compatible candidate failed: `type` when a name match
// exists but its type conflicts (a near miss worth naming), else `none`.
function unresolvedReason(t: TargetField, all: Candidate[]): UnresolvedReason {
  const canon = canonicalName(t.key)
  const nameMatch = all.some((c) => canonicalName(c.name) === canon)
  return nameMatch ? 'type' : 'none'
}

function resolvedField(t: TargetField, c: Candidate): AutoMapField {
  const match: 'exact' | 'canonical' = c.name === t.key ? 'exact' : 'canonical'
  const typed = c.type !== 'any' && !!t.type && t.type !== 'any'
  return {
    key: t.key,
    title: t.title || t.key,
    expr: c.expr,
    sourceName: c.name,
    sourceType: c.type,
    targetType: t.type || 'any',
    required: t.required,
    match,
    typed,
    why: autoMapWhy({ title: t.title || t.key, expr: c.expr, sourceName: c.name, match, typed }),
  }
}

// The heuristic. `sourceRoot` is the root the emitted expressions reference — an edge's
// upstream `output`, a binding's trigger `input`.
export function autoMap(sourceSchema: unknown, targetSchema: unknown, sourceRoot = 'output'): AutoMapResult {
  const targets = targetFields(targetSchema)
  // A target that declares no input fields has nothing to map into — connect silently.
  if (!targets.length || !decodeSchema(targetSchema)) {
    return { status: 'skip', fields: [], transform: '', unresolved: [] }
  }
  const candidates = sourceCandidates(sourceSchema, sourceRoot)

  const unresolved: UnresolvedTarget[] = []
  const resolved: AutoMapField[] = []
  for (const t of targets) {
    const cands = candidatesFor(t, candidates)
    if (cands.length === 1) {
      resolved.push(resolvedField(t, cands[0]))
      continue
    }
    // Only a REQUIRED target's ambiguity blocks the silent apply; an unresolved optional
    // is simply left unmapped.
    if (t.required) {
      const reason: UnresolvedReason = cands.length > 1 ? 'multiple' : unresolvedReason(t, candidates)
      unresolved.push({
        key: t.key,
        title: t.title || t.key,
        reason,
        candidates: (cands.length > 1 ? cands : candidatesFor(t, candidates)).map((c) => c.expr),
      })
    }
  }

  if (unresolved.length) {
    return { status: 'ambiguous', fields: [], transform: '', unresolved }
  }
  // Every required field resolved uniquely. If nothing actually mapped (an optional-only
  // target with no matches), there is no mapping to announce — connect silently.
  if (!resolved.length) {
    return { status: 'skip', fields: [], transform: '', unresolved: [] }
  }
  const mapping: MappingField[] = resolved.map((f) => ({ key: f.key, mode: 'expr', value: f.expr }))
  return { status: 'auto', fields: resolved, transform: buildObjectExpression(mapping), unresolved: [] }
}
