local types = require("types")
local json = require("json")
local M = {}

function M.json(value: unknown, depth: number?): boolean
    local level = depth or 0
    if level > 32 then return false end
    if value == nil or type(value) == "boolean" then return true end
    if type(value) == "number" then return value == value and value ~= math.huge and value ~= -math.huge end
    if type(value) == "string" then return #value <= 12582912 end
    if type(value) ~= "table" then return false end
    local numeric, named = 0, 0
    for key, child in pairs(value) do
        if type(key) ~= "string" and type(key) ~= "number" then return false end
        if type(key) == "number" then
            if key < 1 or key ~= math.floor(key) then return false end
            numeric = numeric + 1
        else named = named + 1 end
        if not M.json(child, level + 1) then return false end
    end
    if numeric > 0 and (named > 0 or numeric ~= #value) then return false end
    return true
end

-- Lua represents an empty map and an empty list with the same table shape.
-- Use the operation schema to retain [] for fields such as labelIds/children.
-- Explicit, schema-allowlisted clear_fields become JSON null at the wire.
function M.encode(value: unknown, definition: types.Schema?, nulls: unknown?): string
    if nulls == true then return "null" end
    if type(value) ~= "table" then return json.encode(value) :: string end
    local record = value :: types.Object
    local is_array = definition and definition.type == "array" or #value > 0
    if is_array then
        local parts: {string} = {}
        for _, child in ipairs(value :: {unknown}) do
            parts[#parts + 1] = M.encode(child, definition and definition.items)
        end
        return "[" .. table.concat(parts, ",") .. "]"
    end
    local names: {string} = {}
    local selected: { [string]: boolean } = {}
    for key in pairs(record) do names[#names + 1] = key; selected[key] = true end
    if type(nulls) == "table" then
        for key in pairs(nulls) do if not selected[key] then names[#names + 1] = key end end
    end
    table.sort(names)
    local parts: {string} = {}
    for _, key in ipairs(names) do
        parts[#parts + 1] = (json.encode(key) :: string) .. ":" .. M.encode(record[key],
            definition and definition.properties and definition.properties[key],
            type(nulls) == "table" and (nulls :: types.Object)[key] or nil)
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

-- The supported subset is intentionally shared with the published tool schemas.
-- Reject unknown fields before resolving credentials or issuing an HTTP request.
function M.validate(value: unknown, schema: types.Schema, path: string?, depth: number?): string?
    local location = path or "params"
    local level = depth or 0
    if level > 32 then return location .. " exceeds the nesting limit" end
    local kind = schema.type
    if kind == "object" then
        if type(value) ~= "table" then return location .. " must be an object" end
        local record = value :: types.Object
        for key in pairs(record) do
            if type(key) ~= "string" then return location .. " must use string keys" end
            local child = schema.properties and schema.properties[key]
            if child then
                local err = M.validate(record[key], child, location .. "." .. key, level + 1)
                if err then return err end
            elseif schema.additionalProperties == false then return location .. ": unexpected field " .. key end
        end
        for _, key in ipairs(schema.required or {}) do
            if record[key] == nil then return location .. "." .. key .. " is required" end
        end
    elseif kind == "array" then
        if type(value) ~= "table" then return location .. " must be an array" end
        local list = value :: { unknown }
        local count = 0
        for key in pairs(list) do
            count = count + 1
            if type(key) ~= "number" or key < 1 or key ~= math.floor(key) or key > #list then
                return location .. " must be a dense array"
            end
        end
        if count ~= #list then return location .. " must be a dense array" end
        if schema.minItems and #list < schema.minItems then return location .. " has too few items" end
        if schema.maxItems and #list > schema.maxItems then return location .. " has too many items" end
        if schema.items then
            for index, child in ipairs(list) do
                local err = M.validate(child, schema.items, location .. "[" .. tostring(index) .. "]", level + 1)
                if err then return err end
            end
        end
    elseif kind == "string" then
        if type(value) ~= "string" then return location .. " must be a string" end
        if schema.minLength and #value < schema.minLength then return location .. " is too short" end
        if schema.maxLength and #value > schema.maxLength then return location .. " is too long" end
    elseif kind == "integer" or kind == "number" then
        if type(value) ~= "number" or value ~= value or value == math.huge or value == -math.huge then
            return location .. " must be a finite number"
        end
        if kind == "integer" and value ~= math.floor(value) then return location .. " must be an integer" end
        if schema.minimum and value < schema.minimum then return location .. " is below the minimum" end
        if schema.maximum and value > schema.maximum then return location .. " exceeds the maximum" end
    elseif kind == "boolean" and type(value) ~= "boolean" then return location .. " must be a boolean" end
    if schema.enum then
        for _, allowed in ipairs(schema.enum) do if value == allowed then return nil end end
        return location .. " has an unsupported value"
    end
    return nil
end
return M
