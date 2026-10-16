// Attribute-driven props for kickside-transform-assist. Every field arrives as a
// host attribute; HTML attributes are strings, but a host binding a live object
// (schemas/samples/value) is supported too. useProps camelCases the kebab attribute
// names (source-schema -> sourceSchema). No hardcoded schema/domain lives here: the
// element renders entirely from what the host passes in.
export interface ComponentProps {
  sourceSchema?: string | Record<string, unknown>
  sinkSchema?: string | Record<string, unknown>
  // The sink's declared input shape: a record, or content a string becomes.
  inputShape?: InputShape
  samples?: string | unknown[]
  hint?: string
  // An existing transform to edit-back. The host restores a prior selection by
  // passing the confirmed byte-shape here; the builder seeds its state from it.
  value?: string | Transform
  disabled?: boolean
}

export type InputShape = 'record' | 'content'

// The active builder strategy. Mirrors the transform kinds a user can author:
// pass-through (none), field expression, LLM prompt, or sandboxed Lua code.
export type TransformKind = 'none' | 'expr' | 'llm' | 'code'

// The strategy asked of the assist endpoint. `auto` lets the server pick when the
// user explicitly chooses it; expression is the default and each strategy stays fixed.
export type AssistStrategy = 'auto' | 'expr' | 'llm' | 'code'

// The confirmed transform byte-shape a host writes into a sync's state.transform /
// input.transform. Discriminated by kind.
export interface NoneTransform { kind: 'none' }
export interface ExprTransform { kind: 'expr'; expr: string }
export interface LlmTransform { kind: 'llm'; prompt: string; model?: string }
export interface CodeTransform {
  kind: 'code'
  code: string
  tool_ids?: string[]
}
export type Transform = NoneTransform | ExprTransform | LlmTransform | CodeTransform

// POST /api/v1/transform/assist response. The server returns the proposed transform
// directly (kind-tagged), whether it validated, and a short rationale.
export interface AssistResult {
  ok?: boolean
  validated?: boolean
  transform?: Transform
  strategy?: AssistStrategy
  rationale?: string
  errors?: string[]
  error?: string
}

// POST /api/v1/transform/validate response. `outputs` carries produced items when
// the transform ran against the samples.
export interface ValidateResult {
  ok?: boolean
  valid?: boolean
  errors?: string[]
  outputs?: unknown[]
  error?: string
}

export interface TransformConfirmedDetail {
  transform: Transform
  strategy: TransformKind
  rationale?: string
}
