-- Canonical provenance envelope for event-body source references.
--
-- Platform contract:
--   source_ref = {
--     origin = { type = string, id = string },
--     sync_id = string?,
--     workflow_run_id = string?,
--     approval_item_id = string?,
--   }
--
-- Producers carry this source_ref inside the event body. Domain payload fields may
-- ride beside the canonical fields for local consumers, but origin is always the
-- object above; callers must not emit a parallel flat origin dialect.

local M = {}

local function invalid(message: string, code: string): error
    return (errors.new({
        message = message,
        kind = errors.INVALID,
        retryable = false,
        details = { code = code },
    }) :: error)
end

local OPTIONAL_KEYS = {
    sync_id = true,
    workflow_run_id = true,
    approval_item_id = true,
}

local CANONICAL_KEYS = {
    origin = true,
    type = true,
    id = true,
    origin_type = true,
    origin_id = true,
    sync_id = true,
    workflow_run_id = true,
    approval_item_id = true,
    fields = true,
    base = true,
}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function put_optional(out: { [string]: any }, key: string, value: any): ()
    local s = trim(value)
    if s ~= "" then out[key] = s end
end

local function copy_payload(out: { [string]: any }, input: any): ()
    if type(input) ~= "table" then return end
    for key, value in pairs(input :: table) do
        if type(key) == "string" and key ~= "" and not CANONICAL_KEYS[key] then
            out[key] = value
        end
    end
end

local function origin_value(args: { [string]: any }, key: string): any
    if type(args.origin) == "table" then
        local value = (args.origin :: table)[key]
        if value ~= nil then return value end
    end
    if type(args.base) == "table" and type((args.base :: table).origin) == "table" then
        local value = ((args.base :: table).origin :: table)[key]
        if value ~= nil then return value end
    end
    return nil
end

function M.build(args: any): ({ [string]: any }?, error?)
    if type(args) ~= "table" then return nil, invalid("source_ref args must be an object", "source_ref_args_invalid") end
    local input = args :: { [string]: any }
    local out: { [string]: any } = {}

    copy_payload(out, input.base)
    copy_payload(out, input.fields)
    copy_payload(out, input)

    local origin_type = trim(input.origin_type)
    if origin_type == "" then origin_type = trim(origin_value(input, "type")) end
    local origin_id = trim(input.origin_id)
    if origin_id == "" then origin_id = trim(origin_value(input, "id")) end

    if origin_type == "" then
        return nil, invalid("source_ref.origin.type is required", "source_ref_origin_type_required")
    end
    if origin_id == "" then
        return nil, invalid("source_ref.origin.id is required", "source_ref_origin_id_required")
    end

    out.origin = { type = origin_type, id = origin_id }
    for key, _ in pairs(OPTIONAL_KEYS) do
        put_optional(out, key, input[key])
        if out[key] == nil and type(input.base) == "table" then
            put_optional(out, key, (input.base :: table)[key])
        end
    end
    return out, nil
end

return M
