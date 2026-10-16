-- DB binding + shared type surface for kickside.mcp. The persist layer reads
-- db_id() so a target_db rebind reaches it; the rest are the row/result shapes the
-- repo, dispatcher, and api speak.

local registry = require("registry")

local M = {}

-- Registry entry whose meta.db_id holds the configured MCP database resource. The
-- target_db ns.requirement rewrites that field per deployment.
M.DB_CONFIG = "kickside.mcp:db_config"

-- Resolve the configured DB id written by the target_db requirement.
function M.db_id(): string
    local entry = select(1, registry.get(M.DB_CONFIG)) :: any
    return entry.meta.db_id :: string
end

-- A stored credential row as the repo reads it back (token_hash excluded from
-- callers; never leaves the persist layer).
type Credential = {
    credential_id: string,
    token_prefix: string,
    actor_id: string,
    whitelist_component_ids: { string },
    label: string,
    status: string,
    policy: { [string]: any },
    context: { [string]: any },
    expires_at: integer?,
    created_at: integer,
    updated_at: integer,
    last_used_at: integer?,
}

-- The resolved principal a bearer token maps to, handed to the dispatcher. It runs
-- as actor_id; whitelist_prefixes (nil = whole actor tree, {} = deny-all) ride
-- in the actor's access_filter to confine it.
type Principal = {
    credential_id: string,
    actor_id: string,
    whitelist_component_ids: { string },
    whitelist_prefixes: { string }?,
    allowed_tool_ids: { [string]: boolean },
    context: { [string]: any },
}

M.Credential = Credential
M.Principal = Principal

return M
