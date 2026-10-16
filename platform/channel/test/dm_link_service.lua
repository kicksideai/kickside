local M = {}

function M.resolve_link(provider, external_id)
    if provider ~= "discord" or external_id ~= "ext-1" then return nil, nil end
    return { link_id = "link-1", user_id = "linked-1", default_agent_id = "" }, nil
end

function M.verify_and_link(_code, _provider, _external_id, _display_name)
    return "linked-1", nil
end

return M
