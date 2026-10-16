// Parsers for a picker's value/config attribute, which arrives either as a bare id or
// as a JSON object holding the selection. Shared so every picker reads its value the
// same way.

// A single selected id, read from a bare string or a JSON object's `key` field.
export function parseSelectedId(v: unknown, key: string): string {
  if (typeof v !== 'string' || !v.trim()) return ''
  const s = v.trim()
  if (s.startsWith('{')) {
    try {
      const o = JSON.parse(s) as Record<string, unknown>
      const val = o[key]
      return typeof val === 'string' ? val : (val == null ? '' : String(val))
    } catch { return '' }
  }
  return s
}

// A multi-select's chosen ids from an array, a JSON array string, or a CSV string.
export function parseSelectedIds(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean)
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return []
    if (s.startsWith('[')) {
      try {
        const arr: unknown = JSON.parse(s)
        if (Array.isArray(arr)) return arr.map(String).filter(Boolean)
      } catch { /* fall through to csv */ }
    }
    return s.split(',').map(x => x.trim()).filter(Boolean)
  }
  return []
}
