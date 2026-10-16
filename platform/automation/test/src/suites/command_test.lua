-- The per-automation durable command stream (design v4 §4.7, §5.5):
-- reservation fences every affected drive under one generation; a matching
-- request id and digest replays, a changed digest conflicts, a different
-- request while pending is refused; finalization needs the pending id,
-- generation, digest and required receipts; simple controls reserve and
-- finish in one transaction; supersede fences an old command at a higher
-- generation; and concurrent reservations serialize on the command row.
-- Runs on SQLite and PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local channel = require("channel")
local drive = require("drive")
local command = require("command")

local DB = "app:db"

local function open_db(): sql.DB
    local db, err = sql.get(DB)
    if err or not db then error("command test: db connect failed: " .. tostring(err)) end
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

local function read_drive(automation_id: string, drive_key: string): table
    local db = open_db()
    local row, err = drive.get(db, automation_id, drive_key)
    db:release()
    if err or not row then error("drive read failed: " .. tostring(err)) end
    return row :: table
end

local function read_op(automation_id: string, request_id: string): table?
    local db = open_db()
    local op, err = command.read_op(db, automation_id, request_id)
    db:release()
    if err then error(tostring(err)) end
    return op
end

local function automation(keys: { string }): string
    local id = uuid.v7()
    for _, key in ipairs(keys) do
        local _, err = in_tx(function(tx)
            return drive.insert_tx(tx, { automation_id = id, drive_key = key, source_kind = "timer" })
        end)
        if err then error(tostring(err)) end
    end
    return id
end

local function request(id: string, request_id: string, digest: string, keys: { string }, kind: string?): table
    return { automation_id = id, request_id = request_id, digest = digest, kind = kind or "resync",
        input = { from = "start" }, drive_keys = keys }
end

local function reserve(req: table): (table?, error?)
    return in_tx(function(tx) return command.reserve_tx(tx, req) end)
end

local function finalize(id: string, request_id: string, generation: integer, digest: string, extra: table?): (table?, error?)
    local final = { automation_id = id, request_id = request_id, generation = generation, digest = digest,
        state = command.OP_STATE.SUCCEEDED, outcome = { cursor = "0" } }
    for key, value in pairs(extra or {}) do final[key] = value end
    return in_tx(function(tx) return command.finalize_tx(tx, final) end)
end

local function reason(err: any): string?
    return err and err:details() and err:details().reason or nil
end

local function define_tests()
    test.describe("automation command stream", function()
        test.it("RA-H56 prepares command-owned rows under reservation and never repeats preparation on replay", function()
            local id = uuid.v7()
            local calls = 0
            local req = request(id, "prepared", "prepared-digest", {"main"})
            local function prepare(tx)
                calls = calls + 1
                local _, err = drive.insert_tx(tx, {automation_id = id, drive_key = "main", source_kind = "none"})
                return err
            end
            local reserved, err = in_tx(function(tx) return command.reserve_tx(tx, req, prepare) end)
            test.is_nil(err, tostring(err))
            test.eq(calls, 1)
            test.eq(reserved.generation, 1)
            local replay, replay_err = in_tx(function(tx) return command.reserve_tx(tx, req, prepare) end)
            test.is_nil(replay_err, tostring(replay_err))
            test.eq(replay.existing, true)
            test.eq(calls, 1)
            req.digest = "changed"
            local changed, changed_err = in_tx(function(tx) return command.reserve_tx(tx, req, prepare) end)
            test.is_nil(changed)
            test.eq(reason(changed_err), command.REASON.IDEMPOTENCY)
            test.eq(calls, 1)
        end)
        test.it("RA-H56 a failed preparation leaves no drive or reserved command", function()
            local id = uuid.v7()
            local original = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "preparation fails"})
            local result, err = in_tx(function(tx)
                return command.reserve_tx(tx, request(id, "prepare", "digest", {"main"}), function(inner)
                    local _, insert_err = drive.insert_tx(inner, {automation_id = id, drive_key = "main", source_kind = "none"})
                    if insert_err then return insert_err end
                    return original
                end)
            end)
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE), tostring(err))
            test.eq(err:retryable(), true)
            test.is_nil(read_op(id, "prepare"))
            local db = open_db()
            local row, row_err = drive.get(db, id, "main")
            db:release()
            test.is_nil(row_err)
            test.is_nil(row)
        end)
        test.it("reserves one generation over every affected drive", function()
            local id = automation({ "a", "b", "c" })
            local reserved, err = reserve(request(id, "req-1", "d1", { "b", "a" }))
            test.is_nil(err)
            test.eq(reserved.generation, 1)
            test.is_false(reserved.existing)
            for _, key in ipairs({ "a", "b" }) do
                local d = read_drive(id, key)
                test.eq(d.pending_command_id, "req-1")
                test.eq(d.command_generation, 1)
                test.eq(d.revision, 2)
                test.eq(d.wake_generation, 1)
            end
            local untouched = read_drive(id, "c")
            test.is_nil(untouched.pending_command_id)
            test.eq(untouched.revision, 1)
            test.eq((read_op(id, "req-1") :: table).state, command.OP_STATE.PENDING)

            local db = open_db()
            local pending = command.pending(db, id)
            db:release()
            test.eq(pending.request_id, "req-1")
            test.eq(pending.input.from, "start")
            test.eq(#pending.drive_keys, 2)
            test.eq(pending.drive_keys[1], "a")
        end)

        test.it("replays a matching request, conflicts on a changed digest and refuses another request while pending", function()
            local id = automation({ "main" })
            reserve(request(id, "req-1", "d1", { "main" }))
            local again, again_err = reserve(request(id, "req-1", "d1", { "main" }))
            test.is_nil(again_err)
            test.is_true(again.existing)
            test.eq(again.generation, 1)
            test.eq(again.state, command.OP_STATE.PENDING)

            local _, digest_err = reserve(request(id, "req-1", "d-other", { "main" }))
            test.eq(reason(digest_err), command.REASON.IDEMPOTENCY)
            local _, pending_err = reserve(request(id, "req-2", "d2", { "main" }))
            test.eq(reason(pending_err), command.REASON.PENDING)
            test.eq(pending_err:details().pending_request_id, "req-1")
            test.eq(read_drive(id, "main").command_generation, 1)
        end)

        test.it("installs commands for an owner holding more outcomes than any former per-owner count", function()
            local id = automation({ "main" })
            local db = open_db()
            local _, seed_err = db:execute([[WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<100000)
                INSERT INTO kickside_automation_op
                (automation_id,request_id,generation,digest,state,created_at,completed_at)
                SELECT $1,'seed-' || CAST(x AS TEXT),1,'seed','succeeded',$2,$2 FROM n]],
                { id, "2026-01-01T00:00:00Z" })
            db:release()
            test.is_nil(seed_err, tostring(seed_err))
            local first, first_err = reserve(request(id, "edge-1", "edge-digest", { "main" }))
            test.is_nil(first_err, tostring(first_err))
            local replay, replay_err = reserve(request(id, "edge-1", "edge-digest", { "main" }))
            test.is_nil(replay_err, tostring(replay_err))
            test.is_true(replay.existing)
            local done, done_err = finalize(id, "edge-1", first.generation, "edge-digest")
            test.is_nil(done_err, tostring(done_err))
            test.eq(done.state, command.OP_STATE.SUCCEEDED)
            local second, second_err = reserve(request(id, "edge-2", "other", { "main" }))
            test.is_nil(second_err, tostring(second_err))
            test.not_nil(second)
            test.not_nil(read_op(id, "edge-2"))
            local cleanup = open_db()
            cleanup:execute("DELETE FROM kickside_automation_op WHERE automation_id=$1 AND request_id LIKE 'seed-%'", { id })
            cleanup:release()
        end)

        test.it("finalizes only the pending id, generation and digest, then releases the drives", function()
            local id = automation({ "main" })
            reserve(request(id, "req-1", "d1", { "main" }))
            local _, stale_err = finalize(id, "req-1", 2, "d1")
            test.eq(reason(stale_err), command.REASON.STALE)
            local _, digest_err = finalize(id, "req-1", 1, "d-other")
            test.eq(reason(digest_err), command.REASON.STALE)
            test.eq(read_drive(id, "main").pending_command_id, "req-1")
            local pending_db = open_db()
            local pending_rows, pending_query_err = pending_db:query([[SELECT pending_input_json,pending_drives_json
                FROM kickside_automation_command WHERE automation_id=$1]], { id })
            pending_db:release()
            test.is_nil(pending_query_err, tostring(pending_query_err))
            test.not_nil(pending_rows[1].pending_input_json)
            test.not_nil(pending_rows[1].pending_drives_json)

            local done, err = finalize(id, "req-1", 1, "d1")
            test.is_nil(err)
            test.eq(done.state, command.OP_STATE.SUCCEEDED)
            local d = read_drive(id, "main")
            test.is_nil(d.pending_command_id)
            test.eq(d.wake_generation, 2)
            local op = read_op(id, "req-1") :: table
            test.eq(op.state, command.OP_STATE.SUCCEEDED)
            test.eq(op.outcome.cursor, "0")
            test.not_nil(op.completed_at)
            local cleared_db = open_db()
            local cleared_rows, cleared_query_err = cleared_db:query([[SELECT pending_input_json,pending_drives_json,
                pending_request_id FROM kickside_automation_command WHERE automation_id=$1]], { id })
            cleared_db:release()
            test.is_nil(cleared_query_err, tostring(cleared_query_err))
            test.is_nil(cleared_rows[1].pending_input_json)
            test.is_nil(cleared_rows[1].pending_drives_json)
            test.is_nil(cleared_rows[1].pending_request_id)

            local replay = reserve(request(id, "req-1", "d1", { "main" }))
            test.eq(replay.state, command.OP_STATE.SUCCEEDED)
            test.eq(replay.outcome.cursor, "0")
            local _, late_err = finalize(id, "req-1", 1, "d1")
            test.eq(reason(late_err), command.REASON.STALE)

            local next_command = reserve(request(id, "req-2", "d2", { "main" }))
            test.eq(next_command.generation, 2)
        end)

        test.it("requires every declared target receipt before finalizing", function()
            local id = automation({ "main" })
            reserve(request(id, "req-1", "d1", { "main" }))
            local _, missing_err = finalize(id, "req-1", 1, "d1", { required_receipts = { "core_pin" } })
            test.eq(reason(missing_err), command.REASON.RECEIPT)
            local _, receipt_err = in_tx(function(tx)
                return nil, command.record_receipt_tx(tx, id, "req-1", 1, "d1", "core_pin", { pin_generation = 4 })
            end)
            test.is_nil(receipt_err)
            local _, stale_receipt_err = in_tx(function(tx)
                return nil, command.record_receipt_tx(tx, id, "req-1", 2, "d1", "core_pin", { pin_generation = 9 })
            end)
            test.eq(reason(stale_receipt_err), command.REASON.STALE)
            local done, err = finalize(id, "req-1", 1, "d1", { required_receipts = { "core_pin" } })
            test.is_nil(err)
            test.eq(done.state, command.OP_STATE.SUCCEEDED)
            test.eq((read_op(id, "req-1") :: table).target_receipts.core_pin.pin_generation, 4)
        end)

        test.it("runs a simple control in one transaction and replays it without reapplying", function()
            local id = automation({ "main" })
            local applied = 0
            local function pause(tx: sql.Transaction, drives: { [string]: table }): (table?, error?)
                applied = applied + 1
                local d = drives.main
                local wrote, err = drive.update_cas_tx(tx, id, "main", { command_generation = d.command_generation }, { enabled = false, phase = drive.PHASE.PAUSED })
                if err then return nil, err end
                return { paused = wrote }, nil
            end
            local req = request(id, "req-pause", "dp", { "main" }, "pause")
            local done, err = in_tx(function(tx) return command.run_tx(tx, req, pause) end)
            test.is_nil(err)
            test.eq(done.state, command.OP_STATE.SUCCEEDED)
            test.is_true(done.outcome.paused)
            local d = read_drive(id, "main")
            test.is_false(d.enabled)
            test.eq(d.phase, drive.PHASE.PAUSED)
            test.is_nil(d.pending_command_id)

            local again = in_tx(function(tx) return command.run_tx(tx, req, pause) end)
            test.is_true(again.existing)
            test.eq(applied, 1)
        end)

        test.it("rolls a failed simple control back to no command at all", function()
            local id = automation({ "main" })
            local _, err = in_tx(function(tx)
                return command.run_tx(tx, request(id, "req-x", "dx", { "main" }, "pause"), function()
                    return nil, (errors.new({ message = "refused", kind = errors.PERMISSION_DENIED }) :: error)
                end)
            end)
            test.not_nil(err)
            test.is_nil(read_op(id, "req-x"))
            local d = read_drive(id, "main")
            test.is_nil(d.pending_command_id)
            test.eq(d.revision, 1)
        end)

        test.it("supersedes a blocked command at a higher generation", function()
            local id = automation({ "a", "b" })
            reserve(request(id, "req-a", "da", { "a" }))
            local _, wrong_err = in_tx(function(tx) return command.supersede_tx(tx, request(id, "req-b", "db", { "b" }), "req-other") end)
            test.eq(reason(wrong_err), command.REASON.STALE)

            local replaced, err = in_tx(function(tx) return command.supersede_tx(tx, request(id, "req-b", "db", { "b" }), "req-a") end)
            test.is_nil(err)
            test.eq(replaced.generation, 2)
            test.eq((read_op(id, "req-a") :: table).state, command.OP_STATE.SUPERSEDED)
            for _, key in ipairs({ "a", "b" }) do
                local d = read_drive(id, key)
                test.eq(d.pending_command_id, "req-b")
                test.eq(d.command_generation, 2)
            end
            local _, old_err = finalize(id, "req-a", 1, "da")
            test.eq(reason(old_err), command.REASON.STALE)
            local done, done_err = finalize(id, "req-b", 2, "db")
            test.is_nil(done_err)
            test.eq(done.generation, 2)
            test.is_nil(read_drive(id, "a").pending_command_id)
        end)

        test.it("defers a failed step and lists the command when it is due", function()
            local id = automation({ "main" })
            reserve(request(id, "req-1", "d1", { "main" }))
            local later = time.now():utc():add(3600 * time.SECOND):format(time.RFC3339)
            local _, err = in_tx(function(tx)
                return nil, command.defer_tx(tx, id, "req-1", 1, "d1", { message = "component store unavailable" }, later)
            end)
            test.is_nil(err)
            local db = open_db()
            local now_due = command.due(db, drive.utc_now(), 1000)
            local later_due = command.due(db, time.now():utc():add(7200 * time.SECOND):format(time.RFC3339), 1000)
            db:release()
            local function contains(list: { table }): boolean
                for _, row in ipairs(list) do if row.automation_id == id then return true end end
                return false
            end
            test.is_false(contains(now_due :: { table }))
            test.is_true(contains(later_due :: { table }))
            local db2 = open_db()
            local pending = command.pending(db2, id)
            db2:release()
            test.eq(pending.last_error.message, "component store unavailable")
            test.eq(pending.next_attempt_at, later)
        end)

        test.it("serializes concurrent reservations on the command row", function()
            local id = automation({ "main" })
            local db = open_db()
            local dialect = tostring(db:type())
            local tx = db:begin()
            local first, first_err = command.reserve_tx(tx, request(id, "req-1", "d1", { "main" }))
            test.is_nil(first_err)
            test.eq(first.generation, 1)
            local done = channel.new(1)
            coroutine.spawn(function()
                local result, err = reserve(request(id, "req-2", "d2", { "main" }))
                done:send({ result = result, err = err })
            end)
            if dialect == sql.type.POSTGRES then
                local probe = open_db()
                local waiting = false
                for _ = 1, 500 do
                    local rows = probe:query("SELECT count(*) AS n FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock'")
                    if (tonumber(rows and rows[1] and rows[1].n) or 0) > 0 then waiting = true; break end
                    time.sleep("10ms")
                end
                probe:release()
                test.is_true(waiting)
            end
            tx:commit()
            db:release()
            local outcome = done:receive()
            test.is_nil(outcome.result)
            test.eq(reason(outcome.err), command.REASON.PENDING)
            test.eq(read_drive(id, "main").command_generation, 1)
        end)
    end)
end

return test.run_cases(define_tests)
