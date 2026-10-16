local http = require("http")
local security = require("security")
local component = require("component")
local engines = require("engines")
local query_params = require("query_params")
local listing_page = require("listing_page")
local http_errors = require("http_errors")

local MAX_PICKER_LIMIT = 100

local function new(dependencies: any?): any
    local deps = dependencies or {}
    local http = deps.http or http
    local security = deps.security or security
    local component = deps.component or component
    local engines = deps.engines or engines

-- The list view routes a KB to its engine's store reader by its store_contract
-- — discovered from the engine registry, never by naming an engine.
local function engine_for_component(comp: any, by_type: any, by_impl: any): any
    local meta = type(comp.meta) == "table" and comp.meta or {}
    local kb_type = meta.kb_type
    if type(kb_type) == "string" and kb_type ~= "" and by_type[kb_type] then
        return by_type[kb_type]
    end
    return by_impl[comp.impl_id]
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

    -- Async multi-select params: `ids` resolves selected chips (returns only
    -- those, ignoring q/limit), `q` is a case-insensitive name/description
    -- substring filter, `limit` caps the rows. With none present the list
    -- returns up to 2000 rows with continuation. Filtering happens
    -- before the per-KB store reads so a 1200-KB list never opens 1200 stores.
    local q_param = req:query("q")
    local q: string? = (type(q_param) == "string" and q_param ~= "") and string.lower(q_param) or nil
    local ids_param = req:query("ids")
    local want_ids: { [string]: boolean }? = nil
    if type(ids_param) == "string" and ids_param ~= "" then
        want_ids = {}
        for id in string.gmatch(ids_param, "([^,]+)") do
            local trimmed = id:match("^%s*(.-)%s*$")
            if trimmed ~= "" then want_ids[trimmed] = true end
        end
    end
    local limit: number? = nil
    if not want_ids then
        local parsed_limit, limit_err = query_params.query_int(req, "limit", nil, { min = 1, max = MAX_PICKER_LIMIT })
        if limit_err then
            query_params.bad_request(res, limit_err)
            return
        end
        if parsed_limit ~= nil then
            limit = parsed_limit
        elseif q then
            limit = 20
        end
    end

    -- Discover every installed engine; their impl_ids scope the component query
    -- and their store_contract routes each KB to the right store reader.
    local engine_list, eng_err = engines.list()
    if eng_err then
        local status = http_errors.classify(eng_err)
        res:set_status(status)
        res:write_json({ success = false, error = tostring(eng_err) })
        return
    end
    local impl_ids: {string} = {}
    local engine_by_impl: { [string]: any } = {}
    local engine_by_type: { [string]: any } = {}
    local seen_impl: { [string]: boolean } = {}
    for _, eng in ipairs(engine_list) do
        if not seen_impl[eng.impl_id] then
            seen_impl[eng.impl_id] = true
            impl_ids[#impl_ids + 1] = eng.impl_id
        end
        if type(eng.kb_type) == "string" and eng.kb_type ~= "" then
            engine_by_type[eng.kb_type] = eng
        end
        if not engine_by_impl[eng.impl_id] then
            engine_by_impl[eng.impl_id] = eng
        end
    end

    local result, err = listing_page.collect(component.query, impl_ids, {
        query = q or "", ids = want_ids, limit = limit, cursor = req:query("cursor"),
    })
    if err or not result then
        local status = http_errors.classify(err)
        res:set_status(status)
        res:write_json({ success = false, error = tostring(err or "failed to list knowledge bases") })
        return
    end
    local components = result.components

    local items = {}
    for _, comp in ipairs(components) do
        local cid = comp.component_id
        local meta = type(comp.meta) == "table" and comp.meta or {}
        local component_engine = engine_for_component(comp, engine_by_type, engine_by_impl)
        local kb_type = meta.kb_type or (component_engine and component_engine.kb_type)

        -- Badge and stat labels are declared by the engine (meta.ui), not a
        -- per-type map; the engine library formats stat_items from public meta.
        local engine = engine_by_type[kb_type] or component_engine
        local badge = engine and engine.badge or nil

        local stat_items = engines.format_stats(meta, engine and engine.stats_spec)
        -- Numeric projections for the page header rollup (sum across KBs),
        -- read straight off public meta so no stat_items text is re-parsed.
        local doc_count_raw = tonumber(meta.document_count) or 0
        local embed_count_raw = tonumber(meta.embedding_count) or 0
        local claims_count_raw = tonumber(meta.claim_count) or 0

        table.insert(items, {
            id = cid,
            name = meta.title or "",
            description = meta.comment or "",
            icon = meta.icon or "tabler:brain",
            status = meta.status or "ready",
            auto_summary = meta.auto_summary,
            kb_type = kb_type,
            badge = badge,
            stat_items = stat_items,
            -- Top-level numeric counts so the page header rollup can sum
            -- them without re-parsing stat_items text. Claim-oriented engines
            -- report claims; document/graph engines report docs and embeddings.
            document_count = doc_count_raw,
            embedding_count = embed_count_raw,
            claim_count = claims_count_raw,
            created_at = comp.created_at,
            updated_at = comp.updated_at,
        })
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        items = items,
        count = #items,
        has_more = result.has_more,
        cursor = result.cursor,
    })
end

return { handler = handler }
end

local default = new()
default.new = new
return default
