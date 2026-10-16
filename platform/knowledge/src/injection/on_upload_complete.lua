local process = require("process")
local funcs = require("funcs")
local logger = require("logger")
local errors = require("errors")
local ingest_upload = require("ingest_upload")

local log = logger:named("kb.upload_complete")

-- Upload pipeline callback: invoked (via funcs.call from the uploads module's
-- token mechanism) when a file uploaded against a KB upload-token finishes
-- processing. It carries the pipeline's file facts; the actual ingest is the
-- shared ingest_upload core, so a fresh upload and a re-ingest of an existing
-- one take the same path.
local REPLY = "kickside.knowledge.injection:upload_complete_reply"
local REPLY_TOPIC = "upload.complete"

-- Answers a caller waiting on the upload (respond_to names its registered
-- reply process). Delivery runs in the upload_complete_reply function under the
-- knowledge identity, so the upload's principal needs no process messaging
-- authority. A refused answer is returned.
local function respond(params: any, payload: any): error?
    local respond_to = params.params and params.params.respond_to
    if not respond_to or respond_to == "" then
        return nil
    end
    local _, reply_err = funcs.call(REPLY, tostring(respond_to), payload)
    return reply_err
end

-- A caller that stopped waiting has released its reply name; the upload's
-- outcome stays durable, so its absence is no failure.
local function deliver_reply(respond_to: string, payload: any): (boolean, error?)
    local pid, lookup_err = process.registry.lookup(respond_to)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return false, nil end
        return false, lookup_err
    end
    if not pid then return false, nil end
    local sent, send_err = process.send(tostring(pid), REPLY_TOPIC, payload)
    if send_err then return false, send_err end
    return sent == true, nil
end

local function is_missing_kb(err: any): boolean
    return errors.is(err, errors.NOT_FOUND) == true
end

local function is_missing_primary_artifact(err: any): boolean
    return errors.is(err, errors.INVALID) == true
end

local function handler(params)
    if not params then
        return nil, "no params provided"
    end

    local token_params = type(params.params) == "table" and params.params or {}
    local kb_id = (token_params.kb_id) :: string
    if not kb_id or kb_id == "" then
        return nil, "kb_id is required in params"
    end

    local upload_id = params.upload_id
    if not upload_id or upload_id == "" then
        return nil, "upload_id is required"
    end

    if params.status == "error" then
        local respond_err = respond(params, { success = false, error = tostring(params.error or "upload failed"), upload_id = upload_id, kb_id = kb_id })
        if respond_err then return nil, respond_err end
        return {
            success = true,
            skipped = true,
            terminal_upload_error = true,
            upload_id = upload_id,
            kb_id = kb_id,
            error = tostring(params.error or "upload failed"),
        }
    end

    local result, ingest_err = ingest_upload.ingest(kb_id, upload_id, {
        mime_type = params.mime_type,
        size = params.size,
        metadata = params.metadata,
        trace_context = token_params.trace_context,
    })

    if ingest_err or not result then
        if is_missing_kb(ingest_err) then
            log:info("upload ingest skipped; knowledge base no longer exists", {
                kb_id = kb_id,
                upload_id = upload_id,
            })
            local respond_err = respond(params, {
                success = false,
                cancelled = true,
                error = tostring(ingest_err),
                upload_id = upload_id,
                kb_id = kb_id,
            })
            if respond_err then return nil, respond_err end
            return {
                success = true,
                cancelled = true,
                upload_id = upload_id,
                kb_id = kb_id,
            }
        end
        if is_missing_primary_artifact(ingest_err) then
            log:info("upload ingest skipped; upload has no primary content artifact", {
                kb_id = kb_id,
                upload_id = upload_id,
            })
            local respond_err = respond(params, {
                success = false,
                skipped = true,
                error = tostring(ingest_err),
                upload_id = upload_id,
                kb_id = kb_id,
            })
            if respond_err then return nil, respond_err end
            return {
                success = true,
                skipped = true,
                upload_id = upload_id,
                kb_id = kb_id,
            }
        end
        log:warn("upload ingest queue failed", { kb_id = kb_id, upload_id = upload_id, error = tostring(ingest_err) })
        local respond_err = respond(params, { success = false, error = tostring(ingest_err), upload_id = upload_id, kb_id = kb_id })
        if respond_err then
            return nil, "failed to queue upload artifact: " .. tostring(ingest_err) .. "; completion reply failed: " .. tostring(respond_err)
        end
        return nil, "failed to queue upload artifact: " .. tostring(ingest_err)
    end

    local respond_err = respond(params, {
        success = true,
        upload_id = upload_id,
        kb_id = kb_id,
        thread_id = result.thread_id,
        projection_id = result.projection_id,
        cursor_id = result.cursor_id,
        external_source = result.external_source,
        external_id = result.external_id,
        external_version = result.external_version,
        trace_context = result.trace_context,
        source_ref = result.source_ref,
    })
    if respond_err then return nil, respond_err end

    return {
        success = true,
        thread_id = result.thread_id,
        projection_id = result.projection_id,
        external_id = result.external_id,
        external_version = result.external_version,
        trace_context = result.trace_context,
        source_ref = result.source_ref,
    }
end

return { handler = handler, deliver_reply = deliver_reply }
