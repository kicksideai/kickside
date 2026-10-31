local tool_visibility = require("tool_visibility")

local M = {}

local RULES = {
    trait = { kind = "registry.entry", meta_type = "agent.trait" },
    tool = { kind = "function.lua", meta_type = "tool" },
}

local function rule_for(capability_type: string): any
    return RULES[capability_type]
end

function M.entry_is_public_trait(entry: any): boolean
    if type(entry) ~= "table" then return false end
    local meta = entry.meta
    return entry.kind == "registry.entry"
        and type(meta) == "table"
        and meta.type == "agent.trait"
        and tool_visibility.meta_is_public(meta)
end

function M.entry_is_public_capability(entry: any, capability_type: string): boolean
    if capability_type == "tool" then
        return tool_visibility.entry_is_public_tool(entry)
    end
    if capability_type == "trait" then
        return M.entry_is_public_trait(entry)
    end
    return false
end

local function invalid(message: string): error
    return (errors.new({kind = errors.INVALID, message = message}) :: error)
end

function M.validate_ids(ids: any, capability_type: string, get_entry: any): (boolean, error?)
    local rule = rule_for(capability_type)
    if not rule then
        return false, invalid("unsupported capability type: " .. tostring(capability_type))
    end
    if ids == nil then return true, nil end
    if type(ids) ~= "table" then
        return false, invalid(capability_type .. " ids must be an array")
    end
    if type(get_entry) ~= "function" then
        return false, invalid("capability registry getter is unavailable")
    end

    for _, id in ipairs(ids) do
        if type(id) ~= "string" or id == "" then
            return false, invalid(capability_type .. " id must be a non-empty string")
        end

        local entry, err = get_entry(id)
        if err and not errors.is(err, errors.NOT_FOUND) then
            return false, errors.wrap(err, "capability registry read failed: " .. id)
        end
        if err or not entry then
            return false, invalid(capability_type .. " not found: " .. id)
        end

        local meta = type(entry.meta) == "table" and entry.meta or {}
        if entry.kind ~= rule.kind or meta.type ~= rule.meta_type then
            return false, invalid(capability_type .. " has invalid registry shape: " .. id)
        end
        if not M.entry_is_public_capability(entry, capability_type) then
            return false, invalid(capability_type .. " is not public: " .. id)
        end
    end

    return true, nil
end

return M
