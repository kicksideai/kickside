local http = require("http")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local upload_tokens = require("upload_tokens")
local execution_identity = require("execution_identity")
local trace_context = require("trace_context")
local uuid = require("uuid")

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

    -- The token authorizes embedding (a write) into this KB on upload completion,
    -- so require WRITE here — not READ.
    local _, access_err = component.validate_access(kb_id, component.ACCESS.WRITE)
    if access_err then
        local status = http_errors.classify(access_err)
        local msg = tostring(access_err or "access denied")
        res:set_status(status)
        res:write_json({ success = false, error = msg })
        return
    end

    -- Freeze the authorizing identity into the token so on-upload-complete embedding
    -- runs as this actor and scope. Fail-closed: without a reconstructable identity
    -- the token is not minted.
    local identity, capture_err = execution_identity.capture()
    if not identity then
        res:set_status((http_errors.classify(capture_err)))
        res:write_json({ success = false, error = "failed to capture execution identity: " .. tostring(capture_err) })
        return
    end
    local row, row_err = execution_identity.to_row(identity)
    if not row then
        res:set_status((http_errors.classify(row_err)))
        res:write_json({ success = false, error = "failed to serialize execution identity: " .. tostring(row_err) })
        return
    end

    local token_trace = trace_context.begin("kb.upload")
    local upload_id = uuid.v4()
    local token, err = upload_tokens.pack({
        upload_id = upload_id,
        function_id = "kickside.knowledge.injection:on_upload_complete",
        actor_id = row.actor_id,
        actor_context = row.actor_context,
        params = { kb_id = kb_id, trace_context = token_trace }
    })

    if err then
        res:set_status((http_errors.classify(err)))
        res:write_json({ success = false, error = "failed to generate upload token: " .. err })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({
        success = true,
        upload_token = token,
        upload_id = upload_id,
        trace_context = token_trace,
    })
end

return { handler = handler }
