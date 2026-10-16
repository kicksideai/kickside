local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local job_types = require("job_types")
local claim = require("claim")
local jobs = require("jobs")
local wake = require("wake")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")

-- Every case owns a private queue rebuilt empty from the live job schema, so
-- each claim selects only rows the case created.
local function with_db(fn)
    local db, _, err = job_fixture.private_queue("app:private_queue_claim_selection_test")
    if not db or not _ then error("test queue unavailable: " .. tostring(err)) end
    if err or not db then
        error("jobs test: private queue unavailable: " .. tostring(err))
    end
    local ok, run_err = pcall(fn, db)
    db:release()
    if not ok then
        error(run_err)
    end
end

-- Jobs carry thread_id without a thread foreign key; the private queue holds
-- only the job closure.
local function make_thread(_db: sql.DB): string
    return uuid.v7()
end

local function enqueue(db: sql.DB, dbtype: string, thread_id: string, job_type: string?, scheduled_at: string?): string
    local id, err = lifecycle.enqueue_job(db, dbtype, {
        owner_locator = { kind = "test", id = "claim_test" },
        thread_id = thread_id,
        job_type = job_type or "test.claim",
        scheduled_at = scheduled_at,
    })
    if err then
        error("enqueue failed: " .. tostring(err))
    end
    return id :: string
end

local function row_of(db: sql.DB, id): table?
    local rows = sql.builder.select("status", "lease_token", "lease_until", "attempts", "execution_seq")
        :from("kickside_job"):where(sql.builder.eq({ id = id })):run_with(db):query()
    return rows and rows[1] or nil
end

local function define_tests()
    test.describe("jobs.claim", function()

        test.it("addresses a due request beyond the normal candidate page and keeps ordinary progress", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread = make_thread(db)
                for _ = 1, 100 do enqueue(db, dbtype, thread, "test.awaited", "2000-01-01T00:00:00Z") end
                local id = enqueue(db, dbtype, thread, "test.awaited", "2001-01-01T00:00:00Z")
                local before = db:query("SELECT scheduled_at,attempts FROM kickside_job WHERE id=$1", { id })
                test.is_nil(select(2, wake.wake_job(db, id, { control = true, ensure_due = true }, dbtype)))
                local after = db:query("SELECT scheduled_at,attempts FROM kickside_job WHERE id=$1", { id })
                test.eq(after[1].scheduled_at, before[1].scheduled_at)
                test.eq(after[1].attempts, before[1].attempts)
                local batch, err = claim.claim_batch(db, dbtype, 2, nil, nil, nil, nil,
                    { awaited_types = { "test.awaited" }, general_capacity = 1, tier_step = 0 })
                test.is_nil(err)
                test.eq(#batch, 2)
                local found = false
                for _, job in ipairs(batch) do if job.id == id then found = true end end
                test.is_true(found)
            end)
        end)

        test.it("reserves concurrency keys once and excludes another claimant without waiting", function()
            local queries = 0
            local probe = function(statement: string, params: table?): (table[]?, error?)
                if not params then error("reservation query parameters are absent") end
                queries = queries + 1
                if queries == 1 then
                    test.not_nil((string.find(statement, "pg_try_advisory_xact_lock", 1, true)))
                    test.eq(params[1], "alpha")
                    test.eq(params[2], "beta")
                    return { { concurrency_key = "alpha", acquired = false }, { concurrency_key = "beta", acquired = true } }, nil
                end
                return {}, nil
            end
            local held, err = claim.reserve_keys(probe, sql.type.POSTGRES, { "beta", "alpha", "beta" })
            test.is_nil(err)
            test.is_false(held.alpha == true)
            test.is_true(held.beta)
            test.eq(queries, 2)
            local serial, serial_err = claim.reserve_keys(probe, sql.type.SQLITE, { "alpha", "beta" })
            test.is_nil(serial_err)
            test.is_true(serial.alpha)
            test.is_true(serial.beta)
            test.eq(queries, 2)
        end)

        test.it("propagates concurrency reservation failures", function()
            local failure = (errors.new({ kind = errors.INTERNAL, message = "reservation unavailable" }) :: error)
            local held, err = claim.reserve_keys(function(_: string, _: table?): (table[]?, error?) return nil, failure end, sql.type.POSTGRES, { "key" })
            test.is_nil(held)
            test.not_nil(err)
            test.contains(tostring(err), "reservation unavailable")
        end)
        for _, mode in ipairs({ "single", "batch" }) do
            test.it("consumes pre-claim demand and preserves demand during " .. mode .. " execution", function()
                with_db(function(db: sql.DB)
                    local dbtype = tostring(db:type())
                    local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = { kind = "test", id = "claim_demand" },
                        job_type = "test.consumer", thread_id = uuid.v7(), slot = true, parked = true,
                    })
                    test.is_nil(enqueue_err)
                    test.not_nil(id)
                    local _, wake_err = wake.wake_job(db, id, nil, dbtype)
                    test.is_nil(wake_err)
                    local function own()
                        if mode == "single" then return claim.claim_job(db, dbtype) end
                        local batch, err = claim.claim_batch(db, dbtype, 1)
                        return batch and batch[1], err
                    end
                    local job, claim_err = own()
                    test.is_nil(claim_err)
                    test.not_nil(job)
                    local running, read_err = db:query("SELECT wake_demand_at FROM kickside_job WHERE id=$1", { id })
                    test.is_nil(read_err)
                    local claimed_demand = running[1].wake_demand_at
                    test.is_nil(lifecycle.complete_job(db, job, dbtype))
                    local parked, parked_err = db:query("SELECT status,scheduled_at FROM kickside_job WHERE id=$1", { id })
                    test.is_nil(parked_err)
                    test.is_nil(claimed_demand)
                    test.eq(parked[1].status, "pending")
                    test.is_nil(parked[1].scheduled_at)
                    test.is_nil(select(2, wake.wake_job(db, id, nil, dbtype)))
                    local active, active_err = own()
                    test.is_nil(active_err)
                    test.not_nil(active)
                    test.is_nil(select(2, wake.wake_job(db, id, nil, dbtype)))
                    test.is_nil(lifecycle.complete_job(db, active, dbtype))
                    local pending, pending_err = db:query("SELECT status,scheduled_at FROM kickside_job WHERE id=$1", { id })
                    test.is_nil(pending_err)
                    test.eq(pending[1].status, "pending")
                    test.not_nil(pending[1].scheduled_at)
                end)
            end)
        end

        test.it("claims awaited work first while reserving the general concurrency bound in one batch", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local awaited: { [string]: boolean } = {}
                for _ = 1, 8 do enqueue(db, dbtype, make_thread(db), "test.general") end
                for _ = 1, 2 do awaited[enqueue(db, dbtype, make_thread(db), "test.awaited")] = true end
                local batch, err = claim.claim_batch(db, dbtype, 4, nil, nil, nil, nil,
                    { awaited_types = { "test.awaited" }, general_capacity = 1, tier_step = 0 })
                test.is_nil(err)
                test.eq(#batch, 3)
                local awaited_count, general_count = 0, 0
                for _, job in ipairs(batch) do
                    if awaited[tostring(job.id)] then awaited_count = awaited_count + 1
                    else general_count = general_count + 1 end
                end
                test.eq(awaited_count, 2)
                test.eq(general_count, 1)
            end)
        end)

        test.it("leaves reserved capacity unused when no awaited work is ready", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                for _ = 1, 6 do enqueue(db, dbtype, make_thread(db), "test.general") end
                local batch, err = claim.claim_batch(db, dbtype, 4, nil, nil, nil, nil,
                    { awaited_types = { "test.awaited" }, general_capacity = 2, tier_step = 0 })
                test.is_nil(err)
                test.eq(#batch, 2)
                for _, job in ipairs(batch) do test.eq(job.job_type, "test.general") end
            end)
        end)

        test.it("locks and rechecks a bounded candidate batch in one ordered read", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local ids: { string } = {}
                for _ = 1, 4 do ids[#ids + 1] = enqueue(db, dbtype, make_thread(db)) end
                local reads = 0
                local tx, begin_err = db:begin()
                test.is_nil(begin_err)
                local probe = job_fixture.observe_tx(tx, function() reads = reads + 1 end)
                local batch, err = claim.lock_candidates(probe, dbtype, ids, lifecycle.now_string(dbtype))
                tx:rollback()
                test.is_nil(err)
                test.eq(#batch, 4)
                test.eq(reads, 1)
                table.sort(ids)
                for index, job in ipairs(batch) do
                    test.eq(tostring(job.id), ids[index])
                    test.eq(tonumber(job.attempts), 0)
                    test.eq(tonumber(job.execution_seq), 0)
                end
            end)
        end)

        test.it("observes an empty queue without opening a write transaction", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local probe = job_fixture.observe_db(db, nil, function()
                    error("empty queue opens a write transaction")
                end)
                local batch, err = claim.claim_batch(probe, dbtype, 4)
                test.is_nil(err)
                test.eq(#batch, 0)
            end)
        end)

        test.it("claims, marks its worker and starts run history in one durable transaction", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local worker_id = "claim-worker-" .. uuid.v7()
                local worker_ddl = dbtype == sql.type.POSTGRES
                    and "CREATE TABLE kickside_job_worker(id TEXT PRIMARY KEY,current_job_id UUID)"
                    or "CREATE TABLE kickside_job_worker(id TEXT PRIMARY KEY,current_job_id TEXT)"
                local _, drop_err = db:execute("DROP TABLE IF EXISTS kickside_job_worker")
                test.is_nil(drop_err)
                local _, table_err = db:execute(worker_ddl)
                test.is_nil(table_err)
                local _, worker_err = db:execute("INSERT INTO kickside_job_worker(id) VALUES($1)", { worker_id })
                test.is_nil(worker_err)
                local job_id = enqueue(db, dbtype, make_thread(db))
                local batch, claim_err = claim.claim_batch(db, dbtype, 1, "live", nil, worker_id)
                test.is_nil(claim_err, tostring(claim_err))
                test.eq(#batch, 1)
                test.eq(batch[1].id, job_id)
                test.not_nil(batch[1].run_ctx)
                local worker_rows, read_err = db:query("SELECT current_job_id FROM kickside_job_worker WHERE id=$1", { worker_id })
                test.is_nil(read_err)
                test.eq(tostring(worker_rows[1].current_job_id), job_id)
                local runs, run_err = db:query("SELECT id,status,lease_token,execution_seq FROM kickside_job_run WHERE job_id=$1", { job_id })
                test.is_nil(run_err)
                test.eq(#runs, 1)
                test.eq(tostring(runs[1].id), tostring(batch[1].run_ctx.id))
                test.eq(runs[1].status, job_types.RUN_STATE.RUNNING)
                test.eq(tostring(runs[1].lease_token), tostring(batch[1].lease_token))
                test.eq(tonumber(runs[1].execution_seq), tonumber(batch[1].execution_seq))

            end)
        end)

        test.it("claims only four idle worker slots with separate tokens and runs", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local workers: { string } = {}
                for i = 1, 4 do
                    local worker_id = "batch-worker-" .. tostring(i) .. "-" .. uuid.v7()
                    local _, insert_err = db:execute("INSERT INTO kickside_job_worker"
                        .. " (id,registry_version,last_seen_at) VALUES ($1,'test',$2)",
                        { worker_id, lifecycle.now_string(dbtype) })
                    test.is_nil(insert_err)
                    workers[i] = worker_id
                end
                local ids: { string } = {}
                for i = 1, 5 do ids[i] = enqueue(db, dbtype, make_thread(db)) end
                local batch, claim_err = claim.claim_batch(db, dbtype, 4, nil, nil, workers)
                test.is_nil(claim_err)
                test.eq(#batch, 4)
                local tokens: { [string]: boolean } = {}
                local runs: { [string]: boolean } = {}
                for _, job in ipairs(batch) do
                    test.not_nil(job.run_ctx)
                    test.not_nil(job.worker_id)
                    test.is_false(tokens[job.lease_token] == true)
                    test.is_false(runs[job.run_ctx.id] == true)
                    tokens[job.lease_token] = true
                    runs[job.run_ctx.id] = true
                    local marked = db:query("SELECT current_job_id FROM kickside_job_worker WHERE id=$1",
                        { job.worker_id })
                    test.eq(tostring(marked[1].current_job_id), tostring(job.id))
                end
                local pending = db:query("SELECT COUNT(*) AS n FROM kickside_job WHERE status='pending'")
                test.eq(tonumber(pending[1].n), 1)
            end)
        end)

        test.it("rolls back a claim when its worker heartbeat row is missing", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local worker_ddl = dbtype == sql.type.POSTGRES
                    and "CREATE TABLE kickside_job_worker(id TEXT PRIMARY KEY,current_job_id UUID)"
                    or "CREATE TABLE kickside_job_worker(id TEXT PRIMARY KEY,current_job_id TEXT)"
                local _, drop_err = db:execute("DROP TABLE IF EXISTS kickside_job_worker")
                test.is_nil(drop_err)
                local _, table_err = db:execute(worker_ddl)
                test.is_nil(table_err)
                local job_id = enqueue(db, dbtype, make_thread(db))
                local batch, claim_err = claim.claim_batch(db, dbtype, 1, "live", nil, "missing-worker")
                test.is_nil(batch)
                test.not_nil(claim_err)
                test.eq(row_of(db, job_id).status, job_types.JOB_STATE.PENDING)
                local runs, run_err = db:query("SELECT id FROM kickside_job_run WHERE job_id=$1", { job_id })
                test.is_nil(run_err)
                test.eq(#runs, 0)
            end)
        end)

        test.it("claims from its own queue while a due shared-queue job stays pending", function()
            local shared, shared_err = sql.get("app:db")
            if not shared then error("test database unavailable: " .. tostring(shared_err)) end
            test.is_nil(shared_err)
            local shared_type = tostring(shared:type())
            local ancient = shared_type == sql.type.SQLITE and "1990-01-01 00:00:00" or "1990-01-01T00:00:00Z"
            local shared_id, shared_enqueue_err = lifecycle.enqueue_job(shared, shared_type, {
                owner_locator = { kind = "test", id = "claim_test" },
                job_identity = { namespace = "claim", scope = uuid.v7(), key = "shared" },
                job_type = "test.claim.shared", priority = 1000000, scheduled_at = ancient,
            })
            test.is_nil(shared_enqueue_err)
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local own_id = enqueue(db, dbtype, make_thread(db))
                local job, err = claim.claim_job(db, dbtype)
                test.is_nil(err)
                test.not_nil(job)
                test.eq(job.id, own_id)
                test.is_nil((claim.claim_job(db, dbtype)))
            end)
            test.eq(row_of(shared, shared_id).status, job_types.JOB_STATE.PENDING)
            local _, cancel_err = sql.builder.update("kickside_job")
                :set("status", job_types.JOB_STATE.CANCELLED)
                :where(sql.builder.eq({ id = shared_id })):run_with(shared):exec()
            test.is_nil(cancel_err)
            shared:release()
        end)

        test.it("hands the claimed job every column its execution reads", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local single_id, single_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = thread_id, job_type = "test.claim.columns",
                    worker_ref = "func://app:generic_job_target", priority = 10,
                    concurrency_key = "columns:single", max_attempts = 5,
                    payload = { marker = "single" },
                })
                test.is_nil(single_err)
                local job, err = claim.claim_job(db, dbtype)
                test.is_nil(err)
                test.eq(job.id, single_id)
                test.eq(job.thread_id, thread_id)
                test.eq(job.job_type, "test.claim.columns")
                test.eq(job.worker_ref, "func://app:generic_job_target")
                test.eq(job.concurrency_key, "columns:single")
                test.eq(job.queue_tier, job_types.QUEUE_TIER.LIVE)
                test.eq(tonumber(job.max_attempts), 5)
                test.eq(tonumber(job.attempts), 1)
                test.eq(tonumber(job.execution_seq), 1)
                test.eq(lifecycle.decode_payload(job.payload).marker, "single")
                test.not_nil(job.scheduled_at)
                test.not_nil(job.lease_token)

                local batch_id, batch_enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = thread_id, job_type = "test.claim.columns",
                    worker_ref = "func://app:generic_job_target",
                    concurrency_key = "columns:batch", payload = { marker = "batch" },
                })
                test.is_nil(batch_enqueue_err)
                local batch, batch_err = claim.claim_batch(db, dbtype, 4)
                test.is_nil(batch_err)
                test.eq(#batch, 1)
                test.eq(batch[1].id, batch_id)
                test.eq(batch[1].worker_ref, "func://app:generic_job_target")
                test.eq(lifecycle.decode_payload(batch[1].payload).marker, "batch")
                test.eq(tonumber(batch[1].attempts), 1)
                test.not_nil(batch[1].lease_token)
            end)
        end)

        test.it("claims only the named job types for the pool's awaited slots", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                enqueue(db, dbtype, thread_id, "test.claim.waiting")
                local awaited_id = enqueue(db, dbtype, thread_id, "test.claim.awaited")
                local none, none_err = claim.claim_batch(db, dbtype, 2, nil, nil, nil, {})
                test.is_nil(none_err)
                test.eq(#(none :: table), 0, "an empty type set claims nothing")
                local batch, batch_err = claim.claim_batch(db, dbtype, 2, nil, nil, nil, { "test.claim.awaited" })
                test.is_nil(batch_err)
                test.eq(#(batch :: table), 1)
                test.eq((batch :: table)[1].id, awaited_id)
            end)
        end)

        test.it("returns slot identity with a claimed reusable job", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    job_identity = { namespace = "drive", scope = uuid.v7(), key = "main" },
                    slot = true,
                    job_type = "test.claim.slot",
                    queue_tier = "maintenance",
                    scheduled_at = "2000-01-01T00:00:00Z",
                })
                test.is_nil(enqueue_err)
                local batch, claim_err = claim.claim_batch(db, dbtype, 1, "maintenance")
                test.is_nil(claim_err)
                test.eq(#batch, 1)
                test.eq(batch[1].id, id)
                if not (batch[1].slot == true or tonumber(batch[1].slot) == 1) then
                    error("claimed slot flag missing: " .. tostring(batch[1].slot))
                end
                local first_run, first_run_err = lifecycle.start_job_run(db, dbtype, batch[1], "slot-pid-1", 1)
                test.is_nil(first_run_err)
                local complete_err = lifecycle.complete_job(db, batch[1], dbtype, { next_run_at = "2000-01-01T00:00:00Z" })
                test.is_nil(complete_err)
                local second, second_claim_err = claim.claim_batch(db, dbtype, 1, "maintenance")
                test.is_nil(second_claim_err)
                test.eq(#second, 1)
                test.eq(second[1].id, id)
                local second_run, second_run_err = lifecycle.start_job_run(db, dbtype, second[1], "slot-pid-2", 1)
                test.is_nil(second_run_err)
                if first_run.id == second_run.id then error("claimed slot reused its previous run") end
            end)
        end)

        test.it("uses the requested worker tier before borrowing spare capacity", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                for _, tier in ipairs({ "live", "backfill", "maintenance" }) do
                    local _, err = lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = { kind = "test", id = "claim_test" },
                        thread_id = thread_id,
                        job_type = "test.tier." .. uuid.v7(),
                        queue_tier = tier,
                    })
                    test.is_nil(err)
                end
                for _, tier in ipairs({ "backfill", "maintenance", "live" }) do
                    local batch, err = claim.claim_batch(db, dbtype, 1, tier)
                    test.is_nil(err)
                    test.eq(#batch, 1)
                    test.eq(batch[1].queue_tier, tier)
                end
            end)
        end)

        test.it("reads only the preferred tier when a single-job claim finds work there", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = make_thread(db), job_type = "test.claim.preferred",
                    queue_tier = "live",
                })
                test.is_nil(enqueue_err)
                local other_id, other_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = make_thread(db), job_type = "test.claim.other",
                    queue_tier = "backfill",
                })
                test.is_nil(other_err)
                local batch, claim_err = claim.claim_batch(db, dbtype, 1, "live")
                test.is_nil(claim_err)
                test.eq(#batch, 1)
                test.eq(batch[1].id, id)
                test.eq(row_of(db, other_id).status, job_types.JOB_STATE.PENDING)
            end)
        end)

        test.it("claims one job per concurrency key in global key order", function()
            test.not_nil(claim.claim_batch)
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local ids = {}
                for _, key in ipairs({ "z-key", "a-key", "z-key", "b-key" }) do
                    local id, err = lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = { kind = "test", id = "claim_test" },
                        thread_id = thread_id, job_type = "test.batch." .. uuid.v7(),
                        concurrency_key = key,
                    })
                    test.is_nil(err)
                    ids[#ids + 1] = id
                end
                local batch, batch_err = claim.claim_batch(db, dbtype, 4)
                test.is_nil(batch_err)
                test.eq(#batch, 3)
                test.eq(batch[1].concurrency_key, "a-key")
                test.eq(batch[2].concurrency_key, "b-key")
                test.eq(batch[3].concurrency_key, "z-key")
            end)
        end)

        test.it("claims a due pending job under a fresh lease and increments attempts", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job_id = enqueue(db, dbtype, thread_id)

                local job, err = claim.claim_job(db, dbtype)
                test.is_nil(err)
                test.not_nil(job)
                test.eq(job.id, job_id)
                test.not_nil(job.lease_token)

                local row = row_of(db, job_id)
                test.eq(row.status, job_types.JOB_STATE.RUNNING)
                test.eq(tonumber(row.attempts), 1)
                test.eq(row.lease_token, job.lease_token)
            end)
        end)

        test.it("never hands the same job to a second claim", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local job_id = enqueue(db, dbtype, thread_id)

                local first = claim.claim_job(db, dbtype)
                test.not_nil(first)
                test.eq(first.id, job_id)

                -- A second claim must not re-claim the running job; the queue
                -- holds no other due job.
                local second, second_err = claim.claim_job(db, dbtype)
                test.is_nil(second_err)
                test.is_nil(second)
            end)
        end)

        test.it("does not claim a job scheduled in the future", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local future = lifecycle.future_string(dbtype, 3600)
                local job_id = enqueue(db, dbtype, thread_id, "test.future", future)

                local job, claim_err = claim.claim_job(db, dbtype)
                test.is_nil(claim_err)
                test.is_nil(job)
                test.eq(row_of(db, job_id).status, job_types.JOB_STATE.PENDING)
            end)
        end)

        test.it("single-flights empty concurrency keys without aborting the batch", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local ancient = dbtype == sql.type.SQLITE and "1999-01-01 00:00:00" or "1999-01-01T00:00:00Z"
                local ids = {}
                for i = 1, 2 do
                    local id, err = lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = { kind = "test", id = "claim_test" },
                        thread_id = thread_id, job_type = "test.empty.key." .. uuid.v7(),
                        priority = 10000,
                        scheduled_at = ancient,
                    })
                    test.is_nil(err)
                    local _, blank_err = sql.builder.update("kickside_job")
                        :set("concurrency_key", "")
                        :where(sql.builder.eq({ id = id })):run_with(db):exec()
                    test.is_nil(blank_err)
                    ids[#ids + 1] = id
                end
                local plain_id, plain_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = thread_id, job_type = "test.empty.plain",
                    priority = 10000,
                    scheduled_at = ancient,
                })
                test.is_nil(plain_err)
                local batch, batch_err = claim.claim_batch(db, dbtype, 4)
                test.is_nil(batch_err)
                test.not_nil(batch)
                local running = 0
                for _, id in ipairs(ids) do
                    if row_of(db, id).status == job_types.JOB_STATE.RUNNING then
                        running = running + 1
                    end
                end
                test.eq(running, 1)
                test.eq(row_of(db, plain_id).status, job_types.JOB_STATE.RUNNING)
            end)
        end)

        test.it("normalizes an empty concurrency key to NULL on enqueue", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local id, err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "claim_test" },
                    thread_id = thread_id, job_type = "test.empty.enqueue",
                    concurrency_key = "",
                })
                test.is_nil(err)
                local rows = sql.builder.select("concurrency_key"):from("kickside_job")
                    :where(sql.builder.eq({ id = id })):run_with(db):query()
                test.is_nil(rows[1].concurrency_key)
                local _, cleanup_err = sql.builder.update("kickside_job")
                    :set("status", "cancelled")
                    :where(sql.builder.eq({ id = id })):run_with(db):exec()
                test.is_nil(cleanup_err)
            end)
        end)

        test.it("borrows spare capacity in FIFO schedule order", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local function at(year: integer): string
                    if dbtype == sql.type.SQLITE then
                        return string.format("%04d-01-01 00:00:00", year)
                    end
                    return string.format("%04d-01-01T00:00:00Z", year)
                end
                local function add(tier: string, year: integer): string
                    local id, err = lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = { kind = "test", id = "claim_test" },
                        thread_id = thread_id, job_type = "test.spare." .. uuid.v7(),
                        queue_tier = tier, scheduled_at = at(year),
                    })
                    test.is_nil(err)
                    return id :: string
                end
                local newer_backfill = add("backfill", 2004)
                local live_old = add("live", 2001)
                local live_new = add("live", 2003)
                local maint = add("maintenance", 2002)
                local older_backfill = add("backfill", 2000)
                local batch, batch_err = claim.claim_batch(db, dbtype, 4)
                test.is_nil(batch_err)
                test.eq(#batch, 4)
                local claimed: { [string]: boolean } = {}
                for _, job in ipairs(batch) do claimed[tostring(job.id)] = true end
                test.is_true(claimed[live_old] == true)
                test.is_true(claimed[live_new] == true)
                test.is_true(claimed[maint] == true)
                test.is_true(claimed[older_backfill] == true)
                test.is_nil(claimed[newer_backfill])
                local _, cleanup_err = sql.builder.update("kickside_job")
                    :set("status", "cancelled")
                    :where(sql.builder.eq({ queue_tier = "backfill" }))
                    :where("job_type LIKE 'test.spare.%'")
                    :run_with(db):exec()
                test.is_nil(cleanup_err)
            end)
        end)

    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
