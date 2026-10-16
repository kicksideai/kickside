local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local job_types = require("job_types")
local claim = require("claim")
local reclaim = require("reclaim")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

local function past(dbtype: string): string
    return dbtype == sql.type.SQLITE and "2000-01-01 00:00:00" or "2000-01-01T00:00:00Z"
end

local function with_db(fn: (sql.DB, string) -> ())
    local db, _, err = job_fixture.private_queue("app:private_queue_run_history_reclaim_test")
    if err or not db then error("jobs test: private queue unavailable: " .. tostring(err)) end
    local dbtype = tostring(db:type())
    fn(db, dbtype)
    db:release()
end

local function register_worker(db: sql.DB, dbtype: string): string
    local worker_id = "worker-" .. uuid.v7()
    local _, err = sql.builder.insert("kickside_job_worker")
        :set_map({ id = worker_id, registry_version = "0", last_seen_at = lifecycle.now_string(dbtype) })
        :run_with(db):exec()
    if err then error("worker insert failed: " .. tostring(err)) end
    return worker_id
end

local function enqueue(db: sql.DB, dbtype: string, params: table?): string
    local spec: table = { owner_locator = { kind = "test", id = "run_history_reclaim" },
        thread_id = uuid.v7(), job_type = "test.run_history_reclaim" }
    for key, value in pairs(params or {}) do spec[key] = value end
    local id, err = lifecycle.enqueue_job(db, dbtype, spec)
    if err or not id then error("enqueue failed: " .. tostring(err)) end
    return id :: string
end

-- Claim through the worker batch path, which records the execution's run.
local function claim_one(db: sql.DB, dbtype: string): table
    local worker_id = register_worker(db, dbtype)
    local batch, err = claim.claim_batch(db, dbtype, 1, nil, nil, { worker_id })
    if err or not batch or #batch ~= 1 then error("claim failed: " .. tostring(err)) end
    return batch[1] :: table
end

local function run_rows(db: sql.DB, job_id: string): { table }
    local rows, err = db:query("SELECT execution_seq, status, error_text, finished_at FROM kickside_job_run"
        .. " WHERE job_id=$1 ORDER BY execution_seq ASC", { job_id })
    if err or not rows then error("run read failed: " .. tostring(err)) end
    return rows :: { table }
end

local function expire(db: sql.DB, dbtype: string, job_id: string)
    local _, err = sql.builder.update("kickside_job"):set("lease_until", past(dbtype))
        :where(sql.builder.eq({ id = job_id })):run_with(db):exec()
    if err then error("expire failed: " .. tostring(err)) end
end

local function insert_run(db: sql.DB, dbtype: string, job_id: string, execution_seq: integer, token: string)
    local now = lifecycle.now_string(dbtype)
    local _, err = sql.builder.insert("kickside_job_run"):set_map({
        id = uuid.v7(), job_id = job_id, owner_kind = "test", owner_id = "run_history_reclaim",
        thread_id = uuid.v7(), job_type = "test.run_history_reclaim", attempt_no = 1,
        execution_seq = execution_seq, worker_pid = "worker-gone", lease_token = token,
        status = job_types.RUN_STATE.RUNNING, started_at = now, result_json = "{}", actions_json = "{}",
        created_at = now, updated_at = now,
    }):run_with(db):exec()
    if err then error("run insert failed: " .. tostring(err)) end
end

local function define_tests()
    test.describe("jobs run history under lease reclaim", function()
        test.it("closes the reclaimed execution's run as lease_lost in the reclaim transaction", function()
            with_db(function(db, dbtype)
                local id = enqueue(db, dbtype)
                local job = claim_one(db, dbtype)
                test.eq(job.id, id)
                expire(db, dbtype, id)

                local reclaimed, err = reclaim.reclaim_expired(db, dbtype)
                test.is_nil(err)
                test.eq(reclaimed, 1)
                local runs = run_rows(db, id)
                test.eq(#runs, 1)
                test.eq(runs[1].status, job_types.RUN_STATE.LEASE_LOST)
                test.not_nil(runs[1].finished_at)

                local again = claim_one(db, dbtype)
                test.eq(again.id, id)
                runs = run_rows(db, id)
                test.eq(#runs, 2)
                test.eq(runs[2].status, job_types.RUN_STATE.RUNNING)
            end)
        end)

        test.it("closes run history whose lease no longer holds its job and keeps live runs", function()
            with_db(function(db, dbtype)
                -- A slot reclaimed earlier and executed again since: its old run
                -- stayed running at an execution the job has moved past.
                local advanced = enqueue(db, dbtype, { parked = true })
                insert_run(db, dbtype, advanced, 1, uuid.v7())
                local _, seq_err = db:execute("UPDATE kickside_job SET execution_seq=7 WHERE id=$1", { advanced })
                test.is_nil(seq_err)
                -- A parked slot whose execution was reclaimed without a new claim.
                local parked = enqueue(db, dbtype, { parked = true })
                insert_run(db, dbtype, parked, 1, uuid.v7())
                local _, parked_err = db:execute("UPDATE kickside_job SET execution_seq=1 WHERE id=$1", { parked })
                test.is_nil(parked_err)
                -- A live execution keeps its run.
                local live_id = enqueue(db, dbtype)
                local live = claim_one(db, dbtype)
                test.eq(live.id, live_id)

                local closed, err = reclaim.close_lost_runs(db, dbtype)
                test.is_nil(err)
                test.eq(closed, 2)
                test.eq(run_rows(db, advanced)[1].status, job_types.RUN_STATE.LEASE_LOST)
                test.eq(run_rows(db, parked)[1].status, job_types.RUN_STATE.LEASE_LOST)
                test.eq(run_rows(db, live_id)[1].status, job_types.RUN_STATE.RUNNING)

                local second, second_err = reclaim.close_lost_runs(db, dbtype)
                test.is_nil(second_err)
                test.eq(second, 0)
            end)
        end)
    end)
end

return { run = test.run_cases(define_tests) }
