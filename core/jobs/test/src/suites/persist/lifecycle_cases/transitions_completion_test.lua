local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local time = require("time")
local job_types = require("job_types")
local config = require("config")
local lifecycle = require("lifecycle")
local lifecycle_cancel = require("lifecycle_cancel")
local lease_status = require("lease_status")
local claim = require("claim")
local jobs = require("jobs")
local wake = require("wake")
local process = require("process")
local channel = require("channel")
local proc_supervisor = require("proc_supervisor")
local job_fixture = require("job_fixture")

local function with_db(fn)
    local db, err = sql.get("app:db")
    if not db then error("test database unavailable: " .. tostring(err)) end
    if err or not db then
        error("jobs test: db connect failed: " .. tostring(err))
    end
    local ok, run_err = pcall(fn, db)
    db:release()
    if not ok then
        error(run_err)
    end
end

-- Insert a thread row so kickside_job FK is satisfied on both dialects.
local function make_thread(db): string
    local id = uuid.v7()
    local _, err = sql.builder.insert("kickside_thread")
        :set_map({ id = id, thread_class = "test", component_id = id })
        :run_with(db)
        :exec()
    if err then
        error("make_thread failed: " .. tostring(err))
    end
    return id
end

-- Create a fenced execution with the shared claim-snapshot fixture.
local function make_running_job(db, dbtype, thread_id, attempts, max_attempts): table
    return assert(job_fixture.running_job(db, dbtype, thread_id, attempts, max_attempts))
end

local function job_status(db, id): string?
    local rows = sql.builder.select("status"):from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    if rows and rows[1] then
        return tostring(rows[1].status)
    end
    return nil
end

local function job_row(db, id): table?
    local rows = sql.builder.select("status", "lease_token", "last_error")
        :from("kickside_job")
        :where(sql.builder.eq({ id = id }))
        :limit(1)
        :run_with(db)
        :query()
    return rows and rows[1] or nil
end

local function define_tests()
    test.describe("independent completion parking", function()
        test.it("disables wake while retaining failed history", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local job = assert(job_fixture.enqueue_leased(db, dbtype, {job_type = "test.park", slot = true,
                job_identity = {namespace = "test", scope = uuid.v7(), key = "park"}}))
            local done, err = jobs.complete(job.id, {token = job.lease_token, execution_seq = tonumber(job.execution_seq)},
                {park = true, record = {status = "failed", error = "declaration refused"}})
            local rows = assert(db:query("SELECT wake_enabled,scheduled_at FROM kickside_job WHERE id=$1", {job.id}))
            local history = assert(db:query("SELECT status,error_text FROM kickside_job_run WHERE job_id=$1", {job.id}))
            db:release()
            test.is_nil(err)
            test.not_nil(done)
            test.is_nil(rows[1].scheduled_at)
            test.is_false(rows[1].wake_enabled == true or tonumber(rows[1].wake_enabled) == 1)
            test.eq(history[1].status, "failed")
            test.eq(history[1].error_text, "declaration refused")
        end)
    end)

    test.describe("jobs.lifecycle transitions", function()
        test.it("accepts satisfied demand while preserving independent control wakes", function()
            with_db(function(db)
                local dbtype = tostring(db:type())
                for _, control in ipairs({ false, true }) do
                    local job = make_running_job(db, dbtype, make_thread(db), 1, 3)
                    local _, update_err = db:execute([[UPDATE kickside_job SET slot=$1,wake_enabled=$1,
                        wake_demand_at=created_at,wake_control_pending=$2 WHERE id=$3]],
                        { dbtype == sql.type.SQLITE and 1 or true, dbtype == sql.type.SQLITE and (control and 1 or 0) or control, job.id })
                    test.is_nil(update_err)
                    local tx = assert(db:begin())
                    local completed, complete_err = jobs.complete_tx(tx, job.id,
                        { token = job.lease_token, execution_seq = 1 }, { demand_satisfied = true })
                    if complete_err then tx:rollback() else tx:commit() end
                    test.is_nil(complete_err)
                    test.eq(completed.status, control and "rearmed" or "parked")
                end
            end)
        end)

        test.it("reads the fenced job and lifetime history together before completing", function()
            with_db(function(db)
                local dbtype = tostring(db:type())
                local job = make_running_job(db, dbtype, make_thread(db), 1, 3)
                local run, start_err = lifecycle.start_job_run(db, dbtype, job, "completion-probe", 1)
                test.is_nil(start_err)
                test.not_nil(run)
                local tx = assert(db:begin())
                local reads, writes = 0, 0
                local probe = job_fixture.observe_tx(tx, function() reads = reads + 1 end,
                    function() writes = writes + 1 end)
                local completed, complete_err = jobs.complete_tx(probe, job.id,
                    { token = job.lease_token, execution_seq = 1 }, {})
                tx:rollback()
                test.is_nil(complete_err)
                test.not_nil(completed)
                test.eq(reads, 1)
                test.eq(writes, dbtype == sql.type.POSTGRES and 1 or 3)
            end)
        end)

        test.it("public completion fences the lifetime sequence and records rearm", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local job = make_running_job(db, dbtype, make_thread(db), 1, 3)
            db:release()
            local completed, complete_err = jobs.complete(job.id,
                { token = job.lease_token, execution_seq = 1 },
                { rearm = lifecycle.future_string(dbtype, 60), tier = "maintenance",
                    record = { status = "completed" } })
            if complete_err then error(tostring(complete_err)) end
            test.is_nil(complete_err)
            test.eq(completed.status, "rearmed")
            test.eq(completed.job_id, job.id)
            test.eq(completed.execution_seq, 1)
            local stale, stale_err = jobs.complete(job.id,
                { token = job.lease_token, execution_seq = 1 }, {})
            test.is_nil(stale)
            test.not_nil(stale_err)
            local verify, verify_err = sql.get("app:db")
            if not verify then error("test database unavailable: " .. tostring(verify_err)) end
            test.is_nil(verify_err)
            local rows = sql.builder.select("status", "queue_tier", "scheduled_at")
                :from("kickside_job"):where(sql.builder.eq({ id = job.id }))
                :run_with(verify):query()
            local history = sql.builder.select("execution_seq", "status")
                :from("kickside_job_run"):where(sql.builder.eq({ job_id = job.id }))
                :run_with(verify):query()
            verify:release()
            test.eq(rows[1].status, "pending")
            test.eq(rows[1].queue_tier, "maintenance")
            test.not_nil(rows[1].scheduled_at)
            test.eq(#history, 1)
            test.eq(tonumber(history[1].execution_seq), 1)
            test.eq(history[1].status, "completed")
        end)

        test.it("stores RFC3339 worker rearm in the database clock format", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local job = make_running_job(db, dbtype, make_thread(db), 1, 3)
            db:release()
            local _, complete_err = jobs.complete(job.id,
                { token = job.lease_token, execution_seq = 1 },
                { rearm = "2030-01-01T00:00:00Z" })
            test.is_nil(complete_err)
            if dbtype == sql.type.SQLITE then
                with_db(function(verify)
                    local rows, read_err = verify:query("SELECT scheduled_at FROM kickside_job WHERE id = $1", { job.id })
                    test.is_nil(read_err)
                    test.eq(rows[1].scheduled_at, "2030-01-01 00:00:00.000000")
                end)
            end
        end)

        test.it("complete_tx leaves commit ownership with its caller", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local job = make_running_job(db, dbtype, make_thread(db), 1, 3)
                local _, slot_err = sql.builder.update("kickside_job")
                    :set("slot", true):where(sql.builder.eq({ id = job.id }))
                    :run_with(db):exec()
                test.is_nil(slot_err)
                local owner_id = "completion-owner-" .. uuid.v7()
                local newer_id = "completion-newer-" .. uuid.v7()
                local _, worker_err = db:execute("INSERT INTO kickside_job_worker"
                    .. " (id,registry_version,last_seen_at,current_job_id)"
                    .. " VALUES ($1,'test',$2,$3)",
                    { owner_id, lifecycle.now_string(dbtype), job.id })
                test.is_nil(worker_err)
                local _, newer_err = db:execute("INSERT INTO kickside_job_worker"
                    .. " (id,registry_version,last_seen_at,current_job_id)"
                    .. " VALUES ($1,'test',$2,$3)",
                    { newer_id, lifecycle.now_string(dbtype), uuid.v7() })
                test.is_nil(newer_err)
                local tx, begin_err = db:begin()
                test.is_nil(begin_err)
                local completed, complete_err = jobs.complete_tx(tx, job.id,
                    { token = job.lease_token, execution_seq = 1 },
                    { record = { status = "parked", error = "declaration invalid" } })
                if complete_err then tx:rollback(); error(tostring(complete_err)) end
                local _, commit_err = tx:commit()
                test.is_nil(commit_err)
                test.eq(completed.status, "parked")
                local marker_rows, marker_err = db:query("SELECT id,current_job_id FROM kickside_job_worker"
                    .. " WHERE id IN ($1,$2) ORDER BY id", { owner_id, newer_id })
                test.is_nil(marker_err)
                for _, marker in ipairs(marker_rows) do
                    if marker.id == owner_id then test.is_nil(marker.current_job_id)
                    else test.not_nil(marker.current_job_id) end
                end
                local rows = sql.builder.select("status", "wake_enabled", "scheduled_at")
                    :from("kickside_job"):where(sql.builder.eq({ id = job.id }))
                    :run_with(db):query()
                test.eq(rows[1].status, "pending")
                test.is_nil(rows[1].scheduled_at)
                test.is_false(rows[1].wake_enabled == true or tonumber(rows[1].wake_enabled) == 1)
            end)
        end)

        test.it("enqueues the frozen public request and returns its canonical identity", function()
            local key = uuid.v7()
            local request = {
                owner_locator = { kind = "test", id = "lifecycle_test" },
                namespace = "drive", scope = "automation", key = key,
                job_type = "app:generic_job_target",
                immutable_payload = { drive_key = key }, slot = true,
                scheduled_at = nil,
            }
            local first, first_err = jobs.enqueue(request)
            test.is_nil(first_err)
            test.not_nil(first)
            test.not_nil(first.id)
            test.eq(first.existing, false)
            local identity, identity_err = lifecycle.identity_parts({
                job_identity = { namespace = request.namespace, scope = request.scope, key = request.key },
            }, first.id)
            test.is_nil(identity_err, tostring(identity_err))
            test.eq(first.job_identity, identity)
            local second, second_err = jobs.enqueue(request)
            test.is_nil(second_err)
            test.eq(second.id, first.id)
            test.eq(second.existing, true)
            with_db(function(db: sql.DB)
                local rows = sql.builder.select("worker_ref", "payload")
                    :from("kickside_job"):where(sql.builder.eq({ id = first.id }))
                    :run_with(db):query()
                test.eq(rows[1].worker_ref, request.job_type)
                test.eq(lifecycle.decode_payload(rows[1].payload).drive_key, key)
            end)
        end)

        test.it("moves the wake key of an active slot identity in place", function()
            local key = uuid.v7()
            local request = {
                owner_locator = { kind = "test", id = "lifecycle_test" },
                namespace = "drive", scope = "automation", key = key,
                job_type = "app:generic_job_target",
                immutable_payload = { drive_key = key }, slot = true, wake_key = "thread:" .. key .. ":a",
            }
            local first, first_err = jobs.enqueue(request)
            test.is_nil(first_err)
            request.wake_key = "thread:" .. key .. ":b"
            local second, second_err = jobs.enqueue(request)
            test.is_nil(second_err)
            test.eq(second.id, first.id)
            test.eq(second.existing, true)
            with_db(function(db: sql.DB)
                local rows = sql.builder.select("wake_key", "status")
                    :from("kickside_job"):where(sql.builder.eq({ id = first.id }))
                    :run_with(db):query()
                test.eq(rows[1].wake_key, request.wake_key)
                test.eq(rows[1].status, "pending")
            end)
        end)

        test.it("returns one active threadless slot id on repeated enqueue", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local params = {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    job_type = "test.slot",
                    slot = true,
                    job_identity = { namespace = "drive", scope = "demo", key = "main" },
                    payload = { drive_key = "main" },
                }
                local first, first_err = lifecycle.enqueue_job(db, dbtype, params)
                test.is_nil(first_err)
                test.not_nil(first)
                if not first then error("slot job is absent") end
                local second, second_err = lifecycle.enqueue_job(db, dbtype, params)
                test.is_nil(second_err)
                test.eq(second, first)
                local canonical = lifecycle.identity_parts(params, first)
                local rows = sql.builder.select("id", "thread_id", "job_identity")
                    :from("kickside_job")
                    :where(sql.builder.eq({ job_identity = canonical }))
                    :run_with(db):query()
                test.eq(#rows, 1)
                test.is_nil(rows[1].thread_id)
            end)
        end)

        test.it("rejects an immutable payload mismatch for an active identity", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local identity = { namespace = "drive", scope = "demo", key = "other" }
                local first, first_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    job_type = "test.slot", slot = true, job_identity = identity,
                    payload = { drive_key = "main" },
                })
                test.is_nil(first_err)
                test.not_nil(first)
                local second, second_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    job_type = "test.slot", slot = true, job_identity = identity,
                    payload = { drive_key = "other" },
                })
                test.is_nil(second)
                test.not_nil(second_err)
            end)
        end)

        test.it("retries a slot's infrastructure failure beyond max attempts", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 3, 3)
                local _, slot_err = sql.builder.update("kickside_job")
                    :set("slot", true)
                    :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
                test.is_nil(slot_err)
                local err = lifecycle.fail_job(db, job, dbtype, "database unavailable", "infrastructure")
                test.is_nil(err)
                test.eq(job_status(db, job.id), job_types.JOB_STATE.PENDING)
            end)
        end)

        test.it("completes a running job and clears its lease", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)
                local err = lifecycle.complete_job(db, job, dbtype)
                test.is_nil(err)
                test.eq(job_status(db, job.id), job_types.JOB_STATE.DONE)
            end)
        end)

        test.it("parks a quietly completed slot instead of stranding it done", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 2, 3)
                local _, slot_err = sql.builder.update("kickside_job")
                    :set("slot", true)
                    :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
                test.is_nil(slot_err)
                local err = lifecycle.complete_job(db, job, dbtype)
                test.is_nil(err)
                local rows = sql.builder.select("status", "scheduled_at", "finished_at", "attempts", "wake_demand_at")
                    :from("kickside_job"):where(sql.builder.eq({ id = job.id }))
                    :run_with(db):query()
                test.eq(rows[1].status, job_types.JOB_STATE.PENDING)
                test.is_nil(rows[1].scheduled_at)
                test.is_nil(rows[1].finished_at)
                test.eq(tonumber(rows[1].attempts), 0)
                test.is_nil(rows[1].wake_demand_at)
            end)
        end)

        test.it("completes a slot terminally only on explicit request", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 2, 3)
                local _, slot_err = sql.builder.update("kickside_job")
                    :set("slot", true)
                    :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
                test.is_nil(slot_err)
                local err = lifecycle.complete_job(db, job, dbtype, { terminal = true })
                test.is_nil(err)
                test.eq(job_status(db, job.id), job_types.JOB_STATE.DONE)
            end)
        end)

        test.it("rearms a slot immediately when wake demand arrives during its run", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 2, 3)
                local future = lifecycle.future_string(dbtype, 3600)
                local _, demand_err = sql.builder.update("kickside_job")
                    :set("slot", true)
                    :set("wake_demand_at", lifecycle.now_string(dbtype))
                    :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
                test.is_nil(demand_err)
                local complete_err = lifecycle.complete_job(db, job, dbtype, { next_run_at = future })
                test.is_nil(complete_err)
                local rows = sql.builder.select("status", "scheduled_at", "attempts", "wake_demand_at")
                    :from("kickside_job"):where(sql.builder.eq({ id = job.id }))
                    :run_with(db):query()
                test.eq(rows[1].status, job_types.JOB_STATE.PENDING)
                test.is_true(tostring(rows[1].scheduled_at) < future)
                test.eq(tonumber(rows[1].attempts), 0)
                test.is_nil(rows[1].wake_demand_at)
            end)
        end)

        test.it("lets a control wake outrank infrastructure retry backoff", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 3, 3)
                local _, control_err = sql.builder.update("kickside_job")
                    :set("slot", true):set("wake_control_pending", true)
                    :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
                test.is_nil(control_err)
                local fail_err = lifecycle.fail_job(db, job, dbtype, "database unavailable", "infrastructure")
                test.is_nil(fail_err)
                local rows = sql.builder.select("status", "scheduled_at", "attempts", "wake_control_pending")
                    :from("kickside_job"):where(sql.builder.eq({ id = job.id }))
                    :run_with(db):query()
                test.eq(rows[1].status, job_types.JOB_STATE.PENDING)
                test.is_true(tostring(rows[1].scheduled_at) <= lifecycle.future_string(dbtype, 1))
                test.eq(tonumber(rows[1].attempts), 0)
                test.is_false(rows[1].wake_control_pending == true or tonumber(rows[1].wake_control_pending) == 1)
            end)
        end)

        test.it("retries a failed job below its attempt ceiling", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)
                local err = lifecycle.fail_job(db, job, dbtype, "boom")
                test.is_nil(err)
                test.eq(job_status(db, job.id), job_types.JOB_STATE.PENDING)
            end)
        end)

        test.it("retries a slot's infrastructure failure beyond max_attempts", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 3, 3)
                local _, slot_err = sql.builder.update("kickside_job")
                    :set("slot", true)
                    :where(sql.builder.eq({ id = job.id })):run_with(db):exec()
                test.is_nil(slot_err)
                local err = lifecycle.fail_job(db, job, dbtype, "boom")
                test.is_nil(err)
                test.eq(job_status(db, job.id), job_types.JOB_STATE.PENDING)
            end)
        end)

        test.it("refuses a transition when the lease token does not match", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)
                job.lease_token = uuid.v7()
                local err = lifecycle.complete_job(db, job, dbtype)
                test.not_nil(err)
                test.eq(err:kind(), errors.CONFLICT)
                test.eq(job_status(db, job.id), job_types.JOB_STATE.RUNNING)
            end)
        end)

        test.it("cancels one job by exact id and is idempotent", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    thread_id = thread_id,
                    job_type = "test.cancel",
                    idempotency_key = "resource:1",
                })
                test.is_nil(enqueue_err)
                local canceled, cancel_err = lifecycle_cancel.cancel_job(db, dbtype, { id = id :: string })
                test.is_nil(cancel_err)
                test.is_true(canceled)
                local repeated, repeat_err = lifecycle_cancel.cancel_job(db, dbtype, { id = id :: string })
                test.is_nil(repeat_err)
                test.is_false(repeated)
                local row = job_row(db, id)
                test.eq(row.status, job_types.JOB_STATE.CANCELLED)
            end)
        end)

        test.it("keeps a running cancellation fenced until its supervisor confirms exit", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job = make_running_job(db, dbtype, thread_id, 1, 3)

                local active, active_err = lease_status.job_still_running(db, job, dbtype)
                test.is_nil(active_err)
                test.is_true(active)

                local cancelled, cancel_err, executions = lifecycle_cancel.cancel_job(db, dbtype,
                    { id = (job.id :: string) })
                test.is_nil(cancel_err)
                test.is_true(cancelled)
                test.eq(#executions, 1)
                test.eq(executions[1].token, job.lease_token)

                local after, after_err = lease_status.job_still_running(db, job, dbtype)
                test.is_nil(after_err)
                test.is_false(after)
                test.eq(job_status(db, job.id), job_types.JOB_STATE.RUNNING)
                local pending_row = sql.builder.select("lease_token", "lease_until", "last_error")
                    :from("kickside_job")
                    :where(sql.builder.eq({ id = job.id }))
                    :run_with(db):query()
                test.eq(pending_row[1].lease_token, job.lease_token)
                test.is_nil(pending_row[1].lease_until)
                test.eq(pending_row[1].last_error, job_types.TERMINATION_PENDING_PREFIX .. job.lease_token)

                local complete_err = lifecycle.complete_job(db, job, dbtype)
                test.not_nil(complete_err)
                test.eq(complete_err:kind(), errors.CONFLICT)
                local settled, settle_err = lifecycle_cancel.finish_cancellation(db, dbtype, executions[1])
                test.is_nil(settle_err)
                test.is_true(settled)
                test.eq(job_status(db, job.id), job_types.JOB_STATE.CANCELLED)
            end)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
