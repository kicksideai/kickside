-- Pending command recovery and the command dispatcher (design v5 §4.7;
-- CONTRACTS §19 dispatcher protocol). A pending declaration command is
-- executable from the command alone: recovery runs its writer step, finalizes
-- it and gives an install's drives their slots. A dispatch pass executes the
-- due pending commands, wakes every drive slot with unacknowledged control
-- demand before acknowledging exactly the demand it observed, and provisions
-- the slot of any drive left without one. Runs on SQLite and PostgreSQL.

type Map = { [string]: any }
type Writer = (string, Map) -> (any?, any)

local sql = require("sql")
local uuid = require("uuid")
local errors = require("errors")
local time = require("time")
local drive = require("drive")
local command = require("command")
local automation_test_engine = require("automation_test_engine")

local DB = "app:db"
local WRITER_CREATE = "kickside.automation:declaration_writer_create"
local WRITER_APPLY = "kickside.automation:declaration_writer_apply"

local function open_db(): sql.DB
    local db, err = sql.get(DB)
    if err or not db then error("recovery test: db connect failed: " .. tostring(err)) end
    return db :: sql.DB
end

local function in_tx(fn: (sql.Transaction) -> (any?, any)): (any?, any)
    local db = open_db()
    local tx = db:begin() :: sql.Transaction
    local result, err = fn(tx)
    if err then tx:rollback() else tx:commit() end
    db:release()
    return result, err
end

local function read_drive(automation_id: string, drive_key: string): Map?
    local db = open_db()
    local row, err = drive.get(db, automation_id, drive_key)
    db:release()
    if err then error(tostring(err)) end
    return row
end

local function command_state(automation_id: string): Map
    local db = open_db()
    local state, err = command.state(db, automation_id)
    db:release()
    if err then error(tostring(err)) end
    return state :: Map
end

local function op_of(automation_id: string, request_id: string): Map?
    local db = open_db()
    local op, err = command.read_op(db, automation_id, request_id)
    db:release()
    if err then error(tostring(err)) end
    return op
end

-- reserve_install leaves an install command pending over main and a timer
-- drive, as an install whose caller stopped after reservation does.
local function reserve_install(automation_id: string, next_attempt_at: string?): Map
    local reserved, err = in_tx(function(tx)
        for _, key in ipairs({ "main", "poll" }) do
            local _, insert_err = drive.insert_tx(tx, { automation_id = automation_id, drive_key = key,
                source_kind = key == "main" and "timer" or "collection",
                applied = { declaration = { source = "s" }, policy = { round = { page_size = 100 } } }, applied_hash = "hash-1" })
            if insert_err then return nil, insert_err end
        end
        return command.reserve_tx(tx, {
            automation_id = automation_id, request_id = "install:" .. automation_id, digest = "hash-1", kind = "install",
            input = {
                operator_id = "operator-1", subject_id = "operator-1", declaration = { source = "s" },
                drive_policy = { round = { page_size = 100 } },
                writer = WRITER_CREATE,
                writer_args = { impl_id = "ns:automation", context = { title = "T" }, meta = { title = "T" },
                    rollback = { { target = "ns:undo", args = { child = "c1" } } } },
            },
            drive_keys = { "main", "poll" },
            next_attempt_at = next_attempt_at or "2000-01-01T00:00:00Z",
        })
    end)
    if err then error(tostring(err)) end
    return reserved :: Map
end

-- engine(writer, slot_calls, runner_calls?) is an engine whose declaration writer
-- is `writer` and whose drive slots record provisions and wakes.
local function engine(writer: Writer, calls: Map): any
    calls.provisioned = calls.provisioned or {}
    calls.woken = calls.woken or {}
    calls.replayed = calls.replayed or {}
    calls.dispatcher_woken = calls.dispatcher_woken or 0
    local lib = automation_test_engine.new({
        funcs = {
            new = function(): (any, any)
                return {
                    with_context = function(self: any): any return self end,
                    call = function(_self: any, target: string, args: any): (any?, any)
                        if target == WRITER_CREATE or target == WRITER_APPLY then return writer(target, args) end
                        calls.replayed[#calls.replayed + 1] = { target = target, args = args }
                        return true, nil
                    end,
                }, nil
            end,
        },
        slot = {
            provision = function(automation_id: string, drive_key: string): (any?, any)
                if calls.provision_error then return nil, calls.provision_error end
                calls.provisioned[#calls.provisioned + 1] = drive_key
                local db = open_db()
                db:execute("UPDATE kickside_automation_drive SET job_id = $1 WHERE automation_id = $2 AND drive_key = $3",
                    { uuid.v7(), automation_id, drive_key })
                db:release()
                return "job-" .. drive_key, nil
            end,
            wake = function(job_id: string): (any?, any)
                if calls.wake_error then return nil, calls.wake_error end
                calls.woken[#calls.woken + 1] = job_id
                return { woken = calls.slot_inactive ~= true }, nil
            end,
            cancel = function(job_id: string): (any?, any)
                calls.cancelled = calls.cancelled or {}
                calls.cancelled[#calls.cancelled + 1] = job_id
                return 1, nil
            end,
            wake_dispatcher = function(): (any?, any)
                if calls.dispatcher_error then return nil, calls.dispatcher_error end
                calls.dispatcher_woken = calls.dispatcher_woken + 1
                return { woken = true }, nil
            end,
        },
    })
    return lib
end

local function writer_ok(writes: { Map }): Writer
    return function(_target: string, args: Map): (any?, any)
        local db = open_db()
        local pending = command.pending(db, args.automation_id)
        db:release()
        if not pending or pending.request_id ~= args.command_id or pending.generation ~= args.generation then
            -- The real writer's refusal (declaration_writer.verify): typed, terminal.
            return nil, errors.new({ message = "declaration command " .. tostring(args.command_id)
                .. " is not the pending automation command", kind = errors.INVALID, retryable = false,
                details = { error_kind = "declaration" } })
        end
        writes[#writes + 1] = args
        return { component_id = args.component_id, success = true }, nil
    end
end

-- reserve_reconfigure leaves a reconfigure command pending over an installed
-- automation's main and timer drives.
local function reserve_reconfigure(automation_id: string, source: any?): Map
    local reserved, err = in_tx(function(tx)
        for _, key in ipairs({ "main", "poll" }) do
            local _, insert_err = drive.insert_tx(tx, { automation_id = automation_id, drive_key = key,
                source_kind = key == "main" and "timer" or "collection",
                applied = { declaration = { source = "old" }, policy = { round = { page_size = 100 } } }, applied_hash = "hash-old",
                job_id = uuid.v7() })
            if insert_err then return nil, insert_err end
        end
        return command.reserve_tx(tx, {
            automation_id = automation_id, request_id = "reconfigure:" .. automation_id, digest = "hash-new", kind = "reconfigure",
            input = { operator_id = "operator-1", subject_id = "operator-1", declaration = { source = "new" },
                drive_policy = { round = { page_size = 7 } },
                schedules = source and source.schedules, source_update = source and { changed = false, source_kind = "timer", cadence_changed = true, action = { schedule = source.schedule } }, writer = WRITER_APPLY, writer_args = {} },
            drive_keys = { "main", "poll" },
            next_attempt_at = "2000-01-01T00:00:00Z",
        })
    end)
    if err then error(tostring(err)) end
    return reserved :: Map
end


return { open_db = open_db, in_tx = in_tx, read_drive = read_drive,
    command_state = command_state, op_of = op_of, reserve_install = reserve_install,
    engine = engine, writer_ok = writer_ok, reserve_reconfigure = reserve_reconfigure }
