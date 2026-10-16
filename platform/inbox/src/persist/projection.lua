local funcs = require("funcs")
local json = require("json")
local inbox_types = require("inbox_types")
local object_fields = require("object_fields")

-- Inbox read-model projection worker. The runner invokes it (worker_input_mode =
-- prefetch_events) with each new batch of inbox events + the projection's current
-- body; it folds item.created/resolved/deleted into body.items (keyed by id) and
-- returns the advanced body + last_seq. body.items IS the inbox read model the
-- reader serves -- materialized in kickside_projection, no fold-on-read. body.meta
-- carries the engine's worker config and must be preserved untouched.
local M = {}

local EV = {
    CREATED = "kickside.inbox.events:item.created",
    VERSION = "kickside.inbox.events:item.version",
    RESOLVED = "kickside.inbox.events:item.resolved",
    DELETED = "kickside.inbox.events:item.deleted",
}

local function decode_body(ev: any): (any?, any?)
    local b = (ev :: any).body
    if type(b) == "string" then
        local decoded, derr = json.decode(b :: string)
        if derr then return nil, derr end
        if type(decoded) ~= "table" then return nil, errors.new({ message = "Inbox event body is not an object", kind = errors.INTERNAL }) end
        return decoded, nil
    end
    if type(b) == "table" then return b end
    return nil, errors.new({ message = "Inbox event body is not an object", kind = errors.INTERNAL })
end

-- Fold one event into body.items.
local function apply(items: any, ev: any): any?
    local etype = (ev :: any).type
    if etype ~= EV.CREATED and etype ~= EV.VERSION and etype ~= EV.RESOLVED and etype ~= EV.DELETED then return nil end
    local body, decode_err = decode_body(ev)
    if decode_err then return decode_err end
    local id = type(body.id) == "string" and body.id or nil
    if not id or id == "" then
        return errors.new({ message = "Inbox item event requires a non-empty id", kind = errors.INTERNAL })
    end

    if etype == EV.CREATED then
        local md = object_fields.object(body.metadata)
        local encoded, encode_err = json.encode(md)
        if encode_err then return encode_err end
        items[id] = {
            id = id,
            item_type = body.item_type,
            title = body.title,
            content = body.content,
            metadata = md,
            metadata_json = encoded,
            source_id = body.source_id,
            status = inbox_types.STATUS.PENDING,
            priority = body.priority or inbox_types.PRIORITY.NORMAL,
            actor_id = body.actor_id,
            created_at = body.created_at,
            created_event_id = (ev :: any).id,
            trace_context = type((ev :: any).trace_context) == "table" and (ev :: any).trace_context or nil,
            resolved_at = nil,
            action = nil,
            resolved_by = nil,
        }
    elseif etype == EV.VERSION then
        local it = items[id]
        if it then
            it.item_type = body.item_type or it.item_type
            it.title = body.title or it.title
            it.content = body.content
            it.priority = body.priority or it.priority
            it.source_id = body.source_id
            it.metadata = object_fields.object(body.metadata)
            local encoded, encode_err = json.encode(it.metadata)
            if encode_err then return encode_err end
            it.metadata_json = encoded
        end
    elseif etype == EV.RESOLVED then
        local it = items[id]
        if it and it.status == inbox_types.STATUS.PENDING then
            it.status = body.status or inbox_types.STATUS.APPROVED
            it.resolved_at = body.resolved_at
            it.form = type(body.form) == "table" and object_fields.object(body.form) or nil
            it.action = type(body.action) == "string" and body.action or nil
            it.resolution_id = type(body.resolution_id) == "string" and body.resolution_id or nil
            it.resolved_by = type(body.resolved_by) == "string" and body.resolved_by or nil
            it.resolved_event_id = (ev :: any).id
        end
    elseif etype == EV.DELETED then
        items[id] = nil
    end
end

local function summarize(items: any): any
    local counts = {
        item_count = 0,
        pending_count = 0,
        resolved_count = 0,
        urgent_count = 0,
        high_count = 0,
    }
    if type(items) ~= "table" then return counts end
    for _, item in pairs(items) do
        if type(item) == "table" then
            counts.item_count = counts.item_count + 1
            if item.status == inbox_types.STATUS.PENDING then
                counts.pending_count = counts.pending_count + 1
            else
                counts.resolved_count = counts.resolved_count + 1
            end
            if item.priority == inbox_types.PRIORITY.URGENT then
                counts.urgent_count = counts.urgent_count + 1
            elseif item.priority == inbox_types.PRIORITY.HIGH then
                counts.high_count = counts.high_count + 1
            end
        end
    end
    return counts
end


-- run(input): the worker entrypoint. input.projection.body is the carried read
-- model; input.events is the new batch; input.range.to_seq is the new head.
function M.run(input: any): (any?, any?)
    input = type(input) == "table" and input or {}
    local projection = type(input.projection) == "table" and input.projection or {}
    local body: any = type(projection.body) == "table" and projection.body or {}
    if type(body.items) ~= "table" then body.items = {} end

    local events = type(input.events) == "table" and input.events or {}
    for _, ev in ipairs(events :: { any }) do
        local apply_err = apply(body.items, ev)
        if apply_err then return nil, apply_err end
    end
    body.counts = summarize(body.items)

    local range = type(input.range) == "table" and input.range or {}
    return { body = body, last_seq = tonumber(range.to_seq) or nil }
end

-- Core invokes this declaration only after a successful, non-stale apply has
-- committed and released its DB connection. The fold itself has no side effects.
function M.after_commit(input: any): (any?, any?)
    return funcs.call("kickside.inbox.persist:publish_summary", input)
end

return M
