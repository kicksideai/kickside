// Parsing for a free-text JSON-object config field (an agent's exit schema or run
// context, a human node's shown-context expression preview). Empty text is a valid
// "unset" state — it clears the field back to the engine default rather than sending
// a broken value; non-empty text must parse to a plain object.

export interface JsonObjectResult {
  value: Record<string, unknown> | null
  error: string
}

export function parseJsonObject(text: string): JsonObjectResult {
  const t = text.trim()
  if (!t) return { value: null, error: '' }
  try {
    const v = JSON.parse(t)
    if (!v || typeof v !== 'object' || Array.isArray(v)) return { value: null, error: 'Must be a JSON object.' }
    return { value: v as Record<string, unknown>, error: '' }
  } catch (e) {
    return { value: null, error: `Invalid JSON: ${e instanceof Error ? e.message : 'parse error'}` }
  }
}
