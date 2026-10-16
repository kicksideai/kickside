// Pure routing helpers (no Vue imports) so they're unit-testable in isolation.

// Normalize an iframe path to a leading-slash route. Empty/missing → '/'.
export function normalizePath(raw: unknown): string {
  const s = String(raw ?? '').trim()
  if (!s) return '/'
  return s.startsWith('/') ? s : '/' + s
}

// Resolve a component's `navigate` event path to a shell route -- the ONE rule
// every surface (and the command palette) navigates by, so all components behave
// identically:
//   - absolute path (leading slash) -> a cross-surface shell route, used as-is
//     (e.g. a dashboard card to '/agents'); the host adds the /c/<page-id> prefix
//     via onRouteChanged, so components never deal with page ids.
//   - relative path (no leading slash) -> an in-surface deep-link resolved under
//     the emitting surface's base (e.g. a KB linking to 'abc/def' under /knowledge).
// Empty -> '' (the caller ignores it). basePath defaults to root.
export function resolveNavTarget(raw: unknown, basePath?: unknown): string {
  const p = String(raw ?? '').trim()
  if (!p) return ''
  if (p.startsWith('/')) return normalizePath(p)
  const base = normalizePath(basePath ?? '/')
  return normalizePath(base === '/' ? p : `${base}/${p}`)
}

// The host exposes the initial deep link through context.route.
export function resolveInitialPath(config: unknown): string {
  const c = (config ?? {}) as { context?: { route?: unknown } }
  const raw = c.context?.route
  return normalizePath(raw)
}
