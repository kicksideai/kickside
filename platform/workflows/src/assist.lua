-- AI assist helpers for workflow authoring. Edge assist asks the shared LLM
-- structured-output path for one expr-lang transform, then executes it against a
-- real or schema-derived sample before returning it to the UI.

local json = require("json")
local expr = require("expr")
local prompt = require("prompt")
local llm = require("llm")
local time = require("time")
local schema_json = require("schema_json")
local mapping = require("mapping")
local workflow = require("workflow")
local blocks = require("block_catalog")
local config_contract = require("config_schema")

type Map = { [string]: any }

-- A model class is intentionally used instead of a concrete provider/model id. The
-- bound kickside.models resolver selects the highest-priority configured member.
local MODEL = "class:fast"
local LLM_TIMEOUT_SECONDS = 50
local LLM_RETRY_BACKOFF_MS = 250
local LLM_ATTEMPTS = 2
local ASSIST_UNAVAILABLE = "assist_unavailable"
local ASSIST_UNAVAILABLE_MESSAGE = "AI assist is temporarily unavailable. Please try again in a moment, or continue editing manually."
local EMPTY_INPUT_GUIDANCE = "Run the workflow once so I can see the upstream output, or add an input schema on the next step."
local MAX_ASSIST_INTENT_BYTES = 4000
local MAX_CONFIG_SCHEMA_BYTES = 65536
local MAX_CURRENT_CONFIG_BYTES = 65536
local MAX_CONFIG_DEPTH = 12
local MAX_CONFIG_BLOCK_ID_BYTES = 128
local MAX_CONFIG_BLOCK_TITLE_BYTES = 256
local MAX_EDGE_INTENT_SUMMARY_BYTES = 500
local MAX_AVAILABLE_BLOCKS = 128

-- Compiler-owned steps use the same schema-driven configuration path as Blocks.
local BUILTIN_CONFIG_SCHEMAS: Map = {
    branch = {
        type = "object",
        required = { "predicate" },
        properties = {
            predicate = { type = "string", title = "Condition", description = "expr-lang condition over the previous step output" },
        },
        additionalProperties = false,
    },
}

local TRANSFORM_SCHEMA: Map = {
    type = "object",
    additionalProperties = false,
    required = { "transform", "rationale" },
    properties = {
        transform = { type = "string" },
        rationale = { type = "string" },
    },
}

local SCHEMA_ASSIST_SCHEMA: Map = {
    type = "object",
    additionalProperties = false,
    required = { "schema", "notes" },
    properties = {
        schema = { type = "object", additionalProperties = true },
        notes = { type = "string" },
    },
}

local CONFIG_ASSIST_SCHEMA: Map = {
    type = "object",
    additionalProperties = false,
    required = { "config", "notes" },
    properties = {
        config = { type = "object", additionalProperties = true },
        notes = { type = "string" },
    },
}

-- The classifier describes an authoring action; it never mutates the graph. Unused
-- string fields stay empty so the structured-output dialect remains portable across
-- providers that do not support JSON-Schema oneOf/discriminators.
local EDGE_INTENT_SCHEMA: Map = {
    type = "object",
    additionalProperties = false,
    required = { "kind", "predicate", "block_id", "summary" },
    properties = {
        kind = { type = "string", enum = { "mapping", "condition", "failure_route", "insert_node" } },
        predicate = { type = "string" },
        block_id = { type = "string" },
        summary = { type = "string" },
    },
}

local JSON_SCHEMA_TYPES: { [string]: boolean } = {
    object = true,
    array = true,
    string = true,
    number = true,
    integer = true,
    boolean = true,
    ["null"] = true,
}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return ((value :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

local function unfence(text: string): string
    local t = trim(text)
    local body = t:match("^```[%w]*%s*(.-)%s*```$")
    if body then return trim(body) end
    return t
end

local function decode_schema(schema: any): any
    if type(schema) == "string" then
        if trim(schema) == "" then return nil end
        local decoded, derr = json.decode(schema :: string)
        if derr or type(decoded) ~= "table" then return nil end
        return decoded
    end
    if type(schema) == "table" then return schema end
    return nil
end

local function is_array_like(value: any): boolean
    if type(value) ~= "table" then return false end
    local count = 0
    local max = 0
    for key, _ in pairs(value :: Map) do
        if type(key) ~= "number" then return false end
        count = count + 1
        if key > max then max = key end
    end
    return count > 0 and max == count
end

local function schema_type(node: Map): any
    local t = node.type
    if type(t) == "table" then return (t :: { any })[1] end
    return t
end

local function example_of(node: any): any
    local n = type(node) == "table" and (node :: Map) or {}
    local t = schema_type(n)
    if t == "object" or type(n.properties) == "table" then
        local out: Map = {}
        if type(n.properties) == "table" then
            for key, prop in pairs(n.properties :: Map) do
                out[tostring(key)] = example_of(prop)
            end
        end
        return out
    elseif t == "array" then
        return { example_of(n.items) }
    elseif t == "number" or t == "integer" then
        return 1
    elseif t == "boolean" then
        return true
    end
    return "value"
end

local function type_name(value: any): string
    local t = type(value)
    if t == "table" then
        if next(value) == nil then return "object" end
        if type(next(value)) == "number" then return "array" end
        return "object"
    end
    return t
end

local function check_type(value: any, expected: string, path: string): string?
    if expected == "object" then
        if type(value) ~= "table" or type(next(value)) == "number" then return path .. " must be object" end
    elseif expected == "array" then
        if type(value) ~= "table" or (next(value) ~= nil and type(next(value)) ~= "number") then return path .. " must be array" end
    elseif expected == "string" then
        if type(value) ~= "string" then return path .. " must be string, got " .. type_name(value) end
    elseif expected == "number" then
        if type(value) ~= "number" then return path .. " must be number, got " .. type_name(value) end
    elseif expected == "integer" then
        if type(value) ~= "number" or math.floor(value :: number) ~= value then return path .. " must be integer" end
    elseif expected == "boolean" then
        if type(value) ~= "boolean" then return path .. " must be boolean, got " .. type_name(value) end
    end
    return nil
end

local function validate_node(value: any, schema: any, path: string): string?
    if type(schema) ~= "table" then return nil end
    local s = schema :: Map
    local expected = schema_type(s)
    if type(expected) == "string" then
        local terr = check_type(value, expected :: string, path)
        if terr then return terr end
    end
    if type(s.enum) == "table" then
        local ok = false
        for _, allowed in ipairs(s.enum :: { any }) do
            if value == allowed then ok = true; break end
        end
        if not ok then return path .. " must be one of the allowed values" end
    end
    if (expected == "object" or type(s.properties) == "table") and type(value) == "table" then
        if type(s.required) == "table" then
            for _, req in ipairs(s.required :: { any }) do
                if (value :: Map)[req] == nil then return path .. "." .. tostring(req) .. " is required" end
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
    if expected == "array" and type(value) == "table" and type(s.items) == "table" then
        for i, item in ipairs(value :: { any }) do
            local err = validate_node(item, s.items, path .. "[" .. tostring(i) .. "]")
            if err then return err end
        end
    end
    return nil
end

local function status_code(value: any): number?
    if type(value) ~= "table" then return nil end
    local v = value :: Map
    for _, key in ipairs({ "status_code", "status", "http_status" }) do
        local code = tonumber(v[key])
        if code then return code end
    end
    if type(v.details) == "table" then return status_code(v.details) end
    return nil
end

local function retryable_error(err: any): boolean
    if type(err) == "table" and (err :: Map).retryable == true then return true end
    if type(err) == "userdata" then
        if (err :: any):retryable() == true then return true end
    end

    local code = status_code(err)
    if code and code >= 500 and code < 600 then return true end

    local message = tostring(err):lower()
    local padded = " " .. message .. " "
    return message:find("timeout", 1, true) ~= nil
        or message:find("timed out", 1, true) ~= nil
        or padded:match("[^%d]5%d%d[^%d]") ~= nil
end

local function unavailable_error(): Map
    return {
        success = false,
        error = ASSIST_UNAVAILABLE,
        message = ASSIST_UNAVAILABLE_MESSAGE,
    }
end


local I: any = {
    json = json, expr = expr, prompt = prompt, llm = llm, time = time,
    schema_json = schema_json, mapping = mapping, workflow = workflow,
    blocks = blocks, config_contract = config_contract,
    MODEL = MODEL, LLM_TIMEOUT_SECONDS = LLM_TIMEOUT_SECONDS,
    LLM_RETRY_BACKOFF_MS = LLM_RETRY_BACKOFF_MS, LLM_ATTEMPTS = LLM_ATTEMPTS,
    ASSIST_UNAVAILABLE = ASSIST_UNAVAILABLE,
    ASSIST_UNAVAILABLE_MESSAGE = ASSIST_UNAVAILABLE_MESSAGE,
    EMPTY_INPUT_GUIDANCE = EMPTY_INPUT_GUIDANCE,
    MAX_ASSIST_INTENT_BYTES = MAX_ASSIST_INTENT_BYTES,
    MAX_CONFIG_SCHEMA_BYTES = MAX_CONFIG_SCHEMA_BYTES,
    MAX_CURRENT_CONFIG_BYTES = MAX_CURRENT_CONFIG_BYTES,
    MAX_CONFIG_DEPTH = MAX_CONFIG_DEPTH,
    MAX_CONFIG_BLOCK_ID_BYTES = MAX_CONFIG_BLOCK_ID_BYTES,
    MAX_CONFIG_BLOCK_TITLE_BYTES = MAX_CONFIG_BLOCK_TITLE_BYTES,
    MAX_EDGE_INTENT_SUMMARY_BYTES = MAX_EDGE_INTENT_SUMMARY_BYTES,
    MAX_AVAILABLE_BLOCKS = MAX_AVAILABLE_BLOCKS,
    BUILTIN_CONFIG_SCHEMAS = BUILTIN_CONFIG_SCHEMAS,
    TRANSFORM_SCHEMA = TRANSFORM_SCHEMA, SCHEMA_ASSIST_SCHEMA = SCHEMA_ASSIST_SCHEMA,
    CONFIG_ASSIST_SCHEMA = CONFIG_ASSIST_SCHEMA, EDGE_INTENT_SCHEMA = EDGE_INTENT_SCHEMA,
    JSON_SCHEMA_TYPES = JSON_SCHEMA_TYPES,
    trim = trim, unfence = unfence, decode_schema = decode_schema,
    is_array_like = is_array_like, schema_type = schema_type,
    example_of = example_of, validate_node = validate_node,
    retryable_error = retryable_error, unavailable_error = unavailable_error,
}
local prompts = require("assist_prompts")(I)
I.default_generate = prompts.default_generate
I.default_schema_generate = prompts.default_schema_generate
I.default_config_generate = prompts.default_config_generate
I.default_edge_intent_generate = prompts.default_edge_intent_generate
local validate = require("assist_validate")(I)
I.validate_transform = validate.validate_transform
I.validate_schema = validate.validate_schema
local edge = require("assist_edge")(I)
local config = require("assist_config")(I)
return {
    validate_transform = validate.validate_transform,
    validate_schema = validate.validate_schema,
    validate_config = config.validate_config,
    config_assist_surface = config.config_assist_surface,
    resolve_config_target = config.resolve_config_target,
    assist_edge_intent = edge.assist_edge_intent,
    assist_edge = edge.assist_edge,
    assist_binding = edge.assist_binding,
    assist_schema = validate.assist_schema,
    assist_config = config.assist_config,
}
