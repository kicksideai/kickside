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
local slot = require("slot")
local automation_test_engine = require("automation_test_engine")

local DB = "app:db"
local WRITER_CREATE = "kickside.automation:declaration_writer_create"
local shared = require("recovery_shared")
local open_db, in_tx, read_drive = shared.open_db, shared.in_tx, shared.read_drive
local command_state, op_of = shared.command_state, shared.op_of
local reserve_install, reserve_reconfigure = shared.reserve_install, shared.reserve_reconfigure
local engine, writer_ok = shared.engine, shared.writer_ok

-- These dispatcher cases own a clean Automation fixture. Earlier suites
-- intentionally leave pending commands and retention evidence; none of that
-- state belongs to the command-only assertions or these maintenance cases.
local function clean_fixture(): ()
    local db = open_db()
    for _, table_name in ipairs({ "kickside_automation_prepared",
            "kickside_automation_delivery_history",
            "kickside_automation_receipt", "kickside_trigger_item_ledger", "kickside_automation_op",
            "kickside_automation_command", "kickside_automation_drive" }) do
        local _, err = db:execute("DELETE FROM " .. table_name)
        if err then db:release(); error(tostring(err)) end
    end
    db:release()
end

local function define_tests()
    test.describe("command dispatcher pass", function()
        test.before_each(clean_fixture)
        for _, state in ipairs({ "missing", "done", "dead", "cancelled" }) do
            test.it("retains unserved demand for a " .. state .. " job until a slot accepts its wake", function()
                local id, missing_job = uuid.v7(), uuid.v7()
                local _, insert_err = in_tx(function(tx)
                    local _, err = drive.insert_tx(tx, { automation_id = id, drive_key = "main",
                        source_kind = "collection", job_id = missing_job, cursor = "committed-position", event_seq = 17 })
                    if err then return nil, err end
                    return tx:execute("UPDATE kickside_automation_drive SET wake_generation=3, wake_applied_generation=1, command_generation=4, revision=6 WHERE automation_id=$1", { id })
                end)
                test.is_nil(insert_err, tostring(insert_err))
                local db = open_db()
                local _, ledger_err = db:execute([[INSERT INTO kickside_trigger_item_ledger
                    (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                     first_failed_at,last_failed_at,created_at,updated_at)
                    VALUES ($1,'source','item','dedup','identity','{}','retrying',$2,$2,$2,$2)]], { id, drive.utc_now() })
                db:release()
                test.is_nil(ledger_err, tostring(ledger_err))
                if state ~= "missing" then
                    db = open_db()
                    local _, job_err = db:execute([[INSERT INTO kickside_job
                        (id,job_type,payload,status,job_identity,owner_kind,owner_id)
                        VALUES ($1,'kickside.automation:round','{}',$2,$3,'automation',$4)]],
                        { missing_job, state, missing_job, id })
                    db:release()
                    test.is_nil(job_err, tostring(job_err))
                end
                local before = read_drive(id, "main")
                local lib = automation_test_engine.new()
                local pass, err = lib.dispatch({ limit = 1000 })
                test.is_nil(err, tostring(err))
                local after = read_drive(id, "main")
                test.eq(after.wake_applied_generation, before.wake_applied_generation)
                test.eq(pass.woken, 0)
                test.eq(pass.provisioned, 0)
                test.eq(after.job_id, missing_job)
                test.not_nil(pass.next_deadline)
                for _, key in ipairs({ "cursor", "event_seq", "command_generation", "revision", "rewind_generation",
                        "pending_command_id", "round_token", "round_seq", "delivery_revision", "wake_generation" }) do
                    test.eq(after[key], before[key], key)
                end
                local replacement, provision_err = slot.provision(id, "main")
                test.is_nil(provision_err, tostring(provision_err))
                test.is_true(replacement ~= missing_job)
                local second, second_err = lib.dispatch({ limit = 1000 })
                test.is_nil(second_err, tostring(second_err))
                test.eq(second.woken, 1)
                test.eq(second.provisioned, 0)
                test.eq(read_drive(id, "main").wake_applied_generation, before.wake_generation)
                test.eq(read_drive(id, "main").job_id, replacement)
                db = open_db()
                local rows, ledger_read_err = db:query("SELECT item_key,dedup_key,identity_key,envelope_json,state FROM kickside_trigger_item_ledger WHERE owner_id=$1", { id })
                db:release()
                test.is_nil(ledger_read_err, tostring(ledger_read_err))
                test.eq(#rows, 1)
                test.eq(rows[1].item_key, "item")
                test.eq(rows[1].dedup_key, "dedup")
                test.eq(rows[1].identity_key, "identity")
                test.eq(rows[1].envelope_json, "{}")
                test.eq(rows[1].state, "retrying")
            end)

        end

        test.it("persists a failed slot provisioning deadline instead of immediately looping", function()
            local id = uuid.v7()
            local _, insert_err = in_tx(function(tx)
                return drive.insert_tx(tx, { automation_id = id, drive_key = "main", source_kind = "collection" })
            end)
            test.is_nil(insert_err, tostring(insert_err))
            local pass, err = engine(writer_ok({}), { provision_error = errors.new({ kind = errors.UNAVAILABLE, message = "jobs unavailable" }) }).dispatch({ limit = 1 })
            test.is_nil(err, tostring(err))
            local d = read_drive(id, "main")
            test.not_nil(d.repair_next_at)
            test.eq(pass.next_deadline, d.repair_next_at)
            test.is_true(pass.next_deadline > drive.utc_now())
        end)

        test.it("propagates a failed dispatcher notification after a durable command commit", function()
            local id = uuid.v7()
            reserve_install(id)
            local result, err = engine(writer_ok({}), { dispatcher_error = errors.new({ kind = errors.UNAVAILABLE, message = "jobs unavailable" }) }).recover_command(id)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.UNAVAILABLE)
        end)

        test.it("continues immediately when a dispatcher page leaves known wake demand", function()
            for _ = 1, 3 do
                local id = uuid.v7()
                in_tx(function(tx)
                    local _, insert_err = drive.insert_tx(tx, { automation_id = id, drive_key = "main", source_kind = "collection", job_id = uuid.v7() })
                    if insert_err then return nil, insert_err end
                    return nil, drive.fence_for_command_tx(tx, id, { "main" }, "req", 1)
                end)
            end
            local pass, err = engine(writer_ok({}), {}).dispatch({ limit = 1 })
            test.is_nil(err, tostring(err))
            test.not_nil(pass.next_deadline)
            test.is_true(pass.next_deadline <= drive.utc_now(), "remaining eligible work requires immediate continuation")
        end)

        test.it("persists a failed wake retry deadline and arms it without hot continuation", function()
            local id = uuid.v7()
            in_tx(function(tx)
                local _, insert_err = drive.insert_tx(tx, { automation_id = id, drive_key = "main", source_kind = "collection", job_id = uuid.v7() })
                if insert_err then return nil, insert_err end
                return nil, drive.fence_for_command_tx(tx, id, { "main" }, "req", 1)
            end)
            local before = drive.utc_now()
            local pass, err = engine(writer_ok({}), { wake_error = errors.new({ kind = errors.UNAVAILABLE, message = "jobs unavailable" }) }).dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            test.not_nil(pass.next_deadline)
            test.is_true(pass.next_deadline > before and pass.next_deadline < drive.utc_after(60000), "known failed wake must arm its retry")
            local db = open_db()
            local rows, read_err = db:query("SELECT repair_next_at FROM kickside_automation_drive WHERE automation_id=$1", { id })
            db:release()
            test.is_nil(read_err, tostring(read_err))
            test.not_nil(rows[1].repair_next_at)
        end)

        test.it("does not schedule ordinary maintenance for a live-owner dead expiry", function()
            local id = uuid.v7()
            local db = open_db()
            local _, drive_err = db:execute([[INSERT INTO kickside_automation_drive
                (automation_id,drive_key,source_kind) VALUES ($1,'main','none')]], {id})
            test.is_nil(drive_err)
            local _, seed_err = db:execute([[INSERT INTO kickside_trigger_item_ledger
                (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                    first_failed_at,last_failed_at,created_at,updated_at,expires_at)
                VALUES ($1,'source','item','item','item','{}','dead',$2,$2,$2,$2,$3)]],
                {id, "2000-01-01T00:00:00Z", "2999-01-01T00:00:00Z"})
            test.is_nil(seed_err)
            db:release()
            local dispatched, err = engine(writer_ok({}), {}).dispatch({limit = 1000})
            test.is_nil(err)
            test.is_nil(dispatched.next_deadline)
            db = open_db()
            local rows, read_err = db:query("SELECT state FROM kickside_trigger_item_ledger WHERE owner_id=$1", {id})
            test.is_nil(read_err)
            test.eq(#rows, 1)
            test.eq(rows[1].state, "dead")
            db:release()
        end)

        test.it("arms the exact earliest terminal ledger retention expiry", function()
            local id = uuid.v7()
            local expiry = drive.utc_after(5000)
            local db = open_db()
            local _, insert_err = db:execute([[INSERT INTO kickside_trigger_item_ledger
                (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                 first_failed_at,last_failed_at,created_at,updated_at,expires_at)
                VALUES ($1,'retention','x','x','x','{}','resolved',$2,$2,$2,$2,$3)]], { id, drive.utc_now(), expiry })
            test.is_nil(insert_err, tostring(insert_err))
            db:release()
            local pass, err = engine(writer_ok({}), {}).dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            test.eq(pass.next_deadline, expiry)
        end)

        test.it("arms and prunes delivery history with the existing dispatcher retention budget",function()
            local id=uuid.v7()
            local expiry=drive.utc_after(5000)
            local db=open_db()
            for _,key in ipairs({"expired","live"}) do
                local _,insert_err=db:execute([[INSERT INTO kickside_automation_delivery_history
                    (automation_id,drive_key,round_token,source_port,item_key,identity_key,state,round_at,expires_at)
                    VALUES ($1,'history','round','source',$2,$2,'resolved',$3,$4)]],
                    {id,key,"2000-01-01T00:00:00Z",key == "expired" and "2000-01-01T00:00:00Z" or expiry})
                test.is_nil(insert_err,tostring(insert_err))
            end
            db:release()
            local pass,err=engine(writer_ok({}),{}).dispatch({limit=1})
            test.is_nil(err,tostring(err))
            test.eq(pass.next_deadline,expiry)
            db=open_db()
            local rows,read_err=db:query("SELECT item_key FROM kickside_automation_delivery_history WHERE automation_id=$1",{id})
            db:release()
            test.is_nil(read_err,tostring(read_err))
            test.eq(#rows,1)
            test.eq(rows[1].item_key,"live")
        end)

        test.it("executes a due pending command and leaves one whose retry floor is ahead", function()
            local due = uuid.v7()
            local later = uuid.v7()
            reserve_install(due)
            reserve_install(later, "2999-01-01T00:00:00Z")
            local writes: { Map } = {}
            local lib = engine(writer_ok(writes), {})

            local pass, err = lib.dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            test.is_true(pass.commands >= 1)
            test.is_nil(command_state(due).pending)
            test.not_nil(command_state(later).pending)
            for _, w in ipairs(writes) do test.is_true(w.automation_id ~= later) end
        end)

        test.it("wakes the dispatcher when a command step is deferred with a new retry floor (A52 no polling)", function()
            local id = uuid.v7()
            reserve_install(id)
            local calls: Map = {}
            local lib = engine(function(): (any?, any)
                return nil, errors.new({ message = "component database unavailable", kind = errors.UNAVAILABLE })
            end, calls)

            local result, err = lib.recover_command(id)
            test.is_nil(err, tostring(err))
            test.eq(result.state, "pending")
            test.is_true(calls.dispatcher_woken >= 1, "a deferred command's new next_attempt_at must wake the dispatcher, never wait for a timer")
        end)

        test.it("wakes the dispatcher when a command finalizes and releases its drives' control demand (A52 no polling)", function()
            local id = uuid.v7()
            reserve_install(id)
            local writes: { Map } = {}
            local calls: Map = {}
            local lib = engine(writer_ok(writes), calls)

            local result, err = lib.recover_command(id)
            test.is_nil(err, tostring(err))
            test.eq(result.state, "succeeded")
            test.is_true(calls.dispatcher_woken >= 1, "the release a finalize commits must wake the dispatcher, never wait for a timer")
        end)

        test.it("wakes the slot of a drive with control demand and acknowledges only the demand it observed", function()
            local id = uuid.v7()
            in_tx(function(tx)
                local _, e = drive.insert_tx(tx, { automation_id = id, drive_key = "main", source_kind = "collection", job_id = uuid.v7() })
                if e then return nil, e end
                return nil, drive.fence_for_command_tx(tx, id, { "main" }, "req-1", 1)
            end)
            local calls: Map = {}
            local lib = engine(writer_ok({}), calls)
            local before = read_drive(id, "main") :: Map
            test.is_true(before.wake_generation > before.wake_applied_generation)

            local _, err = lib.dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            local after = read_drive(id, "main") :: Map
            test.eq(after.wake_applied_generation, before.wake_generation)
            local woke = false
            for _, job_id in ipairs(calls.woken) do if job_id == before.job_id then woke = true end end
            test.is_true(woke)
        end)

        test.it("acknowledges control demand on a drive without a source whose slot job is no longer active", function()
            local id = uuid.v7()
            in_tx(function(tx)
                local _, e = drive.insert_tx(tx, { automation_id = id, drive_key = "main", source_kind = "none", job_id = uuid.v7() })
                if e then return nil, e end
                return nil, drive.fence_for_command_tx(tx, id, { "main" }, "req-1", 1)
            end)
            local calls: Map = { slot_inactive = true }
            local before = read_drive(id, "main") :: Map
            local _, err = engine(writer_ok({}), calls).dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            local after = read_drive(id, "main") :: Map
            test.eq(#calls.provisioned, 0, "a wake never provisions a slot")
            test.eq(after.job_id, before.job_id)
            test.eq(after.wake_applied_generation, before.wake_generation)
        end)

        test.it("keeps control demand when the slot cannot be woken", function()
            local id = uuid.v7()
            in_tx(function(tx)
                local _, e = drive.insert_tx(tx, { automation_id = id, drive_key = "main", source_kind = "collection", job_id = uuid.v7() })
                if e then return nil, e end
                return nil, drive.fence_for_command_tx(tx, id, { "main" }, "req-1", 1)
            end)
            local lib = engine(writer_ok({}), { wake_error = errors.new({ message = "jobs down", kind = errors.UNAVAILABLE }) })
            local _, err = lib.dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            local after = read_drive(id, "main") :: Map
            test.is_true(after.wake_generation > after.wake_applied_generation)
        end)

        test.it("provisions the slot of a drive left without one", function()
            local id = uuid.v7()
            in_tx(function(tx)
                return drive.insert_tx(tx, { automation_id = id, drive_key = "main", source_kind = "collection" })
            end)
            local calls: Map = {}
            local lib = engine(writer_ok({}), calls)
            local _, err = lib.dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            test.not_nil((read_drive(id, "main") :: Map).job_id)
        end)

        test.it("prunes expired resolved ledger rows and preserves dead and unresolved delivery", function()
            local id = uuid.v7()
            local db = open_db()
            local _, drive_err = db:execute([[INSERT INTO kickside_automation_drive
                (automation_id,drive_key,source_kind) VALUES ($1,'main','none')]], { id })
            test.is_nil(drive_err, tostring(drive_err))
            for _, state in ipairs({ "resolved", "dead", "retrying", "uncertain" }) do
                local _, insert_err = db:execute([[INSERT INTO kickside_trigger_item_ledger
                    (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                     first_failed_at,last_failed_at,created_at,updated_at,expires_at)
                    VALUES ($1,'source',$2,$2,$2,'{}',$3,$4,$4,$4,$4,$4)]],
                    { id, state, state, "2000-01-01T00:00:00Z" })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            local pass, err = engine(writer_ok({}), {}).dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            test.eq(pass.pruned, 1)
            db = open_db()
            local rows, query_err = db:query("SELECT state FROM kickside_trigger_item_ledger WHERE owner_id=$1 ORDER BY state", { id })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#rows, 3)
            test.eq(rows[1].state, "dead")
            test.eq(rows[2].state, "retrying")
            test.eq(rows[3].state, "uncertain")
        end)

        test.it("prunes old terminal command outcomes and keeps pending and recent outcomes", function()
            local id = uuid.v7()
            local db = open_db()
            for _, item in ipairs({
                { id = "old-success", state = "succeeded", at = "2000-01-01T00:00:00Z" },
                { id = "old-failure", state = "failed", at = "2000-01-01T00:00:00Z" },
                { id = "old-pending", state = "pending", at = "2000-01-01T00:00:00Z" },
                { id = "recent", state = "succeeded", at = "2999-01-01T00:00:00Z" },
            }) do
                local _, insert_err = db:execute([[INSERT INTO kickside_automation_op
                    (automation_id,request_id,generation,digest,state,created_at,completed_at)
                    VALUES ($1,$2,1,'digest',$3,$4,$4)]], { id, item.id, item.state, item.at })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            local pass, err = engine(writer_ok({}), {}).dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            test.is_true(pass.pruned_ops >= 2)
            db = open_db()
            local rows, query_err = db:query("SELECT request_id FROM kickside_automation_op WHERE automation_id=$1 ORDER BY request_id", { id })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#rows, 2)
            test.eq(rows[1].request_id, "old-pending")
            test.eq(rows[2].request_id, "recent")
        end)

        test.it("prunes aged prepared output with no recovery owner", function()
            local orphan, active, pending, recent = uuid.v7(), uuid.v7(), uuid.v7(), uuid.v7()
            in_tx(function(tx)
                return drive.insert_tx(tx, { automation_id = active, drive_key = "main", source_kind = "none" })
            end)
            local db = open_db()
            local _, command_err = db:execute([[INSERT INTO kickside_automation_command
                (automation_id,generation,pending_request_id,pending_digest,pending_kind,
                 pending_input_json,pending_drives_json,pending_step)
                VALUES ($1,1,'install','digest','install','{}','[]','install')]], { pending })
            test.is_nil(command_err, tostring(command_err))
            for _, item in ipairs({
                { id = orphan, at = "2000-01-01T00:00:00Z" },
                { id = active, at = "2000-01-01T00:00:00Z" },
                { id = pending, at = "2000-01-01T00:00:00Z" },
                { id = recent, at = "2999-01-01T00:00:00Z" },
            }) do
                local _, insert_err = db:execute([[INSERT INTO kickside_automation_prepared
                    (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                    VALUES ($1,'output','hash','{}',$2)]], { item.id, item.at })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            local pass, err = engine(writer_ok({}), {}).dispatch({ limit = 1000 })
            test.is_nil(err, tostring(err))
            test.eq(pass.pruned_prepared, 1)
            db = open_db()
            local rows, query_err = db:query([[SELECT automation_id FROM kickside_automation_prepared
                WHERE automation_id IN ($1,$2,$3,$4)]], { orphan, active, pending, recent })
            db:release()
            test.is_nil(query_err, tostring(query_err))
            test.eq(#rows, 3)
            local kept: { [string]: boolean } = {}
            for _, row in ipairs(rows) do kept[tostring(row.automation_id)] = true end
            test.is_nil(kept[orphan])
            test.is_true(kept[active] and kept[pending] and kept[recent])
        end)
    end)
end

return test.run_cases(define_tests)
