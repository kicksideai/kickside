local M = {}

local RESERVED_METADATA = {
    user_id = true, email = true, full_name = true, status = true,
    security_groups = true, login_time = true, scope_id = true, scope_used = true,
    created_at = true, is_admin = true,
    principal = true, authorized_by = true, component_id = true, execution_root = true,
    authority_epochs = true, session = true, ip_address = true, user_agent = true,
    credential_id = true, link_id = true, execution_identity = true,
    _execution_identity = true, inherited_identity = true,
}

-- Facts about one sign-in. They live only under `session`: relay compares the
-- rest of the actor metadata to decide whether a connection keeps its user hub,
-- so a fact that differs per sign-in must never reach the top level.
local SESSION_FACTS = {"login_time", "ip_address", "user_agent", "auth_method", "sso_provider"}
local SESSION_FACT = {}
for _, key in ipairs(SESSION_FACTS) do SESSION_FACT[key] = true end

function M.merge(destination, extra, skip)
    if type(extra) ~= "table" then return end
    for key, value in pairs(extra) do
        if not RESERVED_METADATA[key] and not (skip and skip[key]) then destination[key] = value end
    end
end

function M.actor(user, authority_epochs, scope_id, groups, session_context, extra)
    session_context = type(session_context) == "table" and session_context or {}
    local session = {}
    for _, key in ipairs(SESSION_FACTS) do session[key] = session_context[key] end
    local metadata = {
        authority_epochs = authority_epochs,
        user_id = user.user_id,
        email = user.email,
        full_name = user.full_name,
        status = user.status,
        security_groups = groups,
        scope_id = scope_id,
        session = session,
    }
    M.merge(metadata, extra, SESSION_FACT)
    return metadata
end

return M
