local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local errors = require("errors")
local drive = require("drive")
local slot = require("slot")
local slot_purge = require("slot_purge")
local owner_gc = require("owner_gc")
local component = require("component")
local retention_pin = require("retention_pin")
local json = require("json")
local automations_lib = require("automations_lib")
local security = require("security")
local contract = require("contract")
local funcs = require("funcs")
local lifecycle_consts = require("lifecycle_consts")
local threads_teardown = require("threads_teardown")
local round_claim = require("round_claim")

local function db(): any
    local opened, err = sql.get("app:db")
    if err or not opened then error(tostring(err)) end
    return opened
end

local function execute(statement: string, args: { any }): ()
    local opened = db()
    local _, err = opened:execute(statement, args)
    opened:release()
    test.is_nil(err, tostring(err))
end

local function count(table_name: string, key: string, owner: string): integer
    local opened = db()
    local rows, err = opened:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE " .. key .. "=$1", { owner })
    opened:release()
    test.is_nil(err, tostring(err))
    return tonumber(rows[1].n) :: integer
end

local function seed_drives(owner: string, keys: { string }): ()
    local opened = db()
    local tx, begin_err = opened:begin()
    test.is_nil(begin_err, tostring(begin_err))
    for _, key in ipairs(keys) do
        local _, insert_err = drive.insert_tx(tx, { automation_id = owner, drive_key = key,
            source_kind = "timer", applied = {}, applied_hash = "gc" })
        test.is_nil(insert_err, tostring(insert_err))
    end
    local _, commit_err = tx:commit()
    opened:release()
    test.is_nil(commit_err, tostring(commit_err))
end

local function define_tests(group: integer)
    test.describe("automation owner deletion", function()
        if group == 1 then
        test.it("reaps a deleted principal's automation through the component owner", function()
            local owner, id = "gc-user-" .. uuid.v7(), uuid.v7()
            local actor = security.new_actor(owner, { security_groups = { "automation_test" } })
            local scope, scope_err = security.named_scope("wippy.security:process")
            test.is_nil(scope_err, tostring(scope_err))
            local def, contract_err = contract.get("kickside.component:component_service")
            test.is_nil(contract_err, tostring(contract_err))
            local service, open_err = def:with_actor(actor):with_scope(scope):open()
            test.is_nil(open_err, tostring(open_err))
            local created, create_err = service:register({ component_id = id,
                impl_id = "kickside.automation.agent.fixture:automation_type",
                meta = { title = "Principal GC automation" } })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(created.success, tostring(created.error))
            seed_drives(id, { "main" })
            local job_id, slot_err = slot.enqueue(id, "main", nil)
            test.is_nil(slot_err, tostring(slot_err))
            execute([[INSERT INTO kickside_automation_receipt
                (owner_id,source_port,item_key,map_slot,identity_key,updated_at)
                VALUES ($1,'source','item','main','item',$2)]], { id, "2026-01-01T00:00:00Z" })
            local framework_actor, actor_err = security.new_actor(lifecycle_consts.SYSTEM_ACTOR,
                { system = true, groups = { "system", "lifecycle" } })
            test.is_nil(actor_err, tostring(actor_err))
            local framework_scope, framework_scope_err = security.named_scope(lifecycle_consts.SYSTEM_SCOPE)
            test.is_nil(framework_scope_err, tostring(framework_scope_err))
            local tick, tick_err = funcs.new():with_actor(framework_actor):with_scope(framework_scope)
                :call("kickside.core.lifecycle:reaper", {
                    thread_id = lifecycle_consts.thread_id(),
                events = { { type = "kickside.lifecycle.events:principal.deleted", body = { subject_id = owner } } },
                range = { to_seq = 1 }, projection = { body = {} },
            })
            test.is_nil(tick_err, tostring(tick_err))
            test.eq(tick.last_seq, 1)
            test.eq(count("kickside_components", "component_id", id), 0)
            test.eq(count("kickside_automation_drive", "automation_id", id), 0)
            test.eq(count("kickside_automation_receipt", "owner_id", id), 0)
            test.eq(count("kickside_job", "id", job_id :: string), 0)
        end)

        test.it("replays rollback once with uninstall options inside the owner callback", function()
            execute("CREATE TABLE IF NOT EXISTS owner_gc_rollback_log"
                .. " (component_id TEXT PRIMARY KEY, keep_thread TEXT NOT NULL)", {})
            local id = uuid.v7()
            local service, service_err = component.get_service()
            test.is_nil(service_err, tostring(service_err))
            if not service then error("component service unavailable") end
            local created, create_err = service:register({ component_id = id,
                impl_id = "kickside.automation.agent.fixture:automation_type",
                meta = { title = "Rollback GC fixture" } })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(created.success, tostring(created.error))
            execute("UPDATE kickside_components SET private_context=$1 WHERE component_id=$2", {
                json.encode({ _rollback = { { target = "kickside.automation:owner_gc_rollback_probe",
                    args = { component_id = id } } } }), id })
            seed_drives(id, { "main" })
            local result, uninstall_err = automations_lib.uninstall(id, { keep_thread = true })
            test.is_nil(uninstall_err, tostring(uninstall_err))
            test.eq(result.replayed, 1)
            test.eq(result.replay_failed, 0)
            local opened = db()
            local rows, read_err = opened:query("SELECT keep_thread FROM owner_gc_rollback_log WHERE component_id=$1", { id })
            opened:release()
            test.is_nil(read_err, tostring(read_err))
            test.eq(#rows, 1, "rollback target called once")
            test.eq(rows[1].keep_thread, "yes", "uninstall options reached the rollback target")
            test.eq(count("kickside_components", "component_id", id), 0)
        end)

        test.it("supersedes a pending command with no drive and releases its pin", function()
            local owner, thread_id = uuid.v7(), uuid.v7()
            local old_id = "install:" .. owner
            local consumer = "drive:" .. owner .. ":main"
            execute("INSERT INTO kickside_thread (id,thread_class,component_id) VALUES ($1,'test',$2)",
                { thread_id, owner })
            local input = json.encode({ pins = { { drive_key = "main", thread_id = thread_id,
                consumer_key = consumer, target = 0 } } })
            execute([[INSERT INTO kickside_automation_command
                (automation_id,generation,pending_request_id,pending_digest,pending_kind,
                 pending_input_json,pending_drives_json,pending_step,next_attempt_at)
                VALUES ($1,1,$2,'install','install',$3,'["main"]','apply',$4)]],
                { owner, old_id, input, "2026-01-01T00:00:00Z" })
            execute([[INSERT INTO kickside_automation_op
                (automation_id,request_id,generation,digest,state,created_at)
                VALUES ($1,$2,1,'install','pending',$3)]],
                { owner, old_id, "2026-01-01T00:00:00Z" })
            local opened = db()
            local _, lower_err = retention_pin.pin_lower(opened, { thread_id = thread_id,
                consumer_key = consumer, command_id = old_id, command_generation = 1, target_cursor = 0 })
            opened:release()
            test.is_nil(lower_err, tostring(lower_err))
            local result, err = owner_gc.delete(owner)
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.eq(count("kickside_retention_pin", "consumer_key", consumer), 0)
            test.eq(count("kickside_retention_pin_tombstone", "consumer_key", consumer), 1)
            test.eq(count("kickside_automation_command", "automation_id", owner), 0)
            test.eq(count("kickside_automation_op", "automation_id", owner), 0)
            local core = db()
            local late, late_err = retention_pin.pin_lower(core, { thread_id = thread_id,
                consumer_key = consumer, command_id = old_id, command_generation = 1, target_cursor = 0 })
            core:release()
            test.is_nil(late)
            test.not_nil(late_err)
        end)

        test.it("releases an event drive pin behind a fence against its old command", function()
            local owner, thread_id = uuid.v7(), uuid.v7()
            local consumer = "drive:" .. owner .. ":main"
            execute("INSERT INTO kickside_thread (id,thread_class,component_id) VALUES ($1,'test',$2)",
                { thread_id, owner })
            seed_drives(owner, { "main" })
            execute("UPDATE kickside_automation_drive SET source_kind='event',source_thread_id=$1"
                .. " WHERE automation_id=$2 AND drive_key='main'", { thread_id, owner })
            execute("INSERT INTO kickside_automation_command (automation_id,generation) VALUES ($1,1)", { owner })
            execute([[INSERT INTO kickside_automation_op
                (automation_id,request_id,generation,digest,state,created_at,completed_at)
                VALUES ($1,$2,1,'install','succeeded',$3,$3)]],
                { owner, "install:" .. owner, "2026-01-01T00:00:00Z" })
            local opened = db()
            local receipt, pin_err = retention_pin.pin_lower(opened, { thread_id = thread_id,
                consumer_key = consumer, command_id = "install:" .. owner,
                command_generation = 1, target_cursor = 0 })
            opened:release()
            test.is_nil(pin_err, tostring(pin_err))
            execute("UPDATE kickside_automation_drive SET pin_generation=$1 WHERE automation_id=$2 AND drive_key='main'",
                { receipt.pin_generation, owner })
            local removed, remove_err = owner_gc.delete(owner)
            test.is_nil(remove_err, tostring(remove_err))
            test.not_nil(removed)
            test.eq(count("kickside_retention_pin", "consumer_key", consumer), 0)
            test.eq(count("kickside_retention_pin_tombstone", "consumer_key", consumer), 1)
            local core = db()
            local late, late_err = retention_pin.pin_lower(core, { thread_id = thread_id,
                consumer_key = consumer, command_id = "install:" .. owner,
                command_generation = 1, target_cursor = 0 })
            core:release()
            test.is_nil(late)
            test.not_nil(late_err)
        end)
        end

        if group == 2 then
        test.it("runs owner cleanup through a real component deletion", function()
            local id = uuid.v7()
            local service, service_err = component.get_service()
            test.is_nil(service_err, tostring(service_err))
            if not service then error("component service unavailable") end
            local created, create_err = service:register({ component_id = id,
                impl_id = "kickside.automation.agent.fixture:automation_type",
                meta = { title = "GC owner fixture" } })
            test.is_nil(create_err, tostring(create_err))
            test.is_true(created.success, tostring(created.error))
            seed_drives(id, { "main" })
            local job_id, slot_err = slot.enqueue(id, "main", nil)
            test.is_nil(slot_err, tostring(slot_err))
            test.not_nil(job_id)
            execute([[INSERT INTO kickside_automation_receipt
                (owner_id,source_port,item_key,map_slot,identity_key,updated_at)
                VALUES ($1,'source','item','main','item',$2)]], { id, "2026-01-01T00:00:00Z" })
            execute([[INSERT INTO kickside_trigger_item_ledger
                (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                 first_failed_at,last_failed_at,created_at,updated_at)
                VALUES ($1,'source','uncertain','uncertain','uncertain','{}','uncertain',$2,$2,$2,$2)]],
                { id, "2026-01-01T00:00:00Z" })
            execute([[INSERT INTO kickside_automation_prepared
                (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                VALUES ($1,'uncertain','hash','{}',$2)]], { id, "2026-01-01T00:00:00Z" })
            local deleted, delete_err = service:delete({ component_id = id })
            test.is_nil(delete_err, tostring(delete_err))
            test.is_true(deleted.success, tostring(deleted.error))
            test.eq(deleted.discarded.ledger_unresolved, 1)
            test.eq(deleted.discarded.prepared_unsettled, 1)
            test.eq(count("kickside_components", "component_id", id), 0)
            test.eq(count("kickside_automation_drive", "automation_id", id), 0)
            test.eq(count("kickside_automation_receipt", "owner_id", id), 0)
            test.eq(count("kickside_job", "id", job_id :: string), 0)
        end)

        test.it("removes owned drive, slot, ledger, receipt, prepared, command rows", function()
            local owner, other = uuid.v7(), uuid.v7()
            seed_drives(owner, { "main" })
            seed_drives(other, { "main" })
            local job_id, slot_err = slot.enqueue(owner, "main", nil)
            test.is_nil(slot_err, tostring(slot_err))
            test.not_nil(job_id)
            local other_job, other_err = slot.provision(other, "main")
            test.is_nil(other_err, tostring(other_err))
            test.not_nil(other_job)
            execute([[INSERT INTO kickside_trigger_item_ledger
                (owner_id,source_port,item_key,dedup_key,identity_key,envelope_json,state,
                 first_failed_at,last_failed_at,created_at,updated_at)
                VALUES ($1,'source','item','item','item','{}','retrying',$2,$2,$2,$2)]],
                { owner, "2026-01-01T00:00:00Z" })
            execute([[INSERT INTO kickside_automation_receipt
                (owner_id,source_port,item_key,map_slot,identity_key,updated_at)
                VALUES ($1,'source','item','main','item',$2)]], { owner, "2026-01-01T00:00:00Z" })
            execute([[INSERT INTO kickside_automation_prepared
                (automation_id,idempotency_key,payload_hash,prepared_json,created_at)
                VALUES ($1,'item','hash','{}',$2)]], { owner, "2026-01-01T00:00:00Z" })

            local result, err = owner_gc.delete(owner)
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.eq(result.discarded.ledger_unresolved, 1)
            test.eq(result.discarded.prepared_unsettled, 1)
            for _, spec in ipairs({
                { "kickside_automation_drive", "automation_id" },
                { "kickside_trigger_item_ledger", "owner_id" },
                { "kickside_automation_receipt", "owner_id" },
                { "kickside_automation_prepared", "automation_id" },
                { "kickside_automation_command", "automation_id" },
                { "kickside_automation_op", "automation_id" },
            }) do
                test.eq(count(spec[1], spec[2], owner), 0, spec[1])
            end
            test.eq(count("kickside_job", "id", job_id :: string), 0, "owner slot")
            test.eq(count("kickside_automation_drive", "automation_id", other), 1, "unrelated drive")
            test.eq(count("kickside_job", "id", other_job :: string), 1, "unrelated slot")
            local repeated, repeated_err = owner_gc.delete(owner)
            test.is_nil(repeated_err, tostring(repeated_err))
            test.not_nil(repeated)
        end)
        end

        if group == 3 then
        test.it("pages an owner's receipt rows through durable cleanup retries", function()
            local owner = uuid.v7()
            execute("CREATE TABLE IF NOT EXISTS owner_gc_rollback_log"
                .. " (component_id TEXT PRIMARY KEY, keep_thread TEXT NOT NULL)", {})
            local rollback = { { target = "kickside.automation:owner_gc_rollback_probe",
                args = { component_id = owner } } }
            for i = 1, 205 do
                execute([[INSERT INTO kickside_automation_receipt
                    (owner_id,source_port,item_key,map_slot,identity_key,updated_at)
                    VALUES ($1,'source',$2,'main',$3,$4)]],
                    { owner, "item:" .. tostring(i), "identity:" .. tostring(i), "2026-01-01T00:00:00Z" })
            end
            local first, first_err = owner_gc.delete(owner, rollback)
            test.is_nil(first)
            test.not_nil(first_err)
            test.is_true(first_err:details().cleanup_pending)
            test.is_true(count("kickside_automation_receipt", "owner_id", owner) >= 105)
            local second, second_err = owner_gc.delete(owner, rollback)
            test.is_nil(second)
            test.not_nil(second_err)
            test.is_true(second_err:details().cleanup_pending)
            local third, third_err = owner_gc.delete(owner, rollback)
            test.is_nil(third_err, tostring(third_err))
            test.not_nil(third)
            test.eq(count("kickside_automation_receipt", "owner_id", owner), 0)
            test.eq(count("owner_gc_rollback_log", "component_id", owner), 1)
        end)

        test.it("retires a mapped destination's receipt with its owner and reports it, leaving the destination's records", function()
            -- The destination record belongs to the destination; deleting the
            -- automation discards only its own map to it (A48).
            local owner = uuid.v7()
            execute([[INSERT INTO kickside_automation_receipt
                (owner_id,source_port,item_key,map_slot,identity_key,dest_ref_json,updated_at)
                VALUES ($1,'source','mapped','main','mapped','{"id":"survivor"}',$2)]],
                { owner, "2000-01-01T00:00:00Z" })
            local result, err = owner_gc.delete(owner)
            test.is_nil(err, tostring(err))
            test.not_nil(result)
            test.eq((result :: any).discarded.receipt_mapped, 1)
            test.eq(count("kickside_automation_receipt", "owner_id", owner), 0)
        end)
        end

        if group == 4 then
        test.it("fences large drive sets in bounded owner-delete pages", function()
            local owner = uuid.v7()
            local keys: { string } = {}
            for i = 1, 205 do keys[i] = "drive:" .. tostring(i) end
            seed_drives(owner, keys)
            local jobs_by_key: { [string]: string } = {}
            for _, key in ipairs({ "drive:1", "drive:10", "drive:100" }) do
                local job_id, slot_err = slot.provision(owner, key)
                test.is_nil(slot_err, tostring(slot_err))
                jobs_by_key[key] = job_id :: string
            end
            local result, cleanup_err = owner_gc.delete(owner)
            test.is_nil(result)
            test.not_nil(cleanup_err)
            test.is_true(cleanup_err:details().cleanup_pending)
            local opened = db()
            local rows, read_err = opened:query("SELECT COUNT(*) AS n FROM kickside_automation_drive"
                .. " WHERE automation_id=$1 AND pending_command_id=$2", { owner, "owner-delete:" .. owner })
            opened:release()
            test.is_nil(read_err, tostring(read_err))
            test.is_true(tonumber(rows[1].n) <= 100, "one call fences at most 100 drives")
            local second, second_err = owner_gc.delete(owner)
            test.is_nil(second)
            test.is_true(second_err:details().cleanup_pending)
            test.eq(count("kickside_automation_drive", "automation_id", owner), 205)
            local third, third_err = owner_gc.delete(owner)
            test.is_nil(third)
            test.is_true(third_err:details().cleanup_pending)
            test.eq(count("kickside_automation_drive", "automation_id", owner), 204)
            test.eq(count("kickside_job", "id", jobs_by_key["drive:1"]), 0)
            test.eq(count("kickside_job", "id", jobs_by_key["drive:10"]), 1)
            test.eq(count("kickside_job", "id", jobs_by_key["drive:100"]), 1)
            local finished: any = nil
            for _ = 1, 210 do
                local step, step_err = owner_gc.delete(owner)
                if step then
                    test.is_nil(step_err, tostring(step_err))
                    finished = step
                    break
                end
                test.not_nil(step_err)
                test.is_true(step_err:details().cleanup_pending)
            end
            test.not_nil(finished, "owner retry must drain every drive")
            test.eq(count("kickside_automation_drive", "automation_id", owner), 0)
            test.eq(count("kickside_automation_command", "automation_id", owner), 0)
        end)
        test.it("returns a continuation when a peer finishes the owner delete between a page's fence and its drive delete", function()
            local owner = uuid.v7()
            seed_drives(owner, { "main" })
            local original = slot_purge.purge_slot
            local peer_result, peer_err
            local raced = false
            slot_purge.purge_slot = function(request)
                local purged, purge_err = original(request)
                if not raced then
                    raced = true
                    peer_result, peer_err = owner_gc.delete(owner)
                end
                return purged, purge_err
            end
            local result, err = owner_gc.delete(owner)
            slot_purge.purge_slot = original
            test.is_nil(peer_err, tostring(peer_err))
            test.not_nil(peer_result)
            test.eq(count("kickside_automation_drive", "automation_id", owner), 0)
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.CONFLICT)
            test.is_true(err:details().cleanup_pending)
            test.is_true(err:details().needs_continue)
            local finished, finish_err = owner_gc.delete(owner)
            test.is_nil(finish_err, tostring(finish_err))
            test.not_nil(finished)
            test.eq(count("kickside_automation_drive", "automation_id", owner), 0)
            test.eq(count("kickside_automation_command", "automation_id", owner), 0)
        end)
        end

        if group == 5 then
        test.it("blocks a surviving event drive before its source events are reaped", function()
            local source, owner = uuid.v7(), uuid.v7()
            execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count)"
                .. " VALUES ($1,'gc',$2,1)", { source, source })
            execute("INSERT INTO kickside_event (id,thread_id,type,seq) VALUES ($1,$2,'gc',1)",
                { uuid.v7(), source })
            execute("INSERT INTO kickside_retention_pin (thread_id,consumer_key,cursor_seq,generation)"
                .. " VALUES ($1,$2,0,1)", { source, "drive:" .. owner .. ":main" })
            local opened = db()
            local tx, begin_err = opened:begin()
            test.is_nil(begin_err, tostring(begin_err))
            local _, drive_err = drive.insert_tx(tx, { automation_id = owner, drive_key = "main",
                source_kind = "event", source_thread_id = source, phase = "active" })
            test.is_nil(drive_err, tostring(drive_err))
            local _, commit_err = tx:commit()
            test.is_nil(commit_err, tostring(commit_err))
            local result, purge_err = threads_teardown.purge_thread(opened, source, nil)
            opened:release()
            test.is_nil(purge_err, tostring(purge_err))
            test.is_true(result.purged)
            test.eq(count("kickside_event", "thread_id", source), 0)
            test.eq(count("kickside_retention_pin", "thread_id", source), 0)
            local proof = db()
            local rows, read_err = proof:query("SELECT phase,enabled FROM kickside_automation_drive"
                .. " WHERE automation_id=$1 AND drive_key='main'", { owner })
            proof:release()
            test.is_nil(read_err, tostring(read_err))
            test.eq(rows[1].phase, "blocked_source_deleted")
            test.is_true(rows[1].enabled == false or rows[1].enabled == 0)
            execute("UPDATE kickside_automation_drive SET enabled=$1 WHERE automation_id=$2 AND drive_key='main'",
                { true, owner })
            local claim_db = db()
            local claim_tx, claim_begin_err = claim_db:begin()
            test.is_nil(claim_begin_err, tostring(claim_begin_err))
            local claim_state, claim_err = round_claim.stamp_tx(claim_tx, owner, "main", { token = "late" }, drive.utc_now())
            claim_tx:rollback()
            claim_db:release()
            test.is_nil(claim_err, tostring(claim_err))
            test.eq(claim_state.state, round_claim.STATE.PARKED)
        end)
        end
    end)
end

local run_cases = {}
for group = 1, 5 do
    local selected = group
    run_cases[group] = test.run_cases(function() define_tests(selected) end)
end

return {
    run = function(options: any): any return run_cases[1](options) end,
    run_component = function(options: any): any return run_cases[2](options) end,
    run_receipts = function(options: any): any return run_cases[3](options) end,
    run_drives = function(options: any): any return run_cases[4](options) end,
    run_source = function(options: any): any return run_cases[5](options) end,
}
