local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local time = require("time")
local channel = require("channel")
local job_types = require("job_types")
local claim = require("claim")
local reclaim = require("reclaim")
local claim_execution = require("claim_execution")
local lifecycle = require("lifecycle")
local lifecycle_cancel = require("lifecycle_cancel")
local proc_supervisor = require("proc_supervisor")
local job_fixture = require("job_fixture")
local row_bytes = require("row_bytes")
local config = require("config")
local lease_status = require("lease_status")

local function past(dbtype: string): string
    return dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
end

local function read(db: sql.DB, id: string): table
    local rows, err = sql.builder.select("status", "lease_token", "lease_until", "last_error",
        "scheduled_at", "wake_control_pending")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    if err or not rows or #rows ~= 1 then error("job " .. id .. " unreadable: " .. tostring(err)) end
    return rows[1] :: table
end

local function fenced(last_error: any): boolean
    return type(last_error) == "string"
        and string.find(last_error, job_types.TERMINATION_PENDING_PREFIX, 1, true) == 1
end

local function occupy_worker(db: sql.DB, dbtype: string, worker_id: string, job_id: string)
    local _, err = sql.builder.insert("kickside_job_worker")
        :set_map({ id = worker_id, registry_version = "0", current_job_id = job_id,
            last_seen_at = lifecycle.now_string(dbtype) })
        :run_with(db):exec()
    if err then error("worker marker insert failed: " .. tostring(err)) end
end

local function worker_job(db: sql.DB, worker_id: string): any
    local rows, err = db:query("SELECT current_job_id FROM kickside_job_worker WHERE id=$1", { worker_id })
    if err or not rows or #rows ~= 1 then error("worker marker unreadable: " .. tostring(err)) end
    return rows[1].current_job_id
end

local function leased(db: sql.DB, dbtype: string): table
    local job, err = job_fixture.enqueue_leased(db, dbtype, {
        job_type = "test.termination_recovery", slot = true,
        job_identity = { namespace = "drive", scope = uuid.v7(), key = "main" },
    })
    if err or not job then error("enqueue failed: " .. tostring(err)) end
    return job :: table
end

-- A supervisor committed the termination marker and stopped before recording
-- the exit: the token stays and the lease runs out.
local function fence(db: sql.DB, dbtype: string, job: table)
    local _, err = sql.builder.update("kickside_job")
        :set("last_error", job_types.TERMINATION_PENDING_PREFIX .. tostring(job.lease_token))
        :set("lease_until", past(dbtype))
        :set("wake_control_pending", true)
        :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
    if err then error("fence failed: " .. tostring(err)) end
end

-- An execution held after unconfirmed termination: no token, a passed recheck.
local function hold(db: sql.DB, dbtype: string, job: table)
    local _, err = sql.builder.update("kickside_job")
        :set("last_error", job_types.TERMINATION_PENDING_PREFIX .. tostring(job.lease_token))
        :set("lease_until", past(dbtype)):set("lease_token", nil)
        :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
    if err then error("hold failed: " .. tostring(err)) end
end

local function define_tests()
    test.describe("jobs termination fence recovery", function()
        test.it("keeps a prior completed execution valid when a later execution is fenced", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            local run = assert(lifecycle.start_job_run(db, dbtype, job, "prior-owner", 1))
            test.is_nil(lifecycle.finalize_job_run(db, dbtype, run, job_types.RUN_STATE.SUCCESS, {}, {}, nil))
            local later_token = uuid.v7()
            assert(db:execute("UPDATE kickside_job SET lease_token=$1,execution_seq=execution_seq+1,last_error=$2 WHERE id=$3",
                {later_token, job_types.TERMINATION_PENDING_PREFIX .. later_token, job.id}))
            local valid, err = lease_status.job_still_running(db, job, dbtype, run.id)
            assert(db:release())
            test.is_nil(err)
            test.is_true(valid)
        end)

        test.it("reports the expired candidate page when renewal wins locked revalidation", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past(dbtype), job.id}))
            local observed = false
            local observer: any = {
                query = function(_, statement, args)
                    local rows, err = db:query(statement, args)
                    if not err and not observed then
                        observed = true
                        test.is_nil(lifecycle.heartbeat_job(db, job, dbtype))
                    end
                    return rows, err
                end,
                begin = function() return db:begin() end,
            }
            local progress, err = reclaim.reclaim_expired(observer, dbtype, 1)
            local row = read(db, job.id)
            local exhausted, exhaust_err = reclaim.reclaim_expired(db, dbtype, 1)
            assert(db:release())
            test.is_nil(err)
            test.is_nil(exhaust_err)
            test.eq(progress, 1)
            test.eq(exhausted, 0)
            test.eq(row.status, "running")
            test.is_false(fenced(row.last_error))
        end)

        test.it("drains the next page when a selected fence settles during liveness observation", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local jobs = {leased(db, dbtype), leased(db, dbtype)}
            for _, job in ipairs(jobs) do fence(db, dbtype, job) end
            local pages, total, progress = 0, 0, 1
            while progress == 1 do
                pages = pages + 1
                if pages > 3 then error("termination scan does not end") end
                local settled, err, scanned = reclaim.reclaim_terminated(db, dbtype, 1, function(id, token)
                    local rows = assert(db:query("SELECT execution_seq FROM kickside_job WHERE id=$1", {id}))
                    test.is_true(assert(reclaim.settle_confirmed(db, dbtype,
                        {id = id, token = token, execution_seq = rows[1].execution_seq})))
                    total = total + 1
                    return false, nil
                end)
                test.is_nil(err)
                test.eq(settled, 0)
                progress = scanned
            end
            assert(db:release())
            test.eq(total, 2)
            test.eq(pages, 3)
            test.eq(progress, 0)
        end)

        for _, intent in ipairs({"cancel", "expiry"}) do
            test.it("settles a fenced unstarted assignment by " .. intent .. " intent", function()
                local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
                local dbtype = tostring(db:type())
                local job = leased(db, dbtype)
                local run = assert(lifecycle.start_job_run(db, dbtype, job, "unstarted-slot", 1))
                if intent == "cancel" then
                    test.is_true(assert(lifecycle_cancel.cancel_job(db, dbtype, {id = job.id})))
                else
                    assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past(dbtype), job.id}))
                    local child_name = proc_supervisor.child_name(job.id, job.lease_token)
                    assert(process.registry.register(child_name, nil, process.registry.CONSISTENT))
                    local progress, expiry_err = reclaim.reclaim_expired(db, dbtype, 1)
                    assert(process.registry.unregister(child_name, process.registry.CONSISTENT))
                    test.is_nil(expiry_err)
                    test.eq(progress, 1)
                end
                local released, err = claim_execution.release_unstarted(db, job, "unstarted-slot", run.id)
                local row = read(db, job.id)
                local history = assert(db:query("SELECT status FROM kickside_job_run WHERE id=$1", {run.id}))
                assert(db:release())
                test.is_nil(err)
                test.is_true(released)
                test.eq(row.status, intent == "cancel" and "cancelled" or "pending")
                test.is_nil(row.lease_token)
                test.is_false(fenced(row.last_error))
                test.eq(history[1].status, intent == "expiry" and "lease_lost" or "failed")
            end)
        end

        test.it("rejects a termination fence even when run history already reports success", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            local run = assert(lifecycle.start_job_run(db, dbtype, job, "history-owner", 1))
            test.is_nil(lifecycle.finalize_job_run(db, dbtype, run, job_types.RUN_STATE.SUCCESS, {}, {}, nil))
            fence(db, dbtype, job)
            local valid, err = lease_status.job_still_running(db, job, dbtype, run.id)
            assert(db:release())
            test.is_nil(err)
            test.is_false(valid)
        end)

        test.it("reports fencing progress while draining multiple live-child pages", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local jobs = {leased(db, dbtype), leased(db, dbtype), leased(db, dbtype)}
            for _, job in ipairs(jobs) do
                assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past(dbtype), job.id}))
                assert(process.registry.register(proc_supervisor.child_name(job.id, job.lease_token), nil, process.registry.CONSISTENT))
            end
            local ok, err = pcall(function()
                for _ = 1, #jobs do test.eq(assert(reclaim.reclaim_expired(db, dbtype, 1)), 1) end
                test.eq(assert(reclaim.reclaim_expired(db, dbtype, 1)), 0)
                for _, job in ipairs(jobs) do test.is_true(fenced(read(db, job.id).last_error)) end
            end)
            for _, job in ipairs(jobs) do
                assert(process.registry.unregister(proc_supervisor.child_name(job.id, job.lease_token), process.registry.CONSISTENT))
            end
            assert(db:release())
            if not ok then error(err) end
        end)

        test.it("reports terminated-page progress independently of settled executions", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local jobs = {leased(db, dbtype), leased(db, dbtype), leased(db, dbtype)}
            for _, job in ipairs(jobs) do fence(db, dbtype, job) end
            local observations = 0
            for _ = 1, #jobs do
                local settled, err, processed = reclaim.reclaim_terminated(db, dbtype, 1, function()
                    observations = observations + 1
                    return true, nil
                end)
                test.is_nil(err)
                test.eq(settled, 0)
                test.eq(processed, 1)
            end
            local settled, err, processed = reclaim.reclaim_terminated(db, dbtype, 1, function() return true, nil end)
            assert(db:release())
            test.is_nil(err)
            test.eq(settled, 0)
            test.eq(processed, 0)
            test.eq(observations, #jobs)
        end)

        for _, mode in ipairs({"single", "batch"}) do
            test.it("readmits a boundary row after termination without blocking its page: " .. mode, function()
                local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
                local dbtype = tostring(db:type())
                local job = leased(db, dbtype)
                local other = leased(db, dbtype)
                local cap = assert(config.policy()).max_row_bytes
                local tx = assert(db:begin())
                local rows = assert(tx:query("SELECT * FROM kickside_job WHERE id=$1", {job.id}))
                local row = rows[1]
                row.updated_at = "9999-12-31T23:59:59.999999999+00:00"
                row.lease_until = lifecycle.future_string(dbtype, 60)
                row.heartbeat_at = lifecycle.now_string(dbtype)
                row.payload = dbtype == sql.type.POSTGRES and '{"pad": ""}' or '{"pad":""}'
                local base = assert(row_bytes.measure(row))
                local padding = string.rep("x", cap - base)
                assert(tx:execute("UPDATE kickside_job SET payload=$1,lease_until=$2 WHERE id=$3", {(dbtype == sql.type.POSTGRES and '{"pad": "' or '{"pad":"') .. padding .. '"}', past(dbtype), job.id}))
                local size_err = row_bytes.check_update(tx, "kickside_job", job.id, {lease_until = row.lease_until}, cap, "boundary_fixture")
                if size_err then assert(tx:rollback()); assert(db:release()); error(size_err) end
                assert(tx:commit())
                assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past(dbtype), other.id}))
                local count, err = reclaim.reclaim_expired(db, dbtype, 2)
                test.is_nil(err)
                test.eq(count, 2)
                test.eq(read(db, job.id).status, "pending")
                test.eq(read(db, other.id).status, "pending")
                local successor, claim_err
                if mode == "single" then successor, claim_err = claim.claim_job(db, dbtype)
                else
                    local batch
                    batch, claim_err = claim.claim_batch(db, dbtype, 1)
                    successor = batch and batch[1]
                end
                test.is_nil(claim_err)
                test.not_nil(successor)
                test.eq(successor.id, job.id)
                test.is_nil(successor.last_error)
                test.is_nil(read(db, job.id).last_error)
                test.eq(tonumber(successor.execution_seq), assert(tonumber(job.execution_seq)) + 1)
                assert(db:release())
            end)

        end

        test.it("fences an expired execution until its registered process ends", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            local ready = process.listen("termination_test_ready")
            local events = process.events()
            local pid = assert(process.spawn_monitored("app:termination_recovery_child", "app:processes",
                {job_id = job.id, token = job.lease_token, parent = tostring(process.pid())}))
            local deadline = time.after("5s")
            local selected = channel.select({ready:case_receive(), deadline:case_receive()})
            test.eq(selected.channel, ready)
            local ok, assertion_err = pcall(function()
                test.is_true(assert(proc_supervisor.child_alive(job.id, job.lease_token)))
                assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past(dbtype), job.id}))
                local count, err = reclaim.reclaim_expired(db, dbtype)
                test.is_nil(err)
                test.eq(count, 1)
                test.eq(read(db, job.id).status, job_types.JOB_STATE.RUNNING)
                test.is_true(fenced(read(db, job.id).last_error))
                test.is_true(assert(proc_supervisor.child_alive(job.id, job.lease_token)))
                local duplicate, claim_err = claim.claim_job(db, dbtype)
                test.is_nil(claim_err)
                test.is_nil(duplicate)
            end)
            assert(process.send(tostring(pid), "termination_test_finish", {}))
            local ended = false
            while not ended do
                selected = channel.select({events:case_receive(), deadline:case_receive()})
                if selected.channel ~= events then error("execution child did not exit") end
                local event = selected.value
                ended = event.kind == process.event.EXIT and tostring(event.from) == tostring(pid)
                if ended then test.is_nil(event.result.error) end
            end
            if not ok then assert(db:release()); error(assertion_err) end
            local alive, alive_err = proc_supervisor.child_alive(job.id, job.lease_token)
            test.is_nil(alive_err)
            test.is_false(alive)
            assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past(dbtype), job.id}))
            test.eq(assert(reclaim.reclaim_terminated(db, dbtype)), 1)
            local successor = assert(claim.claim_job(db, dbtype))
            test.eq(successor.id, job.id)
            test.eq(tonumber(successor.execution_seq), assert(tonumber(job.execution_seq)) + 1)
            local empty, empty_err = claim.claim_job(db, dbtype)
            test.is_nil(empty_err)
            test.is_nil(empty)
            test.eq(assert(reclaim.reclaim_terminated(db, dbtype)), 0)
            assert(db:release())
        end)

        test.it("recovers an expired execution whose process is gone in the same pass", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past(dbtype), job.id}))
            test.eq(assert(reclaim.reclaim_expired(db, dbtype)), 1)
            test.eq(read(db, job.id).status, job_types.JOB_STATE.PENDING)
            test.eq(assert(claim.claim_job(db, dbtype)).id, job.id)
            local empty, empty_err = claim.claim_job(db, dbtype)
            test.is_nil(empty_err)
            test.is_nil(empty)
            assert(db:release())
        end)

        test.it("rechecks a renewed lease after reading child liveness", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            fence(db, dbtype, job)
            local count, err = reclaim.reclaim_terminated(db, dbtype, nil, function(): (boolean, error?)
                local _, renew_err = db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2",
                    {lifecycle.future_string(dbtype, 300), job.id})
                return false, renew_err
            end)
            test.is_nil(err)
            test.eq(count, 0)
            test.eq(read(db, job.id).status, job_types.JOB_STATE.RUNNING)
            assert(db:release())
        end)

        test.it("does not apply stale liveness evidence to a replaced execution", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            fence(db, dbtype, job)
            local replacement = uuid.v7()
            local count, err = reclaim.reclaim_terminated(db, dbtype, nil, function(): (boolean, error?)
                local _, replace_err = db:execute([[UPDATE kickside_job
                    SET lease_token=$1,execution_seq=execution_seq+1,last_error=$2 WHERE id=$3]],
                    {replacement, job_types.TERMINATION_PENDING_PREFIX .. replacement, job.id})
                return false, replace_err
            end)
            test.is_nil(err)
            test.eq(count, 0)
            test.eq(read(db, job.id).lease_token, replacement)
            test.eq(read(db, job.id).status, job_types.JOB_STATE.RUNNING)
            assert(db:release())
        end)

        test.it("settles a fence only once its execution child has ended", function()
            local db, _, queue_err = job_fixture.private_queue("app:private_queue_termination_recovery_test")
            if not db or not _ then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            local dbtype = tostring(db:type())
            local worker_id = "worker-" .. uuid.v7()
            local ended = leased(db, dbtype)
            fence(db, dbtype, ended)
            occupy_worker(db, dbtype, worker_id, ended.id)
            local held = leased(db, dbtype)
            hold(db, dbtype, held)
            local running = leased(db, dbtype)
            fence(db, dbtype, running)
            local live = leased(db, dbtype)

            local expired, expired_err = reclaim.reclaim_expired(db, dbtype)
            test.is_nil(expired_err)
            test.eq(expired, 0)

            local asked: { [string]: string } = {}
            local settled, settle_err = reclaim.reclaim_terminated(db, dbtype, nil, function(job_id: string, token: string): (boolean, error?)
                asked[job_id] = token
                return job_id == running.id, nil
            end)
            test.is_nil(settle_err)
            test.eq(settled, 2)
            test.eq(asked[ended.id], ended.lease_token)
            test.eq(asked[held.id], held.lease_token)
            test.is_nil(asked[live.id])

            local ended_row = read(db, ended.id)
            test.eq(ended_row.status, job_types.JOB_STATE.PENDING)
            test.is_nil(ended_row.lease_token)
            test.is_false(fenced(ended_row.last_error))
            test.not_nil(ended_row.scheduled_at)
            test.is_nil(worker_job(db, worker_id))
            test.eq(read(db, held.id).status, job_types.JOB_STATE.PENDING)

            local running_row = read(db, running.id)
            test.eq(running_row.status, job_types.JOB_STATE.RUNNING)
            test.is_true(fenced(running_row.last_error))
            test.is_true(tostring(running_row.lease_until) > lifecycle.now_string(dbtype))
            test.eq(read(db, live.id).lease_token, live.lease_token)

            local claimed: { [string]: boolean } = {}
            for _ = 1, 2 do
                local next_job, claim_err = claim.claim_job(db, dbtype)
                test.is_nil(claim_err)
                test.not_nil(next_job)
                claimed[tostring((next_job :: table).id)] = true
            end
            test.is_true(claimed[tostring(ended.id)] == true)
            test.is_true(claimed[tostring(held.id)] == true)
            db:release()
        end)

        test.it("keeps a fence while the runtime holds the execution child's name", function()
            local db, _, queue_err = job_fixture.private_queue("app:private_queue_termination_recovery_test")
            if not db or not _ then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            fence(db, dbtype, job)
            local name = proc_supervisor.child_name(tostring(job.id), tostring(job.lease_token))
            local registered, register_err = process.registry.register(name, nil, process.registry.CONSISTENT)
            test.is_nil(register_err)
            test.is_true(registered)

            local kept, kept_err = reclaim.reclaim_terminated(db, dbtype)
            test.is_nil(kept_err)
            test.eq(kept, 0)
            test.eq(read(db, job.id).status, job_types.JOB_STATE.RUNNING)

            process.registry.unregister(name, process.registry.CONSISTENT)
            local _, age_err = sql.builder.update("kickside_job"):set("lease_until", past(dbtype))
                :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
            test.is_nil(age_err)
            local settled, settle_err = reclaim.reclaim_terminated(db, dbtype)
            test.is_nil(settle_err)
            test.eq(settled, 1)
            test.eq(read(db, job.id).status, job_types.JOB_STATE.PENDING)
            db:release()
        end)

        test.it("settles exactly the execution whose exit its supervisor confirmed", function()
            local db, _, queue_err = job_fixture.private_queue("app:private_queue_termination_recovery_test")
            if not db or not _ then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            fence(db, dbtype, job)
            local other = leased(db, dbtype)
            fence(db, dbtype, other)

            local stale, stale_err = reclaim.settle_confirmed(db, dbtype,
                { id = job.id, token = uuid.v7(), execution_seq = job.execution_seq })
            test.is_nil(stale_err)
            test.is_false(stale)
            local settled, settle_err = reclaim.settle_confirmed(db, dbtype,
                { id = job.id, token = job.lease_token, execution_seq = job.execution_seq })
            test.is_nil(settle_err)
            test.is_true(settled)
            local row = read(db, job.id)
            test.eq(row.status, job_types.JOB_STATE.PENDING)
            test.is_false(fenced(row.last_error))
            test.eq(read(db, other.id).status, job_types.JOB_STATE.RUNNING)
            db:release()
        end)

        test.it("serializes child admission racing an unstarted release without aborting the drain", function()
            local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            local run = assert(lifecycle.start_job_run(db, dbtype, job, "test-slot", 1))
            local other = assert(sql.get("app:private_queue_termination_recovery_test"))
            local done = channel.new(2)
            coroutine.spawn(function()
                local started, err = claim_execution.mark_started(other, job, "test-slot", run.id, "test-child")
                done:send({kind = "start", changed = started, err = err})
            end)
            coroutine.spawn(function()
                local released, err = claim_execution.release_unstarted(db, job, "test-slot", run.id)
                done:send({kind = "release", changed = released, err = err})
            end)
            local results: { [string]: any } = {}
            for _ = 1, 2 do
                local selected = channel.select({done:case_receive(), time.after("15s"):case_receive()})
                test.eq(selected.channel, done)
                results[selected.value.kind] = selected.value
            end
            local row = read(db, job.id)
            local runs = assert(db:query("SELECT worker_pid FROM kickside_job_run WHERE id=$1", {run.id}))
            assert(other:release())
            assert(db:release())
            test.is_nil(results.start.err)
            test.is_nil(results.release.err)
            test.is_true(results.start.changed ~= results.release.changed)
            if results.start.changed then
                test.is_false(results.release.changed)
                test.eq(row.status, "running")
                test.eq(runs[1].worker_pid, "test-child")
            else
                test.eq(row.status, "pending")
                test.eq(#runs, 0)
            end
        end)

        test.it("never starts an execution fenced for termination", function()
            local db, _, queue_err = job_fixture.private_queue("app:private_queue_termination_recovery_test")
            if not db or not _ then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            local dbtype = tostring(db:type())
            local job = leased(db, dbtype)
            local run_ctx, run_err = lifecycle.start_job_run(db, dbtype, job, "test-slot", 1)
            test.is_nil(run_err)
            local _, mark_err = sql.builder.update("kickside_job")
                :set("last_error", job_types.TERMINATION_PENDING_PREFIX .. tostring(job.lease_token))
                :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
            test.is_nil(mark_err)
            local started, start_err = claim_execution.mark_started(db, job, "test-slot",
                tostring((run_ctx :: table).id), "test-child")
            test.is_nil(start_err)
            test.is_false(started)
            db:release()
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

local function child(args: table): boolean
    local finish = process.listen("termination_test_finish")
    assert(process.registry.register(proc_supervisor.child_name(args.job_id, args.token), nil,
        process.registry.CONSISTENT))
    assert(process.send(args.parent, "termination_test_ready", {}))
    finish:receive()
    assert(process.registry.unregister(proc_supervisor.child_name(args.job_id, args.token), process.registry.CONSISTENT))
    return true
end

return { run = run, child = child }
