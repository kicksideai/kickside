-- Event-sourced storage for the actor-owned inbox thread:
-- item.created -> item.version | item.resolved | item.deleted.

local contract = require("contract")
local uuid = require("uuid")
local security = require("security")
local json = require("json")
local component = require("component")

local inbox_types = require("inbox_types")
local item_types = require("inbox_item_types")
local object_fields = require("object_fields")

local M = {}

M.THREAD_CLASS = "kickside.inbox"
M.EXTERNAL_SOURCE = "kickside.inbox"

-- The one canonical threads seam: the kickside.core:threads contract, never its
-- private *_method function-ids. Every call runs under the caller's actor + scope.
local THREADS_CONTRACT = "kickside.core:threads"

-- The inbox component KIND binding. The inbox thread is created as this kind so the
-- engine auto-applies its declared read-model projection (provision does the same on
-- login); reduce reads that projection's body.
local INBOX_IMPL = "kickside.inbox:inbox_binding"
local PROJECTION_KIND = "kickside.inbox:items"

-- Event types on the inbox thread.
local EV = inbox_types.EVENT
M.EV = EV

local function actor_id(): string?
    local a = security.actor()
    if not a then return nil end
    return tostring(a:id())
end

-- open_threads opens the canonical thread contract under the ambient actor + scope.
local function open_threads(): (any?, any?)
    if not security.actor() or not security.scope() then
        return nil, errors.new({ message = "security actor and scope required", kind = errors.PERMISSION_DENIED, retryable = false })
    end
    local def, get_err = contract.get(THREADS_CONTRACT)
    if get_err then return nil, get_err end
    if not def then return nil, errors.new({ message = "threads contract unavailable", kind = errors.UNAVAILABLE, retryable = true }) end
    return (def :: any):with_actor(security.actor()):with_scope(security.scope()):open()
end

local function open_read_models(): (any?, any?)
    if not security.actor() or not security.scope() then
        return nil, errors.new({ message = "security actor and scope required", kind = errors.PERMISSION_DENIED, retryable = false })
    end
    local def, get_err = contract.get("kickside.core:read_models")
    if get_err then return nil, get_err end
    if not def then return nil, errors.new({ message = "read-model contract unavailable", kind = errors.UNAVAILABLE, retryable = true }) end
    return (def :: any):with_actor(security.actor()):with_scope(security.scope()):open()
end

function M.component_id_for_owner(owner: string): string?
    if type(owner) ~= "string" or owner == "" then return nil end
    local id = component.singleton_component_id(owner, M.THREAD_CLASS)
    if type(id) ~= "string" then return nil end
    return id
end

function M.current_component_id(): string?
    local owner = actor_id()
    if not owner then return nil end
    return M.component_id_for_owner(owner)
end

-- Find the owner's inbox thread without creating it (for reads/teardown).
local function find_thread(owner: string, opener: any?): (string?, any?)
    local run, open_err = (opener or open_threads)()
    if open_err then return nil, open_err end
    if not run then return nil, errors.new({ message = "threads contract unavailable", kind = errors.UNAVAILABLE, retryable = true }) end
    local id = M.component_id_for_owner(owner)
    if not id then return nil end
    local res, err = run:find({ thread_id = id })
    if err then return nil, err end
    if type(res) ~= "table" then return nil end
    local t = res.thread or res
    if type(t) == "table" and t.id then return tostring(t.id) end
    if res.thread_id then return tostring(res.thread_id) end
    return nil
end

local function copy_trace_context(raw: any): any
    if type(raw) ~= "table" then return nil end
    local out: { [string]: any } = {}
    for _, key in ipairs({ "trace_id", "run_id", "caused_by_event_id", "correlation_key" }) do
        local value = (raw :: table)[key]
        if value ~= nil then out[key] = value end
    end
    return next(out) and out or nil
end

-- append emits one event to the inbox component's primary thread. The component
-- client ensures the thread + declared projection on first touch.
local function append(etype: string, body: any, ext_id: string, trace_context: any?): (any, any?)
    local res, err = component.emit_singleton_event(M.THREAD_CLASS, {
        type = etype,
        body = body,
        impl_id = INBOX_IMPL,
        thread_class = M.THREAD_CLASS,
        trace_context = copy_trace_context(trace_context),
        external = {
            external_source = M.EXTERNAL_SOURCE,
            external_id = ext_id,
            external_version = "1",
        },
    })
    if err then return nil, err end
    return res, nil
end

local function same_value(a: any, b: any): boolean
    if type(a) ~= type(b) then return false end
    if type(a) ~= "table" then return a == b end
    for key, value in pairs(a) do
        if not same_value(value, b[key]) then return false end
    end
    for key in pairs(b) do
        if a[key] == nil then return false end
    end
    return true
end

local function external_event(event_type: string, external_id: string, opener: any?): (any?, any?)
    local owner = actor_id()
    if not owner then return nil, errors.new({ message = "authenticated actor required", kind = errors.PERMISSION_DENIED, retryable = false }) end
    local thread_id, thread_err = find_thread(owner, opener)
    if thread_err then return nil, thread_err end
    if not thread_id then return nil, nil end
    local run, open_err = (opener or open_threads)()
    if open_err then return nil, open_err end
    local found, err = run:find_event_by_external({
        thread_id = thread_id, event_type = event_type,
        external_source = M.EXTERNAL_SOURCE, external_id = external_id,
        external_version = "1",
    })
    if err then return nil, err end
    return type(found) == "table" and found.event or nil, nil
end

function M.resolution_event(id: string, opener: any?, resolution_id: string?): (any?, any?)
    local owner = actor_id()
    if not owner then return nil, errors.new({ message = "authenticated actor required", kind = errors.PERMISSION_DENIED, retryable = false }) end
    local thread_id, thread_err = find_thread(owner, opener)
    if thread_err then return nil, thread_err end
    if not thread_id then return nil, nil end
    local run, open_err = (opener or open_threads)()
    if open_err then return nil, open_err end
    local found, err = run:find_event_by_external({
        thread_id = thread_id, event_type = EV.RESOLVED,
        external_source = M.EXTERNAL_SOURCE, external_id = resolution_id or ("resolve:" .. id),
        external_version = "1",
    })
    if err then return nil, err end
    return type(found) == "table" and found.event or nil, nil
end

local function event_body(event: any): (any?, any?)
    local body = event.body or event.body_json
    if type(body) == "string" then
        local decoded, decode_err = json.decode(body)
        if decode_err then
            return nil, errors.new({ message = "durable Inbox event decode failed: " .. tostring(decode_err), kind = errors.INTERNAL })
        end
        body = decoded
    end
    if type(body) ~= "table" then
        return nil, errors.new({ message = "durable Inbox event body is not an object", kind = errors.INTERNAL })
    end
    return body, nil
end

-- One key names one immutable sink request across both create and delete.
-- The claim can precede a failed effect; retrying the same request may resume.
function M.claim_delivery(key: string, operation: string, item_id: string, payload: any, opener: any?): (boolean, any?)
    if key == "" then return true, nil end
    local owner = actor_id()
    if not owner then return false, errors.new({ message = "authenticated actor required", kind = errors.PERMISSION_DENIED, retryable = false }) end
    local body = { operation = operation, item_id = item_id, payload = payload }
    local function existing(): (any?, any?)
        local thread_id, thread_err = find_thread(owner, opener)
        if thread_err then return nil, thread_err end
        if not thread_id then return nil, nil end
        local run, open_err = (opener or open_threads)()
        if open_err then return nil, open_err end
        local found, find_err = run:find_event_by_external({
            thread_id = thread_id, event_type = EV.DELIVERY_CLAIMED,
            external_source = M.EXTERNAL_SOURCE, external_id = "claim:" .. key, external_version = "1",
        })
        if find_err then return nil, find_err end
        return type(found) == "table" and found.event or nil, nil
    end
    local function matches(event: any): (boolean, any?)
        local old, decode_err = event_body(event)
        if decode_err then return false, decode_err end
        return same_value(old, body), nil
    end
    local prior, lookup_err = existing()
    if lookup_err then return false, lookup_err end
    if prior then
        local same, match_err = matches(prior)
        if match_err then return false, match_err end
        if same then return true, nil end
        return false, errors.new({ message = "idempotency key already used for a different write", kind = errors.CONFLICT, retryable = false })
    end
    local _, append_err = append(EV.DELIVERY_CLAIMED, body, "claim:" .. key, nil)
    if append_err then return false, append_err end
    local claimed, claim_err = existing()
    if claim_err then return false, claim_err end
    if claimed then
        local same, match_err = matches(claimed)
        if match_err then return false, match_err end
        if same then return true, nil end
    end
    return false, errors.new({ message = "idempotency key already used for a different write", kind = errors.CONFLICT, retryable = false })
end

local function aggregate_identity(source_id: any, key: any): (string?, any?)
    local owner = actor_id()
    if not owner then return nil, errors.new({ message = "authenticated actor required", kind = errors.PERMISSION_DENIED }) end
    if type(source_id) ~= "string" or source_id == "" or type(key) ~= "string" or key == "" then
        return nil, errors.new({ message = "aggregate_key and source_id component are required", kind = errors.INVALID })
    end
    local _, access_err = component.validate_access(source_id, 1)
    if access_err then return nil, access_err end
    -- Length prefixes make the tuple unambiguous even when its parts contain separators.
    return "aggregate:" .. tostring(#owner) .. ":" .. owner .. ":" .. tostring(#source_id) .. ":" .. source_id .. ":" .. key, nil
end

function M.resolve_aggregate(params: any): (string?, any?, string?)
    local id, identity_err = aggregate_identity(params.source_id, params.aggregate_key)
    if identity_err then return nil, identity_err end
    local key = type(params.idempotency_key) == "string" and params.idempotency_key ~= "" and params.idempotency_key or uuid.v4()
    local body = { id = id, source_id = params.source_id, aggregate_key = params.aggregate_key,
        status = inbox_types.STATUS.RESOLVED, delivery_key = key, resolved_at = os.time() }
    local claimed, claim_err = M.claim_delivery(key, "resolve", id, {
        source_id = params.source_id, aggregate_key = params.aggregate_key,
    })
    if not claimed then return nil, claim_err end
    local _, err = append(EV.VERSION, body, "delivery:" .. key, params.trace_context)
    if err then return nil, err end
    return id, nil, "updated"
end

function M.create(params: any, deps: any?): (string?, any?, string?)
    local owner = actor_id()
    if not owner then return nil, errors.new({ message = "authenticated actor required", kind = errors.PERMISSION_DENIED }) end
    local item_type = type(params.item_type) == "string" and params.item_type or ""
    local title = type(params.title) == "string" and params.title or ""
    if item_type == "" then return nil, inbox_types.ERROR.TYPE_REQUIRED end
    if title == "" then return nil, inbox_types.ERROR.TITLE_REQUIRED end
    local declared_type, type_err = item_types.get(item_type)
    if not declared_type then return nil, type_err end

    local id = (type(params.id) == "string" and params.id ~= "") and params.id or uuid.v4()
    local aggregate_key = params.aggregate_key
    if aggregate_key ~= nil then
        local identity_err
        id, identity_err = aggregate_identity(params.source_id, aggregate_key)
        if identity_err then return nil, identity_err end
    end
    local body: { [string]: any } = {
        id = id, item_type = item_type, title = title, content = params.content,
        metadata = type(params.metadata) == "table" and params.metadata or {},
        source_id = params.source_id,
        priority = type(params.priority) == "string" and params.priority or inbox_types.PRIORITY.NORMAL,
        actor_id = owner, created_at = os.time(),
        aggregate_key = aggregate_key,
        status = aggregate_key ~= nil and inbox_types.STATUS.PENDING or nil,
    }
    local delivery_key = type(params.idempotency_key) == "string" and params.idempotency_key or ""
    if aggregate_key ~= nil and delivery_key == "" then delivery_key = uuid.v4() end
    if delivery_key == "" then
        local _, err = append(EV.CREATED, body, "item:" .. id, params.trace_context)
        if err then return nil, err end
        return id, nil, "created"
    end
    local opener = deps and deps.open_threads
    local claimed, claim_err = M.claim_delivery(delivery_key, "upsert", id, {
        item_type = item_type, title = title, content = params.content,
        metadata = body.metadata, source_id = body.source_id, priority = body.priority,
        aggregate_key = aggregate_key,
    }, opener)
    if not claimed then return nil, claim_err end
    local genesis, genesis_err = external_event(EV.CREATED, "item:" .. id, opener)
    if genesis_err then return nil, genesis_err end
    if not genesis then
        body.delivery_key = delivery_key
        local _, append_err = append(EV.CREATED, body, "item:" .. id, params.trace_context)
        if append_err then return nil, append_err end
        genesis, genesis_err = external_event(EV.CREATED, "item:" .. id, opener)
        if genesis_err then return nil, genesis_err end
        if not genesis then
            return nil, errors.new({ message = "Inbox genesis append returns no durable event", kind = errors.INTERNAL })
        end
    end
    local original, decode_err = event_body(genesis)
    if decode_err then return nil, decode_err end
    if original.delivery_key == delivery_key then return id, nil, "created" end
    local previous, lookup_err = external_event(EV.VERSION, "delivery:" .. delivery_key, opener)
    if lookup_err then return nil, lookup_err end
    if previous then return id, nil, "updated" end
    body.delivery_key = delivery_key
    local _, append_err = append(EV.VERSION, body, "delivery:" .. delivery_key, params.trace_context)
    if append_err then return nil, append_err end
    return id, nil, "updated"
end

-- Private terminal commit seam used only by inbox_resolve after declaration
-- validation and callbacks succeed. Keeping this off the writer facade prevents
-- module callers from bypassing the canonical resolution orchestration.
function M._commit_resolution(id: string, status: string, meta: any?): (boolean, string?, any?)
    if type(id) ~= "string" or id == "" then return false, "item id is required", nil end
    if type(status) ~= "string" or status == "" then return false, "resolution status is required", nil end
    local action = type(meta) == "table" and type((meta :: any).action) == "string"
        and (meta :: any).action or ""
    if action == "" then return false, "resolution action is required", nil end
    local resolution_id = type(meta) == "table" and type((meta :: any).resolution_id) == "string"
        and (meta :: any).resolution_id or ""
    if resolution_id == "" then return false, "resolution_id is required", nil end
    local owner = actor_id()
    if not owner then return false, "authenticated actor required", nil end
    local item, gerr = M.get(id)
    if gerr then return false, gerr, nil end
    if not item then return false, inbox_types.ERROR.NOT_FOUND, nil end
    if resolution_id ~= inbox_types.resolution_id(item) then return false, "resolution_id does not match item version", nil end
    if item.status ~= inbox_types.STATUS.PENDING then return false, inbox_types.ERROR.ALREADY_RESOLVED, nil end

    local trace_context = copy_trace_context((item :: any).trace_context)
    if trace_context and type((item :: any).created_event_id) == "string" then
        (trace_context :: any).caused_by_event_id = (item :: any).created_event_id
    end
    local requested_resolved_by = type(meta) == "table" and type((meta :: any).resolved_by) == "string"
        and (meta :: any).resolved_by or nil
    if requested_resolved_by and requested_resolved_by ~= owner then
        return false, "resolved_by must match authenticated actor", nil
    end
    local resolved_by = requested_resolved_by or owner
    local body = {
        id = id,
        status = status,
        action = action,
        resolution_id = resolution_id,
        resolved_at = os.time(),
        resolved_by = resolved_by,
    }
    if type(meta) == "table" and type((meta :: any).form) == "table" then
        (body :: any).form = (meta :: any).form
    end
    local res, err = append(EV.RESOLVED,
        body,
        resolution_id,
        trace_context)
    if err then return false, err, nil end
    -- external-id unique constraint: a duplicate means another resolve already won.
    if type(res) == "table" and tonumber(res.inserted) == 0 then
        return false, inbox_types.ERROR.ALREADY_RESOLVED, nil
    end
    return true, nil, body
end

function M.delete(id: string, idempotency_key: string?): (boolean, any?)
    if not actor_id() then return false, errors.new({ message = "authenticated actor required", kind = errors.PERMISSION_DENIED }) end
    if type(id) ~= "string" or id == "" then return false, errors.new({ message = "item id is required", kind = errors.INVALID }) end
    local key = type(idempotency_key) == "string" and idempotency_key or ""
    if key ~= "" then
        local claimed, claim_err = M.claim_delivery(key, "delete", id, {})
        if not claimed then return false, claim_err end
    end
    local genesis, lookup_err = external_event(EV.CREATED, "item:" .. id)
    if lookup_err then return false, lookup_err end
    if not genesis then return false, errors.new({ message = inbox_types.ERROR.NOT_FOUND, kind = errors.NOT_FOUND }) end
    local external_id = key ~= "" and ("delivery:" .. key) or ("delete:" .. id)
    local _, err = append(EV.DELETED, { id = id }, external_id, copy_trace_context(genesis.trace_context))
    if err then return false, err end
    return true, nil
end

-- reduce returns the authenticated actor's inbox items map -- the read model the
-- inbox projection (kind = PROJECTION_KIND) materializes into its body. No
-- fold-on-read: the projection worker (persist/projection.lua) owns the fold; this
-- reads the materialized body. The projection is auto-applied on the inbox thread
-- (its kind binding + provision), so the body exists once it has caught up; a
-- A not-yet-materialized body reads as empty. Component metadata notifications
-- refresh the live UI after projection commit. Delivery and deletion use durable
-- event identities; resolution validates the current item and commits once.
function M.reduce(): ({ [string]: any }, any?, any?)
    local owner = actor_id()
    if not owner then return {}, "authenticated actor required" end
    local thread_id, thread_err = find_thread(owner)
    if thread_err then return {}, thread_err end
    if not thread_id then return {}, nil end

    local models, models_err = open_read_models()
    if models_err then return {}, models_err end
    if not models then return {}, errors.new({ message = "read-model contract did not open", kind = errors.UNAVAILABLE }) end
    local res, err = models:get({ owner_id = thread_id, kind = PROJECTION_KIND, projection_key = "default" })
    if err then return {}, err end
    local body: any = type(res) == "table" and (res :: any).body or {}
    local items = type(body) == "table" and (body :: any).items or nil
    local counts = type(body) == "table" and (body :: any).counts or nil
    if type(items) == "table" then
        for id, item in pairs(items) do
            if type(item) == "table" then
                local access_err
                if item.aggregate_key ~= nil then
                    local _
                    _, access_err = component.validate_access(item.source_id, 1)
                end
                if access_err then
                    if not errors.is(access_err, errors.PERMISSION_DENIED) and not errors.is(access_err, errors.NOT_FOUND) then
                        return {}, access_err
                    end
                    items[id] = nil
                    counts = nil
                else
                    object_fields.item(item)
                end
            end
        end
    end
    return (type(items) == "table" and items or {}) :: { [string]: any }, nil,
        (type(counts) == "table" and counts or nil)
end

-- get returns one current item from the actor's inbox (ownership is implicit:
-- you only see your own inbox thread).
function M.get(id: string): (any, any?)
    local items, err = M.reduce()
    if err then return nil, err end
    return items[id], nil
end

-- delete_inbox tears down an owner's whole inbox (used on user deletion). Returns
-- the thread id removed, or nil if none existed.
function M.delete_inbox(owner: string): (string?, any?)
    return find_thread(owner)
end

return M
