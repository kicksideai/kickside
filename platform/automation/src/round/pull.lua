-- Round acquisition (design v5 §4.2): one bounded page from a drive's source,
-- pulled under the automation's live execution identity (this function runs
-- through execution_identity.run_as, so every read is the principal's own):
--
--   event       -- kickside.core.threads:events_pullable over the source thread
--                  from the drive's committed event sequence;
--   collection  -- the source port's kickside.data:pullable binding with the
--                  declared pull config from the drive's committed cursor;
--   reconcile   -- the source's declared pull_keys function, one page of keys
--                  from the drive's committed cursor (A33);
--   timer       -- kickside.automation:timer_pullable over the occurrence the
--                  stamp persisted (A18).
--
-- acquire(request) -> { success = true, items, next_cursor, has_more,
-- source_gap? } or { success = false, error = classified failure }; the
-- envelope crosses the run_as boundary intact. request = { automation_id,
-- drive_key, source_kind,
-- source_ref?, source_thread_id?, event_type?, config?, cursor?, event_seq?,
-- occurrence?, limit, deadline, idempotency_key }. deadline is the round's work
-- deadline (RFC3339); a collection source receives it in its open context.

local funcs = require("funcs")
local contract = require("contract")
local security = require("security")
local failure_classification = require("failure_classification")
local automations_lib = require("automations_lib")
local capacity = require("connection_capacity").new()

local M = {}

type Map = { [string]: any }

local EVENTS_PULLABLE = "kickside.core.threads:events_pullable"
local TIMER_PULLABLE = "kickside.automation:timer_pullable"
local PULLABLE_CONTRACT = "kickside.data:pullable"

local function invalid(message: string): any
    return failure_classification.classify({ kind = errors.INVALID, message = message, retriable = false })
end

-- The page a pullable answered, or its classified failure.
local function page_of(page: any, call_err: any, prefix: string): (Map?, any)
    if call_err ~= nil then return nil, failure_classification.classify(call_err, prefix) end
    if type(page) ~= "table" or (page :: Map).success == false then
        return nil, failure_classification.classify(page or "pull returned no page", prefix)
    end
    local p = page :: Map
    return {
        items = type(p.items) == "table" and p.items or {},
        next_cursor = p.next_cursor,
        has_more = p.has_more == true,
        source_gap = p.source_gap,
        retry_after_ms = p.retry_after_ms,
    }, nil
end

local function pull_collection(r: Map): (Map?, any)
    local port, resolve_err = automations_lib.resolve_source(tostring(r.source_ref or ""))
    if resolve_err then return nil, failure_classification.classify(resolve_err) end
    if not port then return nil, invalid("source port " .. tostring(r.source_ref) .. " is missing") end
    local binding = tostring((port :: Map).binding or "")
    if binding == "" then return nil, invalid("source port " .. tostring(r.source_ref) .. " declares no binding") end
    local def, def_err = contract.get(PULLABLE_CONTRACT)
    if def_err or not def then return nil, failure_classification.classify(errors.new({ kind = errors.UNAVAILABLE, retryable = true,
        message = "pullable contract unavailable: " .. tostring(def_err),
        details = {code = "automation_pullable_unavailable"} })) end
    local config = type(r.config) == "table" and (r.config :: Map) or {}
    local connection_id = type(config.connection_id) == "string" and config.connection_id ~= "" and config.connection_id or nil
    local single, options_err = (def :: any):with_options({retry = {max_attempts = 1}})
    if options_err then return nil, failure_classification.classify(options_err) end
    local source, open_err = (single :: any):with_actor(security.actor()):with_scope(security.scope())
        :with_context({ component_id = connection_id, deadline = r.deadline }):open(binding)
    if open_err or not source then return nil, failure_classification.classify(open_err or "source open failed", "source open: ") end
    local page, call_err = capacity.invoke(connection_id, function()
        return failure_classification.native_result((source :: any):pull({
            cursor = r.cursor, config = config, limit = r.limit, idempotency_key = r.idempotency_key }))
    end)
    return page_of(page, call_err, "source pull: ")
end

-- pull_keys lists one page of the source's keys through its declared
-- pull_keys function (A33): { keys = [item_key], next_cursor, has_more }.
local function pull_keys(r: Map): (Map?, any)
    local target = tostring(r.pull_keys or "")
    if target == "" then return nil, invalid("reconcile drive declares no pull_keys") end
    local config = type(r.config) == "table" and (r.config :: Map) or {}
    local connection_id = type(config.connection_id) == "string" and config.connection_id ~= "" and config.connection_id or nil
    local page, call_err = capacity.invoke(connection_id, function()
        local invoker, invoker_err = funcs.new():with_options({retry = {max_attempts = 1}})
        if invoker_err then return nil, invoker_err end
        return failure_classification.native_result(invoker:call(target, { cursor = r.cursor, config = config, limit = r.limit,
            component_id = connection_id, deadline = r.deadline }))
    end)
    if call_err ~= nil then return nil, failure_classification.classify(call_err, "source key listing: ") end
    if type(page) ~= "table" or (page :: Map).success ~= true then
        return nil, failure_classification.classify(page or "key listing returned no page", "source key listing: ")
    end
    local p = page :: Map
    if type(p.keys) ~= "table" or p.next_cursor == nil or type(p.has_more) ~= "boolean" then
        return nil, invalid("source key listing must answer keys, next_cursor and has_more")
    end
    local keys: { string } = {}
    for index, raw in ipairs(p.keys :: { any }) do
        local key = type(raw) == "table" and (raw :: Map).item_key or raw
        if type(key) ~= "string" or key == "" then return nil, invalid("source key listing keys[" .. tostring(index) .. "] names no item_key") end
        keys[#keys + 1] = key :: string
    end
    return { items = {}, keys = keys, next_cursor = p.next_cursor, has_more = p.has_more }, nil
end

local function pull(r: Map): (Map?, any)
    if r.source_kind == "event" then
        local page, call_err = funcs.new():call(EVENTS_PULLABLE, {
            config = { thread_id = r.source_thread_id, event_type = r.event_type },
            cursor = math.floor(tonumber(r.event_seq) or 0),
            limit = r.limit,
            idempotency_key = r.idempotency_key,
        })
        return page_of(page, call_err, "events pull: ")
    end
    if r.source_kind == "timer" or r.source_kind == "manual" then
        local page, call_err = funcs.new():call(TIMER_PULLABLE, {
            config = { automation_id = r.automation_id, drive_key = r.drive_key, occurrence = r.occurrence },
            limit = r.limit,
            idempotency_key = r.idempotency_key,
        })
        return page_of(page, call_err, "timer pull: ")
    end
    if r.source_kind == "collection" then return pull_collection(r) end
    if r.source_kind == "reconcile" then return pull_keys(r) end
    return nil, invalid("drive source kind " .. tostring(r.source_kind) .. " acquires nothing")
end

function M.acquire(request: any): (Map?, any)
    local page, failure = pull(type(request) == "table" and (request :: Map) or {})
    if failure ~= nil or not page then return { success = false, error = failure }, nil end
    local out = page :: Map
    out.success = true
    return out, nil
end

return M
