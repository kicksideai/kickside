// Workflow labels are persisted definition metadata. Normalize them at the domain
// boundary so API, list, and editor consumers all observe the same canonical shape.

export function sameWorkflowLabel(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}

export function normalizeLabels(labels: unknown): string[] {
  if (!Array.isArray(labels)) return []
  const normalized: string[] = []
  for (const raw of labels) {
    const label = String(raw ?? '').trim()
    if (!label) continue
    if (!normalized.some((existing) => sameWorkflowLabel(existing, label))) {
      normalized.push(label)
    }
  }
  return normalized
}
