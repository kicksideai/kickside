-- Automation drive rows (design v4 §5.1): creation and paging in drive_key
-- order, fenced updates that refuse a moved fence or a pending command, and
-- the durable control-wake acknowledgment that an older observer cannot
-- apply over newer demand. Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local drive = require("drive")

local DB = "app:db"

local function open_db(): sql.DB
    local db, err = sql.get(DB)
    if err or not db then error("drive test: db connect failed: " .. tostring(err)) end
    return db :: sql.DB
end

local function in_tx(fn: (sql.Transaction) -> (any?, error?)): (any?, error?)
    local db = open_db()
    local tx = db:begin()
    local result, err = fn(tx :: sql.Transaction)
    if err then tx:rollback() else tx:commit() end
    db:release()
    return result, err
end

local function read(automation_id: string, drive_key: string): table?
    local db = open_db()
    local row, err = drive.get(db, automation_id, drive_key)
    db:release()
    if err then error(tostring(err)) end
    return row
end

local function new_drive(automation_id: string, drive_key: string): table
    local created, err = in_tx(function(tx)
        return drive.insert_tx(tx, { automation_id = automation_id, drive_key = drive_key, source_kind = "timer",
            applied = { schedule = "5m" }, action = { writable = "kickside.test:sink" } })
    end)
    if err then error(tostring(err)) end
    return created :: table
end

local function define_tests()
    test.describe("automation drive", function()
        test.it("compares precise retry timestamps with existing second timestamps by instant", function()
            test.eq(drive.utc_at_ms(1893456000123), "2030-01-01T00:00:00.123Z")
            test.is_true(drive.after("2030-01-01T00:00:00.123Z", "2030-01-01T00:00:00Z"))
            test.is_false(drive.after("2030-01-01T00:00:00Z", "2030-01-01T00:00:00.123Z"))
            test.is_false(drive.after("2030-01-01T00:00:00.123Z", "2030-01-01T00:00:00.123Z"))
            test.is_true(drive.after("2030-01-01T00:00:00.124Z", "2030-01-01T00:00:00.123Z"))
        end)

        test.it("creates a drive with its initial fences and decoded declaration", function()
            local id = uuid.v7()
            local d = new_drive(id, "main")
            test.eq(d.revision, 1)
            test.eq(d.command_generation, 0)
            test.is_nil(d.pending_command_id)
            test.eq(d.phase, drive.PHASE.PENDING)
            test.is_true(d.enabled)
            test.eq(d.applied.schedule, "5m")
            test.eq(d.action.writable, "kickside.test:sink")
            test.eq(d.wake_generation, 0)

            local _, dup_err = in_tx(function(tx)
                return drive.insert_tx(tx, { automation_id = id, drive_key = "main", source_kind = "timer" })
            end)
            test.not_nil(dup_err)
            test.eq(dup_err:kind(), errors.CONFLICT)
        end)

        test.it("reads fence columns without decoding delivery journals", function()
            local id = uuid.v7()
            new_drive(id, "main")
            local db = open_db()
            local _, write_err = db:execute("UPDATE kickside_automation_drive SET action_json=$1,admission_json=$1,round_token=$2,round_until=$3 WHERE automation_id=$4 AND drive_key=$5",
                {"invalid JSON", "round-token", "2099-01-01T00:00:00Z", id, "main"})
            test.is_nil(write_err)
            local held, err = drive.get_fence(db, id, "main")
            db:release()
            test.is_nil(err)
            test.eq(held.revision, 1)
            test.eq(held.command_generation, 0)
            test.eq(held.rewind_generation, 0)
            test.eq(held.round_token, "round-token")
            test.eq(held.round_until, "2099-01-01T00:00:00Z")
            test.is_nil(held.pending_command_id)
            test.is_nil(held.action_json)
            test.is_nil(held.admission_json)
        end)

        test.it("reads one admitted delivery with its fence and literal key", function()
            local id = uuid.v7()
            new_drive(id, "main")
            local db = open_db()
            local _, write_err = db:execute("UPDATE kickside_automation_drive SET action_json=$1,admission_json=$2 WHERE automation_id=$3 AND drive_key=$4",
                {"invalid JSON", [[{"a.b\\c\"d":{"generation":7,"identity":{"actor_id":"owner"}},"other":{"generation":9}}]], id, "main"})
            test.is_nil(write_err)
            local held, err = drive.get_admission(db, id, "main", [[a.b\c"d]])
            test.is_nil(err)
            test.eq(held.revision, 1)
            test.eq(held.admission[ [[a.b\c"d]] ].generation, 7)
            test.eq(held.admission[ [[a.b\c"d]] ].identity.actor_id, "owner")
            test.is_nil(held.admission.other)
            test.is_nil(held.action_json)
            local missing, missing_err = drive.get_admission(db, id, "main", "missing")
            test.is_nil(missing_err)
            test.is_nil(missing.admission)
            db:release()
        end)

        test.it("pages drives in drive_key order", function()
            local id = uuid.v7()
            for _, key in ipairs({ "c", "a", "b" }) do new_drive(id, key) end
            local db = open_db()
            local first, next_key, err = drive.list(db, id, { limit = 2 })
            test.is_nil(err)
            test.eq(#first, 2)
            test.eq(first[1].drive_key, "a")
            test.eq(first[2].drive_key, "b")
            test.eq(next_key, "b")
            local rest, last_key = drive.list(db, id, { after_key = next_key, limit = 2 })
            db:release()
            test.eq(#rest, 1)
            test.eq(rest[1].drive_key, "c")
            test.is_nil(last_key)
        end)

        test.it("writes a fenced update only while every captured fence holds", function()
            local id = uuid.v7()
            new_drive(id, "main")
            local wrote, err = in_tx(function(tx)
                return drive.update_cas_tx(tx, id, "main", { revision = 1, no_pending_command = true },
                    { round_token = "L1", phase = drive.PHASE.ACTIVE })
            end)
            test.is_nil(err)
            test.is_true(wrote)

            local stale = in_tx(function(tx)
                return drive.update_cas_tx(tx, id, "main", { revision = 1, round_token = "L0" }, { cursor = "stale" })
            end)
            test.is_false(stale)
            test.is_nil((read(id, "main") :: table).cursor)

            in_tx(function(tx)
                local err_fence = drive.fence_for_command_tx(tx, id, { "main" }, "req-1", 1)
                return nil, err_fence
            end)
            local fenced = read(id, "main") :: table
            test.eq(fenced.revision, 2)
            test.eq(fenced.pending_command_id, "req-1")
            test.eq(fenced.command_generation, 1)
            test.is_nil(fenced.round_token)
            test.eq(fenced.wake_generation, 1)

            local old_round = in_tx(function(tx)
                return drive.update_cas_tx(tx, id, "main", { revision = 1, round_token = "L1" }, { cursor = "after-control" })
            end)
            test.is_false(old_round)
            local blocked = in_tx(function(tx)
                return drive.update_cas_tx(tx, id, "main", { revision = 2, no_pending_command = true }, { round_token = "L2" })
            end)
            test.is_false(blocked)
        end)

        test.it("acknowledges wake demand only from the observed generation", function()
            local id = uuid.v7()
            new_drive(id, "main")
            in_tx(function(tx) return nil, drive.fence_for_command_tx(tx, id, { "main" }, "req-1", 1) end)
            local db = open_db()
            local due = drive.wake_due(db, 1000)
            db:release()
            local mine: table? = nil
            for _, row in ipairs(due :: { table }) do
                if row.automation_id == id then mine = row end
            end
            test.not_nil(mine)
            test.eq((mine :: table).wake_generation, 1)
            test.eq((mine :: table).wake_applied_generation, 0)

            in_tx(function(tx) return nil, drive.release_command_tx(tx, id, { "main" }, "req-1", 1) end)
            local late = in_tx(function(tx) return drive.ack_wake_tx(tx, id, "main", 0, 1) end)
            test.is_true(late)
            local after = read(id, "main") :: table
            test.eq(after.wake_generation, 2)
            test.eq(after.wake_applied_generation, 1)
            local stale = in_tx(function(tx) return drive.ack_wake_tx(tx, id, "main", 0, 2) end)
            test.is_false(stale)
            local current = in_tx(function(tx) return drive.ack_wake_tx(tx, id, "main", 1, 2) end)
            test.is_true(current)
        end)

        test.it("refuses to release a drive pending on another command", function()
            local id = uuid.v7()
            new_drive(id, "main")
            in_tx(function(tx) return nil, drive.fence_for_command_tx(tx, id, { "main" }, "req-2", 2) end)
            local _, err = in_tx(function(tx) return nil, drive.release_command_tx(tx, id, { "main" }, "req-1", 1) end)
            test.not_nil(err)
            test.eq(err:details().reason, "stale_generation")
            test.eq((read(id, "main") :: table).pending_command_id, "req-2")
        end)

        test.it("deletes a drive", function()
            local id = uuid.v7()
            new_drive(id, "main")
            local deleted, delete_err = in_tx(function(tx) return drive.delete_tx(tx, id, "main") end)
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true(deleted)
            test.is_nil(read(id, "main"))
            local again, again_err = in_tx(function(tx) return drive.delete_tx(tx, id, "main") end)
            test.is_nil(again_err, tostring(again_err))
            test.is_false(again)
        end)
    end)
end

return test.run_cases(define_tests)
