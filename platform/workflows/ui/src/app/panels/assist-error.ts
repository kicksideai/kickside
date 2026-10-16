// AI assist failures must read as a directed sentence, never a bare backend code token.
// The assist endpoints answer a failure with both a human `message` and a short `error`
// code (e.g. `assist_unavailable`); the message is what the user sees. When only the code
// is present it is mapped to a sentence, and any other snake_case code degrades to a
// generic line rather than leaking the token. Shared by the schema and edge assist clients
// so the mapping lives in one place.

export const ASSIST_TEMPORARY = 'AI assist is temporarily unavailable. Try again shortly.'
export const ASSIST_UNAVAILABLE = 'AI assist isn’t available here yet.'

const KNOWN: Record<string, string> = {
  assist_unavailable: ASSIST_TEMPORARY,
  'assist unavailable': ASSIST_TEMPORARY,
}

function trimStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

// Prefer the human message; else map a known code; else, for a bare snake_case code with
// no message, show the fallback rather than the token. A plain sentence in `error` (with
// spaces, no underscores) is treated as human and passed through.
export function humanizeAssistError(
  payload: { error?: unknown; message?: unknown } | null | undefined,
  fallback: string,
): string {
  const message = trimStr(payload?.message)
  if (message) return message
  const err = trimStr(payload?.error)
  if (!err) return fallback
  const mapped = KNOWN[err.toLowerCase()]
  if (mapped) return mapped
  // A snake_case / single-token identifier is a code, not prose — don't surface it raw.
  if (/_/.test(err) && !/\s/.test(err)) return fallback
  return err
}
