// Client-side download + filename derivation for a Flow export. The HTTP read
// lives in api.ts (exportWorkflow); this module turns the returned artifact into a file the
// browser saves. The filename derivation is pure so it is unit-tested; the download itself
// is a thin DOM side effect.

// An honest, filesystem-safe filename from the Flow title: lower-kebab, ascii-ish, with
// a stable `.flow.json` suffix. Empty/space-only titles fall back to "flow".
export function flowFilename(title: string): string {
  const slug = (title || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return `${slug || 'flow'}.flow.json`
}

// Save an object as a pretty-printed JSON download. No-op outside a DOM (SSR/tests).
export function downloadJson(filename: string, data: unknown): void {
  if (typeof document === 'undefined') return
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
