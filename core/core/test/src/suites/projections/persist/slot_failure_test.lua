local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local writer = require("writer")
local invoke = require("invoke")
local claim = require("claim")
local job_lifecycle = require("job_lifecycle")
local jobs = require("jobs")

-- A thread with `events` stored events and no projection.
local function thread_with_events(db: sql.DB, events: integer, body: string?): string
    local id = uuid.v7()
    local _, thread_err = db:execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,$3)",
        { id, id, events })
    if thread_err then error("thread insert failed: " .. tostring(thread_err)) end
    for seq = 1, events do
        local _, event_err = db:execute("INSERT INTO kickside_event (id,thread_id,type,role,body,seq) VALUES ($1,$2,'test:event','user',$3,$4)",
            { uuid.v7(), id, body or "{}", seq })
        if event_err then error("event insert failed: " .. tostring(event_err)) end
    end
    return id
end

local function append_event(db: sql.DB, thread_id: string, seq: integer)
    local tx = assert(db:begin())
    local _, event_err = tx:execute("INSERT INTO kickside_event (id,thread_id,type,role,body,seq) VALUES ($1,$2,'test:event','user','{}',$3)",
        { uuid.v7(), thread_id, seq })
    if event_err then error("event insert failed: " .. tostring(event_err)) end
    local _, head_err = tx:execute("UPDATE kickside_thread SET event_count=$1 WHERE id=$2", { seq, thread_id })
    if head_err then error("thread head update failed: " .. tostring(head_err)) end
    assert(jobs.wake_tx(tx, "thread:" .. thread_id))
    assert(tx:commit())
end

-- Make this slot due and claim it the way slot_test does.
local function claim_slot(job_id: string): table
    local db = assert(sql.get("app:db"))
    local dbtype = tostring(db:type())
    local _, due_err = db:execute("UPDATE kickside_job SET scheduled_at=created_at WHERE id=$1 AND status='pending'", { job_id })
    if due_err then error("slot due update failed: " .. tostring(due_err)) end
    local batch, claim_err = claim.claim_batch(db, dbtype, 16, nil, nil)
    db:release()
    if claim_err then error("claim failed: " .. tostring(claim_err)) end
    for _, row in ipairs(batch or {}) do
        if row.id == job_id then return row end
    end
    error("projection slot is not claimed")
end

local function input_for(job: table, cursor_id: string): table
    return { job = { id = job.id, lease_token = job.lease_token, execution_seq = tonumber(job.execution_seq),
        attempts = tonumber(job.attempts) }, payload = { cursor_id = cursor_id } }
end

local function read(db: sql.DB, statement: string, args: { any }): table
    local rows, err = db:query(statement, args)
    if err or not rows or not rows[1] then error("read failed: " .. tostring(err)) end
    return rows[1] :: table
end

local function define_tests()
    test.describe("projection slot failures", function()
        test.it("refuses a corrupt stored projection body with native metadata and preserves its durable state", function()
            for _, raw in ipairs({"false", "7", '"text"', "null"}) do
                local db = assert(sql.get("app:db"))
                local thread_id = thread_with_events(db, 1)
                local options = {kind = "stored-body-integrity", worker_ref = "func://app:test_count_worker",
                    worker_input_mode = "prefetch_events", system_identity = true}
                local registered, register_err = writer.register_projection(db, thread_id, options)
                test.is_nil(register_err)
                test.not_nil(registered)
                local _, seed_err = db:execute("UPDATE kickside_projection SET body=$1 WHERE id=$2",
                    {raw, registered.projection_id})
                test.is_nil(seed_err)
                local before = read(db, "SELECT generation,last_seq,job_id,status FROM kickside_projection_cursor WHERE id=$1",
                    {registered.cursor_id})
                local result, err = writer.register_projection(db, thread_id, options)
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:retryable(), false)
                test.eq(err:details().code, "persisted_data")
                test.eq(err:details().error_kind, "persisted_data")
                test.eq(err:details().field, "kickside_projection.body")
                local projection = read(db, "SELECT body FROM kickside_projection WHERE id=$1", {registered.projection_id})
                local after = read(db, "SELECT generation,last_seq,job_id,status FROM kickside_projection_cursor WHERE id=$1",
                    {registered.cursor_id})
                local _, release_err = db:release()
                test.is_nil(release_err)
                test.eq(projection.body, raw)
                for _, key in ipairs({"generation", "last_seq", "job_id", "status"}) do test.eq(after[key], before[key]) end
            end
        end)

        test.it("refuses a corrupt source body without committing a fold or advancing the cursor", function()
            for _, raw in ipairs({ "false", "7", '"text"', "null" }) do
                local db = assert(sql.get("app:db"))
                local thread_id = thread_with_events(db, 1, raw)
                local registered, register_err = writer.register_projection(db, thread_id, {
                    kind = "source-body-integrity", worker_ref = "func://app:test_count_worker",
                    worker_input_mode = "prefetch_events", system_identity = true,
                })
                test.is_nil(register_err)
                db:release()
                if type(registered.job_id) ~= "string" then error("registered projection has no job id") end
                local job = claim_slot(registered.job_id)
                local result, run_err = invoke.run(input_for(job, registered.cursor_id))
                test.is_nil(result)
                test.is_true(errors.is(run_err, errors.INTERNAL))
                test.eq(run_err:details().error_kind, "persisted_data")
                db = assert(sql.get("app:db"))
                local cursor = read(db, "SELECT last_seq,status FROM kickside_projection_cursor WHERE id=$1", { registered.cursor_id })
                local projection = read(db, "SELECT last_event_seq,body FROM kickside_projection WHERE id=$1", { registered.projection_id })
                local event = read(db, "SELECT body FROM kickside_event WHERE thread_id=$1", { thread_id })
                db:release()
                test.eq(tonumber(cursor.last_seq), 0)
                test.eq(cursor.status, "active")
                test.eq(tonumber(projection.last_event_seq), 0)
                test.eq(event.body, raw)
                local cancelled, cancel_err = jobs.cancel(registered.job_id)
                test.is_nil(cancel_err)
                test.is_true(cancelled.canceled)
            end
        end)

        test.it("records a deterministic worker failure on its projection and stops re-running it", function()
            local db = assert(sql.get("app:db"))
            local thread_id = thread_with_events(db, 1)
            local registered, register_err = writer.register_projection(db, thread_id, {
                kind = "failing-deterministic", worker_ref = "func://app:test_failing_worker",
                system_identity = true, worker_config = { kind = errors.INVALID, message = "bad declaration" },
            })
            test.is_nil(register_err)
            if not registered then error("projection is not registered") end
            db:release()
            local cursor_id = tostring(registered.cursor_id)
            db = assert(sql.get("app:db"))
            test.eq(read(db, "SELECT state FROM kickside_projection WHERE id=$1", { registered.projection_id }).state, "pending")
            db:release()
            local job = claim_slot(registered.job_id)

            local result, run_err = invoke.run(input_for(job, cursor_id))
            test.is_nil(run_err)
            test.is_true(result.self_completed)
            test.is_true(result.invalid)

            db = assert(sql.get("app:db"))
            local cursor = read(db, "SELECT status,last_error,last_seq FROM kickside_projection_cursor WHERE id=$1", { cursor_id })
            test.eq(cursor.status, "invalid")
            test.contains(tostring(cursor.last_error), "bad declaration")
            test.eq(tonumber(cursor.last_seq), 0)
            test.eq(read(db, "SELECT state FROM kickside_projection WHERE id=$1", { registered.projection_id }).state, "invalid")
            local slot = read(db, "SELECT status,scheduled_at,wake_enabled FROM kickside_job WHERE id=$1", { registered.job_id })
            test.eq(slot.status, "pending")
            test.is_nil(slot.scheduled_at)
            test.is_false(slot.wake_enabled == true or tonumber(slot.wake_enabled) == 1)
            test.eq(tonumber(read(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE job_id=$1 AND status='failed'",
                { registered.job_id }).n), 1)
            db:release()
            local health, health_err = jobs.health()
            test.is_nil(health_err)
            test.is_false(health.healthy)
            test.is_true(health.failed_slots >= 1)
            local reported = false
            for _, issue in ipairs(health.issues) do if issue.code == "slots_failed" then reported = true end end
            test.is_true(reported)
            db = assert(sql.get("app:db"))

            append_event(db, thread_id, 2)
            test.is_nil(read(db, "SELECT scheduled_at FROM kickside_job WHERE id=$1", { registered.job_id }).scheduled_at)
            test.eq(read(db, "SELECT status FROM kickside_projection_cursor WHERE id=$1", { cursor_id }).status, "invalid")
            test.eq(tonumber(read(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE job_id=$1 AND status='failed'",
                { registered.job_id }).n), 1)
            test.is_nil(read(db, "SELECT scheduled_at FROM kickside_job WHERE id=$1", { registered.job_id }).scheduled_at)

            -- A corrected declaration re-registers the cursor active and wakes it.
            local _, fix_err = writer.register_projection(db, thread_id, {
                kind = "failing-deterministic", worker_ref = "func://app:test_count_worker",
                worker_input_mode = "prefetch_events", system_identity = true,
            })
            test.is_nil(fix_err)
            local healed = read(db, "SELECT status,last_error FROM kickside_projection_cursor WHERE id=$1", { cursor_id })
            test.eq(healed.status, "active")
            test.is_nil(healed.last_error)
            test.eq(read(db, "SELECT state FROM kickside_projection WHERE id=$1", { registered.projection_id }).state, "pending")
            test.not_nil(read(db, "SELECT scheduled_at FROM kickside_job WHERE id=$1", { registered.job_id }).scheduled_at)
            db:release()
            local repaired_job = claim_slot(registered.job_id)
            local repaired, repaired_err = invoke.run(input_for(repaired_job, cursor_id))
            test.is_nil(repaired_err)
            test.is_true(repaired.self_completed)
            db = assert(sql.get("app:db"))
            local model = read(db, "SELECT state,last_event_seq,body FROM kickside_projection WHERE id=$1", { registered.projection_id })
            test.eq(model.state, "valid")
            test.eq(tonumber(model.last_event_seq), 2)
            test.eq(json.decode(model.body).stats.count, 2)
            local removed, remove_err = writer.remove_projection(db, thread_id, { projection_id = registered.projection_id })
            test.is_nil(remove_err)
            test.eq(removed.removed_cursors, 1)
            local rows, query_err = db:query("SELECT id FROM kickside_projection WHERE id=$1", { registered.projection_id })
            test.is_nil(query_err)
            test.eq(#rows, 0)
            db:release()
        end)

        test.it("keeps an infrastructure failure active, visible and retried", function()
            local db = assert(sql.get("app:db"))
            local thread_id = thread_with_events(db, 1)
            local registered, register_err = writer.register_projection(db, thread_id, {
                kind = "failing-infrastructure", worker_ref = "func://app:test_failing_worker",
                system_identity = true, worker_config = { kind = errors.UNAVAILABLE, message = "provider down", retryable = true,
                    details = {code = "projection_provider_unavailable", reason = "provider_busy", provider = {retry_after = 7}} },
            })
            test.is_nil(register_err)
            if not registered then error("projection is not registered") end
            local _, bound_err = db:execute("UPDATE kickside_job SET max_attempts=1 WHERE id=$1", { registered.job_id })
            test.is_nil(bound_err)
            db:release()
            local cursor_id = tostring(registered.cursor_id)
            local job = claim_slot(registered.job_id)

            local result, run_err = invoke.run(input_for(job, cursor_id))
            test.is_nil(result)
            test.not_nil(run_err)
            test.eq(run_err:kind(), errors.UNAVAILABLE)
            test.is_true(run_err:retryable())
            test.eq(run_err:details().code, "projection_provider_unavailable")
            test.eq(run_err:details().provider.retry_after, 7)
            test.eq(run_err:details().reason, "worker_failed")
            test.eq(run_err:details().cause.details.reason, "provider_busy")

            db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local cursor = read(db, "SELECT status,last_error FROM kickside_projection_cursor WHERE id=$1", { cursor_id })
            test.eq(cursor.status, "active")
            test.contains(tostring(cursor.last_error), "provider down")
            -- The slot retries past max_attempts: a slot is not bounded by it.
            test.is_nil(job_lifecycle.fail_job(db, job, dbtype, tostring(run_err), "infrastructure"))
            local slot = read(db, "SELECT status,scheduled_at,last_error FROM kickside_job WHERE id=$1", { registered.job_id })
            test.eq(slot.status, "pending")
            test.not_nil(slot.scheduled_at)
            test.contains(tostring(slot.last_error), "provider down")
            db:release()
        end)
    end)
end

return { run = test.run_cases(define_tests) }
