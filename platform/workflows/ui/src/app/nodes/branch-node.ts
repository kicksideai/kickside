

export function readBranchPredicate(config: unknown): string {
  const c = config && typeof config === 'object' && !Array.isArray(config) ? (config as Record<string, unknown>) : {}
  return typeof c.predicate === 'string' ? c.predicate : ''
}

// The config patch the panel commits: the trimmed predicate folded onto the existing
// config. This is the round-trip the compiler accepts (config.predicate present) paired
// with true/false arm edges.
export function branchConfigPatch(config: unknown, predicate: string): Record<string, unknown> {
  const c = config && typeof config === 'object' && !Array.isArray(config) ? (config as Record<string, unknown>) : {}
  return { ...c, predicate: predicate.trim() }
}
