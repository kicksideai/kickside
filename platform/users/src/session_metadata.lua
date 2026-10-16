local M = {}

local RESERVED_METADATA = {
    user_id = true, email = true, full_name = true, status = true,
    security_groups = true, login_time = true, scope_id = true, scope_used = true,
    created_at = true, is_admin = true,
    principal = true, authorized_by = true, component_id = true, execution_root = true,
    authority_epochs = true,
    credential_id = true, link_id = true, execution_identity = true,
    _execution_identity = true, inherited_identity = true,
}

function M.merge(destination, extra)
    if type(extra) ~= "table" then return end
    for key, value in pairs(extra) do
        if not RESERVED_METADATA[key] then destination[key] = value end
    end
end

function M.actor(user, authority_epochs, scope_id, groups, login_time, extra)
    local metadata = {
        authority_epochs = authority_epochs,
        user_id = user.user_id,
        email = user.email,
        full_name = user.full_name,
        status = user.status,
        security_groups = groups,
        scope_id = scope_id,
        login_time = login_time,
    }
    M.merge(metadata, extra)
    return metadata
end

return M
