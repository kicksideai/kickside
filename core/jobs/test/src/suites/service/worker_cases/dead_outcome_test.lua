-- A job that ends dead reaches the function its worker declares in meta.job_dead
-- through one outcome job committed with the dead transition.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local time = require("time")
local channel = require("channel")
local process = require("process")
local job_types = require("job_types")
local job_fixture = require("job_fixture")
local worker = require("worker")
local dispatch = require("worker_dispatch")
local worker_child = require("worker_child")
local enqueue = require("lifecycle_enqueue")

local DEAD_PROC = "proc://app:job_dead_proc"
local SLEEP_PROC = "proc://app:job_sleep_proc"
local RECORDER = "app:job_dead_recorder"

local function with_db(fn: (sql.DB, string) -> ())
    local db, err = sql.get("app:db")
    if err or not db then error("jobs test: db connect failed: " .. tostring(err)) end
    local ok, run_err = pcall(fn, db, tostring(db:type()))
    db:release()
    if not ok then error(run_err, 0) end
end

local function make_thread(db: sql.DB): string
    local id = uuid.v7()
    sql.builder.insert("kickside_thread"):set_map({ id = id, thread_class = "test", component_id = id }):run_with(db):exec()
    return id
end

local function leased_proc(db: sql.DB, dbtype: string, worker_ref: string, max_attempts: integer, payload: table): table
    local job, err = job_fixture.enqueue_leased(db, dbtype, {
        thread_id = make_thread(db), job_type = "dead.outcome.test", worker_ref = worker_ref,
        priority = 10000, max_attempts = max_attempts, payload = payload,
    })
    if err or not job then error("job lease failed: " .. tostring(err)) end
    return job
end

local function job_row(db: sql.DB, id: string): table
    local rows = assert(db:query("SELECT status,last_error,owner_kind,owner_id,thread_id FROM kickside_job WHERE id=$1", { id }))
    return rows[1]
end

local function outcomes_for(db: sql.DB, job_id: string): { table }
    local rows = assert(db:query([[SELECT id,status,worker_ref,job_type,owner_kind,owner_id,thread_id,payload,max_attempts
        FROM kickside_job WHERE worker_ref=$1 ORDER BY id]], { RECORDER }))
    local matched: { table } = {}
    for _, row in ipairs(rows) do
        local payload = type(row.payload) == "string" and json.decode(row.payload) or row.payload
        if type(payload) == "table" and payload.job_id == job_id then
            row.payload = payload
            matched[#matched + 1] = row
        end
    end
    return matched
end

-- Run one pending outcome job as a worker would and return its final status.
local function deliver(db: sql.DB, dbtype: string, outcome_id: string): string
    local leased, lease_err = job_fixture.lease_own(db, dbtype, outcome_id)
    if lease_err or not leased then error("outcome lease failed: " .. tostring(lease_err)) end
    worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), leased)
    return tostring(job_row(db, outcome_id).status)
end

local function define_tests()
    test.describe("jobs dead outcomes", function()
        test.it("delivers a final-attempt kill to the declared dead handler once", function()
            local receiver = "app.test.job_dead_receiver"
            local replies = process.listen(receiver)
            assert(process.registry.register(receiver, nil, process.registry.CONSISTENT))
            with_db(function(db: sql.DB, dbtype: string)
                local job = leased_proc(db, dbtype, DEAD_PROC, 1, { block = true, max_execution_ms = 250 })

                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job)

                local dead = job_row(db, job.id)
                test.eq(dead.status, job_types.JOB_STATE.DEAD)
                test.contains(tostring(dead.last_error), dispatch.PROC_TIMEOUT_MARKER)

                local outcomes = outcomes_for(db, job.id)
                test.eq(#outcomes, 1)
                local outcome = outcomes[1]
                test.eq(outcome.status, job_types.JOB_STATE.PENDING)
                test.eq(outcome.job_type, RECORDER)
                test.eq(outcome.owner_kind, dead.owner_kind)
                test.eq(outcome.owner_id, dead.owner_id)
                test.eq(outcome.thread_id, dead.thread_id)
                test.eq(tonumber(outcome.max_attempts), job_types.MAX_ATTEMPTS)

                test.eq(deliver(db, dbtype, outcome.id), job_types.JOB_STATE.DONE)
                test.eq(#outcomes_for(db, job.id), 1)

                local selected = channel.select({ replies:case_receive(), time.after("5s"):case_receive() })
                test.is_true(selected.channel == replies, "the dead handler receives the outcome")
                local received = selected.value
                test.eq(received.job_id, job.id)
                test.eq(received.status, job_types.JOB_STATE.DEAD)
                test.contains(tostring(received.last_error), dispatch.PROC_TIMEOUT_MARKER)
            end)
            process.registry.unregister(receiver, process.registry.CONSISTENT)
            process.unlisten(replies)
        end)

        test.it("delivers a final attempt its job-child supervisor ends at the ceiling", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local job = leased_proc(db, dbtype, DEAD_PROC, 1, { block = true, max_execution_ms = 250 })
            db:release()

            local child_err, control = worker_child.supervise_job_child(job)
            test.contains(tostring(child_err), worker_child.PROC_TIMEOUT_MARKER)

            with_db(function(settle_db: sql.DB, settle_type: string)
                test.is_nil(worker.settle_child_exit(settle_db, settle_type, job, nil, child_err, control))
                test.eq(job_row(settle_db, job.id).status, job_types.JOB_STATE.DEAD)
                local outcomes = outcomes_for(settle_db, job.id)
                test.eq(#outcomes, 1)
                test.eq(deliver(settle_db, settle_type, outcomes[1].id), job_types.JOB_STATE.DONE)
            end)
        end)

        test.it("delivers nothing for a killed attempt that retries", function()
            with_db(function(db: sql.DB, dbtype: string)
                local job = leased_proc(db, dbtype, DEAD_PROC, 3, { block = true, max_execution_ms = 250 })
                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job)
                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.PENDING)
                test.eq(#outcomes_for(db, job.id), 0)
            end)
        end)

        test.it("keeps a dead job silent when its worker declares no dead handler", function()
            with_db(function(db: sql.DB, dbtype: string)
                local job = leased_proc(db, dbtype, SLEEP_PROC, 1, { block = true, max_execution_ms = 250 })
                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job)
                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.DEAD)
                local rows = assert(db:query("SELECT COUNT(*) AS n FROM kickside_job WHERE job_identity LIKE $1 AND id<>$2",
                    { "%" .. job.id .. "%", job.id }))
                test.eq(tonumber(rows[1].n), 0)
            end)
        end)

        test.it("delivers a deterministic failure on an early attempt", function()
            with_db(function(db: sql.DB, dbtype: string)
                local job = leased_proc(db, dbtype, DEAD_PROC, 3,
                    { fail = true, error_kind = "INVALID", error_text = "input refused" })
                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job)
                local dead = job_row(db, job.id)
                test.eq(dead.status, job_types.JOB_STATE.DEAD)
                test.contains(tostring(dead.last_error), "input refused")
                local outcomes = outcomes_for(db, job.id)
                test.eq(#outcomes, 1)
                test.eq(deliver(db, dbtype, outcomes[1].id), job_types.JOB_STATE.DONE)
            end)
        end)

        test.it("ends a failing self-declared outcome without another outcome", function()
            with_db(function(db: sql.DB, dbtype: string)
                local job = leased_proc(db, dbtype, "proc://app:job_dead_self_proc", 1,
                    {fail = true, error_kind = "INVALID"})
                worker.process_job(db, dbtype, "test-pid-" .. uuid.v7(), job)
                local rows = assert(db:query("SELECT id FROM kickside_job WHERE worker_ref=$1 AND CAST(payload AS TEXT) LIKE $2",
                    {"app:job_dead_self_handler", "%" .. job.id .. "%"}))
                test.eq(#rows, 1)
                local outcome_id = rows[1].id
                test.eq(deliver(db, dbtype, outcome_id), job_types.JOB_STATE.DEAD, tostring(job_row(db, outcome_id).last_error))
                local children = assert(db:query("SELECT id FROM kickside_job WHERE CAST(payload AS TEXT) LIKE $1", {"%" .. outcome_id .. "%"}))
                test.eq(#children, 0, "an outcome never generates another outcome")
                test.contains(tostring(job_row(db, outcome_id).last_error), "outcome rejected")
            end)
        end)

        test.it("commits death when outcome admission is refused after worker admission", function()
            with_db(function(db: sql.DB, dbtype: string)
                local job = leased_proc(db, dbtype, DEAD_PROC, 1, {fail = true, error_kind = "INVALID"})
                local original = enqueue.enqueue_job
                enqueue.enqueue_job = function()
                    return nil, errors.new({kind = errors.INVALID, retryable = false, message = "target declaration changes"})
                end
                local ok, run_err = pcall(worker.process_job, db, dbtype, "test-pid-" .. uuid.v7(), job)
                enqueue.enqueue_job = original
                test.is_true(ok, tostring(run_err))
                test.eq(job_row(db, job.id).status, job_types.JOB_STATE.DEAD)
                test.eq(#outcomes_for(db, job.id), 0)
            end)
        end)

        for _, target in ipairs({"missing", "nonfunction", "capacity"}) do
            test.it("refuses an undeliverable dead handler: " .. target, function()
                with_db(function(db: sql.DB, dbtype: string)
                    local _, err = job_fixture.enqueue_leased(db, dbtype, {
                        thread_id = make_thread(db), job_type = "dead.outcome.test",
                        worker_ref = "proc://app:job_dead_" .. target .. "_proc", payload = {},
                    })
                    test.not_nil(err)
                    test.is_true(errors.is(err, errors.INVALID), tostring(err))
                    test.contains(tostring(err), "meta.job_dead")
                end)
            end)
        end

        test.it("refuses to enqueue a job whose worker declares an invalid dead handler", function()
            with_db(function(db: sql.DB, dbtype: string)
                local _, err = job_fixture.enqueue_leased(db, dbtype, {
                    thread_id = make_thread(db), job_type = "dead.outcome.test",
                    worker_ref = "proc://app:job_dead_invalid_proc", payload = {},
                })
                test.not_nil(err)
                test.is_true(errors.is(err, errors.INVALID))
                test.contains(tostring(err), "meta.job_dead")
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

-- This process supervises job children directly, standing in for the loop.
local function run(options)
    local trap_err = job_fixture.supervise_as_loop()
    if trap_err then error(trap_err) end
    return run_cases(options)
end

return { run = run }
