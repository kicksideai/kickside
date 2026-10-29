local http = require("http")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local engines = require("engines")
local stores = require("stores")

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local component = deps.component or component

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

    local _, access_err = component.validate_access(kb_id, component.ACCESS.READ)
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
    if not engine then
        engine, _ = engines.by_impl(comp.impl_id)
        if engine and (type(kb_type) ~= "string" or kb_type == "") then
            kb_type = engine.kb_type
        end
    end

    local config = nil
    local statistics = meta
    local store_contract = engine and type(engine.store_contract) == "string" and engine.store_contract or ""
    if store_contract ~= "" then
        local kb_store = stores.open_engine_store(engine)
        local store_row = nil
        local store_err = nil
        if kb_store then
            store_row, store_err = kb_store:get_store({ component_id = kb_id })
        end
        if not store_err and store_row then
            statistics = type(store_row.stats) == "table" and store_row.stats or meta
            embedding_model = store_row.embedding_model or embedding_model
            config = store_row.config
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
    local stat_items = engines.format_stats(statistics, engine and engine.stats_spec)

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        id = kb_id,
        name = meta.title or "",
        description = meta.comment or "",
        icon = meta.icon or "tabler:brain",
        status = meta.status or "ready",
        created_at = comp.created_at,
        updated_at = comp.updated_at,
        embedding_model = embedding_model,
        config = config,
        node_count = tonumber(statistics.node_count) or 0,
        edge_count = tonumber(statistics.edge_count) or 0,
        embedding_count = tonumber(statistics.embedding_count) or 0,
        document_count = tonumber(statistics.document_count) or 0,
        concept_count = tonumber(statistics.concept_count) or 0,
        chunk_count = tonumber(statistics.chunk_count) or 0,
        summary_count = tonumber(statistics.summary_count) or 0,
        claim_count = tonumber(statistics.claim_count) or 0,
        auto_summary = auto_summary,
        auto_description = auto_description,
        kb_type = kb_type,
        enrichment_agent_id = enrichment_agent_id,
        badge = badge,
        stat_items = stat_items,
    })
end

return { handler = handler }
end

local default = new()
default.new = new
return default
