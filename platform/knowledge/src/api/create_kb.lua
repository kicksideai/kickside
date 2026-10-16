local http = require("http")
local json = require("json")
local security = require("security")
local contract = require("contract")
local engines = require("engines")

local KB_REGISTRY = "kickside.knowledge:knowledge_bases"

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function handler()
    local res = http.response()
    local req = http.request()
    if not res or not req then
        return nil, "failed to get http context"
    end

    res:set_content_type(http.CONTENT.JSON)

    local actor = security.actor()
    local scope = security.scope()
    if not actor or not scope then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
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

    if not is_str(body.name) then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "name is required" })
        return
    end
    if not is_str(body.embedding_model) then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "embedding_model is required" })
        return
    end

    -- Resolve the engine from the kb_engine registry. If the caller omits
    -- kb_type, the default comes from an engine descriptor, not a platform
    -- constant.
    local engine, eng_err = nil, nil
    if is_str(body.kb_type) then
        engine, eng_err = engines.resolve(body.kb_type)
    else
        engine, eng_err = engines.default()
    end
    if not engine then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(eng_err) })
        return
    end
    local kb_type = engine.kb_type

    -- Persistence (component + per-impl store row + config defaults + any
    -- engine-owned anchor seeding) goes through the canonical knowledge_bases
    -- registry; this handler keeps only the HTTP shape and the change notification.
    local svc, svc_err = contract.get(KB_REGISTRY)
    if svc_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "knowledge registry unavailable: " .. tostring(svc_err) })
        return
    end
    local inst, open_err = svc:with_actor(actor):with_scope(scope):open()
    if open_err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "knowledge registry open failed: " .. tostring(open_err) })
        return
    end

    local created, create_err = inst:create({
        name = body.name,
        description = body.description or "",
        kb_type = kb_type,
        embedding_model = body.embedding_model,
        config = body.config,
        icon = is_str(body.icon) and body.icon or engine.icon,
        enrichment_agent_id = body.enrichment_agent_id,
        parent_id = is_str(body.parent_id) and body.parent_id or nil,
    })
    if create_err or not created then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = "failed to create knowledge base: " .. tostring(create_err) })
        return
    end

    local component_id = tostring(created.component_id)

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        id = component_id,
        name = body.name,
        description = body.description or "",
    })
end

return { handler = handler }
