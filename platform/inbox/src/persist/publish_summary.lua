local security = require("security")
local component = require("component")
local funcs = require("funcs")
local logger = require("logger")

local function sync_public_meta(input: any, counts: any): (boolean, any?)
    local thread_id = type(input.thread_id) == "string" and input.thread_id or ""
    if thread_id == "" then return true, nil end

    local component_api = type(input.component) == "table" and input.component or component

    local fields: { [string]: any } = {
        status = counts.pending_count > 0 and "pending" or "ready",
        item_count = counts.item_count,
        pending_count = counts.pending_count,
        resolved_count = counts.resolved_count,
        urgent_count = counts.urgent_count,
        high_count = counts.high_count,
    }
    local seq = type(input.range) == "table" and tonumber(input.range.to_seq) or nil
    if seq then fields.last_event_seq = seq end
    local ok, err = component_api.set_meta(thread_id, fields, { trusted_runtime = true })
    if ok == true then return true, nil end
    return false, err or errors.new({ message = "component metadata write returns no result", kind = errors.INTERNAL })
end

local function run(input: any, recipient: any?, item_id: string?): (any?, any?)
    if not security.can("funcs.call", "kickside.inbox.persist:publish_summary") then
        return nil, errors.new({ message = "Inbox post-commit call denied", kind = errors.PERMISSION_DENIED })
    end
    local ok, err = sync_public_meta(input, input.projection.body.counts)
    if recipient then
        local notification, notify_err = funcs.call("kickside.inbox.persist:notify_addressed", { recipient = recipient,
            thread_id = input.thread_id, item_id = item_id, to_seq = input.range.to_seq })
        if notify_err or not notification or notification.success ~= true then
            logger:named("inbox.notifications"):warn("Inbox invalidation failed after commit",
                { error = tostring(notify_err or "realtime notification refused") })
        end
    end
    if not ok then return nil, err end
    return {}, nil
end
return { run = run }
