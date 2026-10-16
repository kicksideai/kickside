-- Platform registry discovery and listing actions.
local registry = require("registry")
local component = require("component")
local agent_ref = require("agent_ref")
local capability_context = require("capability_context")
local support = require("platform_manager_support")
local tool_result = require("tool_result")
local TOOLS_CONTRACT = support.TOOLS_CONTRACT
local CONNECTION_CONTRACT = support.CONNECTION_CONTRACT
local REPLY_PROVIDER_CONTRACT = support.REPLY_PROVIDER_CONTRACT
local CONNECTION_REGISTRY_NS = support.CONNECTION_REGISTRY_NS
local TRAIT_TYPE = support.TRAIT_TYPE
local trim = support.trim
local lower = support.lower
local contains_text = support.contains_text
local has_tag = support.has_tag
local limit_of = support.limit_of
local offset_of = support.offset_of
local next_offset_of = support.next_offset
local open_contract = support.open_contract
local call_owner_func = support.call_owner_func
local entry_contract_ids = support.entry_contract_ids
local binds_contract = support.binds_contract
local first_class = support.first_class
local selected_fields = support.selected_fields
local add_selected = support.add_selected
local component_summary = support.component_summary
local keyset = require("keyset")

local M = {}

-- Registry-backed lists page their filtered rows in id order.
local function list_component_kinds(args: any): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local fields, fields_err = selected_fields(args, { description = true, component = true })
    if fields_err then return nil, fields_err end
    local entries, err = registry.find({ [".kind"] = "contract.binding" })
    if err then return nil, errors.wrap(err, "registry.find component kinds") end

    local q = lower(args.q)
    local namespace = trim(args.namespace)
    local out: { any } = {}
    for _, entry in ipairs(entries or {}) do
        local meta = entry.meta or {}
        local id = tostring(entry.id or "")
        local include = type(meta.component) == "table" or type(meta.class) == "table" or type(meta.class) == "string"
        if include and namespace ~= "" and id:sub(1, #namespace) ~= namespace then include = false end
        if include then
            local searchable = {
                id = id,
                title = meta.title or id,
                description = meta.comment or "",
                class = meta.class or {},
                group = meta.group or "",
            }
            if contains_text(searchable, q) then
                local row = add_selected({
                    id = id,
                    title = meta.title or id,
                    icon = meta.icon or "",
                    class = meta.class or {},
                    group = meta.group or "",
                    contracts = entry_contract_ids(entry),
                }, { description = meta.comment, component = meta.component }, fields :: { [string]: boolean })
                out[#out + 1] = row
            end
        end
    end
    local page, next_cursor = keyset.page(out, keyset.field("id"), limit :: integer, cursor)
    return { component_kinds = page, next_cursor = next_cursor }, nil
end

-- list_components filters by class, provider and q in the component query
-- and pages by offset.
local function list_components(args: any): (any, error?)
    local fields, fields_err = selected_fields(args, { description = true, meta = true })
    if fields_err then return nil, fields_err end
    local service, svc_err = component.get_service()
    if svc_err then return nil, errors.wrap(svc_err, "component service") end
    if not service then return tool_result.fail(errors.UNAVAILABLE, "component service unavailable") end
    local meta: { [string]: string } = {}
    if trim(args.class) ~= "" then meta.class = trim(args.class) end
    if trim(args.provider) ~= "" then meta.provider = trim(args.provider) end
    local offset = offset_of(args)
    local request: any = {
        filters = { meta = meta, text = trim(args.q) },
        pagination = { limit = limit_of(args), offset = offset },
    }
    local result, err = service:list(request)
    if err then return nil, errors.wrap(err, "list components") end
    if tool_result.is_domain_error(result) then return result end
    if not result then return tool_result.fail(errors.INTERNAL, "list components returned no result") end

    local out: { any } = {}
    for _, row in ipairs(result.components or {}) do
        local shaped = component_summary(row, fields :: { [string]: boolean })
        if (fields :: { [string]: boolean }).description then
            shaped.description = (row.meta or {}).comment or ""
        end
        out[#out + 1] = shaped
    end
    return { components = out, next_offset = next_offset_of(offset, out, result.has_more) }, nil
end

local function list_traits(args: any): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local fields, fields_err = selected_fields(args, { description = true, context_schema = true, tools = true })
    if fields_err then return nil, fields_err end
    local entries, err = registry.find({
        [".kind"] = "registry.entry",
        ["meta.type"] = TRAIT_TYPE,
    })
    if err then return nil, errors.wrap(err, "registry.find traits") end

    local q = lower(args.q)
    local namespace = trim(args.namespace)
    local tag = trim(args.tag)
    local out: { any } = {}
    for _, entry in ipairs(entries or {}) do
        local meta = entry.meta or {}
        local id = tostring(entry.id or "")
        local include = meta.private ~= true and meta.public == true
        if include and namespace ~= "" and id:sub(1, #namespace) ~= namespace then
            include = false
        end
        if include then
            local searchable = { id = id, title = meta.title or id, description = meta.comment or "", tags = meta.tags or {} }
            if contains_text(searchable, q) and has_tag(searchable, tag) then
                local row = add_selected({
                    id = id,
                    title = meta.title or id,
                    context_requirements = capability_context.summary(meta.context_schema),
                    icon = meta.icon or "",
                    tags = meta.tags or {},
                }, {
                    description = meta.comment,
                    context_schema = meta.context_schema,
                    tools = entry.data and entry.data.tools or {},
                }, fields :: { [string]: boolean })
                out[#out + 1] = row
            end
        end
    end
    local page, next_cursor = keyset.page(out, keyset.field("id"), limit :: integer, cursor)
    return { traits = page, next_cursor = next_cursor }, nil
end

-- list_tools pages compact public tool rows in id order.
local function list_tools(args: any): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local fields, fields_err = selected_fields(args, {
        comment = true,
        llm_description = true,
        input_schema = true,
        output_schema = true,
        modules = true,
    })
    if fields_err then return nil, fields_err end
    local tools, err = open_contract(TOOLS_CONTRACT)
    if err then return nil, err end
    local rows, list_err = tools:list({
        namespace = trim(args.namespace) ~= "" and trim(args.namespace) or nil,
        tag = trim(args.tag) ~= "" and trim(args.tag) or nil,
    })
    if list_err then return nil, errors.wrap(list_err, "list tools") end

    local q = lower(args.q)
    local matched: { any } = {}
    for _, row in ipairs(rows or {}) do
        if contains_text(row, q) then
            matched[#matched + 1] = add_selected({
                id = row.id,
                title = row.title or row.id,
                llm_alias = row.llm_alias or "",
                tags = row.tags or {},
                public = row.public == true,
            }, row, fields :: { [string]: boolean })
        end
    end
    local page, next_cursor = keyset.page(matched, keyset.field("id"), limit :: integer, cursor)
    return { tools = page, next_cursor = next_cursor }, nil
end

local function list_agents(args: any): (any, error?)
    local fields, fields_err = selected_fields(args, { description = true })
    if fields_err then return nil, fields_err end
    local offset = offset_of(args)
    local page, list_err = call_owner_func("kickside.agents.registry:a_list", {
        text = trim(args.q),
        pagination = { limit = limit_of(args), offset = offset },
    })
    if list_err then return nil, errors.wrap(list_err, "list agents") end

    local out: { any } = {}
    for _, row in ipairs(page and page.agents or {}) do
        local meta = row.meta or {}
        local shaped = add_selected({
            component_id = row.component_id,
            agent_id = agent_ref.user(tostring(row.component_id or "")),
            title = meta.title or "",
            status = meta.status or "",
            model = meta.model or "",
        }, { description = meta.comment }, fields :: { [string]: boolean })
        out[#out + 1] = shaped
    end
    return { agents = out, next_offset = next_offset_of(offset, out, page and page.has_more) }, nil
end

local function list_bindings_for_contract(args: any, contract_id: string, key: string): (any, error?)
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local fields, fields_err = selected_fields(args, {
        description = true,
        classes = true,
        reply = true,
        config_schema = true,
    })
    if fields_err then return nil, fields_err end
    local entries, err = registry.find({ [".kind"] = "contract.binding" })
    if err then return nil, errors.wrap(err, "registry.find providers") end
    local q = lower(args.q)
    local out: { any } = {}
    for _, entry in ipairs(entries or {}) do
        if binds_contract(entry, contract_id) then
            local meta = entry.meta or {}
            local searchable = {
                id = entry.id,
                provider = meta.provider or "",
                title = meta.title or meta.provider or entry.id,
                description = meta.comment or "",
                class = first_class(meta.class),
            }
            if contains_text(searchable, q) then
                local row = add_selected({
                    id = entry.id,
                    provider = meta.provider or "",
                    title = meta.title or meta.provider or entry.id,
                    icon = meta.icon or "",
                    class = first_class(meta.class),
                    contracts = entry_contract_ids(entry),
                }, {
                    description = meta.comment,
                    classes = meta.class or {},
                    reply = meta.reply,
                    config_schema = meta.config_schema or meta.private_context_schema or meta.auth_schema,
                }, fields :: { [string]: boolean })
                out[#out + 1] = row
            end
        end
    end
    local page, next_cursor = keyset.page(out, keyset.field("id"), limit :: integer, cursor)
    return { [key] = page, next_cursor = next_cursor }, nil
end

local function list_connection_providers(args: any): (any, error?)
    return list_bindings_for_contract(args, CONNECTION_CONTRACT, "connection_providers")
end

local function list_reply_provider_kinds(args: any): (any, error?)
    return list_bindings_for_contract(args, REPLY_PROVIDER_CONTRACT, "reply_provider_kinds")
end

local function list_connections(args: any): (any, error?)
    local fields, fields_err = selected_fields(args, { meta = true, description = true })
    if fields_err then return nil, fields_err end
    local offset = offset_of(args)
    local page, list_err = call_owner_func(CONNECTION_REGISTRY_NS .. ":list", {
        provider = trim(args.provider) ~= "" and trim(args.provider) or nil,
        name = trim(args.name) ~= "" and trim(args.name) or nil,
        text = trim(args.q) ~= "" and trim(args.q) or nil,
        pagination = { limit = limit_of(args), offset = offset },
    })
    if list_err then return nil, errors.wrap(list_err, "list connections") end
    local rows: { any } = {}
    for _, row in ipairs(page and page.connections or {}) do
        local shaped = component_summary(row, fields :: { [string]: boolean })
        if (fields :: { [string]: boolean }).description then shaped.description = (row.meta or {}).comment or "" end
        rows[#rows + 1] = shaped
    end
    return { connections = rows, next_offset = next_offset_of(offset, rows, page and page.has_more) }, nil
end


M.list_component_kinds = list_component_kinds

M.list_components = list_components

M.list_traits = list_traits

M.list_tools = list_tools

M.list_agents = list_agents

M.list_connection_providers = list_connection_providers

M.list_reply_provider_kinds = list_reply_provider_kinds

M.list_connections = list_connections

return M
