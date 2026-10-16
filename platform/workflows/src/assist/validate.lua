-- Schema and expression validation used by assist entry points.
type Map = { [string]: any }
type ValidateAssist = {
    validate_transform: (any, any, any, any?) -> string?,
    validate_schema: (any) -> string?,
    assist_schema: (any, any?) -> Map,
}
return function(I: any): ValidateAssist
local M: Map = {}
local trim, unfence, decode_schema = I.trim, I.unfence, I.decode_schema
local is_array_like, schema_type = I.is_array_like, I.schema_type
local example_of, validate_node = I.example_of, I.validate_node
local expr, mapping, json, schema_json = I.expr, I.mapping, I.json, I.schema_json
local JSON_SCHEMA_TYPES = I.JSON_SCHEMA_TYPES
local default_schema_generate, ASSIST_UNAVAILABLE = I.default_schema_generate, I.ASSIST_UNAVAILABLE
local function validate_condition_predicate(predicate: any, upstream_schema: any, upstream_sample: any): string?
    local text = unfence(trim(predicate))
    if text == "" then return "generated condition was empty" end
    local sample = upstream_sample
    if sample == nil and type(upstream_schema) == "table" then sample = example_of(upstream_schema) end
    if sample == nil then sample = {} end
    local result, err = expr.eval(text, { output = sample })
    if err then return "generated condition is not valid expr-lang: " .. tostring(err) end
    if type(result) ~= "boolean" then return "generated condition must evaluate to true or false" end
    return nil
end

function M.validate_transform(transform: any, upstream_schema: any, downstream_schema: any, upstream_sample: any?): string?
    local source = decode_schema(upstream_schema)
    local target = decode_schema(downstream_schema)
    local text = unfence(trim(transform))
    if text == "" then return "generated transform was empty" end

    local sample = upstream_sample
    if sample == nil and type(source) == "table" then sample = example_of(source) end
    if sample == nil then sample = {} end
    local engine_text, lowering_err = mapping.engine_expr(text)
    if lowering_err or type(engine_text) ~= "string" then
        return "generated transform cannot be lowered for the engine: " .. tostring(lowering_err or "empty transform")
    end
    local out, err = expr.eval(engine_text, { output = sample })
    if err then return "generated transform is not valid expr-lang: " .. tostring(err) end
    if out == nil then return "generated transform produced no downstream input" end
    if type(target) == "table" then
        local verr = validate_node(out, target, "input")
        if verr then return "generated transform does not match downstream schema: " .. tostring(verr) end
    end
    return nil
end

local function is_array_table(value: any): boolean
    return type(value) == "table" and (next(value :: Map) == nil or is_array_like(value))
end

local validate_schema_node: (any, string) -> string?

local function validate_type_keyword(value: any, path: string): string?
    if type(value) == "string" then
        if not JSON_SCHEMA_TYPES[value :: string] then return path .. " has unknown type: " .. tostring(value) end
        return nil
    end
    if not is_array_table(value) then return path .. " must be a string or array of strings" end
    local seen: { [string]: boolean } = {}
    for _, item in ipairs(value :: { any }) do
        local typ = type(item) == "string" and (item :: string) or ""
        if typ == "" or not JSON_SCHEMA_TYPES[typ] then
            return path .. " contains an unknown type: " .. tostring(item)
        end
        if seen[typ] then return path .. " repeats type: " .. tostring(item) end
        seen[typ] = true
    end
    return nil
end

local function validate_schema_array(value: any, path: string): string?
    if not is_array_table(value) then return path .. " must be an array" end
    for i, item in ipairs(value :: { any }) do
        local err = validate_schema_node(item, path .. "[" .. tostring(i) .. "]")
        if err then return err end
    end
    return nil
end

local function validate_schema_map(value: any, path: string): string?
    if type(value) ~= "table" or is_array_like(value) then return path .. " must be an object" end
    for key, item in pairs(value :: Map) do
        if type(key) ~= "string" or key == "" then return path .. " keys must be non-empty strings" end
        local err = validate_schema_node(item, path .. "." .. tostring(key))
        if err then return err end
    end
    return nil
end

local function validate_required(value: any, path: string): string?
    if not is_array_table(value) then return path .. " must be an array of strings" end
    local seen: { [string]: boolean } = {}
    for _, item in ipairs(value :: { any }) do
        if type(item) ~= "string" or item == "" then return path .. " entries must be non-empty strings" end
        local key = item :: string
        if seen[key] then return path .. " repeats field: " .. tostring(item) end
        seen[key] = true
    end
    return nil
end

validate_schema_node = function(node: any, path: string): string?
    if type(node) ~= "table" or is_array_like(node) then return path .. " must be a JSON Schema object" end
    local n = node :: Map
    if n.type ~= nil then
        local terr = validate_type_keyword(n.type, path .. ".type")
        if terr then return terr end
    end
    if n.properties ~= nil then
        local perr = validate_schema_map(n.properties, path .. ".properties")
        if perr then return perr end
    end
    if n.required ~= nil then
        local rerr = validate_required(n.required, path .. ".required")
        if rerr then return rerr end
    end
    if n.items ~= nil then
        if type(n.items) ~= "table" then return path .. ".items must be a schema object" end
        if is_array_like(n.items) then
            local ierr = validate_schema_array(n.items, path .. ".items")
            if ierr then return ierr end
        else
            local ierr = validate_schema_node(n.items, path .. ".items")
            if ierr then return ierr end
        end
    end
    for _, key in ipairs({ "$defs", "definitions", "patternProperties", "dependentSchemas" }) do
        if n[key] ~= nil then
            local merr = validate_schema_map(n[key], path .. "." .. key)
            if merr then return merr end
        end
    end
    for _, key in ipairs({ "oneOf", "anyOf", "allOf" }) do
        if n[key] ~= nil then
            local aerr = validate_schema_array(n[key], path .. "." .. key)
            if aerr then return aerr end
        end
    end
    if n.additionalProperties ~= nil
        and type(n.additionalProperties) ~= "boolean"
        and type(n.additionalProperties) ~= "table" then
        return path .. ".additionalProperties must be boolean or schema object"
    end
    if type(n.additionalProperties) == "table" then
        local aerr = validate_schema_node(n.additionalProperties, path .. ".additionalProperties")
        if aerr then return aerr end
    end
    if n.enum ~= nil and not is_array_table(n.enum) then return path .. ".enum must be an array" end
    return nil
end

function M.validate_schema(schema: any): string?
    local decoded = decode_schema(schema)
    if type(decoded) ~= "table" then return "schema must be a JSON object" end
    return validate_schema_node(decoded, "schema")
end

function M.assist_schema(args: any, opts: any?): Map
    local a = type(args) == "table" and (args :: Map) or {}
    local intent = trim(a.intent)
    if intent == "" then return { success = false, error = "intent required" } end

    local current_schema: any = nil
    if a.current_schema ~= nil then
        current_schema = decode_schema(a.current_schema)
        if type(current_schema) ~= "table" or is_array_like(current_schema) then
            return { success = false, error = "current_schema must be a JSON Schema object" }
        end
        local cerr = M.validate_schema(current_schema)
        if cerr then return { success = false, error = "current_schema is not a valid JSON Schema: " .. cerr .. "." } end
        current_schema = schema_json.normalize_schema(current_schema)
    end

    local o = type(opts) == "table" and (opts :: Map) or {}
    local generate = type(o.generate) == "function" and o.generate or function(ctx: any): (any?, any?)
        return default_schema_generate(ctx, o)
    end
    local generated, err = (generate :: any)({
        intent = intent,
        current_schema = current_schema,
        context = type(a.context) == "table" and a.context or {},
    })
    if err then
        if type(err) == "table" and (err :: Map).error == ASSIST_UNAVAILABLE then return err :: Map end
        return { success = false, error = "Could not generate a schema: " .. tostring(err) .. "." }
    end

    local schema = type(generated) == "table" and (generated :: Map).schema or generated
    schema = decode_schema(schema)
    local verr = M.validate_schema(schema)
    if verr then return { success = false, error = "generated schema is not a valid JSON Schema: " .. verr .. "." } end

    local result: Map = { success = true, schema = schema_json.normalize_schema(schema) }
    local notes = type(generated) == "table" and trim((generated :: Map).notes) or ""
    if notes ~= "" then result.notes = notes end
    return result
end


I.validate_condition_predicate = validate_condition_predicate
return {
    validate_transform = M.validate_transform,
    validate_schema = M.validate_schema,
    assist_schema = M.assist_schema,
}
end
