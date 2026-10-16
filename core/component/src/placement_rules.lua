local registry = require("registry")

type Rule = { parents: { string }, fixed: boolean }
local M = {}

local function invalid(binding: string, message: string): error
    return (errors.new({ kind = errors.INVALID,
        message = "placement declaration " .. binding .. ": " .. message,
        details = { reason = "placement_declaration", binding = binding } }) :: error)
end

function M.validate_binding(entry: any): (Rule?, error?)
    local meta = type(entry.meta) == "table" and entry.meta or {}
    local raw = meta.placement
    if raw == nil then return nil, nil end
    local binding = tostring(entry.id)
    if entry.kind ~= "contract.binding" or type(raw) ~= "table" then
        return nil, invalid(binding, "placement belongs on a component kind binding and must be an object")
    end
    if type(raw.parents) ~= "table" or #raw.parents == 0 then
        return nil, invalid(binding, "parents must be a non-empty array of kind ids or root")
    end
    local parents: { string } = {}
    local parent_count = 0
    for key, value in pairs(raw.parents) do
        if type(key) ~= "number" or key % 1 ~= 0 or key < 1 or key > #raw.parents
            or type(value) ~= "string" or value == "" then
            return nil, invalid(binding, "parents must be a dense array of kind ids or root")
        end
        parent_count = parent_count + 1
    end
    if parent_count ~= #raw.parents then
        return nil, invalid(binding, "parents must be a dense array of kind ids or root")
    end
    for _, id in ipairs(raw.parents) do
        if id ~= "root" then
            local parent, lookup_err = registry.get(id)
            if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then return nil, lookup_err end
            if not parent or parent.kind ~= "contract.binding" then
                return nil, invalid(binding, "unknown parent kind " .. id)
            end
        end
        parents[#parents + 1] = id
    end
    if raw.fixed ~= nil and type(raw.fixed) ~= "boolean" then
        return nil, invalid(binding, "fixed must be a boolean")
    end
    return { parents = parents, fixed = raw.fixed == true }, nil
end

function M.for_impl(impl_id: string): (Rule?, error?)
    local entry, lookup_err = registry.get(impl_id)
    if lookup_err and not errors.is(lookup_err, errors.NOT_FOUND) then return nil, lookup_err end
    if not entry then return nil, nil end
    return M.validate_binding(entry)
end

function M.check(rule: Rule?, kind: string, parent_kind: string, parent_changed: boolean): error?
    if not rule then return nil end
    if rule.fixed and parent_changed then
        return (errors.new({ kind = errors.INVALID, message = "component " .. kind .. " has a fixed parent",
            details = { reason = "placement_fixed", kind = kind } }) :: error)
    end
    for _, allowed in ipairs(rule.parents) do
        if allowed == parent_kind then return nil end
    end
    return (errors.new({ kind = errors.INVALID,
        message = "component " .. kind .. " cannot be placed under " .. parent_kind .. "; allowed parents: " .. table.concat(rule.parents, ", "),
        details = { reason = "placement", kind = kind, parent_kind = parent_kind } }) :: error)
end

function M.run(): (any?, error?)
    local entries, find_err = registry.find({ [".kind"] = "contract.binding" })
    if find_err then return nil, find_err end
    for _, entry in ipairs(entries or {}) do
        local _, validation_err = M.validate_binding(entry)
        if validation_err then return nil, validation_err end
    end
    return { status = "success", message = "component placement declarations validate" }, nil
end

return M
