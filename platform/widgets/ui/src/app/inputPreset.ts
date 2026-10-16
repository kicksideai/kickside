// Generic initial install inputs supplied by a component-owned create surface.
export function inputPreset(raw: unknown): Record<string, unknown> {
  if (raw === undefined || raw === null || raw === '') return {}
  const value: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Install input must be an object.')
  return value as Record<string, unknown>
}
