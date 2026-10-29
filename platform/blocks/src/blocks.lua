local registry = require("registry")
local json = require("json")
local contract = require("contract")
local keyset = require("keyset")
local lower = require("lower")
local tool_adapter = require("tool_adapter")

local M = {}

type Map = { [string]: any }

M.BLOCK_TYPE = contract.BLOCK_TYPE
M.API_VERSION = contract.API_VERSION

local function text(value: any): string
    return type(value) == "string" and value or ""
end

function M.validate(entry: any): string?
    return contract.validate(entry)
end

function M.describe(entry: any): (Map?, string?)
    return contract.describe(entry)
end

local function explicit_descriptor(entry: Map): (Map?, string?)
    local descriptor, err = contract.describe(entry)
    if not descriptor then return nil, err end
    ; (descriptor :: Map).source_kind = "block"
    ; (descriptor :: Map).tool = false
    ; (descriptor :: Map).declaration = entry
    return descriptor, nil
end

local function descriptor(entry: Map): (Map?, string?)
    if tool_adapter.visible(entry) then return tool_adapter.describe(entry) end
    return explicit_descriptor(entry)
end

local function resolve_entry(block_id: any): (Map?, Map?, any)
    local id = text(block_id)
    if not contract.exact_id(id) then return nil, nil, errors.new({ kind = errors.INVALID, message = "Block reference must be an exact namespace:name id" }) end
    local entry, err = registry.get(id)
    if err then return nil, nil, err end
    if type(entry) ~= "table" then return nil, nil, errors.new({ kind = errors.NOT_FOUND, message = "Block not found: " .. id }) end
    local normalized, normalize_err = descriptor(entry :: Map)
    if not normalized then return nil, nil, errors.new({ kind = errors.INTERNAL, message = tostring(normalize_err) }) end
    return normalized, entry :: Map, nil
end

function M.resolve(block_id: any): (Map?, any)
    local normalized, _, err = resolve_entry(block_id)
    return normalized, err
end

function M.get(args: any): (Map?, any)
    local row = type(args) == "table" and (args :: Map) or {}
    local detail, err = M.resolve(row.block_id)
    if err then return nil, err end
    if not detail or detail.public ~= true then
        return nil, errors.new({ kind = errors.NOT_FOUND, message = "Block not found: " .. text(row.block_id) })
    end
    return detail, nil
end

local function validate_tool_config(descriptor_value: Map, config: any): string?
    local valid, err = json.validate(descriptor_value.config, config)
    if valid ~= true then return "Block config invalid: " .. tostring(err) end
    return nil
end

function M.plan_descriptor(descriptor_value: any, instance: any): (Map?, string?)
    if type(descriptor_value) ~= "table" then return nil, "Block descriptor is required" end
    local declared = descriptor_value :: Map
    if declared.source_kind == "tool" then
        local row = type(instance) == "table" and (instance :: Map) or {}
        local config = type(row.config) == "table" and row.config or {}
        local issue = validate_tool_config(declared, config)
        if issue then return nil, issue end
        return lower.plan_descriptor(declared, instance)
    end
    if type(declared.declaration) ~= "table" then return nil, "Explicit Block descriptor is missing its declaration" end
    return lower.plan(declared.declaration, instance)
end

function M.plan(args: any): (Map?, any)
    local row = type(args) == "table" and (args :: Map) or {}
    local normalized, err = M.resolve(row.block_id)
    if not normalized then return nil, err end
    return M.plan_descriptor(normalized, {
        def_node_id = row.def_node_id,
        retry_policy = row.retry_policy,
        start_to_close_timeout = row.start_to_close_timeout,
        schedule_to_close_timeout = row.schedule_to_close_timeout,
        config = type(row.config) == "table" and row.config or {},
    })
end

function M.catalog(): (Map?, error?)
    local explicit, explicit_err = registry.find({ ["meta.type"] = M.BLOCK_TYPE })
    if explicit_err then return nil, explicit_err end
    local tools, tools_err = registry.find({ [".kind"] = "function.lua", ["meta.type"] = "tool" })
    if tools_err then return nil, tools_err end
    local out: Map = {}
    local failures: { string } = {}
    for _, entry in ipairs(type(explicit) == "table" and explicit or {}) do
        local normalized, err = explicit_descriptor(entry :: Map)
        if normalized then out[text(normalized.id)] = normalized
        else failures[#failures + 1] = text((entry :: Map).id) .. ": " .. tostring(err) end
    end
    for _, entry in ipairs(type(tools) == "table" and tools or {}) do
        if tool_adapter.visible(entry) then
            local normalized, err = tool_adapter.describe(entry)
            if normalized then out[text(normalized.id)] = normalized
            else failures[#failures + 1] = text((entry :: Map).id) .. ": " .. tostring(err) end
        end
    end
    if #failures > 0 then
        return nil, errors.new({ kind = errors.INTERNAL, message = "invalid Block declarations: " .. table.concat(failures, "; ") })
    end
    return out, nil
end

function M.list(args: any): (Map?, any)
    local limit, cursor, args_err = keyset.args(args)
    if args_err then return nil, args_err end
    local catalog, err = M.catalog()
    if err then return nil, err end
    local out: { Map } = {}
    for _, normalized in pairs(catalog :: Map) do
        local d = normalized :: Map
        if d.public == true then
            out[#out + 1] = {
                id = d.id,
                title = d.title,
                source_kind = d.source_kind,
                tool = d.tool == true,
            }
        end
    end
    local page, next_cursor = keyset.page(out, keyset.field("id"), limit :: integer, cursor)
    return { blocks = page, next_cursor = next_cursor }, nil
end

return M
