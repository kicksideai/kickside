-- Test-only callable wrappers over the writer / reader libraries. The thread/event
-- endpoints are HTTP handlers (they read http.request), so the writer + reader
-- suites cannot drive them as plain funcs; these entry points expose the same
-- library calls as value-returning functions a scoped test runner can invoke under
-- an actor. Each opens the slice db, runs one library call, and returns
-- { ok, result?, error? } so the component-contract access check resolves the
-- caller. Not registered outside the test harness.

local sql = require("sql")
local json = require("json")
local writer = require("threads_writer")
local reader = require("threads_reader")
local env = require("threads_env")
local security = require("security")

local M = {}

local function actor_id(): string?
    local actor = security.actor()
    if actor then
        local id = actor:id()
        if type(id) == "string" and id ~= "" then
            return id
        end
    end
    return nil
end

local function with_db(fn: (sql.DB) -> (any?, error?)): (any, any?)
    local db, db_err = sql.get(env.db_id() :: string)
    if db_err or not db then
        return { ok = false, error = "db unavailable: " .. tostring(db_err) }, nil
    end
    local result, op_err = fn(db)
    db:release()
    if op_err then
        return { ok = false, error = (op_err :: error):message(), kind = (op_err :: error):kind() }, nil
    end
    return { ok = true, result = result }, nil
end

-- post_message appends one message event ({ text, role?, external? }) through
-- the gated batch writer and answers { event = { event_id, seq }, duplicate }.
function M.post_message(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    local body, encode_err = json.encode({ text = args.text })
    if encode_err then return { ok = false, error = tostring(encode_err) }, nil end
    return with_db(function(db)
        local result, err = writer.ingest_events_batch(db, tostring(args.thread_id), {
            events = { {
                type = "kickside.threads:message.created",
                role = args.role,
                body_json = body,
                external = args.external,
            } },
        }, actor_id())
        if err then return nil, err end
        local answer = (result :: any).events[1]
        return { event = answer, duplicate = answer.duplicate }, nil
    end)
end

-- ingest_events_batch wraps writer.ingest_events_batch.
function M.ingest_events_batch(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    return with_db(function(db)
        return writer.ingest_events_batch(db, tostring(args.thread_id), args, actor_id())
    end)
end

-- ingest_multi wraps writer.ingest_multi for atomic multi-thread appends.
function M.ingest_multi(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    return with_db(function(db)
        return writer.ingest_multi(db, (args.writes :: { table }), actor_id(), args.system == true)
    end)
end

-- get wraps reader.get.
function M.get(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    return with_db(function(db)
        return reader.get(db, tostring(args.thread_id))
    end)
end

-- list_events wraps reader.list_events.
function M.list_events(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    return with_db(function(db)
        return reader.list_events(db, tostring(args.thread_id), (args :: table))
    end)
end

function M.find_event_by_external(args: any): (any, any?)
    args = type(args) == "table" and args or {}
    local external_version: string? = nil
    if type(args.external_version) == "string" then external_version = tostring(args.external_version) end
    return with_db(function(db)
        return reader.find_event_by_external(
            db,
            tostring(args.thread_id),
            tostring(args.event_type),
            tostring(args.external_source),
            tostring(args.external_id),
            external_version
        )
    end)
end

return M
