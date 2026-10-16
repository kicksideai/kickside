// Pure prop parsing for the <kickside-workflow-embed> web component. No Vue, no fetch —
// the element's reactive props object is fed straight in and normalized to the config the
// embed runs on, so the contract other modules author against is unit-tested here.
//
// Wippy exposes host attributes as camelCase props (flow-id -> flowId).

export type EmbedMode = 'run' | 'dispatch'

export interface EmbedConfig {
  // The pinned workflow id, or '' when the embed should show a published-workflow picker.
  workflowId: string
  // Pre-mapped Start input, or null when the schema-driven form should be shown.
  input: Record<string, unknown> | null
  // Non-empty when an `input` attribute was provided but did not parse to a JSON object.
  inputError: string
  // 'run' (default): run + live status + Finish output. 'dispatch': fire-and-forget.
  mode: EmbedMode
  // Action button text.
  label: string
}

const DEFAULT_LABEL = 'Run Workflow'

function stringProp(raw: Record<string, unknown>, key: string): string {
  const v = raw[key]
  return typeof v === 'string' ? v : ''
}

// 'run' unless the caller explicitly asked for 'dispatch'. Any unrecognized value falls
// back to 'run' rather than guessing — the safe default is the observable one.
export function normalizeMode(v: unknown): EmbedMode {
  return typeof v === 'string' && v.trim().toLowerCase() === 'dispatch' ? 'dispatch' : 'run'
}

// The `input` prop may arrive as a JSON string (an HTML attribute) or as an already-parsed
// object (a bound property). A non-object JSON (array, scalar) is rejected: Start input is
// an object payload. Absent/blank input is not an error — it means "render the form".
export function parseInputProp(v: unknown): { value: Record<string, unknown> | null; error: string } {
  if (v == null || v === '') return { value: null, error: '' }
  if (typeof v === 'object') {
    if (Array.isArray(v)) return { value: null, error: 'Input must be a JSON object.' }
    return { value: v as Record<string, unknown>, error: '' }
  }
  if (typeof v === 'string') {
    const trimmed = v.trim()
    if (!trimmed) return { value: null, error: '' }
    try {
      const parsed = JSON.parse(trimmed)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { value: null, error: 'Input must be a JSON object.' }
      }
      return { value: parsed as Record<string, unknown>, error: '' }
    } catch {
      return { value: null, error: 'Input is not valid JSON.' }
    }
  }
  return { value: null, error: 'Input must be a JSON object.' }
}

export function readEmbedProps(raw: Record<string, unknown> | null | undefined): EmbedConfig {
  const props = raw && typeof raw === 'object' ? raw : {}
  const { value, error } = parseInputProp(props.input)
  const label = stringProp(props, 'label').trim() || DEFAULT_LABEL
  return {
    workflowId: stringProp(props, 'flowId').trim(),
    input: value,
    inputError: error,
    mode: normalizeMode(props.mode),
    label,
  }
}
