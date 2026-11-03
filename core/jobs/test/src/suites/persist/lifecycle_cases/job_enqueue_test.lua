local threads_writer = require("threads_writer")
local retention_notifier = require("retention_notifier")
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

-- The producing owner publishes its event with enqueue in one transaction.
local function enqueue_with_event(db: sql.DB, params: table): (table?, error?)
    local dbtype = tostring(db:type())
    local tx = assert(db:begin())
    local event = params.thread_event
    params.thread_event = nil
    event.body_json = assert(json.encode(event.body))
    event.body = nil
    event.trace_context = params.trace_context
    local _, append_err = threads_writer.append_system_tx(tx, dbtype, params.thread_id, { event })
    if append_err then tx:rollback(); return nil, append_err end
    local result, enqueue_err = jobs.enqueue_tx(tx, dbtype, params)
    if enqueue_err then tx:rollback(); return nil, enqueue_err end
    if result.existing then tx:rollback(); return result, nil end
    local _, commit_err = tx:commit()
    if commit_err then return nil, commit_err end
    local _, notify_err = retention_notifier.notify({ kind = "events_appended", thread_id = params.thread_id })
    return result, notify_err
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
    test.describe("jobs.lifecycle enqueue", function()
        test.it("retains native trace refusals without enqueueing a job", function()
            with_db(function(db: sql.DB)
                local key = uuid.v7()
                local id, err = lifecycle.enqueue_job(db, tostring(db:type()), {
                    owner_locator = { kind = "test", id = key },
                    job_identity = { namespace = "test", scope = "trace-refusal", key = key },
                    job_type = "test.trace-refusal", payload = {}, trace_context = { run_id = "only-run" },
                })
                test.is_nil(id)
                test.is_true(errors.is(err, errors.INVALID))
                test.is_false(err:retryable())
                test.eq(err:details().code, "trace_context_trace_id_required")
                local rows, read_err = db:query("SELECT COUNT(*) AS n FROM kickside_job WHERE owner_id=$1", { key })
                test.is_nil(read_err)
                test.eq(tonumber(rows[1].n), 0)
            end)
        end)
        test.it("exposes control acknowledgement and execution progress through public reads", function()
            with_db(function(db)
                local kind = "test.public-observe:" .. uuid.v7()
                local id = assert(jobs.enqueue({namespace = "public-observe", scope = "test", key = uuid.v7(),
                    owner_locator = {kind = "test", id = "public-observe"}, job_type = kind,
                    slot = true, immutable_payload = {}})).id
                local current = assert(jobs.get_job(id))
                test.eq(tonumber(current.execution_seq), 0)
                test.not_nil(current.wake_enabled)
                test.not_nil(current.wake_control_pending)
                local rows = assert(claim.claim_batch(db, tostring(db:type()), 1, "live",
                    {live = 1, maintenance = 0, backfill = 0}, nil, {kind}))
                test.eq(#rows, 1)
                test.eq(rows[1].id, id)
                local lease = {token = rows[1].lease_token, execution_seq = rows[1].execution_seq}
                test.is_true(assert(jobs.wake_job(id, {control = true})).woken)
                current = assert(jobs.get_job(id))
                test.eq(current.status, "running")
                test.is_true(current.wake_control_pending == true or tonumber(current.wake_control_pending) == 1)
                test.eq(tonumber(current.execution_seq), lease.execution_seq)
                test.is_nil(select(2, jobs.complete(id, lease, {})))
                current = assert(jobs.get_job(id))
                test.eq(current.status, "pending")
                test.is_false(current.wake_control_pending == true or tonumber(current.wake_control_pending) == 1)
                test.is_true(current.wake_enabled == true or tonumber(current.wake_enabled) == 1)
                test.is_nil(select(2, jobs.cancel(id)))
            end)
        end)
        test.it("rejects malformed scheduled timestamps before enqueueing", function()
            with_db(function(db)
                local id, err = lifecycle.enqueue_job(db, tostring(db:type()), {
                    owner_locator = { kind = "test", id = "deadline-validation" },
                    job_identity = { namespace = "test", scope = "deadline", key = uuid.v7() },
                    job_type = "test.deadline", payload = {}, scheduled_at = "not-a-timestamp",
                })
                test.is_nil(id)
                test.is_true(errors.is(err, errors.INVALID))
            end)
        end)

        test.it("normalizes zoned SQL and RFC deadlines to the same UTC instant", function()
            with_db(function(db)
                local dbtype = tostring(db:type())
                for _, stamp in ipairs({ "2026-10-02 12:00:10.123456-04:00", "2026-10-02T12:00:10.123456-04:00" }) do
                    local id, err = lifecycle.enqueue_job(db, dbtype, {
                        owner_locator = { kind = "test", id = "deadline-normalization" },
                        job_identity = { namespace = "test", scope = "deadline", key = uuid.v7() },
                        job_type = "test.deadline", payload = {}, scheduled_at = stamp,
                    })
                    test.is_nil(err)
                    local cutoff, cutoff_err = proc_supervisor.parse_deadline("2026-10-02T13:00:00Z")
                    test.is_nil(cutoff_err)
                    local projection = dbtype == sql.type.POSTGRES
                        and [[to_char(scheduled_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')]] or "scheduled_at"
                    local rows, read_err = db:query("SELECT " .. projection .. " AS stored_at FROM kickside_job WHERE id=$1 AND scheduled_at > $2", {
                        id, lifecycle.format_time(dbtype, cutoff) })
                    test.is_nil(read_err)
                    test.eq(#rows, 1, "the UTC deadline remains later than the cutoff")
                    local parsed, parse_err = proc_supervisor.parse_deadline(rows[1].stored_at)
                    test.is_nil(parse_err)
                    test.eq(parsed:utc():format("2006-01-02T15:04:05.000000Z07:00"), "2026-10-02T16:00:10.123456Z")
                end
            end)
        end)

        test.it("stores RFC3339 deadlines in the database clock shape", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local instant = time.now():utc():add(-time.SECOND)
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "deadline" },
                job_identity = { namespace = "test", scope = "deadline", key = uuid.v7() },
                job_type = "test.deadline", payload = {}, scheduled_at = instant:format_rfc3339(),
            })
            local due, due_err = db:query("SELECT id FROM kickside_job WHERE id=$1 AND scheduled_at <= $2", {
                id, lifecycle.now_string(dbtype) })
            local _, remove_err = db:execute("DELETE FROM kickside_job WHERE id=$1", { id })
            db:release()
            test.is_nil(enqueue_err)
            test.is_nil(due_err)
            test.is_nil(remove_err)
            test.eq(#due, 1, "a deadline in the past is claimable today")
        end)

        test.it("enqueues a pending job", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local id, err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    thread_id = thread_id,
                    job_type = "test.enqueue",
                    payload = { n = 1 },
                })
                test.is_nil(err)
                test.not_nil(id)
                test.eq(job_status(db, id), job_types.JOB_STATE.PENDING)
            end)
        end)

        test.it("packs trace_context into the durable job payload", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local id, err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    thread_id = thread_id,
                    job_type = "test.trace",
                    payload = { n = 1 },
                    trace_context = {
                        trace_id = "trace-job",
                        run_id = "run-job",
                        correlation_key = "kb:123:source:abc",
                    },
                })
                test.is_nil(err)
                test.not_nil(id)

                local rows = sql.builder.select("payload"):from("kickside_job")
                    :where(sql.builder.eq({ id = id })):run_with(db):query()
                local payload = json.decode(tostring(rows[1].payload))
                test.eq(payload.n, 1)
                test.eq(payload.trace_context.trace_id, "trace-job")
                test.eq(payload.trace_context.run_id, "run-job")
                test.eq(payload.trace_context.correlation_key, "kb:123:source:abc")
            end)
        end)

        test.it("stores the generic worker binding and refuses a job-carried execution identity", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local id, err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    thread_id = thread_id,
                    job_type = "test.worker_ref",
                    worker_ref = "func://kickside.test:worker",
                    concurrency_key = "component:uploads:test-user",
                })
                test.is_nil(err)
                test.not_nil(id)
                local rows = sql.builder.select("worker_ref", "concurrency_key", "actor_id"):from("kickside_job")
                    :where(sql.builder.eq({ id = id })):run_with(db):query()
                test.eq(rows[1].worker_ref, "func://kickside.test:worker")
                test.eq(rows[1].concurrency_key, "component:uploads:test-user")
                test.is_nil(rows[1].actor_id)

                for _, carried in ipairs({ { actor_id = "actor-1" }, { actor_context = "{}" } }) do
                    local params: { [string]: any } = {
                        owner_locator = { kind = "test", id = "lifecycle_test" },
                        thread_id = thread_id,
                        job_type = "test.worker_ref",
                        worker_ref = "func://kickside.test:worker",
                        idempotency_key = "carried-" .. tostring(next(carried)),
                    }
                    for key, value in pairs(carried) do params[key] = value end
                    local refused_id, refused_err = lifecycle.enqueue_job(db, dbtype, params)
                    test.is_nil(refused_id)
                    test.not_nil(refused_err)
                    test.eq((refused_err :: error):kind(), errors.INVALID)
                end
            end)
        end)

        test.it("defaults max_attempts to the configured default", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local id, err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    thread_id = thread_id,
                    job_type = "test.default_attempts",
                })
                test.is_nil(err)
                test.not_nil(id)

                local rows = sql.builder.select("max_attempts"):from("kickside_job")
                    :where(sql.builder.eq({ id = id })):run_with(db):query()
                test.eq(tonumber(rows[1].max_attempts), (config.policy() :: any).retry_max_attempts,
                    "an unspecified max_attempts must use the configured default")
            end)
        end)

        test.it("returns the existing id for a duplicate active identity", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local thread_id = make_thread(db)
                local key = "idem-" .. uuid.v7()
                local first = lifecycle.enqueue_job(db, dbtype, { thread_id = thread_id, job_type = "test.enqueue",
                    owner_locator = { kind = "test", id = "lifecycle_test" }, idempotency_key = key })
                test.not_nil(first)
                local second, err = lifecycle.enqueue_job(db, dbtype, { thread_id = thread_id, job_type = "test.enqueue",
                    owner_locator = { kind = "test", id = "lifecycle_test" }, idempotency_key = key })
                test.is_nil(err)
                test.eq(second, first)

                local rows = sql.builder.select("id"):from("kickside_job")
                    :where(sql.builder.eq({ thread_id = thread_id, idempotency_key = key })):run_with(db):query()
                test.eq(#rows, 1)
            end)
        end)

        test.it("keeps one active threadless slot for repeated enqueue", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local key = "slot-" .. uuid.v7()
                local params = {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    job_identity = { namespace = "drive", scope = "automation-1", key = key },
                    job_type = "test.slot",
                    payload = { drive_key = key },
                }
                local first, first_err = lifecycle.enqueue_job(db, dbtype, params)
                test.is_nil(first_err)
                test.not_nil(first)
                local second, second_err = lifecycle.enqueue_job(db, dbtype, params)
                test.is_nil(second_err)
                test.eq(second, first)
                local rows = sql.builder.select("id", "thread_id", "job_identity")
                    :from("kickside_job")
                    :where(sql.builder.eq({ id = first }))
                    :run_with(db):query()
                test.eq(#rows, 1)
                test.is_nil(rows[1].thread_id)
                test.not_nil(rows[1].job_identity)
            end)
        end)

        test.it("rejects a changed immutable payload for an active identity", function()
            with_db(function(db: sql.DB)
                local dbtype = tostring(db:type())
                local identity = { namespace = "drive", scope = "automation-2", key = uuid.v7() }
                local first, first_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    job_identity = identity, job_type = "test.slot", payload = { value = 1 },
                })
                test.is_nil(first_err)
                test.not_nil(first)
                local second, second_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    job_identity = identity, job_type = "test.slot", payload = { value = 2 },
                })
                test.is_nil(second)
                test.not_nil(second_err)
            end)
        end)

        test.it("atomically appends one event and rejects a ghost event on active duplicate", function()
            with_db(function(db: sql.DB)
                local thread_id = make_thread(db)
                local key = "event-" .. uuid.v7()
                local enqueued, enqueue_err = enqueue_with_event(db, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    namespace = "thread", scope = thread_id, key = key,
                    thread_id = thread_id,
                    job_type = "app:generic_job_target",
                    immutable_payload = { upload_id = "upload-1" },
                    trace_context = {
                        trace_id = "trace-enqueue",
                        run_id = "run-enqueue",
                        correlation_key = "upload:upload-1",
                    },
                    thread_event = {
                        type = "test.job.queued",
                        body = { upload_id = "upload-1" },
                        external = {
                            external_source = "test.jobs",
                            external_id = "upload-1",
                            external_version = "test.job.queued",
                        },
                    },
                })
                test.is_nil(enqueue_err)
                test.not_nil(enqueued)
                local job_id = enqueued.id

                local event_rows = sql.builder.select("type", "body", "trace_id", "run_id", "correlation_key")
                    :from("kickside_event")
                    :where(sql.builder.eq({ thread_id = thread_id }))
                    :run_with(db):query()
                test.eq(#event_rows, 1)
                test.eq(event_rows[1].type, "test.job.queued")
                local body = json.decode(tostring(event_rows[1].body))
                test.eq(body.upload_id, "upload-1")
                test.eq(event_rows[1].trace_id, "trace-enqueue")
                test.eq(event_rows[1].run_id, "run-enqueue")
                test.eq(event_rows[1].correlation_key, "upload:upload-1")

                local duplicate, dup_err = enqueue_with_event(db, {
                    owner_locator = { kind = "test", id = "lifecycle_test" },
                    namespace = "thread", scope = thread_id, key = key,
                    thread_id = thread_id,
                    job_type = "app:generic_job_target",
                    immutable_payload = { upload_id = "upload-1" },
                    thread_event = {
                        type = "test.job.queued",
                        body = { upload_id = "upload-1" },
                        external = {
                            external_source = "test.jobs",
                            external_id = "upload-2",
                            external_version = "test.job.queued",
                        },
                    },
                })
                test.is_nil(dup_err)
                test.eq(duplicate.id, job_id)

                local duplicate_rows = sql.builder.select("id", "external_id")
                    :from("kickside_event")
                    :where(sql.builder.eq({ thread_id = thread_id, type = "test.job.queued" }))
                    :run_with(db):query()
                test.eq(#duplicate_rows, 1)
                test.eq(duplicate_rows[1].external_id, "upload-1")
            end)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
