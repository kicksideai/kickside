local registry = require("registry")

local M = {}

type Map = { [string]: any }

local TRAIT_TYPE = "agent.trait"

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return ((value :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

local function description_of(meta: Map): string
    local desc = trim(meta.llm_description)
    if desc ~= "" then return desc end
    desc = trim(meta.comment)
    if desc ~= "" then return desc end
    return trim(meta.name)
end

local function context_schema_of(meta: Map): Map?
    if type(meta.context_schema) == "table" then return meta.context_schema :: Map end
    return nil
end

local function find_traits(deps: any): (any, any?)
    local find = type(deps) == "table" and (deps :: Map).find or nil
    if type(find) == "function" then
        return (find :: any)({
            [".kind"] = "registry.entry",
            ["meta.type"] = TRAIT_TYPE,
        })
    end
    return registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = TRAIT_TYPE,
    })
end

-- traits() is a composer catalog projection. It returns rows:
-- { id, title, description, context_schema? }.
function M.traits(_args: any, deps: any): (any, any?)
    local entries, err = find_traits(deps)
    if err then return nil, "registry.find traits: " .. tostring(err) end
    local rows: { any } = {}
    for _, entry in ipairs((entries or {}) :: { any }) do
        local meta = type((entry :: Map).meta) == "table" and ((entry :: Map).meta :: Map) or {}
        if meta.public == true and meta.private ~= true then
            local id = trim((entry :: Map).id)
            if id ~= "" then
                local row: Map = {
                    id = id,
                    title = trim(meta.title) ~= "" and trim(meta.title) or id,
                    description = description_of(meta),
                }
                local context_schema = context_schema_of(meta)
                if context_schema then row.context_schema = context_schema end
                rows[#rows + 1] = row
            end
        end
    end
    table.sort(rows, function(a: any, b: any): boolean
        local at = tostring((a :: Map).title or "")
        local bt = tostring((b :: Map).title or "")
        if at ~= bt then return at < bt end
        return tostring((a :: Map).id or "") < tostring((b :: Map).id or "")
    end)
    return rows, nil
end

return M
