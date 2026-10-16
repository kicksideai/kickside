-- A component-step outage after reconfigure reservation leaves every drive
-- fenced. Recovery must apply the persisted kind plan before the new cadence.
type Map = { [string]: any }
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local errors = require("errors")
local drive = require("drive")
local command = require("command")
local automation_test_engine = require("automation_test_engine")
local DB = "app:db"
local WRITER_APPLY = "kickside.automation:declaration_writer_apply"

local function db(): sql.DB
    local opened, err = sql.get(DB)
    if err or not opened then error(tostring(err)) end
    return opened :: sql.DB
end

local function transaction(fn: (sql.Transaction) -> (any?, any)): (any?, any)
    local opened = db()
    local tx = opened:begin() :: sql.Transaction
    local result, err = fn(tx)
    if err then tx:rollback() else tx:commit() end
    opened:release()
    return result, err
end

local function read_drive(id: string, key: string): Map
    local opened = db()
    local row, err = drive.get(opened, id, key)
    opened:release()
    if err or not row then error(tostring(err)) end
    return row :: Map
end

local function pending(id: string): Map?
    local opened = db()
    local row, err = command.pending(opened, id)
    opened:release()
    if err then error(tostring(err)) end
    return row
end

local function reserve(id: string, enabled: boolean?): ()
    local _, err = transaction(function(tx)
        for _, key in ipairs({ "main", "poll" }) do
            local _, insert_err = drive.insert_tx(tx, { automation_id = id, drive_key = key,
                source_kind = key == "main" and "timer" or "collection",
                applied = { declaration = { source = "old" }, policy = { round = { page_size = 100 } } },
                applied_hash = "hash-old", job_id = uuid.v7() })
            if insert_err then return nil, insert_err end
        end
        return command.reserve_tx(tx, {
            automation_id = id, request_id = "reconfigure:" .. id, digest = "hash-new", kind = "reconfigure",
            input = { operator_id = "operator-1", subject_id = "operator-1", declaration = { source = "new" },
                drive_policy = { round = { page_size = 7 } },
                source_update = { changed = false, source_kind = "timer", cadence_changed = true,
                    action = { schedule = { type = "interval", expression = "4h" } } },
                enabled = enabled,
                state = { hunts_per_day = 6, prompts = { "new market" } },
                public_meta = { hunts_per_day = 6, schedule_expression = "4h" },
                writer = WRITER_APPLY, writer_args = {} },
            drive_keys = { "main", "poll" }, next_attempt_at = "2000-01-01T00:00:00Z",
        })
    end)
    if err then error(tostring(err)) end
end

local function engine(writer: (Map) -> (any?, any)): any
    return automation_test_engine.new({ slot = {
        provision = function(): (any?, any) return "slot", nil end,
        wake = function(): (any?, any) return { woken = true }, nil end,
        cancel = function(): (any?, any) return 1, nil end,
        wake_dispatcher = function(): (any?, any) return { woken = true }, nil end,
    }, funcs = { new = function(): (any, any)
        return { call = function(_self: any, target: string, args: Map): (any?, any)
            if target ~= WRITER_APPLY then return nil, errors.new({ message = "unexpected writer", kind = errors.INVALID }) end
            return writer(args)
        end }, nil
    end } })
end

local run_cases = test.run_cases(function()
    test.describe("recovered reconfigure state", function()
        test.it("recovers kind state and cadence after the component write fails", function()
            local id = uuid.v7()
            reserve(id)
            local component = { state = { hunts_per_day = 2 }, meta = { hunts_per_day = 2,
                schedule_expression = "12h" } }
            local failed = engine(function(): (any?, any)
                return nil, errors.new({ message = "component write unavailable", kind = errors.UNAVAILABLE,
                    retryable = true, details = { error_kind = "infrastructure" } })
            end).recover_command(id)
            test.eq(failed.state, "pending")
            test.eq(component.state.hunts_per_day, 2)
            test.eq((read_drive(id, "main") :: Map).applied.declaration.source, "old")
            test.not_nil((read_drive(id, "main") :: Map).pending_command_id)
            local recovered = engine(function(args: Map): (any?, any)
                local opened = db()
                local current, read_err = command.pending(opened, args.automation_id)
                opened:release()
                if read_err then return nil, read_err end
                local input = (current :: Map).input :: Map
                test.eq(input.state.hunts_per_day, 6)
                test.eq(input.public_meta.schedule_expression, "4h")
                for key, value in pairs(input.state :: Map) do component.state[key] = value end
                for key, value in pairs(input.public_meta :: Map) do component.meta[key] = value end
                return { component_id = args.component_id }, nil
            end).recover_command(id)
            test.eq(recovered.state, "succeeded")
            test.is_nil(pending(id))
            test.eq(component.state.hunts_per_day, 6)
            test.eq(component.meta.schedule_expression, "4h")
            test.eq((read_drive(id, "main") :: Map).action.schedule.expression, "4h")
        end)

        test.it("keeps the native timer paused when the shared declaration disables its source", function()
            local id = uuid.v7()
            reserve(id, false)
            local result, err = engine(function(args: Map): (any?, any)
                return { component_id = args.component_id }, nil
            end).recover_command(id)
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            test.eq(read_drive(id, "main").enabled, false)
            test.eq(read_drive(id, "main").phase, drive.PHASE.PAUSED)
        end)

    end)
end)
return { run = function(options) return run_cases(options) end }
