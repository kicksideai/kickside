-- Append one immutable skill version through the public Threads contract.
--
-- The event's external identity is the natural key for a version within a skill.
-- Threads reports a duplicate when that key already exists. A duplicate is only
-- a successful replay when the durable event has the same type, identity, and
-- structured body; a concurrent writer that chose the same version number with
-- different content is a conflict, not a successful refinement.

local json = require("json")
local errors = require("errors")
local contract = require("contract")

local M = {}

function M.threads(): (any?, error?)
    local def, gerr = contract.get("kickside.core:threads")
    if gerr then return nil, gerr end
    if not def then return nil, errors.new({kind = errors.UNAVAILABLE, message = "threads contract missing"}) end
    local inst, oerr = (def :: any):open()
    if oerr then return nil, oerr end
    if not inst then return nil, errors.new({kind = errors.UNAVAILABLE, message = "threads instance missing"}) end
    return inst, nil
end

local EXTERNAL_SOURCE = "kickside.skills"

local function deep_equal(left: any, right: any): boolean
    if type(left) ~= type(right) then return false end
    if type(left) ~= "table" then return left == right end

    for key, value in pairs(left :: { [any]: any }) do
        if not deep_equal(value, (right :: { [any]: any })[key]) then return false end
    end
    for key, _ in pairs(right :: { [any]: any }) do
        if (left :: { [any]: any })[key] == nil then return false end
    end
    return true
end

local function event_body(event: any): (any?, error?)
    local body = type(event) == "table" and (event :: any).body or nil
    if type(body) == "table" then return body, nil end
    if type(body) ~= "string" then return nil, errors.new({ kind = errors.INTERNAL, message = "durable event body is missing" }) end
    local decoded, decode_err = json.decode(body :: string)
    if decode_err or type(decoded) ~= "table" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "durable event body is invalid JSON: " .. tostring(decode_err or "expected object") })
    end
    return decoded, nil
end

local function latest_event(threads: any, thread_id: string, event_type: string): (any?, error?)
    local listed, list_err = threads:list_events({
        thread_id = thread_id,
        event_type = event_type,
        limit = 1,
    })
    if list_err then return nil, list_err end
    local events = type(listed) == "table" and (listed :: any).events or nil
    if type(events) ~= "table" then return nil, errors.new({ kind = errors.INTERNAL, message = "invalid skill version history response" }) end
    local event = events[1]
    if event == nil then return nil, nil end
    if type(event) ~= "table" or (event :: any).type ~= event_type or type((event :: any).seq) ~= "number" then
        return nil, errors.new({ kind = errors.INTERNAL, message = "invalid skill version event response" })
    end
    return event, nil
end

-- Command-side version decisions consult immutable events explicitly. This is
-- not a read-model query: it is the writer's concurrency source of truth.
function M.latest(threads: any, thread_id: string, created_type: string, updated_type: string): (any?, error?)
    local created, created_err = latest_event(threads, thread_id, created_type)
    if created_err then return nil, created_err end
    local updated, updated_err = latest_event(threads, thread_id, updated_type)
    if updated_err then return nil, updated_err end

    local head = created
    if updated and (not head or (updated :: any).seq > (head :: any).seq) then
        head = updated
    end
    if not head then return nil, errors.new({ kind = errors.NOT_FOUND, message = "skill has no versions" }) end
    return event_body(head)
end

local function verify_duplicate(
    threads: any,
    thread_id: string,
    event_type: string,
    record: any,
    external_id: string,
    external_version: string
): error?
    local found, lookup_err = threads:find_event_by_external({
        thread_id = thread_id,
        event_type = event_type,
        external_source = EXTERNAL_SOURCE,
        external_id = external_id,
        external_version = external_version,
    })
    if lookup_err then return lookup_err end
    local event = type(found) == "table" and (found :: any).event or nil
    if type(event) ~= "table" then
        return errors.new({ kind = errors.INTERNAL, message = "skill version duplicate verification failed: durable event was not found" })
    end
    if (event :: any).type ~= event_type
        or (event :: any).external_source ~= EXTERNAL_SOURCE
        or (event :: any).external_id ~= external_id
        or (event :: any).external_version ~= external_version then
        return errors.new({ kind = errors.INTERNAL, message = "skill version duplicate verification failed: durable event identity mismatch" })
    end
    local persisted, body_err = event_body(event)
    if body_err then return body_err end
    if deep_equal(persisted, record) then return nil end
    return errors.new({ kind = errors.CONFLICT, message = "skill version conflict: version " .. external_version
        .. " already exists with different content" })
end

function M.append(
    threads: any,
    thread_id: string,
    event_type: string,
    record: any,
    impl_id: string,
    thread_class: string,
    identity: string?
): error?
    local version = tostring(type(record) == "table" and (record :: any).version or "")
    local external_id = identity or ("version:" .. version)
    local result, append_err = threads:emit({
        component_id = thread_id,
        type = event_type,
        role = "user",
        body = record,
        impl_id = impl_id,
        thread_class = thread_class,
        content = {
            content_type = "text/markdown",
            content_mode = "inline",
            content_bytes = #(tostring(type(record) == "table" and (record :: any).body or "")),
        },
        external = {
            external_source = EXTERNAL_SOURCE,
            external_id = external_id,
            external_version = version,
        },
    })
    if append_err then return append_err end
    if type(result) ~= "table" then return errors.new({ kind = errors.INTERNAL, message = "invalid Threads emit response" }) end

    local duplicates = tonumber((result :: any).duplicates) or 0
    if duplicates > 0 then
        return verify_duplicate(threads, thread_id, event_type, record, external_id, version)
    end
    if (tonumber((result :: any).inserted) or 0) ~= 1 then
        return errors.new({ kind = errors.INTERNAL, message = "invalid Threads emit result: expected one inserted event" })
    end
    return nil
end

return M
