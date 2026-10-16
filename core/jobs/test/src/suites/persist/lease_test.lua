-- Lease heartbeat. extend_lease is the pure DB primitive the heartbeat process
-- ticks: it refreshes heartbeat_at + lease_until while the (running, lease_token)
-- guard matches, and reports the lease lost (no rows affected) once the token no
-- longer matches. Those two outcomes are unit-tested directly against a fenced
-- running row. The process main loop (channel.select over events + a timer) is
-- process-bound and covered at integration when the worker spawns a real
-- heartbeat; start's arg validation and stop's nil-safety are tested here.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local lease = require("lease")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

local function execution_seq(job: table): integer
    local sequence = math.tointeger(tonumber(job.execution_seq))
    if sequence == nil then error("leased job has no integer execution sequence") end
    return sequence
end

-- Run fn with lease's cancel seam replaced by a recorder, restoring the original
-- afterwards. Returns the list of { pid, grace } calls stop() routed to cancel.
local function record_cancels(fn: () -> ()): { { pid: any, grace: any } }
    local calls: { { pid: any, grace: any } } = {}
    local original = lease._cancel
    lease._cancel = function(pid: any, grace: any): any
        calls[#calls + 1] = { pid = pid, grace = grace }
        return true
    end
    local ok, err = pcall(fn)
    lease._cancel = original
    if not ok then error(err) end
    return calls
end

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

local function make_thread(db: sql.DB): string
    local id = uuid.v7()
    sql.builder.insert("kickside_thread"):set_map({ id = id, thread_class = "test", component_id = id }):run_with(db):exec()
    return id
end

-- Enqueue one job parked and lease exactly that row under the production
-- lease window: the row stays owned past the end of the run, so no reclaim
-- sweep can take it, and extend_lease still moves lease_until strictly forward.
local function claim_one(db: sql.DB, dbtype: string): table
    local job, lease_err = job_fixture.enqueue_leased(db, dbtype, { thread_id = make_thread(db), job_type = "test.lease" })
    if lease_err or not job then error("own job lease failed: " .. tostring(lease_err)) end
    return job
end

local function lease_row(db: sql.DB, id): table?
    local rows = sql.builder.select("status", "lease_token", "lease_until", "heartbeat_at")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function define_tests()
    test.describe("jobs.lease extend_lease", function()
        test.it("validates a live lease without writing and renews only a short lease", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local job = claim_one(db, dbtype)
                local before = lease_row(db, job.id)
                local live, live_err = lease.validate_for_dispatch(db, dbtype, job)
                test.is_nil(live_err)
                test.is_true(live)
                local unchanged = lease_row(db, job.id)
                test.eq(unchanged.heartbeat_at, before.heartbeat_at)
                test.eq(unchanged.lease_until, before.lease_until)

                local short = lifecycle.future_string(dbtype, 0.2)
                local _, shorten_err = db:execute("UPDATE kickside_job SET lease_until=$1 WHERE id=$2", { short, job.id })
                test.is_nil(shorten_err)
                local renewed, renew_err = lease.validate_for_dispatch(db, dbtype, job)
                test.is_nil(renew_err)
                test.is_true(renewed)
                local after = lease_row(db, job.id)
                test.is_true(after.lease_until > short)

                job.execution_seq = execution_seq(job) + 1
                local stale, stale_err = lease.validate_for_dispatch(db, dbtype, job)
                test.is_false(stale)
                test.not_nil(stale_err)
                test.eq(stale_err:kind(), errors.CONFLICT)
                job.execution_seq = execution_seq(job) - 1
                test.is_nil(lifecycle.complete_job(db, job, dbtype))
            end)
        end)

        test.it("extends lease_until and heartbeat_at for the lease owner", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local job = claim_one(db, dbtype)

                local before = lease_row(db, job.id)
                local alive, err = lease.extend_lease(db, dbtype, tostring(job.id), tostring(job.lease_token),
                    execution_seq(job))
                test.is_nil(err)
                test.is_true(alive)

                local after = lease_row(db, job.id)
                test.eq(after.status, "running")
                test.is_true(after.lease_until >= before.lease_until)
                test.not_nil(after.heartbeat_at)

                -- Leave no running row behind for later reclaim sweeps.
                test.is_nil(lifecycle.complete_job(db, job, dbtype))
            end)
        end)

        test.it("reports the lease lost when the token no longer matches", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local job = claim_one(db, dbtype)

                -- A stale token (the job was reclaimed by another worker) must not
                -- extend the lease: the guarded update affects no rows.
                local alive, err = lease.extend_lease(db, dbtype, tostring(job.id), "stale-token-" .. uuid.v7(),
                    execution_seq(job))
                test.is_nil(err)
                test.is_false(alive)

                -- Leave no running row behind for later reclaim sweeps.
                test.is_nil(lifecycle.complete_job(db, job, dbtype))
            end)
        end)

        test.it("reports the lease lost once the job is no longer running", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local job = claim_one(db, dbtype)

                local done_err = lifecycle.complete_job(db, job, dbtype)
                test.is_nil(done_err)

                -- The status guard (running) now fails even with the right token.
                local alive, err = lease.extend_lease(db, dbtype, tostring(job.id), tostring(job.lease_token),
                    execution_seq(job))
                test.is_nil(err)
                test.is_false(alive)
            end)
        end)
    end)

    test.describe("jobs.lease start/stop", function()
        test.it("rejects a start without job id or lease_token", function()
            local pid, err = lease.start({})
            test.is_nil(pid)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("stop is a no-op when given nil", function()
            -- No pid to cancel: stop must return without reaching process.cancel,
            -- which requires a real pid.
            local calls = record_cancels(function()
                lease.stop(nil)
            end)
            test.eq(#calls, 0)
        end)

        test.it("stop cancels the heartbeat process when given a pid", function()
            -- A real pid routes to process.cancel with the bounded grace window.
            local calls = record_cancels(function()
                lease.stop("heartbeat-pid-" .. uuid.v7())
            end)
            test.eq(#calls, 1)
            test.eq(calls[1].grace, "1s")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
