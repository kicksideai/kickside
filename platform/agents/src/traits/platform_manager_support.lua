-- Shared validation, contract access, and registry row helpers for Platform actions.
local contract = require("contract")
local funcs = require("funcs")
local security = require("security")
local agent_ref = require("agent_ref")

local AGENTS_CONTRACT = "kickside.agents:agents"
local TOOLS_CONTRACT = "kickside.agents:tools"
local CONNECTIONS_CONTRACT = "kickside.connection:connections"
local REPLY_PROVIDERS_CONTRACT = "kickside.connection:reply_providers"
local CONNECTION_CONTRACT = "kickside.connection:connection"
local REPLY_PROVIDER_CONTRACT = "kickside.connection:reply_provider"
local CONNECTION_REGISTRY_NS = "kickside.connection.registry"
local TRAIT_TYPE = "agent.trait"

local M = {}

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function lower(value: any): string
    return string.lower(trim(value))
end

local function contains_text(row: any, q: string): boolean
    if q == "" then return true end
    local function matches(value: any): boolean
        return lower(value):find(q, 1, true) ~= nil
    end
    return matches(row.id)
        or matches(row.title)
        or matches(row.comment)
        or matches(row.description)
        or matches(row.llm_alias)
        or matches(row.llm_description)
        or matches(row.kb_type)
        or matches(row.label)
        or matches(row.component_id)
        or matches(row.impl_id)
        or matches(row.provider)
        or matches(row.class)
        or matches(row.group)
end

local function has_tag(row: any, tag: string): boolean
    if tag == "" then return true end
    local tags = row.tags
    if type(tags) ~= "table" then return false end
    for _, value in ipairs(tags) do
        if tostring(value) == tag then return true end
    end
    return false
end

local function limit_of(args: any): integer
    local n = tonumber(args and args.limit)
    if not n or n < 1 then return 50 end
    if n > 100 then return 100 end
    return math.floor(n)
end

local function offset_of(args: any): integer
    local n = tonumber(args and args.offset)
    if not n or n < 0 then return 0 end
    return math.floor(n)
end

-- next_offset is the offset of the page after a component-service page that
-- started at offset, absent on the final page.
local function next_offset(offset: integer, rows: { any }, has_more: any): integer?
    if has_more == true then return offset + #rows end
    return nil
end

local function component_id_from(args: any): string
    local id = trim(args.component_id)
    if id ~= "" then return id end
    id = trim(args.agent_id)
    if agent_ref.is_user(id) then
        return agent_ref.user_component_id(id) or ""
    end
    return id
end

local function open_contract(contract_id: string): (any, error?)
    local def, err = contract.get(contract_id)
    if err then return nil, errors.wrap(err, "contract unavailable: " .. contract_id) end
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "authenticated actor and scope are required" })
    end
    local inst, open_err = def:with_actor(actor):with_scope(scope):open()
    if open_err then return nil, errors.wrap(open_err, "open failed: " .. contract_id) end
    return inst, nil
end

local function call_owner_func(function_id: string, args: any): (any, error?)
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "authenticated actor and scope are required" })
    end
    return funcs.new():with_actor(actor):with_scope(scope):call(function_id, args or {})
end

local function entry_contract_ids(entry: any): { string }
    local ids: { string } = {}
    local data = entry and entry.data
    local contracts = data and data.contracts
    if type(contracts) ~= "table" then return ids end
    for _, c in ipairs(contracts) do
        local id = type(c) == "table" and c.contract or nil
        if type(id) == "string" and id ~= "" then ids[#ids + 1] = id end
    end
    return ids
end

local function binds_contract(entry: any, contract_id: string): boolean
    for _, id in ipairs(entry_contract_ids(entry)) do
        if id == contract_id then return true end
    end
    return false
end

local function first_class(class_value: any): string
    if type(class_value) == "string" then return class_value end
    if type(class_value) == "table" then
        for _, value in ipairs(class_value) do
            if type(value) == "string" and value ~= "" then return value end
        end
    end
    return ""
end

-- List actions use their compact row by default. Callers that need a larger
-- registry value name it explicitly in fields.
local function selected_fields(args: any, allowed: { [string]: boolean }): ({ [string]: boolean }?, error?)
    local requested = args and args.fields
    if requested == nil then return {}, nil end
    if type(requested) ~= "table" then
        return nil, errors.new({ kind = errors.INVALID, message = "fields must be an array" })
    end
    local selected: { [string]: boolean } = {}
    for _, field in ipairs(requested) do
        if type(field) ~= "string" or allowed[field] ~= true then
            return nil, errors.new({ kind = errors.INVALID, message = "unsupported field: " .. tostring(field) })
        end
        selected[field] = true
    end
    return selected, nil
end

local function add_selected(row: any, source: any, selected: { [string]: boolean }): any
    for field, _ in pairs(selected) do
        local value = source[field]
        if value ~= nil then row[field] = value end
    end
    return row
end

local function component_summary(source: any, selected: { [string]: boolean }): any
    local meta = source.meta or {}
    return add_selected({
        component_id = source.component_id,
        impl_id = source.impl_id,
        created_at = source.created_at,
        updated_at = source.updated_at,
        access_level = source.access_level,
        title = meta.title or "",
        class = meta.class or "",
        provider = meta.provider or "",
        status = meta.status or "",
    }, source, selected)
end


M.AGENTS_CONTRACT = AGENTS_CONTRACT
M.TOOLS_CONTRACT = TOOLS_CONTRACT
M.CONNECTIONS_CONTRACT = CONNECTIONS_CONTRACT
M.REPLY_PROVIDERS_CONTRACT = REPLY_PROVIDERS_CONTRACT
M.CONNECTION_CONTRACT = CONNECTION_CONTRACT
M.REPLY_PROVIDER_CONTRACT = REPLY_PROVIDER_CONTRACT
M.CONNECTION_REGISTRY_NS = CONNECTION_REGISTRY_NS
M.TRAIT_TYPE = TRAIT_TYPE
M.trim = trim
M.lower = lower
M.contains_text = contains_text
M.has_tag = has_tag
M.limit_of = limit_of
M.offset_of = offset_of
M.next_offset = next_offset
M.component_id_from = component_id_from
M.open_contract = open_contract
M.call_owner_func = call_owner_func
M.entry_contract_ids = entry_contract_ids
M.binds_contract = binds_contract
M.first_class = first_class
M.selected_fields = selected_fields
M.add_selected = add_selected
M.component_summary = component_summary

return M
