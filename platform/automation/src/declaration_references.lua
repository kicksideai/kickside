-- Resolve only resource fields explicitly declared by a kind's input schema.
-- The result is stable JSON data suitable for a durable command record.
local canonical_json = require("canonical_json")

local M = {}

local KINDS = { component = true, connection = true, thread = true,
    agent = true, trait = true, ["function"] = true, model = true, flow = true, module = true, contract = true }

local function invalid(message: string): error
    return (errors.new({ message = message, kind = errors.INVALID, retryable = false,
        details = { error_kind = "declaration" } }) :: error)
end

local function walk(schema: any, value: any, path: string, result: { any }): error?
    if type(schema) ~= "table" then return invalid("invalid reference schema at " .. path) end
    local annotation = schema["x-reference"]
    if annotation ~= nil then
        if type(annotation) ~= "table" or KINDS[annotation.kind] ~= true
            or type(annotation.access) ~= "string" or annotation.access == "" then
            return invalid("invalid x-reference at " .. path)
        end
        if schema.type ~= "string" then return invalid("x-reference must annotate a string id at " .. path) end
        if value ~= nil then
            if type(value) ~= "string" or value == "" then
                return invalid("invalid reference id at " .. path)
            end
            result[#result + 1] = { path = path, kind = annotation.kind, id = value, access = annotation.access }
        end
        return nil
    end
    if schema.type == "array" then
        local item_schema = schema.items
        if item_schema ~= nil then
            local schema_err = walk(item_schema, nil, path .. "[*]", result)
            if schema_err then return schema_err end
        end
        if value == nil then return nil end
        if type(value) ~= "table" then return invalid("reference array expected at " .. path) end
        if item_schema ~= nil then
            local count, max = 0, 0
            for key in pairs(value) do
                if type(key) ~= "number" or key < 1 or key ~= math.floor(key) then
                    return invalid("reference array is not dense at " .. path)
                end
                count = count + 1
                if key > max then max = key end
            end
            if max ~= count then return invalid("reference array is not dense at " .. path) end
            for i, item in ipairs(value) do
                local err = walk(item_schema, item, path .. "[" .. tostring(i) .. "]", result)
                if err then return err end
            end
        end
    elseif schema.type == "object" then
        if value ~= nil and type(value) ~= "table" then return invalid("reference object expected at " .. path) end
        local properties = schema.properties
        if properties ~= nil then
            if type(properties) ~= "table" then return invalid("invalid properties at " .. path) end
            local names: { string } = {}
            for name in pairs(properties) do
                if type(name) ~= "string" then return invalid("invalid property name at " .. path) end
                names[#names + 1] = name
            end
            table.sort(names)
            for _, name in ipairs(names) do
                local child = value and value[name] or nil
                local err = walk(properties[name], child, path == "" and name or path .. "." .. name, result)
                if err then return err end
            end
        end
    end
    return nil
end

local function field(value: any, key: any): any
    if type(value) == "table" then return value[key] end
    return nil
end

-- Compare marked values against the protected declaration, including removal
-- of an enclosing object or array item. Opaque objects compare as whole values.
local function authority_change(schema: any, previous: any, current: any, path: string): (string?, error?)
    if type(schema) ~= "table" then return nil, nil end
    if schema["x-authority"] ~= nil then
        if schema["x-authority"] ~= "subject" then return nil, invalid("invalid x-authority at " .. path) end
        local before, before_err = canonical_json.encode(previous)
        if before_err then return nil, before_err end
        local after, after_err = canonical_json.encode(current)
        if after_err then return nil, after_err end
        if before ~= after then return path, nil end
        return nil, nil
    end
    if schema.type == "object" then
        for name, child in pairs(schema.properties or {}) do
            local changed, err = authority_change(child, field(previous, name), field(current, name),
                path == "" and name or path .. "." .. name)
            if changed or err then return changed, err end
        end
    elseif schema.type == "array" and schema.items ~= nil then
        local count = math.max(type(previous) == "table" and #previous or 0,
            type(current) == "table" and #current or 0)
        for i = 1, count do
            local changed, err = authority_change(schema.items, field(previous, i), field(current, i),
                path .. "[" .. tostring(i) .. "]")
            if changed or err then return changed, err end
        end
    end
    return nil, nil
end

-- Both admission and the trusted writer enforce the same schema policy.
function M.validate_edit(schema: any, previous: any, current: any, operator_id: string, subject_id: string): error?
    if operator_id == subject_id then return nil end
    local changed, err = authority_change(schema, previous, current, "")
    if err then return err end
    if changed then
        return (errors.new({ message = "only the execution subject may change authority-bearing field " .. changed,
            kind = errors.PERMISSION_DENIED, retryable = false, details = { error_kind = "access" } }) :: error)
    end
    return nil
end

function M.collect(schema: any, declaration: any): ({ any }?, error?)
    if type(declaration) ~= "table" then return nil, invalid("declaration must be an object") end
    -- A kind without an input schema declares no authority-bearing fields.
    if schema == nil then return {}, nil end
    if type(schema) ~= "table" then return nil, invalid("kind input schema must be an object") end
    local result: { any } = {}
    local err = walk(schema, declaration, "", result)
    if err then return nil, err end
    return result, nil
end

-- An edit retains existing resource authority; the operator needs grants for
-- newly introduced resources/capabilities. The execution subject rechecks all.
function M.added(current: { any }, previous: { any }): { any }
    local added: { any } = {}
    for _, ref in ipairs(current) do
        local retained = false
        for _, old in ipairs(previous) do
            if old.kind == ref.kind and old.id == ref.id and old.access == ref.access then
                retained = true
                break
            end
        end
        if not retained then added[#added + 1] = ref end
    end
    return added
end

return M
