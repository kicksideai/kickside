-- Shared types for the kickside.security scopes/roles admin.

local M = {}

-- A DB-backed custom scope row (kickside_security_scopes).
type ScopeRow = {
    slug: string,
    label: string,
    description: string,
    policies: { string },
    -- "" for a net-new custom scope; a built-in/registry scope id for an overlay.
    target: string,
    internal: boolean,
    enabled: boolean,
    created_at: any?,
    updated_at: any?,
}

-- A policy as surfaced in the catalog (the grant a scope can include).
type PolicySummary = {
    id: string,
    title: string?,
    surface: string?,
    intent: string?,
    comment: string?,
    effect: string?,
    actions: any?,
    resources: any?,
    -- A private policy (meta.private = true) is excluded from the picker; only
    -- public policies are selectable when composing a scope.
    private: boolean,
}

-- A scope/role in the merged catalog: a built-in implicit group, a registry
-- security.scope, or a DB-backed custom scope.
type CatalogScope = {
    id: string,
    label: string,
    description: string,
    source: string,        -- builtin | registry | custom
    internal: boolean,
    built_in: boolean,
    enabled: boolean,
    policies: { PolicySummary },
    slug: string?,         -- present for custom (DB-backed) scopes
    -- For a built-in/registry scope that an admin has extended: the overlay's DB
    -- slug + the extra policies it grants (unioned onto the base at runtime).
    overlay_slug: string?,
    overlay_policies: { PolicySummary }?,
}

M.ScopeRow = ScopeRow
M.PolicySummary = PolicySummary
M.CatalogScope = CatalogScope

return M
