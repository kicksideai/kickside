-- Minimal JSON-schema instance validator for the transform generation gate.
--
-- Supported keywords: type (object/array/string/number/integer/boolean),
-- properties, required, items, enum. Declared fields are enforced; anything the
-- schema does not mention is left alone (additionalProperties is effectively
-- true). This is the same keyword subset the runtime's other instance validators
-- (keeper.mcp.surface:validate, keeper.state.patch:validate) support; it is kept
-- local here so the transform library stays free of a cross-module dependency and
-- the gate runs in the standalone transform harness.
--
-- check(value, schema) -> err | nil. A sink input_schema is a JSON string in the
-- registry; check decodes it first so callers pass the raw schema through.

local json = require("json")

local M = {}

type Map = { [string]: any }

local function type_name(v: any): string
    local t = type(v)
    if t == "table" then
        if next(v) == nil then return "object" end
        if type(next(v)) == "number" then return "array" end
        return "object"
    end
    return t
end
M.type_name = type_name

local function check_type(value: any, expected: string, path: string): string?
    if expected == "object" then
        if type(value) ~= "table" then return path .. " must be object, got " .. type_name(value) end
    elseif expected == "array" then
        if type(value) ~= "table" then return path .. " must be array, got " .. type_name(value) end
    elseif expected == "string" then
        if type(value) ~= "string" then return path .. " must be string, got " .. type_name(value) end
    elseif expected == "number" then
        if type(value) ~= "number" then return path .. " must be number, got " .. type_name(value) end
    elseif expected == "integer" then
        if type(value) ~= "number" or math.floor(value :: number) ~= value then
            return path .. " must be integer, got " .. type_name(value)
        end
    elseif expected == "boolean" then
        if type(value) ~= "boolean" then return path .. " must be boolean, got " .. type_name(value) end
    end
    return nil
end

local function validate_node(value: any, schema: any, path: string): string?
    if type(schema) ~= "table" then return nil end
    local s = schema :: Map

    local expected = s.type
    if type(expected) == "string" then
        local err = check_type(value, expected :: string, path)
        if err then return err end
    end

    if type(s.enum) == "table" then
        local ok = false
        for _, allowed in ipairs(s.enum :: {any}) do
            if value == allowed then ok = true; break end
        end
        if not ok then return path .. " must be one of the allowed values" end
    end

    if expected == "object" and type(value) == "table" then
        if type(s.required) == "table" then
            for _, req in ipairs(s.required :: {any}) do
                if (value :: Map)[req] == nil then
                    return path .. "." .. tostring(req) .. " is required"
                end
            end
        end
        if type(s.properties) == "table" then
            for key, prop in pairs(s.properties :: Map) do
                if (value :: Map)[key] ~= nil then
                    local err = validate_node((value :: Map)[key], prop, path .. "." .. tostring(key))
                    if err then return err end
                end
            end
        end
    end

    if expected == "array" and type(value) == "table" then
        if s.items then
            for i, item in ipairs(value :: {any}) do
                local err = validate_node(item, s.items, path .. "[" .. i .. "]")
                if err then return err end
            end
        end
    end

    return nil
end
M.validate_node = validate_node

-- check(value, schema) -> err | nil. schema may be a decoded table or a JSON
-- string (the form sink input_schema is declared in). nil/empty schema accepts
-- any value.
function M.check(value: any, schema: any): string?
    local decoded: any = schema
    if type(schema) == "string" then
        if (schema :: string) == "" then return nil end
        local d, derr = json.decode(schema :: string)
        if derr then return "invalid schema: " .. tostring(derr) end
        decoded = d
    end
    if type(decoded) ~= "table" then return nil end
    return validate_node(value, decoded, "output")
end

return M
