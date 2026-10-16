export interface ComponentProps {}

// A grant the admin can compose into a scope. Mirrors the backend PolicySummary;
// only public policies (meta.private != true) are returned by /security/policies.
export interface Policy {
  id: string
  title?: string
  surface?: string
  intent?: string
  comment?: string
  effect?: string
  actions?: unknown
  resources?: unknown
  private?: boolean
}

// A scope/role in the catalog. Built-in (implicit group), registry security.scope,
// or a DB-backed custom scope. Mirrors the backend CatalogScope.
export interface Scope {
  id: string
  slug?: string
  label: string
  description: string
  source: 'builtin' | 'registry' | 'custom'
  internal: boolean
  built_in: boolean
  enabled: boolean
  policies: Policy[]
  // For a built-in/registry scope an admin has extended via an overlay.
  overlay_slug?: string
  overlay_policies?: Policy[]
}

// Draft state while creating/editing a scope. For a custom scope, target is ''
// and policies is the full set. For an OVERLAY of a built-in/registry scope,
// target is the base scope id, base holds its (locked) base policies, and
// policies holds only the admin's added extensions.
export interface ScopeDraft {
  slug: string
  label: string
  description: string
  policies: string[]
  enabled: boolean
  isNew: boolean
  target: string
  base: Policy[]
}
