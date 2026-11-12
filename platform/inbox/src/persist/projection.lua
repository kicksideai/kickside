local funcs = require("funcs")
local component = require("component")
local json = require("json")
local logger = require("logger")
local registry = require("registry")
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

    if etype == EV.CREATED or (etype == EV.VERSION and body.item_type ~= nil
        and (body.recipient or body.aggregate_key ~= nil) and not items[id]) then
        local md = object_fields.object(body.metadata)
        local encoded, encode_err = json.encode(md)
        if encode_err then return encode_err end
        items[id] = {
            id = id,
            item_type = body.item_type,
            title = body.title,
            content = body.content,
            files = body.files,
            metadata = md,
            metadata_json = encoded,
            source_id = body.source_id,
            aggregate_key = body.aggregate_key,
            status = body.status or inbox_types.STATUS.PENDING,
            priority = body.priority or inbox_types.PRIORITY.NORMAL,
            actor_id = body.actor_id,
            recipient = body.recipient,
            sender_id = body.sender_id,
            created_at = body.created_at,
            created_event_id = (ev :: any).id,
            store_version = body.store_version,
            trace_context = type((ev :: any).trace_context) == "table" and (ev :: any).trace_context or nil,
            resolved_at = body.resolved_at,
            action = nil,
            resolved_by = nil,
        }
    elseif etype == EV.VERSION then
        local it = items[id]
        if it then
            it.store_version = body.store_version or it.store_version
            if body.aggregate_key ~= nil and body.aggregate_key == it.aggregate_key and body.source_id == it.source_id then
                local status = body.status or inbox_types.STATUS.PENDING
                if status == inbox_types.STATUS.RESOLVED then
                    if not it.resolved_event_id then
                        it.status, it.resolved_at = status, body.resolved_at
                    end
                    return nil
                end
                if it.status ~= inbox_types.STATUS.PENDING then it.version_event_id = (ev :: any).id end
                it.status, it.resolved_at = status, nil
                it.action, it.form, it.resolution_id, it.resolved_by, it.resolved_event_id = nil, nil, nil, nil, nil
            end
            it.item_type = body.item_type or it.item_type
            it.sender_id = body.sender_id or it.sender_id
            it.title = body.title or it.title
            it.content = body.content
            if body.files ~= nil then it.files = body.files end
            it.priority = body.priority or it.priority
            it.source_id = body.source_id
            it.metadata = object_fields.object(body.metadata)
            local encoded, encode_err = json.encode(it.metadata)
            if encode_err then return encode_err end
            it.metadata_json = encoded
        end
    elseif etype == EV.RESOLVED then
        local it = items[id]
        local source_closed = it and it.aggregate_key ~= nil and it.status == inbox_types.STATUS.RESOLVED
            and it.resolution_id == nil and it.resolved_event_id == nil
        if it and (it.status == inbox_types.STATUS.PENDING or source_closed) then
            if it.aggregate_key ~= nil and body.resolution_id ~= inbox_types.resolution_id(it) then return nil end
            it.store_version = body.store_version or it.store_version
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

local function prune(items: { [string]: any }): any?
    local binding, binding_err = registry.get("kickside.inbox:inbox_binding")
    if binding_err then return binding_err end
    local days = binding.meta.retention.item_days
    if days == nil then days = 30 end
    if type(days) ~= "number" or days <= 0 then
        return errors.new({ message = "Inbox retention.item_days must be positive", kind = errors.INVALID })
    end
    local now = os.time()
    local cutoff = now - days * 86400
    local removed = 0
    for id, item in pairs(items) do
        if item.status ~= inbox_types.STATUS.PENDING then item.resolved_at = item.resolved_at or now end
        local expired_terminal = item.status ~= inbox_types.STATUS.PENDING and item.resolved_at < cutoff
        -- Five times Core's default 200-event fold, so reclamation outpaces arrivals.
        if expired_terminal and removed < 1000 then
            items[id] = nil
            removed = removed + 1
        end
    end
    return nil
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
    local prune_err = prune(body.items)
    if prune_err then return nil, prune_err end
    body.counts = summarize(body.items)

    local range = type(input.range) == "table" and input.range or {}
    return { body = body, last_seq = tonumber(range.to_seq) or nil }
end

-- Core invokes this declaration only after a successful, non-stale apply has
-- committed and released its DB connection. The fold itself has no side effects.
function M.after_commit(input: any): (any?, any?)
    local result, err = funcs.call("kickside.inbox.persist:publish_summary", input)
    local recipient
    for _, event in ipairs(input.events or {}) do
        local body, decode_err = decode_body(event)
        if decode_err then return nil, decode_err end
        local item = input.projection.body.items and input.projection.body.items[body.id]
        recipient = body.recipient or (item and item.recipient)
        if recipient then break end
    end
    if not recipient then
        local owner, owner_err = component.component_owner(input.thread_id :: string)
        if owner_err then
            logger:named("inbox.notifications"):warn("Inbox owner lookup failed after commit", { error = tostring(owner_err) })
        elseif owner then
            recipient = { kind = "user", id = owner }
        end
    end
    if recipient then
        local notification, notify_err = funcs.call("kickside.inbox.persist:notify_addressed", { recipient = recipient,
            thread_id = input.thread_id, to_seq = input.range.to_seq })
        if notify_err or not notification or notification.success ~= true then
            logger:named("inbox.notifications"):warn("Inbox invalidation failed after commit",
                { error = tostring(notify_err or "realtime notification refused") })
        end
    end
    return result, err
end

return M
