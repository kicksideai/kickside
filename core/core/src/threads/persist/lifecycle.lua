-- lifecycle: per-component lifecycle threads. A lifecycle thread is a raw
-- kickside_thread row keyed deterministically off the component id, carrying NO new
-- backing component. This is the recursion base-case: a thread is itself a component
-- (thread_crud.create attaches one), so giving every component its own component-backed
-- thread would recurse and double rows. The lifecycle thread is internal: it stores
-- the audited component id in attrs, but leaves kickside_thread.component_id blank so
-- a deleted component cannot leave behind a component-linked orphan.
--
-- Typed events created/updated/deleted are appended through writer.append_system, so
-- they ride the same durable seq + dedupe (on the external identity triple) + cursor
-- machinery as any thread event. Appends are idempotent: a repeat with the same
-- dedup_key is counted as a duplicate and never advances the head.

local sql = require("sql")
local json = require("json")
local crypto = require("crypto")
local consts = require("threads_consts")
local masks = require("core_types")
local writer = require("threads_writer")
local error_envelope = require("error_envelope")

local M = {}
M._json = json

local LIFECYCLE_NS = "kickside.lifecycle"
local CLASS_PREFIX = "lifecycle."
type Executor = sql.DB | sql.Transaction

-- The lifecycle event kinds and their event types on the thread log.
M.KIND = { CREATED = "created", UPDATED = "updated", DELETED = "deleted" }
M.EVENT = {
    CREATED = "kickside.component.events:created",
    UPDATED = "kickside.component.events:updated",
    DELETED = "kickside.component.events:deleted",
}
local EVENT_TYPE: { [string]: string } = {
    created = M.EVENT.CREATED,
    updated = M.EVENT.UPDATED,
    deleted = M.EVENT.DELETED,
}

-- A component whose impl is the thread impl is itself a thread; tracking its lifecycle
-- on another thread would recurse. Such components are exempt from a lifecycle thread.
function M.is_exempt(impl_id: string?): boolean
    return impl_id == consts.THREAD_IMPL_ID
end

-- Deterministic lifecycle-thread id for a component (stable across calls), so ensure
-- and append always resolve the same thread without a lookup table.
function M.thread_id(component_id: string): string
    local hex = crypto.hmac.sha256(LIFECYCLE_NS, component_id)
    return string.format(
        "%s-%s-%s-%s-%s",
        hex:sub(1, 8), hex:sub(9, 12), "5" .. hex:sub(14, 16), hex:sub(17, 20), hex:sub(21, 32)
    )
end

-- The lifecycle thread_class for a component class, clamped to the thread_class cap.
local function class_for(component_class: string?): string
    local c = (type(component_class) == "string" and (component_class :: string) ~= "")
        and (component_class :: string) or "component"
    local cls = CLASS_PREFIX .. c
    if #cls > consts.LIMITS.THREAD_CLASS_MAX_LEN then
        cls = cls:sub(1, consts.LIMITS.THREAD_CLASS_MAX_LEN)
    end
    return cls
end

local function missing_response(field: string): error
    return errors.new({message = "lifecycle dependency returned no " .. field .. " proof",
        kind = errors.INTERNAL, retryable = false, details = {code = "lifecycle_response", field = field}})
end

local function thread_exists(db: Executor, thread_id: string): (boolean, error?)
    local rows, err = sql.builder.select("id")
        :from("kickside_thread")
        :where(sql.builder.eq({ id = thread_id }))
        :limit(1)
        :run_with(db):query()
    if err then
        return false, errors.wrap(err, "failed to read lifecycle thread")
    end
    if type(rows) ~= "table" then return false, missing_response("rows") end
    return #rows > 0, nil
end

-- ensure creates the component's lifecycle thread if absent and returns its id.
-- Idempotent: a repeat call (deterministic id already present) is a no-op success,
-- and a concurrent create is tolerated by re-checking on insert failure. Registers
-- NO component, so component count is invariant under lifecycle-thread creation.
function M.ensure(db: Executor, component_id: string, component_class: string?): (string?, error?)
    local cid = type(component_id) == "string" and (component_id :: string) or ""
    if cid == "" then
        return nil, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    local tid = M.thread_id(cid)

    local exists, exists_err = thread_exists(db, tid)
    if exists_err then return nil, exists_err end
    if exists then return tid, nil end

    local attrs, attrs_err = json.encode({ lifecycle = true, component_id = cid, class = component_class })
    if attrs_err then return nil, errors.wrap(attrs_err, "failed to encode lifecycle thread attrs") end
    if type(attrs) ~= "string" then return nil, missing_response("attrs") end

    local _, ins_err = sql.builder.insert("kickside_thread")
        :set_map({
            id = tid,
            thread_class = class_for(component_class),
            component_id = "",
            state = masks.THREAD_STATE.OPEN,
            event_count = 0,
            attrs = attrs,
        })
        :run_with(db):exec()
    if ins_err then
        -- A concurrent ensure may have inserted the same deterministic id; an
        -- existing row is success, not an error.
        local now_exists, recheck_err = thread_exists(db, tid)
        if recheck_err then
            return nil, error_envelope.wrap_secondary(recheck_err, ins_err, "failed to recheck lifecycle thread insertion")
        end
        if now_exists then return tid, nil end
        return nil, errors.wrap(ins_err, "failed to create lifecycle thread")
    end
    return tid, nil
end

function M.ensure_tx(tx: sql.Transaction, component_id: string, component_class: string?): (string?, error?)
    return M.ensure(tx, component_id, component_class)
end

local function lifecycle_event(component_id: string, kind: string, dedup_key: string, payload: any): (table?, error?)
    local etype = EVENT_TYPE[kind]
    if not etype then
        return nil, (errors.new({ message = "invalid lifecycle kind: " .. tostring(kind), kind = errors.INVALID }) :: error)
    end
    local cid = type(component_id) == "string" and (component_id :: string) or ""
    if cid == "" then
        return nil, (errors.new({ message = "component_id is required", kind = errors.INVALID }) :: error)
    end
    local dk = type(dedup_key) == "string" and (dedup_key :: string) or ""
    if dk == "" then
        return nil, (errors.new({ message = "dedup_key is required", kind = errors.INVALID }) :: error)
    end

    local body_json = "{}"
    if type(payload) == "table" then
        local enc, enc_err = M._json.encode(payload)
        if enc_err then return nil, errors.wrap(enc_err, "failed to encode lifecycle event body") end
        if type(enc) ~= "string" then return nil, missing_response("event_body") end
        body_json = enc :: string
    end

    -- external_version is a constant non-null sentinel: the unique dedup index
    -- includes external_version, and a NULL there is treated as distinct (SQLite,
    -- and Postgres pre-15), which would let a same-key retry insert twice.
    return {
        type = etype,
        role = "system",
        body_json = body_json,
        external = { external_source = "component.lifecycle", external_id = dk, external_version = "1" },
    }, nil
end

-- append writes one typed lifecycle event to the component's lifecycle thread via the
-- gate-less system seam. dedup_key makes it at-least-once safe: a repeat with the same
-- key is a duplicate (head not advanced). payload is JSON-encoded into the event body.
function M.append(db: sql.DB, component_id: string, kind: string, dedup_key: string, payload: any): (any?, error?)
    local cid = type(component_id) == "string" and (component_id :: string) or ""
    local event, event_err = lifecycle_event(component_id, kind, dedup_key, payload)
    if event_err or not event then return nil, event_err end
    return writer.append_system(db, M.thread_id(cid), { event })
end

function M.append_tx(tx: sql.Transaction, dbtype: string, component_id: string, kind: string, dedup_key: string, payload: any): (any?, error?)
    local cid = type(component_id) == "string" and (component_id :: string) or ""
    local event, event_err = lifecycle_event(component_id, kind, dedup_key, payload)
    if event_err or not event then return nil, event_err end
    return writer.append_system_tx(tx, dbtype, M.thread_id(cid), { event })
end

return M
