-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Stable vocabulary for the kickside.security scopes/roles admin.
--
-- Native groups carry module-owned policies. Custom scopes retain DB selections
-- of source policy IDs and security.scope catalog descriptors.

local registry = require("registry")

local M = {}

M.POLICY_KIND = "security.policy"
M.SCOPE_KIND = "security.scope"

-- Role descriptor discovered for the catalog from meta.title/meta.comment.
M.ROLE_META_TYPE = "kickside.security.role"

-- Provenance of a scope in the catalog.
M.SOURCE = {
    BUILTIN = "builtin",     -- host-declared role descriptor
    REGISTRY = "registry",   -- a security.scope shipped in the registry
    CUSTOM = "custom",       -- a DB-backed custom scope (projected to a security.scope)
}

-- Process name the scope projection service registers: the id of the service
-- entry that owns it. Scope writes, delegations and logins send their projection
-- requests to it.
M.SCOPE_PROJECTION_TOPIC = "kickside.security.service:scope_projection.service"
M.RECONCILE_TOPIC = "reconcile"

-- Registry id namespace for projected custom scopes.
M.CUSTOM_SCOPE_NS = "kickside.security.scopes"

-- meta.managed_by marker the projection service stamps on every security.scope entry it
-- projects, so reconcile manages exactly its own entries (custom scopes AND
-- built-in-id overlays) without matching on id prefix.
M.MANAGED_BY = "kickside.security.scopes"

-- Registry entry whose meta.db_id holds the configured DB resource. The
-- target_db ns.requirement rewrites it per deployment.
M.DB_CONFIG = "kickside.security:db_config"

function M.db_id(): (string?, error?)
    local entry, read_err = registry.get(M.DB_CONFIG)
    if read_err then return nil, read_err end
    local id = entry and entry.meta and entry.meta.db_id
    if type(id) ~= "string" or id == "" then
        return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "Security database is unconfigured"}) :: error)
    end
    return id, nil
end

return M
