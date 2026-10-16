local M = {}

local prefix = "user_agent:"

local function trim(value)
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
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

return M
