local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local job_types = require("job_types")
local claim = require("claim")
local reclaim = require("reclaim")
local claim_execution = require("claim_execution")
local lifecycle = require("lifecycle")
local proc_supervisor = require("proc_supervisor")
local job_fixture = require("job_fixture")

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

return { run = run }
