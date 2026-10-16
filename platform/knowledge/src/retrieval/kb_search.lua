-- Control-plane KB query facade. The single inbound query seam: resolve a KB and
-- delegate to the engine's query_binding (the queryable contract the provider
-- implements). Retrieval — vector, graph, or otherwise — is entirely the engine's
-- concern; the control plane never reads an engine's node/vector store. So /search
-- and the kb_query trait share one model-agnostic query path.

local contract = require("contract")
local security = require("security")
local component = require("component")
local engines = require("engines")
local stores = require("stores")

local M = {}
local QUERYABLE_CONTRACT = "kickside.contract:queryable"
local MAX_QUERY_LIMIT = 100

local function current_runtime_identity(): (any, any, string?)
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, nil, "security actor and scope are required"
    end
    return actor, scope, nil
end

local function normalize_limit(value: any, default_value: any): number?
    local n = tonumber(value)
    if not n then n = tonumber(default_value) end
    if not n then return nil end
    n = math.floor(n)
    if n < 1 then n = 1 end
    if n > MAX_QUERY_LIMIT then n = MAX_QUERY_LIMIT end
    return n
end

-- query(kb_id, { query, limit?, offset? }) -> (result, err). result is the engine/graph
-- retrieval envelope ({ success, items, count, ... }).
function M.query(kb_id: any, opts: any): (any, any)
    opts = opts or {}
    if type(kb_id) ~= "string" or kb_id == "" then
        return nil, "knowledge base id is required"
    end
    local query_text = opts.query
    if type(query_text) ~= "string" or query_text == "" then
        return nil, "query is required"
    end

    local svc, svc_err = component.get_service()
    if svc_err or not svc then
        return nil, "component service unavailable: " .. tostring(svc_err)
    end
    local comp, comp_err = svc:get({ component_id = kb_id })
    if not comp or not comp.success then
        return nil, tostring(comp_err or "knowledge base not found")
    end

    local _, _, engine, store_err = stores.resolve_component_store(kb_id)
    if store_err or not engine then return nil, tostring(store_err or "no query engine for this knowledge base") end
    local eng = engine :: { kb_type: any, query_binding: any, default_config: any }

    -- Delegate to the provider's queryable binding. Whatever retrieval the engine
    -- performs (vector, graph, hybrid) is its own concern behind this contract.
    if not eng.query_binding then
        return nil, "no query engine for this knowledge base"
    end
    local actor, scope, security_err = current_runtime_identity()
    if security_err then return nil, security_err end
    local query_def, query_def_err = contract.get(QUERYABLE_CONTRACT)
    if query_def_err or not query_def then
        return nil, "failed to get queryable: " .. tostring(query_def_err)
    end
    local inst, open_err = (query_def :: any):with_actor(actor):with_scope(scope):open(eng.query_binding :: string, { component_id = kb_id })
    if open_err or not inst then
        return nil, "failed to open queryable: " .. tostring(open_err)
    end
    local defaults = (type(eng.default_config) == "table" and eng.default_config or {}) :: any
    local limit = normalize_limit(opts.limit, defaults.search_limit)
    return inst:query({ query = query_text, limit = limit, offset = opts.offset })
end

-- config(kb_id) -> (merged_config, engine, err). The KB's stored config overlaid
-- on the engine defaults, plus the engine descriptor. The answering layer uses
-- it to select a query driver and models without re-resolving the component.
function M.config(kb_id: any): (any, any, string?)
    if type(kb_id) ~= "string" or kb_id == "" then
        return nil, nil, "knowledge base id is required"
    end
    local svc, svc_err = component.get_service()
    if svc_err or not svc then
        return nil, nil, "component service unavailable: " .. tostring(svc_err)
    end
    local comp, comp_err = svc:get({ component_id = kb_id })
    if not comp or not comp.success then
        return nil, nil, tostring(comp_err or "knowledge base not found")
    end
    local stored: any = {}
    local _, store_row, engine, store_err = stores.resolve_component_store(kb_id)
    if store_err or not engine then return nil, nil, tostring(store_err or "no engine for this knowledge base") end
    local s = store_row :: { config: any }?
    if s and type(s.config) == "table" then
        stored = s.config
    end
    return engines.apply_default_config(stored, engine), engine, nil
end

return M
