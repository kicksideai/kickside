-- Jobs and run history are bounded by age expiry alone: an owner keeps
-- enqueuing, running and completing past any former per-owner count, the
-- retention sweep deletes only settled rows past their window, and a single
-- row above the row byte limit is refused without being stored.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local channel = require("channel")
local slot_purge = require("slot_purge")
local lifecycle = require("lifecycle")
local retention = require("retention")
local config = require("config")
local jobs = require("jobs")
local job_fixture = require("job_fixture")
local job_types = require("job_types")

local FORMER_JOBS_PER_OWNER = 10000
local FORMER_RUNS_PER_OWNER = 100000

local function open_db(): sql.DB
    local db, err = sql.get("app:db")
    if not db then error("test database unavailable: " .. tostring(err)) end
    if err or not db then error("jobs retention DB unavailable: " .. tostring(err)) end
    return db :: sql.DB
end

local function enqueue_as(db: any, dbtype: string, owner_id: string, key: string): (string?, error?, boolean?)
    return lifecycle.enqueue_job(db, dbtype, {
        owner_locator = { kind = "test", id = owner_id },
        job_identity = { namespace = "retention", scope = owner_id, key = key },
        job_type = "test.retention", parked = true,
    })
end

local function enqueue(db: sql.DB, owner_id: string, key: string): (string?, error?, boolean?)
    return enqueue_as(db, tostring(db:type()), owner_id, key)
end

local function count(db: sql.DB, statement: string, params: { any }): integer
    local rows, err = db:query(statement, params)
    if err then error("jobs retention count failed: " .. tostring(err)) end
    return math.floor(tonumber(rows[1].n) :: number)
end

local function max_row_bytes(): integer
    local policy, policy_err = config.policy()
    if policy_err or not policy then error("jobs policy unavailable: " .. tostring(policy_err)) end
    return (policy :: any).max_row_bytes
end

local function run_once(db: sql.DB, owner: string, key: string): string
    local id, enqueue_err = enqueue(db, owner, key)
    test.is_nil(enqueue_err)
    local leased, lease_err = job_fixture.lease_own(db, tostring(db:type()), id :: string)
    if not leased then error("test job lease fails: " .. tostring(lease_err)) end
    test.is_nil(lease_err)
    local done, done_err = jobs.complete(id :: string,
        { token = leased.lease_token, execution_seq = tonumber(leased.execution_seq) },
        { record = { status = "completed" } })
    test.is_nil(done_err)
    test.not_nil(done)
    return id :: string
end

local function seed_runs(db: sql.DB, owner: string, job_id: string, total: integer): integer
    local statement: string
    if tostring(db:type()) == sql.type.POSTGRES then
        statement = [[INSERT INTO kickside_job_run
            (id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,status,lease_token,started_at,finished_at)
            SELECT md5($1::text || ':' || n::text)::uuid,$1::uuid,'test',$2,'test.retention',1,n + 1000,'success','seed',$3::timestamptz,$3::timestamptz
            FROM generate_series(1,]] .. tostring(total) .. [[) AS n]]
    else
        statement = [[WITH RECURSIVE numbered(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbered WHERE n<]]
            .. tostring(total) .. [[)
            INSERT INTO kickside_job_run
            (id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,status,lease_token,started_at,finished_at)
            SELECT lower(hex(randomblob(16))),$1,'test',$2,'test.retention',1,n + 1000,'success','seed',$3,$3
            FROM numbered]]
    end
    local seeded, err = db:execute(statement, { job_id, owner, "2000-01-01T00:00:00Z" })
    if err then error("run seed failed: " .. tostring(err)) end
    return math.floor(tonumber(seeded.rows_affected) :: number)
end

local function define_tests()
    test.describe("jobs retention bounded by age expiry", function()
        test.it("retains done dead and cancelled jobs until expiry and then removes them", function()
            local db = open_db()
            local dbtype = tostring(db:type())
            local owner = uuid.v7()
            for _, status in ipairs({ job_types.JOB_STATE.DONE, job_types.JOB_STATE.DEAD, job_types.JOB_STATE.CANCELLED }) do
                local id, enqueue_err = enqueue(db, owner, status)
                test.is_nil(enqueue_err)
                if type(id) ~= "string" then error("retention fixture enqueue returns no job id") end
                if status == job_types.JOB_STATE.CANCELLED then
                    local cancelled, cancel_err = jobs.cancel(id)
                    test.is_nil(cancel_err)
                    test.is_true(cancelled.canceled)
                else
                    local job, lease_err = job_fixture.lease_own(db, dbtype, id)
                    test.is_nil(lease_err)
                    if status == job_types.JOB_STATE.DEAD then
                        test.is_nil(lifecycle.fail_job(db, job, dbtype, "invalid input", "deterministic"))
                    else
                        test.is_nil(lifecycle.complete_job(db, job, dbtype, nil))
                    end
                end
                test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job WHERE id=$1 AND status=$2 AND finished_at IS NOT NULL", { id, status }), 1)
                local kept, keep_err = retention.prune_jobs(db, nil, "2000-01-01T00:00:00Z", 100)
                test.is_nil(keep_err)
                test.eq(kept, 0)
                test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job WHERE id=$1", { id }), 1)
                local _, age_err = db:execute("UPDATE kickside_job SET finished_at='2000-01-01T00:00:00Z' WHERE id=$1", { id })
                test.is_nil(age_err)
                local removed, remove_err = retention.prune_jobs(db, nil, "2001-01-01T00:00:00Z", 100)
                test.is_nil(remove_err)
                test.eq(removed, 1)
                test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job WHERE id=$1", { id }), 0)
            end
            db:release()
        end)

        test.it("retains every finished run state until expiry and then removes its history", function()
            local db = open_db()
            local dbtype = tostring(db:type())
            local owner = uuid.v7()
            for _, status in pairs(job_types.RUN_STATE) do
                if status ~= job_types.RUN_STATE.RUNNING then
                    local id, enqueue_err = enqueue(db, owner, status)
                    test.is_nil(enqueue_err)
                    if type(id) ~= "string" then
                        error(errors.new({ kind = errors.INTERNAL, retryable = false, message = "retention fixture enqueue returns no job id" }))
                    end
                    local job, lease_err = job_fixture.lease_own(db, dbtype, id)
                    test.is_nil(lease_err)
                    if type(job) ~= "table" then
                        error(errors.new({ kind = errors.INTERNAL, retryable = false, message = "retention fixture lease returns no job" }))
                    end
                    local run, start_err = lifecycle.start_job_run(db, dbtype, job, "state-history", 1)
                    test.is_nil(start_err)
                    test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE id=$1 AND status='running'", { run.id }), 1)
                    test.is_nil(lifecycle.finalize_job_run(db, dbtype, run, status, { state = status }, {}, nil))
                    test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE id=$1 AND status=$2 AND finished_at IS NOT NULL", { run.id, status }), 1)
                    local kept, keep_err = retention.prune_runs(db, nil, "2000-01-01T00:00:00Z", 100)
                    test.is_nil(keep_err)
                    test.eq(kept, 0)
                    test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE id=$1", { run.id }), 1)
                    local _, age_err = db:execute("UPDATE kickside_job_run SET finished_at='2000-01-01T00:00:00Z' WHERE id=$1", { run.id })
                    test.is_nil(age_err)
                    local removed, remove_err = retention.prune_runs(db, nil, "2001-01-01T00:00:00Z", 100)
                    test.is_nil(remove_err)
                    test.eq(removed, 1)
                    test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE id=$1", { run.id }), 0)
                end
            end
            db:release()
        end)

        test.it("prunes thread jobs and history by their owner without crossing system scope", function()
            local db = open_db()
            local owner = uuid.v7()
            local ids = {}
            for _, kind in ipairs({ "thread", "test" }) do
                local id, err = lifecycle.enqueue_job(db, tostring(db:type()), {
                    owner_locator = { kind = kind, id = owner },
                    job_identity = { namespace = "retention", scope = owner, key = kind },
                    job_type = "test.retention", parked = true,
                })
                test.is_nil(err)
                ids[kind] = id
                local _, settle_err = db:execute([[UPDATE kickside_job SET status='done',
                    finished_at='2000-01-01T00:00:00Z' WHERE id=$1]], { id })
                test.is_nil(settle_err)
                local _, seed_err = db:execute([[INSERT INTO kickside_job_run
                    (id,job_id,owner_kind,owner_id,job_type,attempt_no,execution_seq,status,
                     lease_token,started_at,finished_at)
                    VALUES ($1,$2,$3,$4,'test.retention',1,1,'success','seed',$5,$5)]],
                    { uuid.v7(), id, kind, owner, "2000-01-01T00:00:00Z" })
                test.is_nil(seed_err)
            end
            for _, runs in ipairs({ true, false }) do
                local prune = runs and retention.prune_runs or retention.prune_jobs
                local table_name = runs and "kickside_job_run" or "kickside_job"
                local total, err = prune(db, nil, "2001-01-01T00:00:00Z", 500)
                test.is_nil(err)
                test.not_nil(total)
                test.eq(count(db, "SELECT COUNT(*) AS n FROM " .. table_name
                    .. " WHERE owner_kind='thread' AND owner_id=$1", { owner }), 1)
                test.eq(count(db, "SELECT COUNT(*) AS n FROM " .. table_name
                    .. " WHERE owner_kind='test' AND owner_id=$1", { owner }), 0)
                local thread_total, thread_err = prune(db, owner, "2001-01-01T00:00:00Z", 500)
                test.is_nil(thread_err)
                test.eq(thread_total, 1)
            end
            db:release()
        end)
        test.it("persists the surviving owner and replays one job identity", function()
            local owner = uuid.v7()
            local db = open_db()
            local id, err, inserted = enqueue(db, owner, "same")
            test.is_nil(err)
            test.is_true(inserted)
            local again, replay_err, replay_inserted = enqueue(db, owner, "same")
            test.is_nil(replay_err)
            test.eq(again, id)
            test.is_false(replay_inserted)
            db:release()
            local restarted = open_db()
            local rows, read_err = restarted:query(
                "SELECT owner_kind,owner_id FROM kickside_job WHERE id=$1", { id })
            restarted:release()
            test.is_nil(read_err)
            test.eq(rows[1].owner_kind, "test")
            test.eq(rows[1].owner_id, owner)
        end)

        test.it("enqueues past the former per-owner job count and prunes settled jobs after the window", function()
            local owner = uuid.v7()
            local db = open_db()
            local dbtype = tostring(db:type())
            local tx = assert(db:begin())
            for index = 1, FORMER_JOBS_PER_OWNER do
                local id, err = enqueue_as(tx, dbtype, owner, "bulk-" .. tostring(index))
                if err or not id then
                    tx:rollback(); db:release()
                    error("job " .. tostring(index) .. " refused: " .. tostring(err))
                end
            end
            local _, commit_err = tx:commit()
            test.is_nil(commit_err)
            local settled, settle_err = db:execute([[UPDATE kickside_job SET status='done',
                finished_at='2000-01-01T00:00:00Z' WHERE owner_kind='test' AND owner_id=$1]], { owner })
            test.is_nil(settle_err)
            test.eq(tonumber(settled.rows_affected), FORMER_JOBS_PER_OWNER)
            for index = 1, 20 do
                local id, err = enqueue(db, owner, "fresh-" .. tostring(index))
                test.is_nil(err)
                test.not_nil(id)
            end
            test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job WHERE owner_kind='test' AND owner_id=$1",
                { owner }), FORMER_JOBS_PER_OWNER + 20)
            db:release()
            local pruned = 0
            while true do
                local swept, sweep_err = jobs.retention_sweep()
                test.is_nil(sweep_err)
                if swept.jobs == 0 then break end
                pruned = pruned + swept.jobs
            end
            test.is_true(pruned >= FORMER_JOBS_PER_OWNER)
            local verify = open_db()
            test.eq(count(verify, "SELECT COUNT(*) AS n FROM kickside_job WHERE owner_kind='test' AND owner_id=$1",
                { owner }), 20)
            verify:release()
        end)

        test.it("completes runs past the former per-owner run count and prunes expired history", function()
            local owner = uuid.v7()
            local db = open_db()
            local anchor = run_once(db, owner, "anchor")
            test.eq(seed_runs(db, owner, anchor, FORMER_RUNS_PER_OWNER), FORMER_RUNS_PER_OWNER)
            for index = 1, 12 do run_once(db, owner, "run-" .. tostring(index)) end
            test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE owner_kind='test' AND owner_id=$1",
                { owner }), FORMER_RUNS_PER_OWNER + 13)
            db:release()
            local pruned = 0
            while true do
                local swept, sweep_err = jobs.retention_sweep()
                test.is_nil(sweep_err)
                if swept.job_runs == 0 then break end
                pruned = pruned + swept.job_runs
            end
            test.is_true(pruned >= FORMER_RUNS_PER_OWNER)
            local verify = open_db()
            test.eq(count(verify, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE owner_kind='test' AND owner_id=$1",
                { owner }), 13)
            verify:release()
        end)

        test.it("retains running history but prunes expired parked history", function()
            local db, owner = open_db(), uuid.v7()
            local id, enqueue_err = enqueue(db, owner, "parked-retention")
            test.is_nil(enqueue_err)
            local leased, lease_err = job_fixture.lease_own(db, tostring(db:type()), id :: string)
            if not leased then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            local _, complete_err = jobs.complete(id :: string,
                { token = leased.lease_token, execution_seq = tonumber(leased.execution_seq) },
                { record = { status = "parked" } })
            test.is_nil(complete_err)
            local _, age_err = db:execute("UPDATE kickside_job_run SET finished_at='2000-01-01T00:00:00Z' WHERE job_id=$1", { id })
            test.is_nil(age_err)
            local live_id, live_enqueue_err = enqueue(db, owner, "running-retention")
            test.is_nil(live_enqueue_err)
            local running, running_err = job_fixture.lease_own(db, tostring(db:type()), live_id :: string)
            if not running then error("test job lease fails: " .. tostring(running_err)) end
            test.is_nil(running_err)
            local run, start_err = lifecycle.start_job_run(db, tostring(db:type()), running, "retention-worker", 1)
            test.is_nil(start_err)
            local swept, sweep_err = jobs.retention_sweep()
            test.is_nil(sweep_err, tostring(sweep_err))
            test.eq(swept.job_runs, 1)
            local rows, read_err = db:query("SELECT id,status FROM kickside_job_run WHERE job_id=$1", { id })
            test.is_nil(read_err)
            test.eq(#rows, 0)
            local live_rows, live_read_err = db:query("SELECT id,status FROM kickside_job_run WHERE job_id=$1", { live_id })
            test.is_nil(live_read_err)
            test.eq(#live_rows, 1)
            test.eq(live_rows[1].id, run.id)
            test.eq(live_rows[1].status, "running")
            db:release()
        end)

        test.it("completes concurrent leases of one owner", function()
            local owner = uuid.v7()
            local db = open_db()
            local leases: table[] = {}
            for _, key in ipairs({ "race-a", "race-b" }) do
                local id, enqueue_err = enqueue(db, owner, key)
                test.is_nil(enqueue_err)
                local leased, lease_err = job_fixture.lease_own(db, tostring(db:type()), id :: string)
                if not leased then error("test job lease fails: " .. tostring(lease_err)) end
                test.is_nil(lease_err)
                leases[#leases + 1] = { id = id, lease = leased }
            end
            db:release()
            local done = channel.new(2)
            for _, item in ipairs(leases) do
                coroutine.spawn(function()
                    local result, err = jobs.complete(item.id,
                        { token = item.lease.lease_token,
                            execution_seq = tonumber(item.lease.execution_seq) },
                        { record = { status = "completed" } })
                    done:send({ result = result, err = err })
                end)
            end
            for _ = 1, 2 do
                local outcome = done:receive()
                test.is_nil(outcome.err)
                test.not_nil(outcome.result)
            end
            local restarted = open_db()
            test.eq(count(restarted, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE owner_kind='test' AND owner_id=$1",
                { owner }), 2)
            restarted:release()
        end)

        test.it("deletes only settled jobs and runs past their window", function()
            local owner = uuid.v7()
            local db = open_db()
            local id = run_once(db, owner, "cleanup")
            local pending, pending_err = enqueue(db, owner, "pending")
            test.is_nil(pending_err)
            local _, age_err = db:execute([[UPDATE kickside_job_run SET finished_at='2000-01-01T00:00:00Z'
                WHERE job_id=$1]], { id })
            test.is_nil(age_err)
            local _, age_job_err = db:execute([[UPDATE kickside_job SET finished_at='2000-01-01T00:00:00Z'
                WHERE id=$1]], { id })
            test.is_nil(age_job_err)
            db:release()

            local swept, sweep_err = jobs.retention_sweep()
            test.is_nil(sweep_err, tostring(sweep_err))
            test.not_nil(swept)
            test.is_true(swept.job_runs >= 1)
            test.is_true(swept.jobs >= 1)

            local verify = open_db()
            test.eq(count(verify, "SELECT COUNT(*) AS n FROM kickside_job WHERE id=$1", { id }), 0)
            test.eq(count(verify, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE job_id=$1", { id }), 0)
            test.eq(count(verify, "SELECT COUNT(*) AS n FROM kickside_job WHERE id=$1", { pending }), 1)
            verify:release()
        end)

        test.it("purges a slot only after its running lease settles", function()
            local owner = uuid.v7()
            local db = open_db()
            local identity = { namespace = "retention", scope = owner, key = "slot" }
            local id, enqueue_err = lifecycle.enqueue_job(db, tostring(db:type()), {
                owner_locator = { kind = "test", id = owner },
                job_identity = identity, job_type = "test.retention", slot = true, parked = true,
            })
            test.is_nil(enqueue_err)
            local leased, lease_err = job_fixture.lease_own(db, tostring(db:type()), id :: string)
            if not leased then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            local blocked, blocked_err = slot_purge.purge_slot(identity)
            test.is_nil(blocked)
            test.not_nil(blocked_err)
            test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job WHERE id=$1", { id }), 1)

            local _, complete_err = jobs.complete(id :: string,
                { token = leased.lease_token, execution_seq = tonumber(leased.execution_seq) },
                { record = { status = "completed" } })
            test.is_nil(complete_err)
            local removed, remove_err = slot_purge.purge_slot(identity)
            test.is_nil(remove_err)
            test.eq(removed, 1)
            test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job WHERE id=$1", { id }), 0)
            test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE job_id=$1", { id }), 0)
            db:release()
        end)

        test.it("waits for history settlement when a released slot has no purgeable page", function()
            local owner = uuid.v7()
            local db = open_db()
            local dbtype = tostring(db:type())
            local identity = { namespace = "retention", scope = owner, key = "history-wait" }
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = owner }, job_identity = identity,
                job_type = "test.retention", slot = true, parked = true,
            })
            test.is_nil(enqueue_err)
            local job, claim_err = job_fixture.lease_own(db, dbtype, id)
            if not job then error("test job lease fails: " .. tostring(claim_err)) end
            test.is_nil(claim_err)
            local run, start_err = lifecycle.start_job_run(db, dbtype, job, "history-wait-worker", 1)
            test.is_nil(start_err)
            test.is_nil(lifecycle.fail_job(db, job, dbtype, "child ends", "deterministic"))
            local ok, failure = pcall(function()
                for _ = 1, 2 do
                    local removed, purge_err = slot_purge.purge_slot(identity)
                    test.is_nil(removed)
                    test.is_true(errors.is(purge_err, errors.CONFLICT), tostring(purge_err))
                    test.is_true(purge_err:details().cleanup_pending)
                    test.eq(purge_err:details().wait_for, "run_history_settlement")
                    test.is_false(purge_err:details().needs_continue)
                    test.eq(purge_err:details().deleted_runs, 0)
                    test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE id=$1 AND status='running'", { run.id }), 1)
                end
            end)
            local history_err = lifecycle.finalize_job_run(db, dbtype, run, "failed", {}, {}, "child ends")
            local removed, purge_err = slot_purge.purge_slot(identity)
            db:release()
            test.is_nil(history_err, tostring(history_err))
            test.is_nil(purge_err, tostring(purge_err))
            test.eq(removed, 1)
            if not ok then error(failure) end
        end)

        test.it("rejects stored concurrency and wake keys above the encoded job row limit", function()
            local cap = max_row_bytes()
            local db, owner = open_db(), uuid.v7()
            for _, field in ipairs({ "concurrency_key", "wake_key" }) do
                local params = {
                    owner_locator = { kind = "test", id = owner },
                    job_identity = { namespace = "retention", scope = owner, key = field },
                    job_type = "test.retention", parked = true,
                }
                params[field] = string.rep("k", cap + 1)
                local id, err = lifecycle.enqueue_job(db, tostring(db:type()), params)
                test.is_nil(id)
                test.not_nil(err)
                test.eq(err:kind(), errors.INVALID)
                test.eq(err:details().reason, "row_too_large")
                test.eq(err:details().cap, cap)
            end
            test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job WHERE owner_kind='test' AND owner_id=$1",
                { owner }), 0)
            db:release()
        end)

        test.it("measures the full stored run row before completion", function()
            local cap = max_row_bytes()
            local db, owner = open_db(), uuid.v7()
            local id, enqueue_err = enqueue(db, owner, "oversized-run")
            test.is_nil(enqueue_err)
            local leased, lease_err = job_fixture.lease_own(db, tostring(db:type()), id :: string)
            if not leased then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            local result, err = jobs.complete(id :: string,
                { token = leased.lease_token, execution_seq = tonumber(leased.execution_seq) },
                { record = { status = "failed", error = string.rep("e", cap - 1) } })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
            test.eq(err:details().reason, "row_too_large")
            local rows, read_err = db:query("SELECT status FROM kickside_job WHERE id=$1", { id })
            test.is_nil(read_err)
            test.eq(rows[1].status, "running")
            test.eq(count(db, "SELECT COUNT(*) AS n FROM kickside_job_run WHERE job_id=$1", { id }), 0)
            db:release()
        end)

        test.it("refuses failure text that makes the retained job or run exceed its row limit", function()
            local cap = max_row_bytes()
            local db, owner = open_db(), uuid.v7()
            local id, enqueue_err = enqueue(db, owner, "oversized-failure")
            test.is_nil(enqueue_err)
            local leased, lease_err = job_fixture.lease_own(db, tostring(db:type()), id :: string)
            if not leased then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            local err = lifecycle.fail_job(db, leased, tostring(db:type()),
                string.rep("e", cap - 5), "deterministic")
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
            test.eq(err:details().reason, "row_too_large")
            local rows, read_err = db:query("SELECT status,last_error FROM kickside_job WHERE id=$1", { id })
            test.is_nil(read_err)
            test.eq(rows[1].status, "running")
            test.is_nil(rows[1].last_error)
            db:release()
        end)

        test.it("refuses worker output that makes an existing run exceed its row limit", function()
            local cap = max_row_bytes()
            local db, owner = open_db(), uuid.v7()
            local id, enqueue_err = enqueue(db, owner, "oversized-output")
            test.is_nil(enqueue_err)
            local leased, lease_err = job_fixture.lease_own(db, tostring(db:type()), id :: string)
            if not leased then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            local run, start_err = lifecycle.start_job_run(db, tostring(db:type()), leased,
                "retention-worker", 1)
            test.is_nil(start_err)
            local err = lifecycle.finalize_job_run(db, tostring(db:type()), run,
                "success", { blob = string.rep("r", cap - 100) }, {}, nil)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
            test.eq(err:details().reason, "row_too_large")
            local rows, read_err = db:query("SELECT status,result_json FROM kickside_job_run WHERE id=$1", { run.id })
            test.is_nil(read_err)
            test.eq(rows[1].status, "running")
            test.eq(rows[1].result_json, "{}")
            db:release()
        end)

        test.it("keeps no per-owner usage state", function()
            local db = open_db()
            local dbtype = tostring(db:type())
            local rows: any
            if dbtype == sql.type.POSTGRES then
                rows = db:query([[SELECT table_name AS name FROM information_schema.tables
                    WHERE table_schema=current_schema() AND table_name LIKE 'kickside_job%']])
            else
                rows = db:query("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'kickside_job%'")
            end
            db:release()
            for _, row in ipairs(rows or {}) do
                test.is_nil((tostring(row.name):find("usage", 1, true)))
                test.is_nil((tostring(row.name):find("health_cursor", 1, true)))
            end
        end)
    end)
end
return { run = test.run_cases(define_tests) }
