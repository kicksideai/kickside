local util = require("util")
local contract = require("contract")
local security = require("security")
local engines = require("engines")
local component = require("component")
local stores = require("stores")
local keyset = require("keyset")
local tool_result = require("tool_result")
local kb_render = require("kb_render")

local KNOWLEDGE_BASES_CONTRACT = "kickside.knowledge:knowledge_bases"
local MAINTAINABLE_CONTRACT = "kickside.knowledge:maintainable"

local trim = util.trim

local function lower(value: any): string
    return string.lower(trim(value))
end

local function open_knowledge_bases(): (any?, error?)
    local def, err = contract.get(KNOWLEDGE_BASES_CONTRACT)
    if err then return nil, errors.wrap(err, "knowledge_bases contract unavailable") end
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "authenticated actor and scope are required" }) end
    local instance, open_err = def:with_actor(actor):with_scope(scope):open()
    if open_err then return nil, errors.wrap(open_err, "knowledge_bases contract open failed") end
    return instance, nil
end

local function matches(row: any, query: string): boolean
    if query == "" then return true end
    local meta = type(row.meta) == "table" and row.meta or {}
    for _, value in pairs({ row.component_id, row.kb_type, row.label, row.description,
        meta.title, meta.comment, meta.kb_type }) do
        if lower(value):find(query, 1, true) then return true end
    end
    return false
end

local function list_engines(args: any): any
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local fields, fields_err = kb_render.requested_fields(args.fields)
    if fields_err then return nil, fields_err end
    local rows, err = engines.list()
    if err then return nil, errors.wrap(err, "list knowledge engines") end
    local query = lower(args.q)
    local matched: { any } = {}
    for _, row in ipairs(rows or {}) do
        if matches(row, query) then
            matched[#matched + 1] = kb_render.selected({
                id = row.engine_id,
                kb_type = row.kb_type,
                label = row.label,
                icon = row.icon,
                badge = row.badge,
            }, row, fields :: { [string]: boolean })
        end
    end
    local page, next_cursor = keyset.page(matched, keyset.field("id"), limit :: integer, cursor)
    return { kb_engines = page, next_cursor = next_cursor }
end

local function list_knowledge_bases(args: any): any
    local limit, cursor, page_err = keyset.args(args)
    if page_err then return nil, page_err end
    local fields, fields_err = kb_render.requested_fields(args.fields)
    if fields_err then return nil, fields_err end
    local kbs, err = open_knowledge_bases()
    if err then return nil, err end
    local kb_type = trim(args.kb_type)
    local rows, list_err = kbs:list({ kb_type = kb_type ~= "" and kb_type or nil })
    if list_err then return nil, errors.wrap(list_err, "list knowledge bases") end
    local query = lower(args.q)
    local matched: { any } = {}
    for _, row in ipairs(rows or {}) do
        if matches(row, query) then
            local meta = type(row.meta) == "table" and row.meta or {}
            matched[#matched + 1] = kb_render.selected({
                component_id = row.component_id,
                name = row.label or meta.title,
                kb_type = row.kb_type or meta.kb_type,
                status = row.status or meta.status,
            }, row, fields :: { [string]: boolean })
        end
    end
    local page, next_cursor = keyset.page(matched, keyset.field("component_id"), limit :: integer, cursor)
    return { knowledge_bases = page, next_cursor = next_cursor }
end

local function upsert_knowledge_base(args: any): any
    local name = trim(args.name)
    if name == "" then return tool_result.fail(errors.INVALID, "name is required") end
    local kbs, err = open_knowledge_bases()
    if err then return nil, err end
    local result, upsert_err = kbs:upsert({
        name = name,
        description = args.description,
        kb_type = args.kb_type,
        embedding_model = args.embedding_model,
        config = args.config,
        enrichment_agent_id = args.enrichment_agent_id,
    })
    if upsert_err then return nil, upsert_err end
    return result, nil
end

local function delete_knowledge_base(args: any): any
    local component_id = trim(args.component_id)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id is required") end
    local kbs, err = open_knowledge_bases()
    if err then return nil, err end
    local result, delete_err = kbs:delete({ component_id = component_id })
    if delete_err then return nil, errors.wrap(delete_err, "delete knowledge base") end
    return result, nil
end

-- The engine backing a knowledge base, resolved from the component itself: its
-- declared kb_type first, its impl binding second -- the same resolution the KB
-- read endpoints use. The control plane names no engine; what a knowledge base
-- can do is whatever its engine declares on its descriptor.
local function engine_of(component_id: string): (any?, error?)
    local svc, svc_err = component.get_service()
    if svc_err then return nil, errors.wrap(svc_err, "component service unavailable") end
    if not svc then return nil, errors.new({ kind = errors.UNAVAILABLE, message = "component service unavailable" }) end
    local comp, comp_err = svc:get({ component_id = component_id })
    if comp_err then return nil, errors.wrap(comp_err, "knowledge base read failed") end
    if not comp or not comp.success then
        return nil, errors.new({ kind = errors.NOT_FOUND, message = "knowledge base not found" })
    end
    local meta: any = type(comp.meta) == "table" and comp.meta or {}
    if meta.class ~= "knowledge_base" then
        return nil, errors.new({ kind = errors.INVALID, message = "component is not a knowledge base" })
    end
    local engine: any = nil
    local resolve_err: any = nil
    if type(meta.kb_type) == "string" and meta.kb_type ~= "" then
        engine, resolve_err = engines.resolve(meta.kb_type)
    end
    if not engine then
        engine, resolve_err = engines.by_impl(comp.impl_id)
    end
    if resolve_err then return nil, resolve_err end
    if not engine then
        return nil, errors.new({ kind = errors.NOT_FOUND, message = "no knowledge engine for this knowledge base" })
    end
    return engine, nil
end

-- Maintenance is an optional engine capability. The engine declares its binding
-- in metadata, while the knowledge control plane supplies the validated KB id
-- as the contract context; callers cannot select an arbitrary binding.
local function open_maintainable(component_id: string): (any?, error?)
    local engine, engine_err = engine_of(component_id)
    if not engine then return nil, engine_err end
    local binding = (engine :: any).maintenance_binding
    if type(binding) ~= "string" or binding == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "this knowledge base's engine does not support maintenance" })
    end
    return stores.open_kb_store_contract(MAINTAINABLE_CONTRACT, binding, { component_id = component_id })
end

-- A whole-KB rewrite may take minutes to hours and must run under the engine's
-- durable job worker. Scheduling requires WRITE access; status is available to
-- readers of the same KB.
local function schedule_maintenance(invoke: any, run_type: string, args: any): any
    local component_id = trim(args.component_id)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id is required") end
    local _, access_err = component.validate_access(component_id, component.ACCESS.WRITE)
    if access_err then return tool_result.fail(errors.PERMISSION_DENIED, "access denied") end
    local instance, open_err = open_maintainable(component_id)
    if not instance then return nil, open_err end
    local receipt, run_err = invoke(instance)
    if run_err then return nil, errors.wrap(run_err, "schedule " .. run_type) end
    if not receipt then return tool_result.fail(errors.INTERNAL, "schedule " .. run_type .. " returned no receipt") end
    return {
        kb_id = component_id,
        run_type = run_type,
        job_id = (receipt :: any).job_id,
        scheduled = (receipt :: any).scheduled == true,
        run = (receipt :: any).run,
    }
end

local function knowledge_base_maintenance(args: any): any
    local component_id = trim(args.component_id)
    if component_id == "" then return tool_result.fail(errors.INVALID, "component_id is required") end
    local _, access_err = component.validate_access(component_id, component.ACCESS.READ)
    if access_err then return tool_result.fail(errors.PERMISSION_DENIED, "access denied") end
    local instance, open_err = open_maintainable(component_id)
    if not instance then return nil, open_err end
    local report, read_err = (instance :: any):maintenance_status({})
    if read_err then return nil, errors.wrap(read_err, "read knowledge base maintenance") end
    if not report then return tool_result.fail(errors.INTERNAL, "knowledge base maintenance returned no report") end
    return {
        kb_id = component_id,
        resummarize = (report :: any).resummarize,
        reembed = (report :: any).reembed,
    }
end

local function handler(args: any): (any, error?)
    args = type(args) == "table" and args or {}
    local action = trim(args.action)
    if action == "list_kb_engines" then return list_engines(args) end
    if action == "list_knowledge_bases" then return list_knowledge_bases(args) end
    if action == "upsert_knowledge_base" then return upsert_knowledge_base(args) end
    if action == "delete_knowledge_base" then return delete_knowledge_base(args) end
    if action == "resummarize_knowledge_base" then
        return schedule_maintenance(function(instance: any): (any?, string?)
            return instance:schedule_resummarize({})
        end, "resummarize", args)
    end
    if action == "reembed_knowledge_base" then
        return schedule_maintenance(function(instance: any): (any?, string?)
            return instance:schedule_reembed({})
        end, "reembed", args)
    end
    if action == "knowledge_base_maintenance" then return knowledge_base_maintenance(args) end
    return tool_result.fail(errors.INVALID, "unknown action")
end

return { handler = handler }
