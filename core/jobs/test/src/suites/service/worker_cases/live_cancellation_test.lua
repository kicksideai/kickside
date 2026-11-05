local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local time = require("time")
local channel = require("channel")
local lifecycle = require("lifecycle")
local jobs = require("jobs")
local job_fixture = require("job_fixture")
local worker_child = require("worker_child")
local worker = require("worker")
local proc_supervisor = require("proc_supervisor")
local reclaim = require("reclaim")
local claim = require("claim")
local job_types = require("job_types")
local worker_fence = require("worker_fence")
local worker_pool = require("worker_pool")
local lifecycle_cancel = require("lifecycle_cancel")

local function expire_without_notification(db: sql.DB, dbtype: string, job: table)
    local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
    assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past, job.id}))
    local notify = proc_supervisor.notify
    proc_supervisor.notify = function(...) return true, nil end
    local progress, err = reclaim.reclaim_expired(db, dbtype, 1)
    proc_supervisor.notify = notify
    test.is_nil(err)
    test.eq(progress, 1)
end

return { run = function(options)
    test.is_nil(job_fixture.supervise_as_loop())
    return test.run_cases(function()
        test.describe("live durable job cancellation", function()
            local job, completion, ready, completed
            test.before_each(function() job, completion, ready, completed = nil, nil, nil, false end)
            test.after_each(function()
                if job then
                    local _, cancel_err = jobs.cancel(job.id)
                    test.is_nil(cancel_err)
                    if completion and not completed then
                        local selected = channel.select({ completion:case_receive(), time.after("15s"):case_receive() })
                        test.eq(selected.channel, completion)
                    end
                end
                if ready then
                    local _, unlisten_err = process.unlisten(ready)
                    test.is_nil(unlisten_err)
                end
            end)
            test.it("retains typed stale-child loss and closes its history after ownership ends", function()
                local db = assert(sql.get("app:db"))
                local dbtype = tostring(db:type())
                local leased = assert(job_fixture.enqueue_leased(db, dbtype, {
                    job_type = "test.stale.child", worker_ref = "proc://app:job_sleep_proc",
                    job_identity = {namespace = "stale", scope = uuid.v7(), key = "child"},
                }))
                job = leased
                local run = assert(lifecycle.start_job_run(db, dbtype, leased, tostring(process.pid()), 1))
                test.is_nil(lifecycle.complete_job(db, leased, dbtype))
                assert(db:release())
                local child_err, control = worker_child.supervise_job_child(leased, run.id)
                test.is_true(job_types.is_lease_lost_error(child_err))
                db = assert(sql.get("app:db"))
                local settle_err = worker.settle_child_exit(db, dbtype, leased, run, child_err, control)
                local history = assert(db:query("SELECT status FROM kickside_job_run WHERE id=$1", {run.id}))[1]
                local row = assert(db:query("SELECT status FROM kickside_job WHERE id=$1", {leased.id}))[1]
                assert(db:release())
                test.is_nil(settle_err)
                test.eq(history.status, "lease_lost")
                test.eq(row.status, "done")
            end)

            test.it("recovers an expired unfenced assignment rejected before supervisor spawn", function()
                local db = assert(sql.get("app:db"))
                local dbtype = tostring(db:type())
                local leased = assert(job_fixture.enqueue_leased(db, dbtype, {
                    job_type = "test.unstarted.expiry." .. uuid.v7(), worker_ref = "proc://app:job_sleep_proc",
                    max_attempts = 1,
                    job_identity = {namespace = "expiry", scope = uuid.v7(), key = "unstarted"},
                }))
                job = leased
                local run = assert(lifecycle.start_job_run(db, dbtype, leased, tostring(process.pid()), 1))
                local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
                assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past, leased.id}))
                assert(db:release())
                local child_err, control = worker_child.supervise_job_child(leased, run.id)
                test.is_true(job_types.is_lease_lost_error(child_err))
                local alive, alive_err = proc_supervisor.child_alive(leased.id, leased.lease_token)
                test.is_nil(alive_err)
                test.is_false(alive)
                db = assert(sql.get("app:db"))
                local before = assert(db:query("SELECT status,last_error FROM kickside_job WHERE id=$1", {leased.id}))[1]
                test.eq(before.status, "running")
                test.is_nil(before.last_error)
                local settle_err = worker.settle_child_exit(db, dbtype, leased, run, child_err, control)
                local row = assert(db:query("SELECT status,lease_token FROM kickside_job WHERE id=$1", {leased.id}))[1]
                local history = assert(db:query("SELECT status FROM kickside_job_run WHERE id=$1", {run.id}))[1]
                test.is_nil(settle_err)
                test.eq(row.status, "pending")
                test.is_nil(row.lease_token)
                test.eq(history.status, "lease_lost")
                local next_jobs = assert(claim.claim_batch(db, dbtype, 1, nil, nil, nil, {leased.job_type}))
                test.eq(#next_jobs, 1)
                test.eq(next_jobs[1].id, leased.id)
                test.eq(#assert(claim.claim_batch(db, dbtype, 1, nil, nil, nil, {leased.job_type})), 0)
                test.is_nil(worker.settle_child_exit(db, dbtype, leased, run, child_err, control))
                local current = assert(db:query("SELECT status,lease_token FROM kickside_job WHERE id=$1", {leased.id}))[1]
                test.eq(current.status, "running")
                test.eq(current.lease_token, next_jobs[1].lease_token)
                assert(db:release())
            end)

            for _, intent in ipairs({"expiry", "cancel"}) do
                test.it("commits supervisor lease-loss history before concurrent recovery: " .. intent, function()
                    local db = assert(sql.get("app:db"))
                    local dbtype = tostring(db:type())
                    local leased = assert(job_fixture.enqueue_leased(db, dbtype, {
                        job_type = "test.loss.recovery", worker_ref = "proc://app:job_sleep_proc", max_attempts = 1,
                        job_identity = {namespace = "loss", scope = uuid.v7(), key = "recovery"},
                    }))
                    local run = assert(lifecycle.start_job_run(db, dbtype, leased, tostring(process.pid()), 1))
                    local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
                    assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past, leased.id}))
                    local child_err, control = worker_child.supervise_job_child(leased, run.id)
                    test.is_true(job_types.is_lease_lost_error(child_err))
                    if intent == "cancel" then test.is_true(assert(lifecycle_cancel.cancel_job(db, dbtype, {id = leased.id}))) end
                    local recovered = false
                    local recovery_err: error? = nil
                    local finish = lifecycle_cancel.finish_cancellation
                    lifecycle_cancel.finish_cancellation = function(...)
                        recovered = true
                        local _, err = reclaim.reclaim_terminated(db, dbtype, job_types.MAX_WORKERS)
                        recovery_err = err
                        return finish(...)
                    end
                    local settle_err = worker.settle_child_exit(db, dbtype, leased, run, child_err, control)
                    lifecycle_cancel.finish_cancellation = finish
                    local row = assert(db:query("SELECT status,lease_token FROM kickside_job WHERE id=$1", {leased.id}))[1]
                    local history = assert(db:query("SELECT status FROM kickside_job_run WHERE id=$1", {run.id}))[1]
                    assert(db:release())
                    test.is_nil(settle_err)
                    test.is_nil(recovery_err)
                    test.is_true(recovered)
                    test.eq(row.status, intent == "cancel" and "cancelled" or "pending")
                    test.is_nil(row.lease_token)
                    test.eq(history.status, intent == "cancel" and "failed" or "lease_lost")
                end)
            end

            test.it("recovers a supervisor-confirmed lease loss without treating it as an execution failure", function()
                local db = assert(sql.get("app:db"))
                local dbtype = tostring(db:type())
                local leased = assert(job_fixture.enqueue_leased(db, dbtype, {
                    job_type = "test.supervisor.lease", worker_ref = "proc://app:job_sleep_proc", max_attempts = 1,
                    job_identity = {namespace = "lease", scope = uuid.v7(), key = "supervisor"},
                    payload = {block = true, ready_to = tostring(process.pid()), max_execution_ms = 5000},
                }))
                job = leased
                local run = assert(lifecycle.start_job_run(db, dbtype, leased, tostring(process.pid()), 1))
                assert(db:release())
                ready = process.listen("job_worker_ready")
                completion = channel.new(1)
                coroutine.spawn(function()
                    local err, control = worker_child.supervise_job_child(leased, run.id)
                    completion:send({err = err, control = control})
                end)
                local selected = channel.select({ready:case_receive(), completion:case_receive(), time.after("15s"):case_receive()})
                completed = selected.channel == completion
                test.eq(selected.channel, ready)
                db = assert(sql.get("app:db"))
                test.is_nil(worker_fence.prepare_termination(db, leased))
                assert(db:release())
                local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
                test.is_true(assert(proc_supervisor.notify(leased.id, leased.lease_token,
                    leased.execution_seq, "lease_renewed", past)))
                selected = channel.select({completion:case_receive(), time.after("15s"):case_receive()})
                completed = selected.channel == completion
                test.eq(selected.channel, completion)
                test.is_true(job_types.is_lease_lost_error(selected.value.err))
                db = assert(sql.get("app:db"))
                local settle_err = worker.settle_child_exit(db, dbtype, leased, run, selected.value.err, selected.value.control)
                local row = assert(db:query("SELECT status,lease_token FROM kickside_job WHERE id=$1", {leased.id}))[1]
                local history = assert(db:query("SELECT status FROM kickside_job_run WHERE id=$1", {run.id}))[1]
                assert(db:release())
                test.is_nil(settle_err)
                test.eq(row.status, "pending")
                test.is_nil(row.lease_token)
                test.eq(history.status, "lease_lost")
            end)

            for _, intent in ipairs({"cancel", "expiry"}) do
                for _, outcome in ipairs({"failure", "invalid", "timeout"}) do
                    test.it("settles " .. intent .. " intent after supervised " .. outcome, function()
                        local db = assert(sql.get("app:db"))
                        local dbtype = tostring(db:type())
                        local finish = "fenced_finish_" .. uuid.v7()
                        local leased = assert(job_fixture.enqueue_leased(db, dbtype, {
                            job_type = "test.fenced.outcome." .. uuid.v7(), worker_ref = "proc://app:job_sleep_proc",
                            job_identity = {namespace = "fenced", scope = uuid.v7(), key = "outcome"},
                            payload = {finish_topic = finish, ready_to = tostring(process.pid()),
                                fail = outcome == "failure", output = outcome == "invalid" and {tier = "invalid"} or nil,
                                max_execution_ms = outcome == "timeout" and 1000 or 5000},
                        }))
                        job = leased
                        local run = assert(lifecycle.start_job_run(db, dbtype, leased, tostring(process.pid()), 1))
                        assert(db:release())
                        ready = process.listen("job_worker_ready")
                        local done = channel.new(1)
                        completion = done
                        coroutine.spawn(function()
                            local err, control = worker_child.supervise_job_child(leased, run.id)
                            done:send({err = err, control = control})
                        end)
                        local selected = channel.select({ready:case_receive(), done:case_receive(), time.after("15s"):case_receive()})
                        test.eq(selected.channel, ready)
                        local target = selected.value.target_pid
                        db = assert(sql.get("app:db"))
                        if intent == "cancel" then
                            test.is_true(assert(lifecycle_cancel.cancel_job(db, dbtype, {id = leased.id})))
                        else
                            expire_without_notification(db, dbtype, leased)
                        end
                        assert(db:release())
                        if outcome ~= "timeout" then assert(process.send(target, finish, {})) end
                        selected = channel.select({done:case_receive(), time.after("15s"):case_receive()})
                        completed = selected.channel == done
                        test.eq(selected.channel, done)
                        local child_err = selected.value.err
                        db = assert(sql.get("app:db"))
                        local before = assert(db:query("SELECT status,last_error FROM kickside_job WHERE id=$1", {leased.id}))[1]
                        local before_history = assert(db:query("SELECT status FROM kickside_job_run WHERE id=$1", {run.id}))[1]
                        test.eq(before_history.status, intent == "expiry" and "lease_lost" or "running")
                        local settle_err = worker.settle_child_exit(db, dbtype, leased, run, child_err, selected.value.control)
                        local row = assert(db:query("SELECT status,lease_token,last_error FROM kickside_job WHERE id=$1", {leased.id}))[1]
                        local history = assert(db:query("SELECT status,error_text FROM kickside_job_run WHERE id=$1", {run.id}))[1]
                        assert(db:release())
                        if outcome ~= "timeout" then test.is_true(job_types.is_lease_lost_error(child_err))
                        else test.not_nil(child_err) end
                        test.eq(before.status, "running")
                        test.eq(before.last_error, job_types.TERMINATION_PENDING_PREFIX .. leased.lease_token)
                        test.is_nil(settle_err)
                        test.eq(row.status, intent == "cancel" and "cancelled" or "pending")
                        test.is_nil(row.lease_token)
                        test.eq(history.status, intent == "expiry" and "lease_lost" or "failed")
                        if intent == "expiry" then test.eq(history.error_text, "lease ended: execution lease reclaimed") end
                    end)
                end
            end

            test.it("settles an expired supervised execution as retryable after child termination", function()
                local db = assert(sql.get("app:db"))
                local dbtype = tostring(db:type())
                local leased = assert(job_fixture.enqueue_leased(db, dbtype, {
                    job_type = "test.expiry.supervised." .. uuid.v7(), worker_ref = "proc://app:job_sleep_proc",
                    job_identity = {namespace = "expiry", scope = uuid.v7(), key = "child"},
                    payload = {block = true, ready_to = tostring(process.pid()), max_execution_ms = 5000},
                }))
                job = leased
                local run = assert(lifecycle.start_job_run(db, dbtype, job, tostring(process.pid()), 1))
                assert(db:release())
                ready = process.listen("job_worker_ready")
                completion = channel.new(1)
                coroutine.spawn(function()
                    local err, control = worker_child.supervise_job_child(job, run.id)
                    completion:send({err = err, control = control})
                end)
                local selected = channel.select({ready:case_receive(), completion:case_receive(), time.after("15s"):case_receive()})
                completed = selected.channel == completion
                test.eq(selected.channel, ready)
                db = assert(sql.get("app:db"))
                local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
                assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past, job.id}))
                -- Hold notification delivery at the committed fence so recovery
                -- observes the real child alive before the supervisor reaps it.
                local original_notify = proc_supervisor.notify
                local revocation
                proc_supervisor.notify = function(...)
                    revocation = {...}
                    return true, nil
                end
                local progress, err = reclaim.reclaim_expired(db, dbtype, 1)
                proc_supervisor.notify = original_notify
                local held = assert(db:query("SELECT status,lease_token FROM kickside_job WHERE id=$1", {job.id}))
                assert(db:release())
                test.is_nil(err)
                test.eq(held[1].status, "running")
                test.eq(held[1].lease_token, job.lease_token)
                local live, live_err = proc_supervisor.child_alive(job.id, job.lease_token)
                test.is_nil(live_err)
                test.is_true(live)
                assert(original_notify(table.unpack(revocation)))
                selected = channel.select({completion:case_receive(), time.after("15s"):case_receive()})
                completed = selected.channel == completion
                test.eq(selected.channel, completion)
                test.is_nil(err)
                test.is_nil(selected.value.err)
                test.eq(selected.value.control, "revoked")
                local alive, alive_err = proc_supervisor.child_alive(job.id, job.lease_token)
                test.is_nil(alive_err)
                test.is_false(alive)
                db = assert(sql.get("app:db"))
                test.is_nil(worker.settle_child_exit(db, dbtype, job, run, nil, selected.value.control))
                local rows = assert(db:query("SELECT status,lease_token FROM kickside_job WHERE id=$1", {job.id}))
                local runs = assert(db:query("SELECT status,error_text FROM kickside_job_run WHERE id=$1", {run.id}))
                assert(db:release())
                test.eq(rows[1].status, "pending")
                test.is_nil(rows[1].lease_token)
                test.eq(runs[1].status, "lease_lost")
                test.eq(runs[1].error_text, "lease ended: execution lease reclaimed")
                test.eq(progress, 1)
                db = assert(sql.get("app:db"))
                local successors = assert(claim.claim_batch(db, dbtype, 1, nil, nil, nil, {job.job_type}))
                test.eq(#successors, 1)
                test.eq(successors[1].id, job.id)
                test.eq(successors[1].execution_seq, job.execution_seq + 1)
                local duplicates, duplicate_err = claim.claim_batch(db, dbtype, 1, nil, nil, nil, {job.job_type})
                test.is_nil(duplicate_err)
                test.eq(#duplicates, 0)
                assert(db:release())
                test.is_nil(select(2, jobs.cancel(job.id)))
                job = nil
            end)

            test.it("keeps a rechecked fence lease-invalid and preserves lease-loss history after worker completion", function()
                local db = assert(sql.get("app:db"))
                local dbtype = tostring(db:type())
                local leased = assert(job_fixture.enqueue_leased(db, dbtype, {
                    job_type = "test.expiry.completion", worker_ref = "func://app:generic_job_target",
                    job_identity = {namespace = "expiry", scope = uuid.v7(), key = "completion"},
                }))
                job = leased
                local run = assert(lifecycle.start_job_run(db, dbtype, leased, tostring(process.pid()), 1))
                local lease = {token = leased.lease_token, execution_seq = leased.execution_seq}
                assert(db:release())
                test.is_true(assert(jobs.lease_valid(leased.id, lease)))
                db = assert(sql.get("app:db"))
                local child_name = proc_supervisor.child_name(leased.id, leased.lease_token)
                assert(process.registry.register(child_name, nil, process.registry.CONSISTENT))
                expire_without_notification(db, dbtype, leased)
                assert(process.registry.unregister(child_name, process.registry.CONSISTENT))
                assert(db:release())
                local valid, valid_err = jobs.lease_valid(leased.id, lease)
                test.is_nil(valid_err)
                test.is_false(valid)
                db = assert(sql.get("app:db"))
                local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
                assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past, leased.id}))
                test.eq(assert(reclaim.reclaim_terminated(db, dbtype, 1, function() return true, nil end)), 0)
                assert(db:release())
                valid, valid_err = jobs.lease_valid(leased.id, lease)
                test.is_nil(valid_err)
                test.is_false(valid)
                local result, complete_err = jobs.complete(leased.id, lease, {})
                test.is_nil(result)
                test.is_true(job_types.is_lease_lost_error(complete_err))
                db = assert(sql.get("app:db"))
                local _, worker_err = worker.process_job(db, dbtype, tostring(process.pid()), leased, run.id)
                test.is_true(job_types.is_lease_lost_error(worker_err))
                local runs = assert(db:query("SELECT status,error_text FROM kickside_job_run WHERE id=$1", {run.id}))
                test.eq(runs[1].status, "lease_lost")
                test.eq(runs[1].error_text, "lease ended: execution lease reclaimed")
                assert(db:release())
            end)

            test.it("returns typed lease loss when a supervised target completes after expiry fencing", function()
                local db = assert(sql.get("app:db"))
                local dbtype = tostring(db:type())
                local finish = "worker_finish_" .. uuid.v7()
                local leased = assert(job_fixture.enqueue_leased(db, dbtype, {
                    job_type = "test.expiry.race", worker_ref = "proc://app:job_sleep_proc",
                    job_identity = {namespace = "expiry", scope = uuid.v7(), key = "race"},
                    payload = {finish_topic = finish, ready_to = tostring(process.pid()), max_execution_ms = 5000},
                }))
                job = leased
                local run = assert(lifecycle.start_job_run(db, dbtype, leased, tostring(process.pid()), 1))
                ready = process.listen("job_worker_ready")
                local done = channel.new(1)
                completion = done
                coroutine.spawn(function()
                    local control, err = worker.process_job(db, dbtype, tostring(process.pid()), leased, run.id)
                    done:send({control = control, err = err})
                end)
                local selected = channel.select({ready:case_receive(), done:case_receive(), time.after("15s"):case_receive()})
                test.eq(selected.channel, ready)
                local target = selected.value.target_pid
                expire_without_notification(db, dbtype, leased)
                assert(process.send(target, finish, {}))
                selected = channel.select({done:case_receive(), time.after("15s"):case_receive()})
                completed = selected.channel == done
                test.eq(selected.channel, done)
                local runs = assert(db:query("SELECT status,error_text FROM kickside_job_run WHERE id=$1", {run.id}))
                local _, settle_err = reclaim.settle_confirmed(db, dbtype, {
                    id = leased.id, token = leased.lease_token, execution_seq = leased.execution_seq})
                assert(db:release())
                test.is_nil(settle_err)
                test.is_true(job_types.is_lease_lost_error(selected.value.err))
                test.eq(runs[1].status, "lease_lost")
                test.eq(runs[1].error_text, "lease ended: execution lease reclaimed")
            end)

            test.it("retains cancellation intent and its existing timer through an unconfirmed exit and recheck", function()
                local db = assert(job_fixture.private_queue("app:private_queue_termination_recovery_test"))
                local dbtype = tostring(db:type())
                local leased = assert(job_fixture.enqueue_leased(db, dbtype, {
                    job_type = "test.cancel.recovery",
                    job_identity = {namespace = "cancel", scope = uuid.v7(), key = "recheck"},
                }))
                local cancelled, cancel_err = lifecycle_cancel.cancel_job(db, dbtype, {id = leased.id})
                test.is_nil(cancel_err)
                test.is_true(cancelled)
                local renewal_err = lifecycle.heartbeat_job(db, leased, dbtype)
                test.is_true(job_types.is_lease_lost_error(renewal_err))
                test.is_nil(worker_fence.hold_unconfirmed_execution(db, leased))
                local past = dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
                assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past, leased.id}))
                local dispatch_at = lifecycle.now_string(dbtype)
                test.eq(assert(reclaim.reclaim_terminated(db, dbtype, 1, function() return true, nil end)), 0)
                local rows = assert(db:query("SELECT lease_until,heartbeat_at FROM kickside_job WHERE id=$1", {leased.id}))
                test.not_nil(rows[1].lease_until)
                test.is_nil(rows[1].heartbeat_at)
                local deadline, kind, deadline_err = worker_pool.next_deadline(db, dbtype, dispatch_at)
                test.is_nil(deadline_err)
                test.not_nil(deadline)
                test.eq(kind, "lease")
                assert(db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", {past, leased.id}))
                test.eq(assert(reclaim.reclaim_terminated(db, dbtype, 1, function() return false, nil end)), 1)
                rows = assert(db:query("SELECT status FROM kickside_job WHERE id=$1", {leased.id}))
                assert(db:release())
                test.eq(rows[1].status, "cancelled")
            end)

            test.it("retains the cancellation fence until a real blocked worker exits and then settles once", function()
                local db = assert(sql.get("app:db"))
                local dbtype = tostring(db:type())
                local owner = uuid.v7()
                local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = owner }, parked = true,
                    job_identity = { namespace = "live-cancellation", scope = owner, key = "cancel" },
                    job_type = "test.live.cancel", worker_ref = "proc://app:job_sleep_proc",
                    payload = { block = true, ready_to = tostring(process.pid()), max_execution_ms = 5000 },
                })
                test.is_nil(enqueue_err)
                if type(id) ~= "string" then
                    error(errors.new({ kind = errors.INTERNAL, retryable = false, message = "cancellation fixture enqueue returns no job id" }))
                end
                local leased, lease_err = job_fixture.lease_own(db, dbtype, id)
                test.is_nil(lease_err)
                if type(leased) ~= "table" then
                    error(errors.new({ kind = errors.INTERNAL, retryable = false, message = "cancellation fixture lease returns no job" }))
                end
                job = leased
                local run, run_err = lifecycle.start_job_run(db, dbtype, job, tostring(process.pid()), 1)
                test.is_nil(run_err)
                db:release()
                ready = process.listen("job_worker_ready")
                completion = channel.new(1)
                coroutine.spawn(function()
                    local supervise_err, control = worker_child.supervise_job_child(job, run.id)
                    completion:send({ err = supervise_err, control = control })
                end)
                local selected = channel.select({ ready:case_receive(), completion:case_receive(), time.after("15s"):case_receive() })
                completed = selected.channel == completion
                test.eq(selected.channel, ready, "worker exits before it starts")
                test.eq(selected.value.job_id, id)
                local live, live_err = proc_supervisor.child_alive(id, job.lease_token)
                test.is_nil(live_err)
                test.is_true(live)
                local canceled, cancel_err = jobs.cancel(id, job.lease_token)
                test.is_nil(cancel_err)
                test.is_true(canceled.canceled)
                selected = channel.select({ completion:case_receive(), time.after("15s"):case_receive() })
                completed = selected.channel == completion
                test.eq(selected.channel, completion, "revoked worker does not exit")
                test.is_nil(selected.value.err)
                test.eq(selected.value.control, "revoked")
                local ended, end_err = proc_supervisor.child_alive(id, job.lease_token)
                test.is_nil(end_err)
                test.is_false(ended)
                db = assert(sql.get("app:db"))
                local fenced = assert(db:query("SELECT status,last_error FROM kickside_job WHERE id=$1", { id }))
                test.eq(fenced[1].status, "running")
                test.contains(fenced[1].last_error, job.lease_token)
                test.is_nil(worker.settle_child_exit(db, dbtype, job, run, nil, "revoked"))
                local rows = assert(db:query("SELECT status,lease_token,finished_at FROM kickside_job WHERE id=$1", { id }))
                local history = assert(db:query("SELECT status,finished_at FROM kickside_job_run WHERE job_id=$1", { id }))
                db:release()
                test.eq(rows[1].status, "cancelled")
                test.is_nil(rows[1].lease_token)
                test.not_nil(rows[1].finished_at)
                test.eq(#history, 1)
                test.eq(history[1].status, "failed")
                test.not_nil(history[1].finished_at)
                job = nil
                local repeated, repeat_err = jobs.cancel(id)
                test.is_nil(repeat_err)
                test.is_false(repeated.canceled)
            end)
        end)
    end)(options)
end }
