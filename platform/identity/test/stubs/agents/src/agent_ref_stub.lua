local M = {}

local prefix = "user_agent:"
M.USER_AGENT_PREFIX = prefix
M.USER_AGENT_NAMESPACE = "user_agent"

local function trim(value)
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

function M.user(component_id)
    return prefix .. trim(component_id)
end

function M.trim(value)
    return trim(value)
end

function M.is_user(ref)
    local raw = trim(ref)
    return raw:sub(1, #prefix) == prefix
end

function M.user_component_id(ref)
    local raw = trim(ref)
    if raw == "" then return nil end
    if raw:sub(1, #prefix) == prefix then
        local id = raw:sub(#prefix + 1)
        if id == "" then return nil end
        return id
    end
    if raw:find(":", 1, true) then return nil end
    return raw
end

function M.normalize(ref)
    local raw = trim(ref)
    if raw == "" then return "" end
    if raw:find(":", 1, true) then return raw end
    return M.user(raw)
end

return M
