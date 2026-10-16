-- Resolve only resource fields explicitly declared by a kind's input schema.
-- The result is stable JSON data suitable for a durable command record.
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
