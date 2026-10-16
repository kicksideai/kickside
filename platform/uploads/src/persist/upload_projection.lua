local funcs = require("funcs")
local upload_response = require("upload_response")
local upload_read_model = require("upload_read_model")

-- Uploads read-model projection worker. The runner invokes it (input_mode =
-- prefetch_events) with each new batch of upload lifecycle events + the projection's
-- current body. Production runs materialize lifecycle status into
-- kickside_upload_read_model and project only compact counts into public meta.
-- Committed lifecycle rows drive owner notifications through notify_owner;
-- component meta remains the public summary. The worker runs under the
-- projection's owner identity and declares no security frame.
local M = {}

local NOTIFY_OWNER = "kickside.uploads.persist:notify_owner"

local function sync_public_meta(input: any, counts: any): (boolean, any?)
    local result, err = funcs.call("kickside.uploads.persist:publish_summary", {
        thread_id = input.thread_id,
        range = input.range,
        counts = counts,
        component = input.component,
    })
    if err then return false, err end
    if result then return true, nil end
    return false, errors.new({ message = "upload summary publication returns no result", kind = errors.INTERNAL })
end

function M.run(input: any): any
    if type(input) ~= "table" or type(input.thread_id) ~= "string" or input.thread_id == "" then
        return nil, errors.new({kind = errors.INVALID, message = "upload projection requires a component identity"})
    end
    local read_model = input.read_model or upload_read_model
    local counts, materialize_err, notifications = read_model.apply_events(input.thread_id, input.events)
    if materialize_err then return nil, materialize_err end
    local body = {counts = counts}
    local previous = input.projection.body
    if type(previous.meta) == "table" then body.meta = previous.meta end

    local meta_ok, meta_err = sync_public_meta(input, body.counts)
    if not meta_ok then return nil, meta_err end

    for _, upload in ipairs(notifications or {}) do
        local _, notify_err = funcs.call(NOTIFY_OWNER, {
            component_id = input.thread_id,
            upload_id = upload.uuid,
            data = upload_response.format_get_upload(upload),
        })
        if notify_err then return nil, notify_err end
    end

    local range = type(input.range) == "table" and input.range or {}
    return { body = body, last_seq = tonumber(range.to_seq) or nil }
end

return M
