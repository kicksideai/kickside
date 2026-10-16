local contract = require("contract")
local security = require("security")

local KB_REGISTRY = "kickside.knowledge:knowledge_bases"

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function handle(_: any): any
    local def, def_err = contract.get(KB_REGISTRY)
    if def_err or not def then
        return { success = false, error = "knowledge_bases contract unavailable: " .. tostring(def_err) }
    end

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return { success = false, error = "security actor and scope are required" }
    end

    local kb, open_err = def:with_actor(actor):with_scope(scope):open()
    if open_err or not kb then
        return { success = false, error = "knowledge_bases open failed: " .. tostring(open_err) }
    end

    local rows, list_err = kb:list({})
    if list_err then
        return { success = false, error = tostring(list_err) }
    end

    local items = {}
    for _, row in ipairs(rows or {}) do
        local meta = row.meta or {}
        local id = row.component_id or row.id
        if is_str(id) then
            items[#items + 1] = {
                id = id,
                title = meta.title or row.title or id,
                name = meta.title or row.name or id,
                description = meta.comment or "",
                kb_type = meta.kb_type or row.kb_type,
            }
        end
    end

    return { success = true, items = items, count = #items }
end

return { handle = handle }
