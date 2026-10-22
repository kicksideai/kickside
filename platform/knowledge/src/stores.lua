local util = require("util")
-- Shared opener for the KB engine store LIFECYCLE contract. Platform knowledge
-- code resolves an engine's per-component store row here (create/get/update/delete
-- only). Node/edge/embedding/graph state is the engine's own concern and never
-- reachable through this seam.

local contract = require("contract")
local security = require("security")
local engines = require("engines")

local M = {}

local trim = util.trim

local function current_runtime_identity(): (any, any, error?)
    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        return nil, nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "security actor and scope are required" })
    end
    return actor, scope, nil
end

-- Open a KB store lifecycle contract by id, under the runtime actor/scope. The
-- contract shape is model-agnostic (create_store/get_store/update_config/delete_store).
function M.open_kb_store_contract(contract_id: string, binding: string?, context: any?): (any, error?)
    if type(contract_id) ~= "string" or contract_id == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "store contract id is required" })
    end
    local svc, err = contract.get(contract_id)
    if err then return nil, errors.wrap(err, "kb_store_lifecycle contract unavailable") end
    local actor, scope, security_err = current_runtime_identity()
    if security_err then return nil, security_err end
    local inst, oerr = (svc :: any):with_actor(actor):with_scope(scope):open(binding, context)
    if oerr then return nil, errors.wrap(oerr, "kb_store_lifecycle open failed") end
    return inst
end

-- Open an engine's store lifecycle through the binding its descriptor names.
function M.open_engine_store(engine: any): (any, error?)
    local binding = trim(engine.store_binding)
    return M.open_kb_store_contract(trim(engine.store_contract), binding ~= "" and binding or nil)
end

local function store_key(engine: any): string
    return trim(engine.store_contract) .. "|" .. trim(engine.store_binding)
end

-- Resolve a KB component to the engine-owned store lifecycle instance + store row.
-- API handlers validate component access before calling into store readers;
-- background workers already run under the frozen projection actor and must not
-- rediscover their KB through user-facing component visibility.
function M.resolve_component_store(component_id: string): (any?, any?, any?, error?)
    local kb_id = trim(component_id)
    if kb_id == "" then
        return nil, nil, nil, errors.new({ kind = errors.INVALID, message = "knowledge base id is required" })
    end

    local list, list_err = engines.list()
    if list_err then return nil, nil, nil, list_err end

    local seen: { [string]: boolean } = {}
    local last_open_err: string? = nil
    local opened = 0

    for _, engine in ipairs(list or {}) do
        local key = store_key(engine)
        if trim(engine.store_contract) ~= "" and not seen[key] then
            seen[key] = true
            local store_inst, store_err = M.open_engine_store(engine)
            if store_err or not store_inst then
                last_open_err = tostring(store_err or "open failed")
            else
                opened = opened + 1
                local row, row_err = store_inst:get_store({ component_id = kb_id })
                if not row_err and row then
                    local store_row = row :: { kb_type: any }
                    local kb_type = trim(store_row.kb_type)
                    if kb_type == "" then
                        return nil, nil, nil, errors.new({ kind = errors.INTERNAL, message = "store row is missing kb_type" })
                    end

                    local row_engine, row_engine_err = engines.resolve(kb_type)
                    if row_engine_err then return nil, nil, nil, row_engine_err end
                    if not row_engine then
                        return nil, nil, nil, errors.new({ kind = errors.NOT_FOUND, message = "no knowledge engine for kb_type " .. kb_type })
                    end

                    if trim((row_engine :: any).store_contract) ~= "" and store_key(row_engine) ~= key then
                        local canonical_store, canonical_err = M.open_engine_store(row_engine)
                        if canonical_err then return nil, nil, nil, errors.wrap(canonical_err, "failed to open canonical store") end
                        local canonical_row, get_err = canonical_store:get_store({ component_id = kb_id })
                        if get_err then return nil, nil, nil, errors.wrap(get_err, "canonical store row read failed") end
                        if not canonical_row then
                            return nil, nil, nil, errors.new({ kind = errors.NOT_FOUND, message = "canonical store row not found" })
                        end
                        return canonical_store, canonical_row, row_engine, nil
                    end

                    return store_inst, row, row_engine, nil
                end
            end
        end
    end

    if opened == 0 and last_open_err then
        return nil, nil, nil, errors.new({ kind = errors.UNAVAILABLE, message = "kb_store_lifecycle unavailable: " .. last_open_err })
    end
    return nil, nil, nil, errors.new({ kind = errors.NOT_FOUND, message = "knowledge base not found" })
end

return M
