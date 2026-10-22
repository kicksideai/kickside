-- Pending command recovery and the command dispatcher (design v5 §4.7;
-- CONTRACTS §19 dispatcher protocol). A pending declaration command is
-- executable from the command alone: recovery runs its writer step, finalizes
-- it and gives an install's drives their slots. A dispatch pass executes the
-- due pending commands, wakes every drive slot with unacknowledged control
-- demand before acknowledging exactly the demand it observed, and provisions
-- the slot of any drive left without one. Runs on SQLite and PostgreSQL.

type Map = { [string]: any }
type Writer = (string, Map) -> (any?, any)

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local errors = require("errors")
local time = require("time")
local drive = require("drive")
local command = require("command")
local automation_test_engine = require("automation_test_engine")

local DB = "app:db"
local WRITER_CREATE = "kickside.automation:declaration_writer_create"
local shared = require("recovery_shared")
local open_db, in_tx, read_drive = shared.open_db, shared.in_tx, shared.read_drive
local command_state, op_of = shared.command_state, shared.op_of
local reserve_install, reserve_reconfigure = shared.reserve_install, shared.reserve_reconfigure
local engine, writer_ok = shared.engine, shared.writer_ok

local function define_tests()
    test.describe("pending command recovery", function()
        test.it("retains nonretryable infrastructure failures until the writer recovers", function()
            local id = uuid.v7()
            reserve_install(id)
            local calls: Map = {}
            local result, err = engine(function()
                return nil, errors.new({kind = errors.UNAVAILABLE, retryable = false,
                    message = "writer unavailable", details = {error_kind = "infrastructure"}})
            end, calls).recover_command(id)
            test.is_nil(err)
            test.eq(result.state, "pending")
            test.not_nil(command_state(id).pending)
            test.eq(op_of(id, "install:" .. id).state, "pending")
            test.not_nil(read_drive(id, "main"))
            test.eq(#calls.replayed, 0)
            test.eq(engine(writer_ok({}), {}).recover_command(id).state, "succeeded")
        end)
        test.it("runs a pending install's writer step from the command alone and gives its drives slots", function()
            local id = uuid.v7()
            local reserved = reserve_install(id)
            local writes: { Map } = {}
            local calls: Map = {}
            local lib = engine(writer_ok(writes), calls)

            local result, err = lib.recover_command(id)
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            test.eq(#writes, 1)
            test.eq(writes[1].impl_id, "ns:automation")
            test.eq(writes[1].command_id, "install:" .. id)
            test.eq(writes[1].generation, reserved.generation)
            test.eq(writes[1].declaration_hash, "hash-1")
            test.eq(writes[1].rollback[1].target, "ns:undo")

            test.is_nil(command_state(id).pending)
            test.eq((op_of(id, "install:" .. id) :: Map).state, "succeeded")
            test.eq(#calls.provisioned, 2)
            test.is_nil((read_drive(id, "main") :: Map).pending_command_id)
        end)

        test.it("refreshes every affected drive's applied declaration when a reconfigure succeeds", function()
            local id = uuid.v7()
            reserve_reconfigure(id)
            local writes: { Map } = {}
            local result, err = engine(writer_ok(writes), {}).recover_command(id)
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            for _, key in ipairs({ "main", "poll" }) do
                local d = read_drive(id, key) :: Map
                test.eq(d.applied.declaration.source, "new")
                test.eq(d.applied.policy.round.page_size, 7)
                test.eq(d.applied_hash, "hash-new")
                test.is_nil(d.pending_command_id)
            end
        end)

        test.it("changes a timer cadence in the fenced reconfigure and keeps its occurrence sequence", function()
            local id = uuid.v7()
            reserve_reconfigure(id, { source_kind = "timer", schedule = { type = "interval", expression = "4h" } })
            local before = read_drive(id, "main") :: Map
            local _, seed_err = in_tx(function(tx)
                return drive.update_cas_tx(tx, id, "main", {}, {
                    action = { schedule = { type = "interval", expression = "12h" } },
                    next_run_at = "2099-01-01T00:00:00Z", last_committed_occurrence_seq = 9,
                })
            end)
            test.is_nil(seed_err, tostring(seed_err))
            local result, err = engine(writer_ok({}), {}).recover_command(id)
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            local after = read_drive(id, "main") :: Map
            test.eq(after.action.schedule.expression, "4h")
            test.is_nil(after.next_run_at)
            test.eq(after.last_committed_occurrence_seq, 9)
            test.eq(after.command_generation, before.command_generation)
        end)

        test.it("refuses a competing source reconfigure while the first is pending", function()
            local id = uuid.v7()
            reserve_reconfigure(id, { source_kind = "timer", schedule = { type = "interval", expression = "4h" } })
            local _, err = in_tx(function(tx)
                return command.reserve_tx(tx, { automation_id = id, request_id = "second", digest = "second",
                    kind = "reconfigure", input = { source_update = { changed = false, action = {} } }, drive_keys = { "main", "poll" } })
            end)
            test.not_nil(err)
            local details = type(err) == "userdata" and err:details() or nil
            test.eq(details.reason, command.REASON.PENDING)
            test.eq(details.pending_request_id, "reconfigure:" .. id)
        end)


        test.it("keeps the applied declaration when a reconfigure fails", function()
            local id = uuid.v7()
            reserve_reconfigure(id)
            local _, err = engine(function(): (any?, any)
                return nil, errors.new({ message = "stale or changed declaration command", kind = errors.CONFLICT, retryable = false })
            end, {}).recover_command(id)
            test.not_nil(err)
            local d = read_drive(id, "main") :: Map
            test.eq(d.applied.declaration.source, "old")
            test.eq(d.applied.policy.round.page_size, 100)
            test.eq(d.applied_hash, "hash-old")
            test.is_nil(d.pending_command_id)
        end)

        -- Two executors of one pending command (the caller, a drive's round,
        -- the dispatcher) may run its step concurrently. The one whose writer
        -- finds the command already finalized reads that durable outcome.
        test.it("answers a step whose command another executor finalized with its durable outcome", function()
            local id = uuid.v7()
            reserve_reconfigure(id)
            local writes: { Map } = {}
            local lib: any = nil
            local interleaved = false
            lib = engine(function(target: string, args: Map): (any?, any)
                if not interleaved then
                    interleaved = true
                    local inner, inner_err = lib.recover_command(id)
                    test.is_nil(inner_err, tostring(inner_err))
                    test.eq(inner.state, "succeeded")
                end
                return writer_ok(writes)(target, args)
            end, {})
            local result, err = lib.recover_command(id)
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            test.eq(#writes, 1)
            test.eq((op_of(id, "reconfigure:" .. id) :: Map).state, "succeeded")
            local d = read_drive(id, "main") :: Map
            test.eq(d.applied_hash, "hash-new")
            test.is_nil(d.pending_command_id)
        end)

        test.it("answers none when the automation has no pending command", function()
            local lib = engine(writer_ok({}), {})
            local result, err = lib.recover_command(uuid.v7())
            test.is_nil(err)
            test.eq(result.state, "none")
        end)

        test.it("keeps a command pending with its failure and a paced next attempt after a retryable step failure", function()
            local id = uuid.v7()
            reserve_install(id)
            local calls: Map = {}
            local lib = engine(function(): (any?, any)
                return nil, errors.new({ message = "component database unavailable", kind = errors.UNAVAILABLE })
            end, calls)
            local before = time.now():utc():format(time.RFC3339)

            local result, err = lib.recover_command(id)
            test.is_nil(err, tostring(err))
            test.eq(result.state, "pending")
            local pending = command_state(id).pending :: Map
            test.not_nil(pending)
            test.eq(pending.request_id, "install:" .. id)
            test.contains(tostring(pending.last_error.message), "component database unavailable")
            test.eq(pending.last_error.kind, errors.UNAVAILABLE)
            test.eq(pending.last_error.attempts, 1)
            test.is_true(pending.next_attempt_at > before)
            test.eq((op_of(id, "install:" .. id) :: Map).state, "pending")
            test.not_nil(read_drive(id, "main"))
            test.eq(#calls.replayed, 0)
            test.eq(#calls.provisioned, 0)

            local again = lib.recover_command(id)
            test.eq(again.state, "pending")
            test.eq((command_state(id).pending :: Map).last_error.attempts, 2)

            local writes: { Map } = {}
            local recovered = engine(writer_ok(writes), {}).recover_command(id)
            test.eq(recovered.state, "succeeded")
            test.is_nil(command_state(id).pending)
        end)

        test.it("finalizes a failed install step, removes its drives and replays its rollback chain", function()
            local id = uuid.v7()
            reserve_install(id)
            local calls: Map = {}
            local lib = engine(function(): (any?, any)
                return nil, errors.new({ message = "the operator lacks WRITE on the target parent", kind = errors.PERMISSION_DENIED, retryable = false })
            end, calls)

            local result, err = lib.recover_command(id)
            test.is_nil(result)
            test.not_nil(err)
            test.is_nil(command_state(id).pending)
            local op = op_of(id, "install:" .. id) :: Map
            test.eq(op.state, "failed")
            test.eq(op.outcome.kind, errors.PERMISSION_DENIED)
            test.is_nil(read_drive(id, "main"))
            test.is_nil(read_drive(id, "poll"))
            test.eq(#calls.replayed, 1)
            test.eq(calls.replayed[1].target, "ns:undo")
            test.eq(#calls.provisioned, 0)
        end)
    end)

    test.describe("drive recovery before stamping", function()
        test.it("lets a drive without a pending command stamp", function()
            local id = uuid.v7()
            in_tx(function(tx) return drive.insert_tx(tx, { automation_id = id, drive_key = "main", source_kind = "collection" }) end)
            local result, err = engine(writer_ok({}), {}).recover_drive(id, "main")
            test.is_nil(err, tostring(err))
            test.is_true(result.stamp)
            test.eq(result.state, "none")
        end)

        test.it("runs the pending command step first and then lets the drive stamp", function()
            local id = uuid.v7()
            reserve_install(id, "2999-01-01T00:00:00Z")
            local writes: { Map } = {}
            local result, err = engine(writer_ok(writes), {}).recover_drive(id, "poll")
            test.is_nil(err, tostring(err))
            test.eq(#writes, 1)
            test.is_true(result.stamp)
            test.eq(result.state, "succeeded")
            test.is_nil((read_drive(id, "poll") :: Map).pending_command_id)
        end)

        test.it("holds the stamp while the pending step is deferred, naming its next attempt", function()
            local id = uuid.v7()
            reserve_install(id)
            local result, err = engine(function(): (any?, any)
                return nil, errors.new({ message = "component database unavailable", kind = errors.UNAVAILABLE })
            end, {}).recover_drive(id, "main")
            test.is_nil(err, tostring(err))
            test.is_false(result.stamp)
            test.eq(result.state, "pending")
            test.eq(result.request_id, "install:" .. id)
            test.not_nil(result.next_attempt_at)
        end)

        test.it("reports a drive its failed install removed", function()
            local id = uuid.v7()
            reserve_install(id)
            local result, err = engine(function(): (any?, any)
                return nil, errors.new({ message = "denied", kind = errors.PERMISSION_DENIED, retryable = false })
            end, {}).recover_drive(id, "main")
            test.is_nil(err, tostring(err))
            test.is_false(result.stamp)
            test.eq(result.state, "removed")
        end)

        test.it("refuses a drive that does not exist", function()
            local _, err = engine(writer_ok({}), {}).recover_drive(uuid.v7(), "main")
            test.not_nil(err)
            test.is_true(errors.is(err, errors.NOT_FOUND))
        end)
    end)

end

return test.run_cases(define_tests)
