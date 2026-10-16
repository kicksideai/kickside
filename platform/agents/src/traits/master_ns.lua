-- Namespace allow-list for the master agent traits. A master is configured with a
-- `namespaces` list (in its trait context) that bounds which agents or traits it
-- may reach. The list is matched against the namespace of an id -- the part before
-- the last ':' (so "kickside.agents.traits:trait_curator" -> "kickside.agents.traits",
-- and a user agent "user_agent:<uuid>" -> "user_agent"). An entry matches a namespace
-- exactly or as a dotted prefix ("kickside" allows "kickside.agents.traits"). An
-- empty list, or one containing "*", means unrestricted.

local M = {}

local function parse(v: any): { string }
    local out: { string } = {}
    if type(v) == "table" then
        for _, n in ipairs(v :: { any }) do
            if type(n) == "string" and (n :: string) ~= "" then out[#out + 1] = n :: string end
        end
    elseif type(v) == "string" then
        for n in string.gmatch(v :: string, "[^,%s]+") do out[#out + 1] = n end
    end
    return out
end

-- The namespace of a registry/agent id: everything before the last ':'.
function M.namespace_of(id: any): string
    if type(id) ~= "string" or (id :: string) == "" then return "" end
    local s = id :: string
    local cut = nil
    for i = #s, 1, -1 do
        if s:sub(i, i) == ":" then cut = i; break end
    end
    if not cut then return "" end
    return s:sub(1, cut - 1)
end

-- Is `id` within the configured namespace allow-list? Unconfigured (empty) or a
-- "*" entry allows everything. Otherwise the id's namespace must match an entry
-- exactly or under it as a dotted prefix.
function M.allowed(namespaces: any, id: any): boolean
    local list = parse(namespaces)
    if #list == 0 then return true end
    for _, n in ipairs(list) do
        if n == "*" then return true end
    end
    local ns = M.namespace_of(id)
    if ns == "" then return false end
    for _, n in ipairs(list) do
        if ns == n or ns:sub(1, #n + 1) == (n .. ".") then return true end
    end
    return false
end

-- A human-readable summary of the configured scope for the prompt.
function M.describe(namespaces: any): string
    local list = parse(namespaces)
    if #list == 0 then return "all namespaces" end
    for _, n in ipairs(list) do
        if n == "*" then return "all namespaces" end
    end
    return table.concat(list, ", ")
end

return M
