local http = require("http")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local canonical_json = require("canonical_json")
local engines = require("engines")
local stores = require("stores")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local component = deps.component or component
    local stores = deps.stores or stores

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

    local access_level, access_err = component.validate_access(kb_id, component.ACCESS.READ)
    if access_err then
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    local service, svc_err = component.get_service()
    if svc_err or not service then
        res:set_status((http_errors.classify(svc_err)))
        res:write_json({ success = false, error = "component service unavailable: " .. tostring(svc_err) })
        return
    end

    local comp, comp_err = service:get({ component_id = kb_id })
    if not comp or not comp.success then
        res:set_status(http.STATUS.NOT_FOUND)
        res:write_json({ success = false, error = tostring(comp_err or "knowledge base not found") })
        return
    end

    -- Public metadata carries identity and status. Detail already reads the
    -- engine store for configuration, so reuse its statistics when available.
    local meta = type(comp.meta) == "table" and comp.meta or {}
    local embedding_model = meta.embedding_model
    local auto_summary = meta.auto_summary
    local auto_description = meta.auto_description
    local kb_type = meta.kb_type
    local enrichment_agent_id = nil
    local engine = nil
    if type(kb_type) == "string" and kb_type ~= "" then
        engine = engines.resolve(kb_type)
    end
    if not engine or (engine.impl_id and engine.impl_id ~= comp.impl_id) then
        engine, _ = engines.by_impl(comp.impl_id)
        if engine and (type(kb_type) ~= "string" or kb_type == "") then
            kb_type = engine.kb_type
        end
    end

    local config = nil
    local owned = stores.stats_available(engine)
    local statistics: any = meta
    if owned then statistics = nil end
    local store_contract = engine and type(engine.store_contract) == "string" and engine.store_contract or ""
    if store_contract ~= "" then
        local kb_store, open_err = stores.open_engine_store(engine)
        local store_row = nil
        local store_err = open_err
        local want_stats = owned and not comp.deleting_at
        if kb_store then
            store_row, store_err = kb_store:get_store({component_id = kb_id, stats = want_stats and true or nil})
        end
        if want_stats and (open_err or (store_err and not errors.is(store_err, errors.NOT_FOUND))) then
            res:set_status(http_errors.classify(store_err))
            res:write_json({success = false, error = "Knowledge store statistics unavailable"})
            return
        end
        if not store_err and store_row then
            if want_stats and type(store_row.stats) ~= "table" then
                res:set_status(http.STATUS.INTERNAL_ERROR)
                res:write_json({success = false, error = "invalid Knowledge store statistics response"})
                return
            end
            if want_stats or not owned then
                statistics = type(store_row.stats) == "table" and store_row.stats or meta
            end
            embedding_model = store_row.embedding_model or embedding_model
            if store_row.config ~= nil then config = canonical_json.object(store_row.config) end
            kb_type = store_row.kb_type or kb_type
            enrichment_agent_id = store_row.enrichment_agent_id
            if type(kb_type) == "string" and kb_type ~= "" then
                local row_engine = engines.resolve(kb_type)
                if row_engine then engine = row_engine end
            end
        end
    end

    -- Badge + stat labels are declared by the resolved engine (meta.ui), not a
    -- per-type map; the engine library formats the selected statistics.
    local badge = engine and engine.badge or nil
    local stat_items = statistics and engines.format_stats(statistics, engine and engine.stats_spec) or nil

    res:set_status(http.STATUS.OK)
    local response: any = {
        success = true,
        id = kb_id,
        access_level = access_level,
        deleting_at = comp.deleting_at,
        deletion_job_id = comp.deletion_job_id,
        name = meta.title or "",
        description = meta.comment or "",
        icon = meta.icon or "tabler:brain",
        status = meta.status or "ready",
        created_at = comp.created_at,
        updated_at = comp.updated_at,
        embedding_model = embedding_model,
        config = config,
        auto_summary = auto_summary,
        auto_description = auto_description,
        kb_type = kb_type,
        enrichment_agent_id = enrichment_agent_id,
        badge = badge,
        stat_items = stat_items,
        stats_from_store = owned and true or nil,
    }
    if statistics then
        for _, field in ipairs(stores.STATS_FIELDS) do
            if owned or field ~= "failed_count" then response[field] = tonumber(statistics[field]) or 0 end
        end
    end
    res:write_json(response)
end

return { handler = handler }
end

local default = new()
default.new = new
return default
