local http = require("http")
local security = require("security")
local json = require("json")
local component = require("component")
local engines = require("engines")
local stores = require("stores")
local http_errors = require("http_errors")
local update_consistency = require("update_consistency")

local function problem(message: any, status: number): any
    return { message = tostring(message), status = status }
end

local function get_component(component_id: string): (any?, any?)
    local service, service_err = component.get_service()
    if service_err or not service then
        return nil, problem(
            "component service unavailable: " .. tostring(service_err or "not found"),
            (http_errors.classify(service_err))
        )
    end

    local row, get_err = service:get({ component_id = component_id })
    if get_err or not row or row.success ~= true then
        local message = get_err or (type(row) == "table" and row.error) or "knowledge base not found"
        return nil, problem(message, get_err and (http_errors.classify(get_err)) or http.STATUS.NOT_FOUND)
    end
    return row, nil
end

local function prepare_config(component_id: string, comp: any, patch: any): (any?, any?)
    local meta = type(comp.meta) == "table" and comp.meta or {}
    local kb_type = meta.kb_type
    local engine, engine_err = nil, nil
    if type(kb_type) == "string" and kb_type ~= "" then
        engine, engine_err = engines.resolve(kb_type)
    end
    if not engine then
        engine, engine_err = engines.by_impl(comp.impl_id)
    end
    if engine_err or not engine then
        return nil, problem(
            engine_err or "no store engine for this knowledge base",
            (http_errors.classify(engine_err))
        )
    end

    local store_contract = (engine :: { store_contract: string? }).store_contract
    if type(store_contract) ~= "string" or store_contract == "" then
        return nil, problem("knowledge engine declares no store contract", http.STATUS.INTERNAL_ERROR)
    end
    local store_inst, open_err = stores.open_kb_store_contract(store_contract)
    if open_err or not store_inst then
        return nil, problem(
            "store contract unavailable: " .. tostring(open_err or "not found"),
            (http_errors.classify(open_err))
        )
    end

    local store_row, get_err = store_inst:get_store({ component_id = component_id })
    if get_err or not store_row then
        return nil, problem(get_err or "store not found", get_err and (http_errors.classify(get_err)) or http.STATUS.NOT_FOUND)
    end

    -- Descriptor defaults remain beneath persisted values, and the caller's patch
    -- remains the highest-precedence layer. None of these merges mutate the exact
    -- persisted snapshot retained for compensation.
    local configs, config_err = update_consistency.config_plan(
        (store_row :: any).config,
        patch,
        function(current: any): any
            return engines.apply_default_config(current, engine)
        end
    )
    if config_err or not configs then
        return nil, problem(config_err or "failed to prepare config", (http_errors.classify(config_err)))
    end

    local maintenance = nil
    if type(engine.config_maintenance) == "table" and next(engine.config_maintenance) ~= nil then
        if type(engine.maintenance_binding) ~= "string" or engine.maintenance_binding == "" then
            return nil, problem("knowledge engine declares config maintenance without a binding", http.STATUS.INTERNAL_ERROR)
        end
        local maintenance_err
        maintenance, maintenance_err = stores.open_kb_store_contract("kickside.knowledge:maintainable",
            engine.maintenance_binding, { component_id = component_id })
        if maintenance_err or not maintenance then return nil, problem(maintenance_err, http.STATUS.INTERNAL_ERROR) end
    end

    return {
        store = store_inst,
        maintenance = maintenance,
        config_maintenance = engine.config_maintenance,
        current_config = configs.current_config,
        effective_config = configs.effective_config,
        desired_config = configs.desired_config,
    }, nil
end

local function write_config(component_id: string, plan: any, config: any): (any?, any?)
    local result, err = plan.store:update_config({ component_id = component_id, config = config })
    if err or not result then
        return nil, err or "empty result"
    end
    return result, nil
end

local function request_maintenance(_component_id: string, plan: any, method: string): (any?, any?)
    local receipt, err = plan.maintenance[method](plan.maintenance, {})
    if err then return nil, err end
    if type(receipt) == "table" and receipt.error then return nil, receipt.error end
    return receipt, nil
end

local function write_meta(component_id: string, fields: { [string]: any }): (boolean, any?)
    local ok, err = component.set_meta(component_id, fields)
    if ok then return true, nil end
    local status = http_errors.classify(err)
        local message = tostring(err or "update failed")
    return false, problem(message, status)
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local kb_id = req:param("id")
    if not kb_id or kb_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "knowledge base id is required" })
        return
    end

    local _, access_err = component.validate_access(kb_id, component.ACCESS.WRITE)
    if access_err then
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local raw, raw_err = req:body()
    if raw_err or type(raw) ~= "string" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid request body" })
        return
    end
    local body, body_err = json.decode(raw)
    if body_err or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    local has_changes = false
    if body.embedding_model ~= nil then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "embedding_model is immutable; create a new knowledge base to change it",
        })
        return
    end
    if body.kb_type ~= nil then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            success = false,
            error = "kb_type is immutable; create a new knowledge base to change it",
        })
        return
    end

    local meta_fields = {}
    if body.name ~= nil then meta_fields.title = body.name end
    if body.description ~= nil then meta_fields.comment = body.description end
    if body.icon ~= nil then meta_fields.icon = body.icon end

    if body.config ~= nil then
        if type(body.config) ~= "table" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "config must be an object" })
            return
        end
        has_changes = true
    end

    if next(meta_fields) ~= nil then has_changes = true end

    if not has_changes then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "no fields to update" })
        return
    end

    local ok, update_err = update_consistency.apply(kb_id, {
        meta_fields = meta_fields,
        config_patch = body.config,
    }, {
        get_component = get_component,
        prepare_config = prepare_config,
        update_config = write_config,
        set_meta = write_meta,
        request_maintenance = request_maintenance,
    })
    if not ok then
        local err: any = type(update_err) == "table" and update_err or {
            message = tostring(update_err or "update failed"),
            status = http.STATUS.INTERNAL_ERROR,
        }
        local message = tostring(err.message or "update failed")
        if type(err.rollback) == "table" then
            message = message .. "; config rollback failed: "
                .. tostring(err.rollback.message or "unknown error")
        end
        res:set_status(tonumber(err.status) or http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = message })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, id = kb_id })
end

return { handler = handler }
