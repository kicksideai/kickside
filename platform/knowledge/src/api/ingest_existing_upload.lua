local http = require("http")
local json = require("json")
local security = require("security")
local component = require("component")
local http_errors = require("http_errors")
local upload_query_repo = require("upload_query_repo")
local ingest_upload = require("ingest_upload")

-- POST /knowledge/{id}/ingest-upload — ingest already-uploaded file(s) into a KB
-- without re-uploading bytes. The actor picks files they previously uploaded
-- ("My uploads"); each is verified to belong to the caller, then handed to the
-- shared ingest_upload core (the same path a fresh upload takes). Accepts a
-- single { upload_id } or a batch { upload_ids: [...] }.
local MAX_BATCH = 50

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
    local actor_id = actor:id()

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

    local ids: { string } = {}
    if type(body.upload_ids) == "table" then
        for _, v in ipairs(body.upload_ids :: { any }) do
            if type(v) == "string" and v ~= "" then table.insert(ids, v :: string) end
        end
    elseif type(body.upload_id) == "string" and body.upload_id ~= "" then
        table.insert(ids, body.upload_id :: string)
    end

    if #ids == 0 then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "upload_id or upload_ids is required" })
        return
    end
    if #ids > MAX_BATCH then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "too many uploads (max " .. MAX_BATCH .. ")" })
        return
    end
    local request_trace = type(body.trace_context) == "table" and body.trace_context or nil

    local results: { any } = {}
    local queued = 0
    for _, upload_id in ipairs(ids) do
        -- Ownership: the upload must belong to the caller. A missing record and a
        -- foreign record are reported the same way so ids can't be probed.
        local rec, rec_err = upload_query_repo.get(upload_id)
        if rec_err or not rec or tostring(rec.actor_id) ~= tostring(actor_id) then
            table.insert(results, { upload_id = upload_id, success = false, error = "upload not found" })
        else
            local result, ingest_err = ingest_upload.ingest(kb_id, upload_id, {
                mime_type = rec.mime_type,
                size = rec.size,
                metadata = rec.metadata,
                trace_context = request_trace,
            })
            if ingest_err or not result then
                table.insert(results, { upload_id = upload_id, success = false, error = tostring(ingest_err) })
            else
                queued = queued + 1
                table.insert(results, {
                    upload_id = upload_id,
                    success = true,
                    external_id = result.external_id,
                    thread_id = result.thread_id,
                    projection_id = result.projection_id,
                    run_id = result.run_id,
                    trace_context = result.trace_context,
                })
            end
        end
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = queued > 0, queued = queued, total = #ids, results = results })
end

return { handler = handler }
