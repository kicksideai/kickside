-- Canonical implementation of `kickside.knowledge:knowledge_bases` registry.
--
-- A KB is a component with class=knowledge_base whose impl_id is the embeddable
-- binding of whichever engine backs it. The engine (impl binding + store
-- contract) is resolved from the kb_engine registry by kb_type, so this control
-- plane names no engine.
--
-- This registry composes:
--   - kickside.component:component_service for component lifecycle
--   - the engine store contract (kickside.knowledge:kb_store_lifecycle) resolved from the
--     discovered engine

local contract = require("contract")
local uuid = require("uuid")
local errors = require("errors")
local security = require("security")
local component = require("component")
local engines = require("engines")
local kb_types = require("kb_types")
local envelope = require("envelope")

local COMPONENT_SERVICE = "kickside.component:component_service"
local KB_CLASS = kb_types.COMPONENT_CLASS
-- The enrichment_agent_id names an agent component. Validate the referenced
-- component's public class here so a dangling or non-agent reference never
-- reaches an engine store. Component identity stays canonical throughout.
-- The core threads contract, whose ensure_thread attaches a KB's primary thread and
-- auto-applies a kind binding's declared projections/retention. thread_id ==
-- component_id, so the injection workers derive kb_id from input.thread_id.
local THREADS_CONTRACT = "kickside.core:threads"

local M = {}

-- ─── helpers ───────────────────────────────────────────────────────────

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

-- Open the store engine for a given store contract id. Every KB engine
-- implements the same (component_id, embedding_model, config, opts?) create_store
-- and (component_id) delete_store shape, so one opener serves every engine.
local function open_store(contract_id: string): (any, error?)
    local svc, err = contract.get(contract_id)
    if err or not svc then return nil, errors.new({ kind = errors.INTERNAL, message = "store contract '" .. contract_id .. "' unavailable: " .. tostring(err) }) end
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "security actor and scope are required" })
    end
    local inst, oerr = (svc :: any):with_actor(actor):with_scope(scope):open()
    if oerr or not inst then return nil, errors.new({ kind = errors.INTERNAL, message = "store '" .. contract_id .. "' open failed: " .. tostring(oerr) }) end
    return inst, nil
end

-- validate_enrichment_agent rejects a non-existent enrichment_agent_id at the write
-- site. An empty/absent id selects the default enrichment (no agent), so it passes.
local function validate_enrichment_agent(svc: any, enrichment_agent_id: any): error?
    if not is_str(enrichment_agent_id) then return nil end
    local id = enrichment_agent_id :: string
    local comp, err = svc:get({ component_id = id })
    if err then
        return (errors.new({ message = "enrichment_agent_id lookup failed: " .. tostring(err), kind = errors.INTERNAL }) :: any)
    end
    local meta = comp and type(comp.meta) == "table" and comp.meta or {}
    if not comp or not comp.success or meta.class ~= "agent" then
        return (errors.new({ message = "enrichment_agent_id references a non-existent agent: " .. id, kind = errors.NOT_FOUND }) :: any)
    end
    return nil
end

local function open_component_service(): (any, error?)
    local svc, err = contract.get(COMPONENT_SERVICE)
    if err then return nil, errors.wrap(err, "component_service") end
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "security actor and scope are required" })
    end
    local instance, ierr = svc:with_actor(actor):with_scope(scope):open()
    if ierr then return nil, errors.wrap(ierr, "open") end
    return instance, nil
end

local function add_store_contract(out: { any }, seen: { [string]: boolean }, contract_id: any): ()
    if type(contract_id) == "string" and contract_id ~= "" and not seen[contract_id] then
        seen[contract_id] = true
        out[#out + 1] = contract_id
    end
end

local function store_contracts_for_component(component_row: any): ({ any }?, error?)
    local meta: any = type(component_row.meta) == "table" and component_row.meta or {}
    local seen: { [string]: boolean } = {}
    local out: { any } = {}

    if is_str(meta.kb_type) then
        local engine, err = engines.resolve(meta.kb_type)
        if not engine then return nil, err end
        add_store_contract(out, seen, engine.store_contract)
        return out, nil
    end

    local by_impl, impl_err = engines.by_impl(component_row.impl_id)
    if impl_err then return nil, impl_err end
    if by_impl then
        add_store_contract(out, seen, by_impl.store_contract)
        return out, nil
    end

    return nil, errors.new({ kind = errors.INTERNAL, message = "knowledge base has no declared owner engine" })
end

-- ensure_primary_thread creates the KB's primary thread (thread_id == component_id)
-- so the engine's declared projection set (meta.projections on engine.engine_id) is
-- auto-applied through the canonical threads.ensure_thread -> autoinit path, exactly
-- like inbox/skills. The thread is declared under engine.engine_id (which carries the
-- projections) while the KB component keeps its embeddable impl_id for embed dispatch.
-- This is the single provisioning path: there is no imperative ensure elsewhere.
local function ensure_primary_thread(component_id: string, engine: any): error?
    if type(engine) ~= "table" then return errors.new({ kind = errors.INVALID, message = "engine is required to provision a knowledge base" }) end
    local declaration_impl_id = engine.engine_id
    if not is_str(declaration_impl_id) then
        return errors.new({ kind = errors.INTERNAL, message = "engine has no binding id to declare the KB thread from" })
    end
    local threads, get_err = contract.get(THREADS_CONTRACT)
    if get_err or not threads then
        return errors.wrap(get_err, "threads contract unavailable")
    end
    local inst, open_err = (threads :: any):with_actor(security.actor()):with_scope(security.scope()):open()
    if open_err or not inst then
        return errors.wrap(open_err, "threads open failed")
    end
    -- The thread class comes from the engine binding's meta.thread declaration,
    -- read by the thread writer — one authority for create and convergence alike.
    local _, err = inst:ensure_thread({
        component_id = component_id,
        impl_id = declaration_impl_id,
    })
    if err then return errors.wrap(err, "ensure primary thread") end
    return nil
end

-- ─── contract methods ──────────────────────────────────────────────────

-- create: create a KB. The kb_type's engine (impl binding + store contract) is
-- resolved from the kb_engine registry, not a hardcoded type→impl map. An
-- unknown type errors clearly when no engine is installed.
-- Input:  { name, description?, kb_type?, embedding_model, config? }
-- Output: { component_id, kb_type, rollback }
function M.create(args: any): (kb_types.CreateResult?, error?)
    args = args or {}
    if not is_str(args.name) then return nil, errors.new({ kind = errors.INVALID, message = "name is required" }) end
    if not is_str(args.embedding_model) then
        return nil, errors.new({ kind = errors.INVALID, message = "embedding_model is required. "
            .. "Use class:embed for the configured Embedding class. If no embedding model is configured, "
            .. "add one in System > Models and assign it to Embedding." })
    end

    local name = args.name :: string
    local embedding_model = args.embedding_model :: string
    local description = is_str(args.description) and (args.description :: string) or ""
    local engine, eng_err = nil, nil
    if is_str(args.kb_type) then
        engine, eng_err = engines.resolve(args.kb_type)
    else
        engine, eng_err = engines.default()
    end
    if not engine then return nil, eng_err end
    local kb_type: string = engine.kb_type :: string

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    local enrichment_agent_id = args.enrichment_agent_id
    local agent_err = validate_enrichment_agent(svc, enrichment_agent_id)
    if agent_err then return nil, agent_err end

    local component_id = uuid.v4()

    local meta: { [string]: string } = {
        title = name,
        comment = description,
        class = KB_CLASS,
        kb_type = kb_type,
        embedding_model = embedding_model,
    }
    if is_str(args.icon) then meta.icon = args.icon end

    local result, err = svc:register({
        component_id = component_id,
        impl_id = engine.impl_id,
        meta = meta,
        parent_id = is_str(args.parent_id) and (args.parent_id :: string) or nil,
    })
    if err then return nil, errors.wrap(err, "register_component") end
    if not result or not result.success then
        return nil, errors.new({ kind = errors.INTERNAL, message = "register failed: " .. tostring(result and result.error or "unknown") })
    end

    -- Create the per-component store through the engine's store contract. The
    -- engine is the single source of truth for its config defaults: apply
    -- engine.default_config (explicit values in args.config win). This is keyed off
    -- the resolved engine, not a per-kb_type list here, so a new engine/kb_type
    -- cannot silently ship without the config its own impl requires (e.g. the
    -- contextual summary/chunk models kb10's embed_func mandates). The kb_type +
    -- enrichment agent travel in opts, which engines that don't need them ignore.
    local config: any = engines.apply_default_config(args.config, engine)
    local store, store_err = open_store(engine.store_contract :: string)
    if not store then
        svc:delete({ component_id = component_id })
        return nil, store_err
    end
    local _, ex_err = store:create_store({
        component_id = component_id,
        embedding_model = embedding_model,
        config = config,
        opts = {
            kb_type = kb_type,
            enrichment_agent_id = enrichment_agent_id,
            name = name,
            description = description,
            is_graph = engine.is_graph == true,
        },
    })
    if ex_err then
        svc:delete({ component_id = component_id })
        return nil, errors.wrap(ex_err, "create_store")
    end

    local meta_ok, meta_err = component.set_meta(component_id, {
        status = "ready",
        kb_type = kb_type,
        auto_summary = "",
        auto_description = "",
        embedding_count = 0,
        document_count = 0,
        concept_count = 0,
        chunk_count = 0,
        summary_count = 0,
        claim_count = 0,
    })
    if not meta_ok then
        svc:delete({ component_id = component_id })
        return nil, errors.wrap(meta_err, "public meta sync")
    end

    local proj_err = ensure_primary_thread(component_id, engine)
    if proj_err then
        svc:delete({ component_id = component_id })
        return nil, proj_err
    end

    return ({
        component_id = component_id,
        kb_type = kb_type,
        name = name,
        rollback = {
            method = "delete",
            args = { component_id = component_id },
        },
    }) :: kb_types.CreateResult, nil
end

-- find: lookup by component_id or name.
-- Input:  { component_id? } | { name? }
-- Output: kb row or nil
function M.find(args: any): (kb_types.ComponentRow?, error?)
    args = args or {}
    if not is_str(args.component_id) and not is_str(args.name) then
        return nil, errors.new({ kind = errors.INVALID, message = "component_id or name is required" })
    end

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    local meta_filter: { [string]: string } = { class = KB_CLASS }
    if is_str(args.name) then meta_filter.title = args.name :: string end

    local result, err = svc:list({ filters = { meta = meta_filter } })
    if err then return nil, errors.wrap(err, "list_components") end
    if not result or not result.success then
        return nil, errors.new({ kind = errors.INTERNAL, message = "list_components returned " .. tostring(result and result.error or "no result") })
    end

    local list = ((result.components or {}) :: { kb_types.ComponentRow })
    if is_str(args.component_id) then
        for _, c in ipairs(list) do
            if c.component_id == args.component_id then return c, nil end
        end
        return nil, nil
    end
    if #list == 0 then return nil, nil end
    return list[1], nil
end

-- upsert: idempotent. Natural key is name.
function M.upsert(args: any): (kb_types.UpsertResult?, error?)
    args = args or {}
    if not is_str(args.name) then return nil, errors.new({ kind = errors.INVALID, message = "name is required" }) end
    local existing, err = M.find({ name = args.name })
    if err then return nil, err end
    if existing then
        return ({ kb = existing, created = false, rollback = nil }) :: kb_types.UpsertResult, nil
    end
    local created, cerr = M.create(args)
    if cerr then return nil, cerr end
    local kb, find_err = M.find({ component_id = created.component_id })
    if find_err then return nil, find_err end
    if not kb then return nil, errors.new({ kind = errors.NOT_FOUND, message = "created KB component not found: " .. created.component_id }) end
    return ({ kb = kb, created = true, rollback = created.rollback }) :: kb_types.UpsertResult, nil
end

-- update: patch metadata (title/description/icon) — embedding_model is immutable.
function M.update(args: any): (kb_types.ComponentRef?, string?)
    args = args or {}
    if not is_str(args.component_id) then return nil, "component_id is required" end
    if args.embedding_model ~= nil then
        return nil, "embedding_model is immutable; create a new knowledge base to change it"
    end
    if args.kb_type ~= nil then
        return nil, "kb_type is immutable; create a new knowledge base to change it"
    end

    local meta_fields: { [string]: any } = {}
    if is_str(args.name) then
        meta_fields.title = args.name
    end
    if is_str(args.description) then
        meta_fields.comment = args.description
    end
    if next(meta_fields) == nil then return nil, "nothing to update (provide name or description)" end

    local ok, err = component.set_meta(args.component_id :: string, meta_fields)
    if not ok then return nil, "update_component: " .. tostring(err or "failed") end
    return ({ component_id = args.component_id }) :: kb_types.ComponentRef, nil
end

function M.delete(args: any): (kb_types.ComponentRef?, error?)
    args = args or {}
    if not is_str(args.component_id) then return nil, errors.new({ message = "component_id is required", kind = errors.INVALID }) end

    local component_id = args.component_id

    local svc, sverr = open_component_service()
    if not svc then return nil, envelope.call_error(sverr, "component_service") end

    local comp, comp_err = svc:get({ component_id = component_id })
    if comp_err then return nil, envelope.call_error(comp_err, "get_component") end
    if not comp or not comp.success then
        return nil, errors.new({ message = "knowledge base not found: " .. component_id, kind = errors.NOT_FOUND })
    end
    local meta: any = type(comp.meta) == "table" and comp.meta or {}
    if meta.class ~= KB_CLASS then
        return nil, errors.new({ message = "component is not a knowledge base: " .. component_id, kind = errors.INVALID })
    end

    local contract_ids, contract_err = store_contracts_for_component(comp)
    if contract_err then return nil, envelope.call_error(contract_err, "store_contract") end

    for _, contract_id in ipairs(contract_ids or {}) do
        local store, store_err = open_store(contract_id :: string)
        if not store then return nil, envelope.call_error(store_err, "store_open") end
    end

    local result, err = svc:delete({ component_id = component_id })
    if err then return nil, envelope.call_error(err, "delete_component") end
    local result_err = envelope.error_of(result, "delete_component")
    if result_err then return nil, result_err end
    return ({ component_id = component_id, deleted = result.deleted == true,
        in_progress = result.in_progress == true, status = result.status, cleanup_pending = result.cleanup_pending,
        kind = result.kind, retryable = result.retryable, details = result.details, discarded = result.discarded }) :: kb_types.ComponentRef, nil
end

-- list: enumerate KBs.
function M.list(args: any): ({ kb_types.ComponentRow }?, error?)
    args = args or {}

    local svc, sverr = open_component_service()
    if not svc then return nil, sverr end

    local meta_filter: { [string]: string } = { class = KB_CLASS }
    if is_str(args.kb_type) then meta_filter.kb_type = args.kb_type :: string end

    local result, err = svc:list({ filters = { meta = meta_filter } })
    if err then return nil, errors.wrap(err, "list_components") end
    if not result or not result.success then
        return nil, errors.new({ kind = errors.INTERNAL, message = "list_components returned " .. tostring(result and result.error or "no result") })
    end
    return ((result.components or {}) :: { kb_types.ComponentRow }), nil
end

M._validate_enrichment_agent = validate_enrichment_agent

return M
