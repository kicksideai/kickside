-- The one canonical JSON codec every KickSide hash and digest encodes through
-- (OWNERSHIP A28.7): declaration hashes, control and identity digests, prepared
-- payload hashes and Flow artifact checksums. Object keys are sorted at every
-- depth, so the text is independent of Lua's insertion and hash order; a table
-- whose keys are exactly 1..n, including an unmarked empty table, is an array (Wippy's
-- JSON wire contract). Explicit empty objects retain their map shape.
-- Object keys must be strings; cycles and nesting beyond
-- MAX_DEPTH are refused.
--
--   encode(value) -> (text?, err?)
--   hash(value)   -> (lowercase sha256 hex of encode(value)?, err?)

local json = require("json")
local hash = require("hash")

local M = {}

M.MAX_DEPTH = 128

type Map = { [string]: any }

local function invalid(message: string): error
    return (errors.new({ message = "canonical JSON: " .. message, kind = errors.INVALID, retryable = false }) :: error)
end

-- Wippy's encoder uses map capacity to distinguish {} from []. Keep this
-- convention in one place for persistence and response boundaries.
function M.object(value: any): any
    if type(value) ~= "table" or next(value) == nil then return table.create(0, 1) end
    return value
end

local SCHEMA_MAP_KEYS: { [string]: boolean } = {
    properties = true, patternProperties = true, definitions = true,
    ["$defs"] = true, dependentSchemas = true,
}
local SCHEMA_ARRAY_KEYS: { [string]: boolean } = {
    allOf = true, anyOf = true, oneOf = true, prefixItems = true,
}
local SCHEMA_SINGLE_KEYS: { [string]: boolean } = {
    additionalProperties = true, unevaluatedProperties = true,
    additionalItems = true, unevaluatedItems = true, contains = true,
    propertyNames = true, ["not"] = true, ["if"] = true,
    ["then"] = true, ["else"] = true, contentSchema = true,
}

-- Normalize only schema-bearing positions. Annotation values (default, const,
-- enum, examples and extensions) retain their declared JSON data shape.
function M.normalize_schema(value: any): any
    if type(value) ~= "table" then return value end
    local out: Map = M.object({}) :: Map
    for key, item in pairs(value :: Map) do
        if SCHEMA_MAP_KEYS[key] and type(item) == "table" then
            local map: Map = M.object({}) :: Map
            for name, schema in pairs(item :: Map) do map[name] = M.normalize_schema(schema) end
            out[key] = map
        elseif SCHEMA_ARRAY_KEYS[key] and type(item) == "table" then
            local list: { any } = {}
            for i, schema in ipairs(item :: { any }) do list[i] = M.normalize_schema(schema) end
            out[key] = list
        elseif key == "items" and type(item) == "table" then
            if #(item :: { any }) > 0 then
                local list: { any } = {}
                for i, schema in ipairs(item :: { any }) do list[i] = M.normalize_schema(schema) end
                out[key] = list
            else
                out[key] = M.normalize_schema(item)
            end
        elseif SCHEMA_SINGLE_KEYS[key] then
            out[key] = M.normalize_schema(item)
        elseif (key == "required" or key == "enum" or key == "examples" or key == "type")
            and type(item) == "table" and next(item) == nil then
            out[key] = {}
        else
            out[key] = item
        end
    end
    return out
end

local function is_array(value: Map): boolean
    local count, highest = 0, 0
    for key, _ in pairs(value) do
        if type(key) ~= "number" or key < 1 or math.floor(key) ~= key then return false end
        count = count + 1
        if key > highest then highest = key end
    end
    if count == 0 then return json.encode(value) ~= "{}" end
    return count == highest
end

local function scalar(value: any): (string?, error?)
    local encoded, err = json.encode(value)
    if err then return nil, errors.wrap(err, "canonical JSON: value is not valid JSON") end
    if type(encoded) ~= "string" then
        return nil, errors.new({message = "canonical JSON: invalid encoder response", kind = errors.INTERNAL,
            retryable = false, details = {code = "canonical_dependency_response", field = "json.encode"}})
    end
    return encoded :: string, nil
end

local function encode_value(value: any, active: { [any]: boolean }, depth: integer): (string?, error?)
    if type(value) ~= "table" then return scalar(value) end
    if depth > M.MAX_DEPTH then return nil, invalid("value exceeds the nesting limit of " .. tostring(M.MAX_DEPTH)) end
    if active[value] then return nil, invalid("a cyclic table is not JSON") end
    active[value] = true
    local t = value :: Map
    local parts: { string } = {}
    if is_array(t) then
        for index = 1, #(t :: { any }) do
            local encoded, err = encode_value((t :: any)[index], active, depth + 1)
            if err then active[value] = nil; return nil, err end
            parts[#parts + 1] = encoded :: string
        end
        active[value] = nil
        return "[" .. table.concat(parts, ",") .. "]", nil
    end
    local keys: { string } = {}
    for key, _ in pairs(t) do
        if type(key) ~= "string" then active[value] = nil; return nil, invalid("object keys must be strings") end
        keys[#keys + 1] = key
    end
    table.sort(keys)
    for _, key in ipairs(keys) do
        local encoded_key, key_err = scalar(key)
        if key_err then active[value] = nil; return nil, key_err end
        local encoded, err = encode_value(t[key], active, depth + 1)
        if err then active[value] = nil; return nil, err end
        parts[#parts + 1] = (encoded_key :: string) .. ":" .. (encoded :: string)
    end
    active[value] = nil
    return "{" .. table.concat(parts, ",") .. "}", nil
end

function M.encode(value: any): (string?, error?)
    return encode_value(value, {}, 1)
end

function M.hash(value: any): (string?, error?)
    local text, err = M.encode(value)
    if err or not text then return nil, err end
    local digest, digest_err = hash.sha256(text :: string)
    if digest_err then return nil, errors.wrap(digest_err, "canonical JSON: sha256 failed") end
    if type(digest) ~= "string" or #(digest :: string) ~= 64 then
        return nil, errors.new({message = "canonical JSON: invalid sha256 response", kind = errors.INTERNAL,
            retryable = false, details = {code = "canonical_dependency_response", field = "hash.sha256"}})
    end
    return (digest :: string):lower(), nil
end

return M
