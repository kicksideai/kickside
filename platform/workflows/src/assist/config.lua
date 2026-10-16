-- Safe config projection, target resolution, and drafted settings merge.
type Map = { [string]: any }
type ConfigAssist = {
    validate_config: (any, any, boolean?) -> string?,
    config_assist_surface: (any, any) -> (Map?, Map?, string?),
    resolve_config_target: (any, any, any?) -> (Map?, Map?),
    assist_config: (any, any?) -> Map,
}
return function(I: any): ConfigAssist
local M: Map = { validate_schema = I.validate_schema }
local trim, decode_schema, is_array_like, schema_type = I.trim, I.decode_schema, I.is_array_like, I.schema_type
local json, config_contract, workflow, blocks = I.json, I.config_contract, I.workflow, I.blocks
local BUILTIN_CONFIG_SCHEMAS = I.BUILTIN_CONFIG_SCHEMAS
local MAX_CONFIG_DEPTH, MAX_CONFIG_SCHEMA_BYTES = I.MAX_CONFIG_DEPTH, I.MAX_CONFIG_SCHEMA_BYTES
local MAX_CURRENT_CONFIG_BYTES = I.MAX_CURRENT_CONFIG_BYTES
local MAX_CONFIG_BLOCK_ID_BYTES, MAX_CONFIG_BLOCK_TITLE_BYTES = I.MAX_CONFIG_BLOCK_ID_BYTES, I.MAX_CONFIG_BLOCK_TITLE_BYTES
local MAX_ASSIST_INTENT_BYTES = I.MAX_ASSIST_INTENT_BYTES
local ASSIST_UNAVAILABLE, ASSIST_UNAVAILABLE_MESSAGE = I.ASSIST_UNAVAILABLE, I.ASSIST_UNAVAILABLE_MESSAGE
local default_config_generate = I.default_config_generate
local function config_failure(code: string, message: string): Map
    return { success = false, error = code, code = code, message = message }
end

function M.validate_config(config: any, config_schema: any, require_fields: boolean?): string?
    local validation_error = config_contract.validate(config, config_schema, { require_fields = require_fields ~= false })
    if validation_error == nil then return nil end
    return tostring(validation_error)
end

local copy_tree = I.mapping.copy_tree

local SENSITIVE_KEY_PARTS = { "password", "secret", "token", "credential", "api_key", "apikey", "private_key" }
local function sensitive_key(key: any): boolean
    local lowered = tostring(key or ""):lower()
    for _, part in ipairs(SENSITIVE_KEY_PARTS) do
        if lowered:find(part, 1, true) then return true end
    end
    return false
end

local function schema_contains_sensitive(node: any, key: any, depth: number): boolean
    if sensitive_key(key) then return true end
    if type(node) ~= "table" or depth > MAX_CONFIG_DEPTH then return depth > MAX_CONFIG_DEPTH end
    local n = node :: Map
    if n.writeOnly == true or n.sensitive == true then return true end
    local format = type(n.format) == "string" and tostring(n.format):lower() or ""
    if format == "password" or format == "secret" then return true end
    if type(n.properties) == "table" then
        for child_key, child in pairs(n.properties :: Map) do
            if schema_contains_sensitive(child, child_key, depth + 1) then return true end
        end
    end
    if type(n.items) == "table" and schema_contains_sensitive(n.items, "items", depth + 1) then return true end
    if type(n.additionalProperties) == "table"
        and schema_contains_sensitive(n.additionalProperties, "additionalProperties", depth + 1) then return true end
    return false
end

local function schema_contains_picker(node: any, depth: number): boolean
    if type(node) ~= "table" or depth > MAX_CONFIG_DEPTH then return depth > MAX_CONFIG_DEPTH end
    local schema = node :: Map
    if schema.picker ~= nil or schema.class ~= nil then return true end
    if type(schema.properties) == "table" then
        for _, child in pairs(schema.properties :: Map) do
            if schema_contains_picker(child, depth + 1) then return true end
        end
    end
    if type(schema.items) == "table" and schema_contains_picker(schema.items, depth + 1) then return true end
    if type(schema.additionalProperties) == "table"
        and schema_contains_picker(schema.additionalProperties, depth + 1) then return true end
    return false
end

local function value_contains_sensitive_key(value: any, depth: number): boolean
    if type(value) ~= "table" then return false end
    if depth > MAX_CONFIG_DEPTH then return true end
    for key, child in pairs(value :: Map) do
        if type(key) == "string" and sensitive_key(key) then return true end
        if value_contains_sensitive_key(child, depth + 1) then return true end
    end
    return false
end

local supported_config_schema = config_contract.validate_dialect

local function within_current_config_bounds(value: any): string?
    if value_contains_sensitive_key(value, 1) then return "current config contains sensitive or excessively nested data" end
    local encoded = json.encode(value)
    if type(encoded) ~= "string" or #encoded > MAX_CURRENT_CONFIG_BYTES then return "current config is too large" end
    return nil
end

-- The server derives this projection from the registry declaration. Picker-backed
-- identity fields stay in their canonical picker and are never sent to the model.
function M.config_assist_surface(config_schema: any, current_config: any): (Map?, Map?, string?)
    local source = decode_schema(config_schema)
    if type(source) ~= "table" or is_array_like(source) then return nil, nil, "config schema is not an object" end
    local root = source :: Map
    local root_format = type(root.format) == "string" and tostring(root.format):lower() or ""
    if root.picker ~= nil or root.class ~= nil or root.writeOnly == true or root.sensitive == true
        or root_format == "password" or root_format == "secret" then
        return nil, nil, "config schema root is identity-owned or sensitive"
    end
    local properties = type((source :: Map).properties) == "table" and ((source :: Map).properties :: Map) or nil
    if not properties then return nil, nil, "config schema has no declared fields" end

    local projected_properties: Map = {}
    for key, raw in pairs(properties) do
        local field = type(raw) == "table" and (raw :: Map) or {}
        local current_value = type(current_config) == "table" and (current_config :: Map)[key] or nil
        if field.picker == nil and field.class == nil
            and not schema_contains_picker(field, 1)
            and not schema_contains_sensitive(field, key, 1)
            and not value_contains_sensitive_key(current_value, 1) then
            projected_properties[tostring(key)] = copy_tree(raw)
        end
    end
    if next(projected_properties) == nil then return nil, nil, "config schema has no assistable fields" end

    local required: { any } = {}
    for _, raw in ipairs(type((source :: Map).required) == "table" and ((source :: Map).required :: { any }) or {}) do
        local key = tostring(raw)
        if projected_properties[key] ~= nil then required[#required + 1] = key end
    end
    local projected = copy_tree(source) :: Map
    projected.properties = projected_properties
    projected.required = required
    projected.additionalProperties = false

    -- Validate the model-facing projection, not fields owned by pickers. A picker
    -- may use a richer value schema without disabling assist for unrelated fields.
    local unsupported = supported_config_schema(projected, "config_schema", 1)
    if unsupported then return nil, nil, tostring(unsupported) end
    local encoded = json.encode(projected)
    if type(encoded) ~= "string" or #encoded > MAX_CONFIG_SCHEMA_BYTES then return nil, nil, "config schema is too large" end

    local current: Map = {}
    local raw_current = type(current_config) == "table" and (current_config :: Map) or {}
    for key, _ in pairs(projected_properties) do
        if raw_current[key] ~= nil then current[key] = copy_tree(raw_current[key]) end
    end
    local current_bounds_err = within_current_config_bounds(current)
    if current_bounds_err then return nil, nil, current_bounds_err end
    return projected, current, nil
end

function M.resolve_config_target(workflow_id: any, node_id: any, opts: any?): (Map?, Map?)
    local wid = trim(workflow_id)
    local nid = trim(node_id)
    if wid == "" or nid == "" or #nid > 255 then
        return nil, config_failure("invalid_request", "A valid step id is required.")
    end
    local o = type(opts) == "table" and (opts :: Map) or {}
    local workflow_reader = type(o.workflow) == "table" and o.workflow or workflow
    local catalog_reader = type(o.blocks) == "table" and o.blocks or blocks
    local state, state_err = (workflow_reader :: any).state(wid)
    if state_err or type(state) ~= "table" then
        return nil, config_failure("state_unavailable", "Could not load this workflow.")
    end

    local selected: Map? = nil
    for _, raw in ipairs(type((state :: Map).nodes) == "table" and ((state :: Map).nodes :: { any }) or {}) do
        local node = type(raw) == "table" and (raw :: Map) or {}
        if tostring(node.id or "") == nid then selected = node; break end
    end
    if not selected then return nil, config_failure("node_not_found", "This step no longer exists.") end

    local kind = trim((selected :: Map).kind)
    if kind == "" or #kind > MAX_CONFIG_BLOCK_ID_BYTES then
        return nil, config_failure("config_not_supported", "This step has no AI-configurable settings.")
    end
    local catalog, catalog_err = (catalog_reader :: any).catalog()
    if catalog_err then
        return nil, config_failure("catalog_unavailable", "Could not load this step’s declaration.")
    end
    local declared = (catalog :: Map)[kind]
    -- Compiler-owned intrinsics join the same schema-driven path as registry extensions.
    local builtin_schema = BUILTIN_CONFIG_SCHEMAS[kind]
    if type(builtin_schema) == "table" and (type(declared) ~= "table" or type((declared :: Map).config_schema) ~= "table") then
        declared = type(declared) == "table" and (copy_tree(declared) :: Map) or { label = kind }
        ;(declared :: Map).config_schema = copy_tree(builtin_schema)
    end
    if type(declared) ~= "table" or type((declared :: Map).config_schema) ~= "table" then
        return nil, config_failure("config_not_supported", "This step has no AI-configurable settings.")
    end

    local config_schema, current_config, projection_err = M.config_assist_surface(
        (declared :: Map).config_schema,
        type((selected :: Map).config) == "table" and (selected :: Map).config or {}
    )
    if projection_err or not config_schema or not current_config then
        return nil, config_failure("config_not_supported", "This step has no AI-configurable settings.")
    end
    local block_title = trim((selected :: Map).title or (declared :: Map).label or kind)
    if #block_title > MAX_CONFIG_BLOCK_TITLE_BYTES then
        return nil, config_failure("config_not_supported", "This step has no AI-configurable settings.")
    end
    return {
        block_id = kind,
        block_title = block_title,
        config_schema = config_schema,
        current_config = current_config,
    }, nil
end

function M.assist_config(args: any, opts: any?): Map
    local a = type(args) == "table" and (args :: Map) or {}
    local intent = trim(a.intent)
    if intent == "" then return config_failure("invalid_request", "Describe how this step should behave.") end
    if #intent > MAX_ASSIST_INTENT_BYTES then return config_failure("invalid_request", "The step description is too long.") end

    local block_id = trim(a.block_id)
    local block_title = trim(a.block_title)
    if block_id == "" or #block_id > MAX_CONFIG_BLOCK_ID_BYTES then
        return config_failure("invalid_request", "Step kind is invalid.")
    end
    if #block_title > MAX_CONFIG_BLOCK_TITLE_BYTES then
        return config_failure("invalid_request", "Step title is too long.")
    end

    local config_schema = decode_schema(a.config_schema)
    if type(config_schema) ~= "table" or is_array_like(config_schema) then
        return config_failure("invalid_schema", "This step does not declare a usable configuration schema.")
    end
    local unsupported = supported_config_schema(config_schema, "config_schema", 1)
    if unsupported then return config_failure("unsupported_schema", "This step uses a configuration rule AI assist cannot validate: " .. unsupported .. ".") end
    local schema_err = M.validate_schema(config_schema)
    if schema_err then return config_failure("invalid_schema", "The step configuration schema is invalid: " .. schema_err .. ".") end

    local encoded_schema = json.encode(config_schema)
    if type(encoded_schema) ~= "string" or #encoded_schema > MAX_CONFIG_SCHEMA_BYTES then
        return config_failure("invalid_schema", "The step configuration schema is too large for AI assist.")
    end

    local current_config = a.current_config
    if current_config == nil then current_config = {} end
    local current_bounds_err = within_current_config_bounds(current_config)
    if current_bounds_err then return config_failure("invalid_current_config", "Current step settings cannot be sent to AI assist: " .. current_bounds_err .. ".") end
    local current_err = M.validate_config(current_config, config_schema, false)
    if current_err then return config_failure("invalid_current_config", "Current step settings are invalid: " .. current_err .. ".") end

    local upstream_schema = nil
    if a.upstream_schema ~= nil then
        upstream_schema = decode_schema(a.upstream_schema)
        if type(upstream_schema) ~= "table" or is_array_like(upstream_schema) then
            return config_failure("invalid_schema", "The previous step output schema is invalid.")
        end
        local upstream_err = M.validate_schema(upstream_schema)
        local encoded_upstream = json.encode(upstream_schema)
        if upstream_err or type(encoded_upstream) ~= "string" or #encoded_upstream > MAX_CONFIG_SCHEMA_BYTES then
            return config_failure("invalid_schema", "The previous step output schema is invalid or too large.")
        end
    end

    local o = type(opts) == "table" and (opts :: Map) or {}
    local generate = type(o.generate) == "function" and o.generate or function(ctx: any): (any?, any?)
        return default_config_generate(ctx, o)
    end
    local generated, err = (generate :: any)({
        intent = intent,
        block_id = block_id,
        block_title = block_title,
        config_schema = config_schema,
        current_config = current_config,
        upstream_schema = upstream_schema,
    })
    if err then
        if type(err) == "table" and (err :: Map).error == ASSIST_UNAVAILABLE then
            return config_failure(tostring(ASSIST_UNAVAILABLE), tostring((err :: Map).message or ASSIST_UNAVAILABLE_MESSAGE))
        end
        return config_failure("generation_failed", "The assistant could not draft these settings.")
    end

    local drafted = type(generated) == "table" and (generated :: Map).config or generated
    if type(drafted) ~= "table" or is_array_like(drafted) then
        return config_failure("invalid_draft", "The assistant returned no usable settings.")
    end
    -- Omitted optional values mean "keep", never silent deletion. A future explicit
    -- remove operation needs its own reviewed representation rather than absence.
    local function merge_value(current: any, draft: any, schema: any): any
        local declaration = type(schema) == "table" and (schema :: Map) or {}
        local object_like = schema_type(declaration) == "object" or type(declaration.properties) == "table"
        if not object_like or type(current) ~= "table" or is_array_like(current)
            or type(draft) ~= "table" or is_array_like(draft) then
            return copy_tree(draft)
        end
        local merged = copy_tree(current) :: Map
        local properties = type(declaration.properties) == "table" and (declaration.properties :: Map) or {}
        for key, value in pairs(draft :: Map) do
            local child_schema = properties[tostring(key)]
            if child_schema == nil and type(declaration.additionalProperties) == "table" then
                child_schema = declaration.additionalProperties
            end
            merged[key] = merge_value(merged[key], value, child_schema)
        end
        return merged
    end
    local config = merge_value(current_config, drafted, config_schema) :: Map
    local validation_err = M.validate_config(config, config_schema, true)
    if validation_err then
        return config_failure("invalid_draft", "The drafted settings do not match this step: " .. validation_err .. ".")
    end

    local result: Map = { success = true, config = config }
    local notes = type(generated) == "table" and trim((generated :: Map).notes) or ""
    if notes ~= "" then result.notes = notes end
    return result
end

return {
    validate_config = M.validate_config,
    config_assist_surface = M.config_assist_surface,
    resolve_config_target = M.resolve_config_target,
    assist_config = M.assist_config,
}
end
