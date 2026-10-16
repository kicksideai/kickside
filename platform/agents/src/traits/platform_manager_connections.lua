-- Platform connection and reply-provider mutations.
local support = require("platform_manager_support")
local tool_result = require("tool_result")
local CONNECTION_REGISTRY_NS = support.CONNECTION_REGISTRY_NS
local trim = support.trim
local component_id_from = support.component_id_from
local call_owner_func = support.call_owner_func
local selected_fields = support.selected_fields
local component_summary = support.component_summary
local M = {}

local function upsert_connection(args: any): (any, error?)
    local provider = trim(args.provider)
    local name = trim(args.name)
    if provider == "" then return tool_result.fail(errors.INVALID, "provider is required") end
    if name == "" then return tool_result.fail(errors.INVALID, "name is required") end
    if type(args.auth) ~= "table" then return tool_result.fail(errors.INVALID, "auth must be an object") end
    local result, upsert_err = call_owner_func(CONNECTION_REGISTRY_NS .. ":upsert", {
        provider = provider,
        name = name,
        auth = args.auth,
        validate = args.validate == true,
    })
    if upsert_err then return nil, errors.wrap(upsert_err, "upsert connection") end
    return result, nil
end

local function update_connection(args: any): (any, error?)
    local component_id = component_id_from(args)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id is required") end
    if trim(args.name) == "" then return tool_result.fail(errors.INVALID, "name is required") end
    local result, update_err = call_owner_func(CONNECTION_REGISTRY_NS .. ":update", { component_id = component_id, name = args.name })
    if update_err then return nil, errors.wrap(update_err, "update connection") end
    return result, nil
end

local function delete_connection(args: any): (any, error?)
    local component_id = component_id_from(args)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id is required") end
    local result, delete_err = call_owner_func(CONNECTION_REGISTRY_NS .. ":delete", { component_id = component_id })
    if delete_err then return nil, errors.wrap(delete_err, "delete connection") end
    return result, nil
end

local function validate_connection(args: any): (any, error?)
    local component_id = component_id_from(args)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id is required") end
    local result, validate_err = call_owner_func(CONNECTION_REGISTRY_NS .. ":validate", { component_id = component_id })
    if validate_err then return nil, errors.wrap(validate_err, "validate connection") end
    return result, nil
end

local function list_reply_providers(args: any): (any, error?)
    local fields, fields_err = selected_fields(args, { meta = true, description = true })
    if fields_err then return nil, fields_err end
    local offset = support.offset_of(args)
    local page, list_err = call_owner_func(CONNECTION_REGISTRY_NS .. ":rp_list", {
        provider = trim(args.provider) ~= "" and trim(args.provider) or nil,
        name = trim(args.name) ~= "" and trim(args.name) or nil,
        text = trim(args.q) ~= "" and trim(args.q) or nil,
        pagination = { limit = support.limit_of(args), offset = offset },
    })
    if list_err then return nil, errors.wrap(list_err, "list reply providers") end
    local rows: { any } = {}
    for _, row in ipairs(page and page.reply_providers or {}) do
        local shaped = component_summary(row, fields :: { [string]: boolean })
        if (fields :: { [string]: boolean }).description then shaped.description = (row.meta or {}).comment or "" end
        rows[#rows + 1] = shaped
    end
    return { reply_providers = rows, next_offset = support.next_offset(offset, rows, page and page.has_more) }, nil
end

local function upsert_reply_provider(args: any): (any, error?)
    local provider = trim(args.provider)
    local name = trim(args.name)
    if provider == "" then return tool_result.fail(errors.INVALID, "provider is required") end
    if name == "" then return tool_result.fail(errors.INVALID, "name is required") end
    if type(args.auth) ~= "table" then return tool_result.fail(errors.INVALID, "auth must be an object") end
    local result, upsert_err = call_owner_func(CONNECTION_REGISTRY_NS .. ":rp_upsert", { provider = provider, name = name, auth = args.auth })
    if upsert_err then return nil, errors.wrap(upsert_err, "upsert reply provider") end
    return result, nil
end

local function update_reply_provider(args: any): (any, error?)
    local component_id = component_id_from(args)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id is required") end
    if trim(args.name) == "" then return tool_result.fail(errors.INVALID, "name is required") end
    local result, update_err = call_owner_func(CONNECTION_REGISTRY_NS .. ":rp_update", { component_id = component_id, name = args.name })
    if update_err then return nil, errors.wrap(update_err, "update reply provider") end
    return result, nil
end

local function delete_reply_provider(args: any): (any, error?)
    local component_id = component_id_from(args)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id is required") end
    local result, delete_err = call_owner_func(CONNECTION_REGISTRY_NS .. ":rp_delete", { component_id = component_id })
    if delete_err then return nil, errors.wrap(delete_err, "delete reply provider") end
    return result, nil
end


M.upsert_connection = upsert_connection

M.update_connection = update_connection

M.delete_connection = delete_connection

M.validate_connection = validate_connection

M.list_reply_providers = list_reply_providers

M.upsert_reply_provider = upsert_reply_provider

M.update_reply_provider = update_reply_provider

M.delete_reply_provider = delete_reply_provider

return M
