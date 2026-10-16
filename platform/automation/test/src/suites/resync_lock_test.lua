-- Interleave the pin-receipt writer and the real event-resync completion
-- transaction. PostgreSQL's blocking graph is the barrier, not a timed race.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local channel = require("channel")
local drive = require("drive")
local command = require("command")
local controls = require("controls")
local fixture = require("control_fixture")

type Map = { [string]: any }

local function define_tests()
    test.describe("event resync lock order", function()
        for _, scenario in ipairs({
            { mode = "receipt", title = "serializes completion behind a concurrent pin receipt writer" },
            { mode = "round", title = "locks reconcile before a later event key alongside a round drive update" },
            { mode = "completed", title = "reads a concurrent executor's outcome without rewinding twice" },
        }) do
            test.it(scenario.title, function()
                local id = uuid.v7()
                -- A non-main key also makes reconcile sort before the event drive.
                local key = "z_event"
                fixture.seed_drive(id, key, { source_kind = "event", source_thread_id = uuid.v7(), event_seq = 17 })
                fixture.seed_drive(id, "reconcile")
                local reserved, reserve_err = fixture.in_tx(function(tx)
                    return command.reserve_tx(tx, { automation_id = id, request_id = "resync", digest = "digest",
                        kind = "resync_event", input = { drive_key = key, target = 0 }, drive_keys = { key, "reconcile" } })
                end)
                test.is_nil(reserve_err, tostring(reserve_err))
                local generation = math.floor(tonumber(reserved.generation) or 0) :: integer
                local pending = fixture.pending(id) :: Map
                local receipt = { pin_generation = 3 }
                local _, receipt_err = fixture.in_tx(function(tx)
                    return true, command.record_receipt_tx(tx, id, "resync", generation, "digest", "pin:" .. key, receipt)
                end)
                test.is_nil(receipt_err, tostring(receipt_err))

                local writer = fixture.open_db()
                local postgres = tostring(writer:type()) == sql.type.POSTGRES
                local tx = writer:begin()
                -- engine/pins.lower_pins records the command receipt first, then
                -- updates the drive's pin generation, in this same transaction.
                if scenario.mode == "round" then
                    -- A round with receipts prelocks reconcile then z_event in
                    -- ascending order before updating either drive.
                    local _, lock_err = drive.lock_tx(tx, id, { "reconcile" })
                    test.is_nil(lock_err, tostring(lock_err))
                else
                    local record_err = command.record_receipt_tx(tx, id, "resync", generation, "digest", "pin:" .. key, receipt)
                    test.is_nil(record_err, tostring(record_err))
                end
                local writer_pid = postgres and tonumber(tx:query("SELECT pg_backend_pid() AS pid")[1].pid) or 0
                local done = channel.new(1)
                local started = channel.new(1)
                local shared: any = {
                    command_steps = {}, lower_pins = function() return { [key] = receipt }, nil end,
                    wake_dispatcher = function() return nil end,
                    read_recorded = function(owner, request)
                        local op = fixture.op(owner, request)
                        return op, nil
                    end,
                    in_automation_tx = function(fn)
                        local db = fixture.open_db()
                        local completing = db:begin()
                        local pid = postgres and tonumber(completing:query("SELECT pg_backend_pid() AS pid")[1].pid) or 0
                        started:send(pid)
                        local result, err = fn(completing)
                        if err then completing:rollback() else
                            local _, commit_err = completing:commit()
                            err = commit_err
                        end
                        db:release()
                        return result, err
                    end,
                }
                controls.attach({}, { drive = drive, command = command, sql = sql }, shared)
                coroutine.spawn(function()
                    local result, err = shared.command_steps.resync_event(pending)
                    done:send({ result = result, err = err })
                end)
                local waiting = true
                if postgres then
                    local completing_pid = started:receive()
                    local probe = fixture.open_db()
                    waiting = false
                    for _ = 1, 500 do
                        local rows = probe:query("SELECT $1 = ANY(pg_blocking_pids($2)) AS blocked", { writer_pid, completing_pid })
                        if rows[1].blocked then waiting = true; break end
                        time.sleep("10ms")
                    end
                    probe:release()
                end
                -- Completion waits on the writer's command or reconcile lock.
                -- The writer must also reach the event drive without a lock cycle.
                local fields: Map = { pin_generation = receipt.pin_generation }
                if scenario.mode == "completed" then
                    fields.event_seq = 0
                    fields.delivery_revision = 2
                    fields.rewind_generation = 1
                end
                local _, update_err = drive.update_cas_tx(tx, id, key, {}, fields)
                if not update_err and scenario.mode == "completed" then
                    local _, restart_err = drive.update_cas_tx(tx, id, "reconcile", {}, { reconcile_next_at = drive.utc_now() })
                    update_err = restart_err
                    if not update_err then
                        local _, finalize_err = command.finalize_tx(tx, { automation_id = id, request_id = "resync",
                            generation = generation, digest = "digest", state = "succeeded",
                            required_receipts = { "pin:" .. key }, outcome = { event_seq = 0, pin_generation = 3 } })
                        update_err = finalize_err
                    end
                end
                local commit_err: any = nil
                if update_err then tx:rollback() else _, commit_err = tx:commit() end
                writer:release()
                local outcome = done:receive()
                test.is_true(waiting, "completion must block behind the other transaction")
                test.is_nil(update_err, tostring(update_err))
                test.is_nil(commit_err, tostring(commit_err))
                test.is_nil(outcome.err, tostring(outcome.err))
                test.eq(outcome.result.state, "succeeded")
                local db = fixture.open_db()
                local d = drive.get(db, id, key)
                local reconcile = drive.get(db, id, "reconcile")
                db:release()
                test.eq(d.event_seq, 0)
                test.eq(d.delivery_revision, 2)
                test.eq(d.rewind_generation, 1)
                test.eq(d.pin_generation, 3)
                test.is_nil(d.pending_command_id)
                test.not_nil(reconcile.reconcile_next_at)
                test.is_nil(reconcile.pending_command_id)
                test.is_nil(fixture.pending(id))
                test.eq(fixture.op(id, "resync").state, "succeeded")
            end)
        end
    end)
end

return { run = test.run_cases(define_tests) }
