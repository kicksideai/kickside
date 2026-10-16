local util = require("util")
local http = require("http")
local json = require("json")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local thread_ingest = require("thread_ingest")
local source_ref_builder = require("source_ref_builder")

local trim = util.trim

local function body_or_query(req: any, body: { [string]: any }, key: string): string
    local value = trim(body[key])
    if value ~= "" then return value end
    return trim(req:query(key))
end

local function shallow_copy(input: any): { [string]: any }
    local out: { [string]: any } = {}
    if type(input) == "table" then
        for key, value in pairs(input) do out[key] = value end
    end
    return out
end

local function source_ref_input(body: { [string]: any }, metadata: { [string]: any }): { [string]: any }
    if type(body.source_ref) == "table" then return shallow_copy(body.source_ref) end
    if type(metadata.source_ref) == "table" then return shallow_copy(metadata.source_ref) end
    return {}
end

local function origin_id_for(external_id: string, upload_id: string, source_url: string, reference_component_id: string): string
    if external_id ~= "" then return external_id end
    if upload_id ~= "" then return upload_id end
    if source_url ~= "" then return source_url end
    if reference_component_id ~= "" then return reference_component_id end
    return "delete"
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

    local raw = req:body()
    local body: { [string]: any } = {}
    if type(raw) == "string" and trim(raw) ~= "" then
        local decoded, body_err = json.decode(raw)
        if body_err or type(decoded) ~= "table" then
            res:set_status(http.STATUS.BAD_REQUEST)
            res:write_json({ success = false, error = "invalid json" })
            return
        end
        body = decoded :: { [string]: any }
    end

    local external_id = body_or_query(req, body, "external_id")
    local upload_id = body_or_query(req, body, "upload_id")
    local source_url = body_or_query(req, body, "source_url")
    local external_version = body_or_query(req, body, "external_version")

    local metadata = shallow_copy(body.metadata)
    metadata.source = metadata.source or "api.delete_content"
    if upload_id ~= "" then metadata.upload_id = upload_id end
    if source_url ~= "" then metadata.source_url = source_url end

    local source_ref = source_ref_input(body, metadata)
    if external_id == "" then external_id = trim(source_ref.external_id) end
    if upload_id == "" then upload_id = trim(source_ref.upload_id) end
    if source_url == "" then source_url = trim(source_ref.source_url or source_ref.url) end
    if external_version == "" then external_version = trim(source_ref.external_version) end
    if external_id ~= "" then metadata.external_id = external_id end
    if external_version ~= "" then metadata.external_version = external_version end
    if upload_id ~= "" then metadata.upload_id = upload_id end
    if source_url ~= "" then metadata.source_url = source_url end

    local reference_component_id = trim(source_ref.reference_component_id or source_ref.component_id)
    if reference_component_id ~= "" then
        source_ref.reference_component_id = source_ref.reference_component_id or reference_component_id
    end

    if external_id ~= "" then source_ref.external_id = external_id end
    if external_version ~= "" then source_ref.external_version = external_version end
    if upload_id ~= "" then source_ref.upload_id = upload_id end
    if source_url ~= "" then source_ref.source_url = source_url end

    local source_kind = trim(source_ref.kind or source_ref.type)
    if source_kind == "" then source_kind = "manual" end
    if upload_id ~= "" then
        source_kind = "upload"
    elseif source_url ~= "" then
        source_kind = "url"
    elseif reference_component_id ~= "" then
        source_kind = "reference"
    end
    source_ref.kind = source_kind

    local built_ref, ref_err = source_ref_builder.build({
        base = source_ref,
        fields = source_ref,
        origin_type = "api.delete_content",
        origin_id = origin_id_for(external_id, upload_id, source_url, reference_component_id),
    })
    if ref_err or not built_ref then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid source_ref: " .. tostring(ref_err) })
        return
    end
    source_ref = built_ref

    local result, delete_err = thread_ingest.delete_content(kb_id, {
        metadata = metadata,
        external_id = external_id ~= "" and external_id or nil,
        external_version = external_version ~= "" and external_version or nil,
        source_ref = source_ref,
    })

    if delete_err or not result then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "failed to queue content delete: " .. tostring(delete_err) })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        thread_id = result.thread_id,
        projection_id = result.projection_id,
        cursor_id = result.cursor_id,
        external_id = result.external_id,
        external_version = result.external_version,
        trace_context = result.trace_context,
    })
end

return { handler = handler }
