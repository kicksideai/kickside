local http = require("http")
local json = require("json")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")

local function shallow_copy(input: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function source_ref_input(body: { [string]: any }, metadata: { [string]: any }): { [string]: any }
    local ref = shallow_copy(body.source_ref)
    if next(ref) == nil then ref = shallow_copy(metadata.source_ref) end
    return ref
end

local function put_default(target: { [string]: any }, key: string, value: any): ()
    if target[key] == nil or (type(target[key]) == "string" and target[key] == "") then
        target[key] = value
    end
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

    local engine, access_err = component.open(kb_id, component.ACCESS.WRITE, "kickside.contract:embeddable")
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

    if not body.content or body.content == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "content is required" })
        return
    end

    -- Cap content size before the synchronous embed call to bound work and memory.
    -- 413 has no named constant in http.STATUS, so use the numeric literal.
    local MAX_CONTENT_BYTES = 1024 * 1024
    if type(body.content) ~= "string" or #body.content > MAX_CONTENT_BYTES then
        res:set_status(413)
        res:write_json({ success = false, error = "content exceeds maximum size of " .. MAX_CONTENT_BYTES .. " bytes" })
        return
    end

    local content_type = body.content_type or "text/plain"

    local metadata = shallow_copy(body.metadata)
    metadata.source = metadata.source or "manual"
    local title = body.title or metadata.title
    local source_ref = source_ref_input(body, metadata)
    put_default(source_ref, "kind", "manual")
    put_default(source_ref, "origin", "api.ingest_content")
    put_default(source_ref, "title", title)
    put_default(source_ref, "content_type", content_type)

    assert(engine, "embeddable binding required")
    local result, ingest_err = engine:embed_content({
        content = body.content,
        content_type = content_type,
        metadata = metadata,
        title = title,
        external_id = body.external_id,
        external_version = body.external_version,
        source_ref = source_ref,
    })

    if ingest_err or not result or result.success ~= true then
        ingest_err = ingest_err or (result and result.error)
        res:set_status((http_errors.classify(ingest_err)))
        res:write_json({ success = false, error = "failed to queue content ingest: " .. tostring(ingest_err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        thread_id = result.thread_id,
        projection_id = result.projection_id,
        cursor_id = result.cursor_id,
        external_source = result.external_source,
        external_id = result.external_id,
        external_version = result.external_version,
        trace_context = result.trace_context,
        source_ref = result.source_ref,
    })
end

return { handler = handler }
