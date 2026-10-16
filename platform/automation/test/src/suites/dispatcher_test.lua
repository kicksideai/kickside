-- The command dispatcher's maintenance slot worker (design v5 §4.7; A52 no
-- polling): one dispatch pass, then rearm to the exact next known deadline
-- read from durable state, or not at all when none is pending. Runs on
-- SQLite and PostgreSQL.

type Map = { [string]: any }

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local funcs = require("funcs")
local drive = require("drive")
local command = require("command")

local DB = "app:db"

local function open_db(): sql.DB
    local db, err = sql.get(DB)
    if err or not db then error("dispatcher test: db connect failed: " .. tostring(err)) end
    return db :: sql.DB
end

-- reserve_pending leaves one command pending at next_attempt_at, over one
-- fresh drive its reservation fences.
local function reserve_pending(next_attempt_at: string): string
    local automation_id = uuid.v7()
    local db = open_db()
    local tx = db:begin() :: sql.Transaction
    local _, insert_err = drive.insert_tx(tx, { automation_id = automation_id, drive_key = "main", source_kind = "collection" })
    if insert_err then tx:rollback(); db:release(); error(tostring(insert_err)) end
    local _, reserve_err = command.reserve_tx(tx, {
        automation_id = automation_id, request_id = "run_now:" .. automation_id, digest = "d", kind = "run_now",
        input = {}, drive_keys = { "main" }, next_attempt_at = next_attempt_at,
    })
    if reserve_err then tx:rollback(); db:release(); error(tostring(reserve_err)) end
    tx:commit()
    db:release()
    return automation_id
end

local function run_dispatch(): (Map, any)
    return funcs.new():call("kickside.automation:command_dispatcher", { job = { id = "dispatcher-test" }, payload = {} })
end

-- These dispatcher cases own a clean Automation fixture. Earlier suites
-- intentionally leave pending commands and retention evidence; none of that
-- state belongs to the command-only assertions or these maintenance cases.
local function clean_fixture(): ()
    local db = open_db()
    for _, table_name in ipairs({ "kickside_automation_prepared",
            "kickside_automation_receipt", "kickside_trigger_item_ledger", "kickside_automation_op",
            "kickside_automation_command", "kickside_automation_drive" }) do
        local _, err = db:execute("DELETE FROM " .. table_name)
        if err then db:release(); error(tostring(err)) end
    end
    db:release()
end

local function define_tests()
    test.describe("command dispatcher worker", function()
        test.before_each(clean_fixture)
        test.it("does not rearm a pass with no due work and no future deadline", function()
            local output, err = run_dispatch()
            test.is_nil(err, tostring(err))
            test.not_nil(output.pass)
            test.is_true(type(output.pass.commands) == "number")
            test.is_nil(output.pass.next_deadline)
            test.is_nil(output.rearm)
            test.is_nil(output.next_run_at)
        end)

        test.it("rearms a pass with a future pending command to exactly its next_attempt_at", function()
            local deadline = "2999-05-01T00:00:00Z"
            reserve_pending(deadline)
            local output, err = run_dispatch()
            test.is_nil(err, tostring(err))
            test.eq(output.pass.next_deadline, deadline)
            test.eq(output.rearm, deadline)
        end)

        test.it("rearms to the earliest of several future pending commands", function()
            reserve_pending("2999-08-01T00:00:00Z")
            local earliest = "2999-02-01T00:00:00Z"
            reserve_pending(earliest)
            reserve_pending("2999-11-01T00:00:00Z")
            local output, err = run_dispatch()
            test.is_nil(err, tostring(err))
            test.eq(output.rearm, earliest)
        end)
    end)
end

return test.run_cases(define_tests)
