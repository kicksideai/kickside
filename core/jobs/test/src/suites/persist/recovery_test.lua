-- Continuation crash recovery and mixed retained-path flows: a crash inside
-- the continuation transaction retains demand for a racing append, and
-- append, completion-with-events, and the retention sweep compose on one
-- thread. Each exercises the real transaction, no lease-expiry substitute.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local time = require("time")
local jobs = require("jobs")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")
local wake = require("wake")
local job_types = require("job_types")
local threads_writer = require("threads_writer")
local retention_notifier = require("retention_notifier")
local sweeper = require("sweeper")
local repo = require("repo")

local function define_tests()
    test.describe("jobs continuation recovery", function()
        -- A crash inside the continuation's final transaction rolls the whole
        -- transaction back: demand stays retained and no watcher advances. An
        -- append racing the failed commit bumps demand again, and the next
        -- continuation completes both generations. The crash is a real
        -- statement failure injected by a row trigger, not a lease expiry.
        test.it("a crash inside the continuation transaction retains demand for a racing append", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local is_postgres = dbtype == tostring(sql.type.POSTGRES)
            local key = "thread:" .. uuid.v7()
            local seed_tx = assert(db:begin())
            for i = 1, 205 do
                local id, enqueue_err = lifecycle.enqueue_job(seed_tx, dbtype, {
                    owner_locator = { kind = "test", id = "recovery_test" },
                    job_identity = { namespace = "drive", scope = key, key = tostring(i) },
                    job_type = "test.watcher", wake_key = key, parked = true,
                })
                test.is_nil(enqueue_err)
                test.not_nil(id)
            end
            local _, seed_commit_err = seed_tx:commit()
            test.is_nil(seed_commit_err)
            local wake_result, wake_err = job_fixture.wake_key(db, dbtype, key)
            test.is_nil(wake_err)
            test.eq(wake_result.touched_count, 200)
            local identity = lifecycle.identity_parts({
                job_type = "test.watcher",
                job_identity = { namespace = "wake", scope = key, key = "continuation" },
            }, "unused")
            local rows = sql.builder.select("id", "payload")
                :from("kickside_job"):where(sql.builder.eq({ job_identity = identity }))
                :run_with(db):query()
            test.eq(#rows, 1)
            local continuation = rows[1]

            local sfx = string.gsub(uuid.v7(), "-", "_")
            local crash_trigger = "trg_crash_" .. sfx
            local crash_fn = "fn_crash_" .. sfx
            if is_postgres then
                local _, fn_err = db:execute([[CREATE FUNCTION ]] .. crash_fn .. [[() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'injected crash'; RETURN NEW; END;$$]])
                test.is_nil(fn_err)
                local _, trg_err = db:execute([[CREATE TRIGGER ]] .. crash_trigger .. [[ BEFORE UPDATE ON kickside_job FOR EACH ROW WHEN (OLD.wake_key = ']] .. key .. [[' AND OLD.wake_generation IS DISTINCT FROM NEW.wake_generation) EXECUTE FUNCTION ]] .. crash_fn .. [[()]])
                test.is_nil(trg_err)
            else
                local _, trg_err = db:execute([[CREATE TRIGGER ]] .. crash_trigger .. [[ BEFORE UPDATE ON kickside_job FOR EACH ROW WHEN NEW.wake_key = ']] .. key .. [[' AND NEW.wake_generation <> OLD.wake_generation BEGIN SELECT RAISE(ROLLBACK, 'injected crash'); END]])
                test.is_nil(trg_err)
            end

            local crashed, crash_err = wake.continue_job(db, dbtype, continuation)
            test.is_nil(crashed)
            test.not_nil(crash_err)
            test.is_true(errors.is(crash_err, is_postgres and errors.UNKNOWN or errors.INTERNAL))
            if is_postgres then test.is_nil(crash_err:retryable()) else test.is_false(crash_err:retryable()) end
            if not is_postgres then
                local details = crash_err:details()
                test.not_nil(details)
                test.eq(details.operation_error.kind, errors.INTERNAL)
                test.is_false(details.operation_error.retryable)
                test.eq(details.operation_error.details.sqlite_code, 19)
                test.eq(details.operation_error.details.sqlite_extended_code, 1811)
            end
            local fanout = sql.builder.select("demand_generation", "ack_generation")
                :from("kickside_wake_fanout"):where(sql.builder.eq({ key = key }))
                :run_with(db):query()
            test.eq(tonumber(fanout[1].demand_generation), 1)
            test.eq(tonumber(fanout[1].ack_generation), 0)
            local untouched = sql.builder.select("id"):from("kickside_job")
                :where(sql.builder.eq({ wake_key = key }))
                :where("status IN ('pending','running')")
                :where("wake_generation < 1"):run_with(db):query()
            test.eq(#untouched, 5)
            local advanced = sql.builder.select("id"):from("kickside_job")
                :where(sql.builder.eq({ wake_key = key }))
                :where("wake_generation >= 2"):run_with(db):query()
            test.eq(#advanced, 0)
            local live = sql.builder.select("status"):from("kickside_job")
                :where(sql.builder.eq({ id = continuation.id })):run_with(db):query()
            test.eq(live[1].status, "pending")

            local _, drop_err = db:execute([[DROP TRIGGER ]] .. crash_trigger .. (is_postgres and [[ ON kickside_job]] or ""))
            test.is_nil(drop_err)
            if is_postgres then
                local _, drop_fn_err = db:execute([[DROP FUNCTION ]] .. crash_fn)
                test.is_nil(drop_fn_err)
            end
            local raced, race_err = job_fixture.wake_key(db, dbtype, key)
            test.is_nil(race_err)
            test.eq(raced.touched_count, 0)

            continuation.lease_token = uuid.v7()
            local _, lease_err = sql.builder.update("kickside_job")
                :set("status", "running")
                :set("lease_token", continuation.lease_token)
                :set("lease_until", lifecycle.future_string(dbtype, 60))
                :where(sql.builder.eq({ id = continuation.id, status = "pending" }))
                :run_with(db):exec()
            test.is_nil(lease_err)
            local second, second_err = wake.continue_job(db, dbtype, continuation)
            test.is_nil(second_err)
            test.not_nil(second)
            test.is_true(second.self_completed)
            test.eq(second.woken, 200)
            continuation.lease_token = uuid.v7()
            local _, retry_err = sql.builder.update("kickside_job")
                :set("status", "running")
                :set("lease_token", continuation.lease_token)
                :set("lease_until", lifecycle.future_string(dbtype, 60))
                :where(sql.builder.eq({ id = continuation.id, status = "pending" }))
                :run_with(db):exec()
            test.is_nil(retry_err)
            local final, final_err = wake.continue_job(db, dbtype, continuation)
            test.is_nil(final_err)
            test.eq(final.woken, 5)
            local settled = sql.builder.select("demand_generation", "ack_generation")
                :from("kickside_wake_fanout"):where(sql.builder.eq({ key = key }))
                :run_with(db):query()
            test.eq(tonumber(settled[1].demand_generation), 2)
            test.eq(tonumber(settled[1].ack_generation), 2)
            local unseen = sql.builder.select("id"):from("kickside_job")
                :where(sql.builder.eq({ wake_key = key }))
                :where("status IN ('pending','running')")
                :where("wake_generation < 2"):run_with(db):query()
            test.eq(#unseen, 0)
            sql.builder.update("kickside_job"):set("status", "cancelled")
                :where(sql.builder.eq({ wake_key = key })):run_with(db):exec()
            db:release()
        end)

        -- Append, completion-with-events, and the retention sweep share one
        -- thread in a single flow: the sweep prunes only the aged rows while
        -- the freshly appended and completed rows (and the success run)
        -- survive on every retained path.
        test.it("append, completion with events, and retention sweep compose on one thread", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local function ts(offset_days: number): string
                local at = time.now():add(offset_days * 24 * time.HOUR)
                if dbtype == tostring(sql.type.SQLITE) then
                    return at:utc():format(time.DATE_TIME)
                end
                return at:utc():format(time.RFC3339)
            end
            local thread_id = uuid.v7()
            local _, thread_err = sql.builder.insert("kickside_thread")
                :set_map({ id = thread_id, thread_class = "test", component_id = thread_id, event_count = 1 })
                :run_with(db):exec()
            test.is_nil(thread_err)
            -- Core's per-thread CRUD is event-only; Jobs prunes its own tables
            -- from its global policy window (default 30d), so the aged job
            -- below is set well past that window rather than through a
            -- per-thread Jobs override.
            local _, policy_err = repo.upsert(db, thread_id, { event_hot_retention_days = 30 })
            test.is_nil(policy_err)
            local _, aged_event_err = sql.builder.insert("kickside_event")
                :set_map({ id = uuid.v7(), thread_id = thread_id, type = "test.old", role = "user", body = "{}", seq = 1, created_at = ts(-60) })
                :run_with(db):exec()
            test.is_nil(aged_event_err)
            local aged_job_id = uuid.v7()
            local _, aged_job_err = sql.builder.insert("kickside_job")
                :set_map({ id = aged_job_id, job_identity = "4:test:mixed:" .. aged_job_id,
                    owner_kind = "thread", owner_id = thread_id,
                    thread_id = thread_id, job_type = "test", status = "done",
                    finished_at = ts(-90), scheduled_at = ts(-90), created_at = ts(-90) })
                :run_with(db):exec()
            test.is_nil(aged_job_err)

            local appended, append_err = threads_writer.ingest_events_batch(db, thread_id, {
                events = { { type = "test.mixed.append", body_json = "{\"n\":1}" } }, system = true,
            }, nil)
            test.is_nil(append_err)
            test.eq(appended.inserted, 1)

            local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "recovery_test" },
                parked = true,
                thread_id = thread_id,
                job_type = "test.mixed.complete",
                priority = 10000,
                payload = {},
            })
            test.is_nil(enqueue_err)
            local job, lease_err = job_fixture.lease_own(db, dbtype, job_id)
            if not job then error("test job lease fails: " .. tostring(lease_err)) end
            test.is_nil(lease_err)
            test.not_nil(job)
            test.eq(job.id, job_id)
            local run_ctx, run_err = lifecycle.start_job_run(db, dbtype, job, "test-pid", 1)
            test.is_nil(run_err)
            local tx = assert(db:begin())
            local _, event_err = threads_writer.append_system_tx(tx, dbtype, thread_id,
                { { type = "test.mixed.done", body_json = "{\"n\":2}" } }, job.id)
            test.is_nil(event_err)
            local _, complete_err = jobs.complete_tx(tx, job.id,
                { token = job.lease_token, execution_seq = job.execution_seq },
                { record = { status = "completed" } })
            test.is_nil(complete_err)
            local history_err = lifecycle.finalize_job_run(tx, dbtype, run_ctx,
                "completed", { status = "completed" }, { status = "completed" }, nil)
            test.is_nil(history_err)
            local _, commit_err = tx:commit()
            test.is_nil(commit_err)
            local _, notify_err = retention_notifier.notify({ kind = "events_appended", thread_id = thread_id })
            test.is_nil(notify_err)

            local stats, sweep_err = sweeper.run_for_thread(db, thread_id)
            test.is_nil(sweep_err)
            test.eq((stats :: table).events, 1)
            local _, jobs_sweep_err = jobs.retention_sweep()
            test.is_nil(jobs_sweep_err)

            local events = sql.builder.select("type")
                :from("kickside_event"):where(sql.builder.eq({ thread_id = thread_id }))
                :order_by("seq ASC"):run_with(db):query()
            test.eq(#events, 2)
            test.eq(events[1].type, "test.mixed.append")
            test.eq(events[2].type, "test.mixed.done")
            local jobs = sql.builder.select("id", "status")
                :from("kickside_job"):where(sql.builder.eq({ thread_id = thread_id }))
                :run_with(db):query()
            test.eq(#jobs, 1)
            test.eq(jobs[1].id, job_id)
            test.eq(jobs[1].status, "done")
            local runs = sql.builder.select("status")
                :from("kickside_job_run"):where(sql.builder.eq({ job_id = job_id }))
                :run_with(db):query()
            test.eq(#runs, 1)
            test.eq(runs[1].status, "completed")
            db:release()
        end)

    end)
end

local run_cases = test.run_cases(define_tests)

local function run(options)
    return run_cases(options)
end

return { run = run }
