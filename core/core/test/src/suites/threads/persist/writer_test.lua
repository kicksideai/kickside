-- Threads writer behavior, exercised under a real actor by driving the event /
-- thread method funcs (so the component-contract WRITE check resolves the actor).
-- Covers: monotonic seq on a message append, external-identity dedup, batch insert with
-- explicit + auto seq and duplicate counting, and that a non-member is denied WRITE.
-- Direct kickside_event reads assert the persisted rows. Runs on SQLite and
-- PostgreSQL.

local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local security = require("security")
local funcs = require("funcs")
local contract = require("contract")
local jobs = require("jobs")
local projection_writer = require("projection_writer")
local writer = require("writer")
local process = require("process")
local channel = require("channel")

local DB = "app:db"
local THREADS = "kickside.core:threads"
-- The event endpoints are HTTP handlers, so the writer is driven through the
-- test_ops callables (value-returning wrappers over the writer library) under a
-- scoped runner so the component-contract WRITE check resolves the actor.
local POST = "app:test_post_message"
local INGEST = "app:test_ingest_events_batch"
local MULTI = "app:test_ingest_multi"

local function define_tests()
    test.describe("Threads Writer", function()
        local suffix = uuid.v4():sub(1, 8)
        local owner = "tw-owner-" .. suffix
        local stranger = "tw-stranger-" .. suffix

        local function test_scope()
            local pol, perr = security.policy("app:test_scope_policy")
            if not pol then error("test policy missing: " .. tostring(perr)) end
            return security.new_scope({ pol })
        end

        local function run_as(user_id, target, args)
            local actor = security.new_actor(user_id, { security_groups = {} })
            return funcs.new()
                :with_actor(actor)
                :with_scope(test_scope())
                :call(target, args)
        end

        local function as_owner(target, args)
            return run_as(owner, target, args)
        end

        -- Open the threads contract framed as the given user.
        local function open_threads(user_id)
            local actor = security.new_actor(user_id, { security_groups = {} })
            local svc, cerr = contract.get(THREADS)
            if cerr or not svc then error("threads contract unavailable: " .. tostring(cerr)) end
            local inst, oerr = svc:with_actor(actor):with_scope(test_scope()):open()
            if oerr or not inst then error("open threads contract failed: " .. tostring(oerr)) end
            return inst
        end

        -- Open a thread to write into.
        local function new_thread()
            local res, err = open_threads(owner):create({ thread_class = "tw_" .. suffix })
            if err then error("create failed: " .. tostring(err)) end
            return res.thread_id
        end

        -- Direct event read for seq/dedup assertions.
        local function events_of(thread_id)
            local d, e = sql.get(DB)
            if e then error(tostring(e)) end
            local rows, qerr = sql.builder.select("id", "seq", "type", "external_source", "external_id")
                :from("kickside_event")
                :where("thread_id = ?", thread_id)
                :order_by("seq ASC")
                :run_with(d):query()
            d:release()
            if qerr then error(tostring(qerr)) end
            return rows or {}
        end

        for _, subscribed in ipairs({ false, true }) do
            test.it("notifies the pool only when committed append wakes subscribed work: " .. tostring(subscribed), function()
                local thread_id = new_thread()
                local job_id: string? = nil
                if subscribed then
                    local queued, enqueue_err = jobs.enqueue({
                        owner_locator = { kind = "test", id = "writer_notification" },
                        namespace = "drive", scope = "test", key = uuid.v7(),
                        job_type = "app:test_count_worker", immutable_payload = {},
                        wake_key = "thread:" .. thread_id, parked = true,
                    })
                    test.is_nil(enqueue_err)
                    if not queued then error("watcher is absent") end
                    job_id = queued.id
                end
                local mailbox, listen_err = process.listen("kickside.core.jobs:wake", { message = true })
                test.is_nil(listen_err)
                if not mailbox then error("wake mailbox is absent") end
                local _, register_err = process.registry.register("kickside.core.jobs.worker_pool", nil, process.registry.CONSISTENT)
                test.is_nil(register_err)
                local db, db_err = sql.get(DB)
                test.is_nil(db_err)
                if not db then error("database is absent") end
                local result, append_err = writer.append_system(db, thread_id, { { type = "app:threads_note", body_json = "{}" } })
                db:release()
                local notice = channel.select({ mailbox:case_receive(), default = true })
                local _, unregister_err = process.registry.unregister("kickside.core.jobs.worker_pool", process.registry.CONSISTENT)
                process.unlisten(mailbox)
                if job_id then
                    local _, cancel_err = jobs.cancel(job_id)
                    test.is_nil(cancel_err)
                end
                test.is_nil(unregister_err)
                test.is_nil(append_err)
                test.not_nil(result)
                test.eq(notice.channel == mailbox, subscribed)
                local read_db = assert(sql.get(DB))
                local rows, read_err = read_db:query("SELECT demand_generation,ack_generation FROM kickside_wake_fanout WHERE key=$1", { "thread:" .. thread_id })
                read_db:release()
                test.is_nil(read_err)
                test.eq(tonumber(rows[1].demand_generation), 1)
                test.eq(tonumber(rows[1].ack_generation), 1)
            end)
        end

        test.it("a message append assigns monotonic seq", function()
            local thread_id = new_thread()
            local first, e1 = as_owner(POST, { thread_id = thread_id, text = "one" })
            test.is_nil(e1)
            test.is_true(first.ok)
            local second, e2 = as_owner(POST, { thread_id = thread_id, text = "two" })
            test.is_nil(e2)
            test.is_true(second.ok)

            local rows = events_of(thread_id)
            test.eq(#rows, 2)
            test.eq(tonumber(rows[1].seq), 1)
            test.eq(tonumber(rows[2].seq), 2)
        end)

        test.it("a message append publishes durable wake demand for a parked watcher", function()
            local thread_id = new_thread()
            local wake_key = "thread:" .. thread_id
            local enqueued, enqueue_err = jobs.enqueue({
                owner_locator = { kind = "test", id = "writer_test" },
                namespace = "drive", scope = "test", key = uuid.v7(),
                job_type = "app:test_count_worker", immutable_payload = {},
                wake_key = wake_key, parked = true,
            })
            test.is_nil(enqueue_err)
            test.not_nil(enqueued)
            local job_id = enqueued.id
            local result, append_err = as_owner(POST, { thread_id = thread_id, text = "wake" })
            test.is_nil(append_err)
            test.is_true(result.ok)
            local db, db_err = sql.get(DB)
            test.is_nil(db_err)
            local job_rows = sql.builder.select("scheduled_at", "wake_generation")
                :from("kickside_job"):where(sql.builder.eq({ id = job_id }))
                :run_with(db):query()
            local fanout_rows = sql.builder.select("demand_generation", "ack_generation")
                :from("kickside_wake_fanout"):where(sql.builder.eq({ key = wake_key }))
                :run_with(db):query()
            db:release()
            jobs.cancel(job_id)
            test.eq(#job_rows, 1)
            test.not_nil(job_rows[1].scheduled_at)
            test.eq(tonumber(job_rows[1].wake_generation), 1)
            test.eq(tonumber(fanout_rows[1].demand_generation), 1)
            test.eq(tonumber(fanout_rows[1].ack_generation), 1)
        end)

        test.it("multi-thread append wakes a parked watcher", function()
            local thread_id = new_thread()
            local enqueued, enqueue_err = jobs.enqueue({
                owner_locator = { kind = "test", id = "writer_test" },
                namespace = "drive", scope = "test", key = uuid.v7(),
                job_type = "app:test_count_worker", immutable_payload = {},
                wake_key = "thread:" .. thread_id, parked = true,
            })
            test.is_nil(enqueue_err)
            local job_id = enqueued.id
            local result, append_err = as_owner(MULTI, { writes = {
                { thread_id = thread_id, events = { { type = "app:threads_note", body_json = "{}" } } },
            } })
            test.is_nil(append_err)
            test.is_true(result.ok)
            test.eq(result.result[1].inserted, 1)

            local read_db, read_err = sql.get(DB)
            test.is_nil(read_err)
            local rows, rows_err = sql.builder.select("wake_generation", "scheduled_at")
                :from("kickside_job"):where(sql.builder.eq({ id = job_id }))
                :run_with(read_db):query()
            read_db:release()
            test.is_nil(rows_err)
            test.eq(tonumber(rows[1].wake_generation), 1)
            test.not_nil(rows[1].scheduled_at)
        end)

        test.it("a message append dedups on the external identity triple", function()
            local thread_id = new_thread()
            local payload = {
                thread_id = thread_id,
                text = "synced",
                external = { external_source = "github", external_id = "issue-1", external_version = "v1" },
            }
            local first, e1 = as_owner(POST, payload)
            test.is_nil(e1)
            test.is_true(first.ok)
            test.is_false(first.result.duplicate == true)

            local second, e2 = as_owner(POST, payload)
            test.is_nil(e2)
            test.is_true(second.ok)
            test.is_true(second.result.duplicate == true)

            -- Only one event persisted.
            local rows = events_of(thread_id)
            test.eq(#rows, 1)
        end)

        test.it("ingest_events_batch inserts, auto-sequences, and counts duplicates", function()
            local thread_id = new_thread()
            local event_id = uuid.v7()
            local res, err = as_owner(INGEST, {
                thread_id = thread_id,
                events = {
                    { id = event_id, type = "app:threads_note", body_json = "{\"n\":1}" },
                    { type = "app:threads_note", body_json = "{\"n\":2}" },
                },
            })
            test.is_nil(err)
            test.is_true(res.ok)
            test.eq(res.result.inserted, 2)
            test.eq(res.result.max_seq, 2)

            -- Re-ingest the same explicit id: counted as a duplicate, not inserted.
            local again, aerr = as_owner(INGEST, {
                thread_id = thread_id,
                events = { { id = event_id, type = "app:threads_note", body_json = "{\"n\":1}" } },
            })
            test.is_nil(aerr)
            test.is_true(again.ok)
            test.eq(again.result.inserted, 0)
            test.eq(again.result.duplicates, 1)
        end)

        test.it("replays a duplicate ingest and keeps appending new events", function()
            local thread_id = new_thread()
            local event_id = uuid.v7()
            local input = { thread_id = thread_id,
                events = { { id = event_id, type = "note", body_json = "{\"n\":1}" } } }
            local first, first_err = as_owner(INGEST, input)
            test.is_nil(first_err)
            test.is_true(first.ok)
            local replay, replay_err = as_owner(INGEST, input)
            test.is_nil(replay_err)
            test.is_true(replay.ok)
            test.eq(replay.result.duplicates, 1)
            local next_event, next_err = as_owner(INGEST, { thread_id = thread_id,
                events = { { type = "note", body_json = "{}" } } })
            test.is_nil(next_err)
            test.is_true(next_event.ok)
            test.eq(next_event.result.inserted, 1)
            test.eq(#events_of(thread_id), 2)
            local visible = as_owner("app:test_get_thread", { thread_id = thread_id })
            test.is_true(visible.ok)
            test.is_nil(visible.result.retention_status)
            test.is_nil(visible.result.retention_usage)
        end)

        -- The external-identity dedup keys on the event TYPE too. A KB document
        -- delete reuses the upserted document's external_version; without type in
        -- the key it collided with the content.upserted event and was silently
        -- dropped, so the doc never deleted and the UI spun forever.
        test.it("dedup keys on type: a delete with an upsert's external identity is still inserted", function()
            local thread_id = new_thread()
            local ext = { external_source = "knowledge.kb", external_id = "content:doc-1", external_version = "v-hash-1" }
            local up, uerr = as_owner(INGEST, {
                thread_id = thread_id,
                events = { { type = "content.upserted", body_json = "{}", external = ext } },
            })
            test.is_nil(uerr); test.is_true(up.ok); test.eq(up.result.inserted, 1)

            -- Same external identity, DIFFERENT type -> not a duplicate, must insert.
            local del, derr = as_owner(INGEST, {
                thread_id = thread_id,
                events = { { type = "content.deleted", body_json = "{}", external = ext } },
            })
            test.is_nil(derr); test.is_true(del.ok)
            test.eq(del.result.inserted, 1)
            test.eq(del.result.duplicates, 0)

            -- Same external identity, SAME type -> still deduped (idempotency preserved).
            local again = as_owner(INGEST, {
                thread_id = thread_id,
                events = { { type = "content.upserted", body_json = "{}", external = ext } },
            })
            test.is_true(again.ok)
            test.eq(again.result.inserted, 0)
            test.eq(again.result.duplicates, 1)
        end)

        test.it("a non-member cannot write to the thread", function()
            local thread_id = new_thread()
            local res = run_as(stranger, POST, { thread_id = thread_id, text = "intruder" })
            test.not_nil(res)
            test.is_false(res.ok == true)
        end)

        -- Threads sort below/above by id while their watchers carry the
        -- opposite id order. The append must acquire wake rows in key order
        -- and job rows in ascending id order across the whole transaction;
        -- per-thread wake locking (F_lo,J_big,F_hi,J_small) reverses the job
        -- edge and breaks the section 14 proof. Scratch triggers record the
        -- statement order the engine issues.
        test.it("multi-thread append wakes in global key then job-id order", function()
            local first_thread = new_thread()
            local second_thread = new_thread()
            local lo = first_thread < second_thread and first_thread or second_thread
            local hi = first_thread < second_thread and second_thread or first_thread
            local function enqueue_watcher(thread_id)
                local enqueued, enqueue_err = jobs.enqueue({
                    owner_locator = { kind = "test", id = "writer_test" },
                    namespace = "drive", scope = "test", key = uuid.v7(),
                    job_type = "app:test_count_worker", immutable_payload = {},
                    wake_key = "thread:" .. thread_id,
                    parked = true,
                })
                if enqueue_err then error(tostring(enqueue_err)) end
                return enqueued.id
            end
            local hi_job = enqueue_watcher(hi)
            local lo_job = enqueue_watcher(lo)
            if not (hi_job < lo_job) then error("watcher ids do not reverse thread order") end

            local probe, probe_err = sql.get(DB)
            if probe_err then error(tostring(probe_err)) end
            local dbtype = tostring(probe:type())
            probe:release()
            local sfx = string.gsub(uuid.v7(), "-", "_")
            local log_table = "kickside_test_wake_order_" .. sfx
            local fanout_trigger = "trg_fanout_" .. sfx
            local fanout_insert_trigger = "trg_fanout_insert_" .. sfx
            local job_trigger = "trg_job_" .. sfx
            local fanout_fn = "fn_fanout_" .. sfx
            local job_fn = "fn_job_" .. sfx
            local is_postgres = tostring(sql.type.POSTGRES) == dbtype
            local statements: { string }
            if is_postgres then
                statements = {
                    [[CREATE TABLE ]] .. log_table .. [[ (seq SERIAL PRIMARY KEY, kind TEXT NOT NULL, entry_key TEXT NOT NULL)]],
                    [[CREATE FUNCTION ]] .. fanout_fn .. [[() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN IF TG_OP = 'INSERT' THEN INSERT INTO ]] .. log_table .. [[(kind, entry_key) VALUES ('fanout', NEW.key); ELSIF NEW.demand_generation <> OLD.demand_generation THEN INSERT INTO ]] .. log_table .. [[(kind, entry_key) VALUES ('fanout', NEW.key); END IF; RETURN NEW; END;$$]],
                    [[CREATE TRIGGER ]] .. fanout_trigger .. [[ AFTER INSERT OR UPDATE ON kickside_wake_fanout FOR EACH ROW EXECUTE FUNCTION ]] .. fanout_fn .. [[()]],
                    [[CREATE FUNCTION ]] .. job_fn .. [[() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN IF NEW.wake_generation <> OLD.wake_generation THEN INSERT INTO ]] .. log_table .. [[(kind, entry_key) VALUES ('job', NEW.id); END IF; RETURN NEW; END;$$]],
                    [[CREATE TRIGGER ]] .. job_trigger .. [[ AFTER UPDATE ON kickside_job FOR EACH ROW EXECUTE FUNCTION ]] .. job_fn .. [[()]],
                }
            else
                statements = {
                    [[CREATE TABLE ]] .. log_table .. [[ (seq INTEGER PRIMARY KEY, kind TEXT NOT NULL, entry_key TEXT NOT NULL)]],
                    [[CREATE TRIGGER ]] .. fanout_insert_trigger .. [[ AFTER INSERT ON kickside_wake_fanout FOR EACH ROW BEGIN INSERT INTO ]] .. log_table .. [[(kind, entry_key) VALUES ('fanout', NEW.key); END]],
                    [[CREATE TRIGGER ]] .. fanout_trigger .. [[ AFTER UPDATE ON kickside_wake_fanout FOR EACH ROW WHEN (NEW.demand_generation <> OLD.demand_generation) BEGIN INSERT INTO ]] .. log_table .. [[(kind, entry_key) VALUES ('fanout', NEW.key); END]],
                    [[CREATE TRIGGER ]] .. job_trigger .. [[ AFTER UPDATE ON kickside_job FOR EACH ROW WHEN (NEW.wake_generation <> OLD.wake_generation) BEGIN INSERT INTO ]] .. log_table .. [[(kind, entry_key) VALUES ('job', NEW.id); END]],
                }
            end
            local setup_db, setup_err = sql.get(DB)
            if setup_err then error(tostring(setup_err)) end
            for _, statement in ipairs(statements) do
                local _, ddl_err = setup_db:execute(statement)
                if ddl_err then setup_db:release(); error(tostring(ddl_err)) end
            end
            setup_db:release()

            local res, err = as_owner(MULTI, { writes = {
                { thread_id = hi, events = { { type = "app:threads_note", body_json = "{\"n\":1}" } } },
                { thread_id = lo, events = { { type = "app:threads_note", body_json = "{\"n\":2}" } } },
            } })
            test.is_nil(err)
            test.is_true(res.ok)
            test.eq(#res.result, 2)

            local read_db, read_err = sql.get(DB)
            if read_err then error(tostring(read_err)) end
            local order_rows, order_err = sql.builder.select("kind", "entry_key")
                :from(log_table):order_by("seq ASC"):run_with(read_db):query()
            local job_rows, job_err = sql.builder.select("id", "scheduled_at", "wake_generation")
                :from("kickside_job"):where(sql.builder.eq({ id = hi_job }))
                :run_with(read_db):query()
            local lo_rows, lo_err = sql.builder.select("id", "scheduled_at", "wake_generation")
                :from("kickside_job"):where(sql.builder.eq({ id = lo_job }))
                :run_with(read_db):query()
            local drops = {
                [[DROP TRIGGER ]] .. job_trigger .. (is_postgres and [[ ON kickside_job]] or ""),
                [[DROP TRIGGER ]] .. fanout_trigger .. (is_postgres and [[ ON kickside_wake_fanout]] or ""),
                [[DROP TABLE ]] .. log_table,
            }
            if not is_postgres then table.insert(drops, 3, [[DROP TRIGGER ]] .. fanout_insert_trigger) end
            if is_postgres then
                drops[#drops + 1] = [[DROP FUNCTION ]] .. job_fn
                drops[#drops + 1] = [[DROP FUNCTION ]] .. fanout_fn
            end
            for _, statement in ipairs(drops) do
                local _, drop_err = read_db:execute(statement)
                if drop_err then read_db:release(); error(tostring(drop_err)) end
            end
            read_db:release()
            if order_err then error(tostring(order_err)) end
            if job_err then error(tostring(job_err)) end
            if lo_err then error(tostring(lo_err)) end

            local position: { [string]: integer } = {}
            for index, row in ipairs(order_rows or {}) do
                local key = tostring(row.kind) .. ":" .. tostring(row.entry_key)
                if position[key] == nil then position[key] = index end
            end
            local fanout_lo = position["fanout:thread:" .. lo]
            local fanout_hi = position["fanout:thread:" .. hi]
            test.not_nil(fanout_lo)
            test.not_nil(fanout_hi)
            test.is_true((fanout_lo :: integer) < (fanout_hi :: integer))
            local job_first = position["job:" .. hi_job]
            local job_second = position["job:" .. lo_job]
            test.not_nil(job_first)
            test.not_nil(job_second)
            test.is_true((job_first :: integer) < (job_second :: integer))

            test.eq(#job_rows, 1)
            test.not_nil(job_rows[1].scheduled_at)
            test.eq(tonumber(job_rows[1].wake_generation), 1)
            test.eq(#lo_rows, 1)
            test.not_nil(lo_rows[1].scheduled_at)
            test.eq(tonumber(lo_rows[1].wake_generation), 1)
            jobs.cancel(hi_job)
            jobs.cancel(lo_job)
        end)

        -- Thread append wakes the durable slot without mutating the cursor fence.
        test.it("a message append wakes a parked projection slot", function()
            local thread_id = new_thread()
            local d, de = sql.get(DB)
            if de or not d then error(tostring(de)) end
            local registered, reg_err = projection_writer.register_projection(d, thread_id, {
                kind = "wake-fixture", worker_ref = "func://app:test_count_worker",
                system_identity = true, start_at_head = true,
            })
            test.is_nil(reg_err)
            local job_id = tostring((registered :: any).job_id)
            local before, before_err = d:query(
                "SELECT status,scheduled_at FROM kickside_job WHERE id=$1", { job_id })
            test.is_nil(before_err)
            test.eq((before :: any)[1].status, "pending")
            test.is_nil((before :: any)[1].scheduled_at)
            d:release()

            local posted = as_owner(POST, { thread_id = thread_id, text = "wake" })
            test.is_true(posted.ok)
            local d2, d2e = sql.get(DB)
            if d2e or not d2 then error(tostring(d2e)) end
            local jobs_rows, jobs_err = d2:query(
                "SELECT status,scheduled_at FROM kickside_job WHERE id=$1", { job_id })
            test.is_nil(jobs_err)
            test.eq((jobs_rows :: any)[1].status, "pending")
            test.not_nil((jobs_rows :: any)[1].scheduled_at)
            local cursor_rows, cursor_err = d2:query(
                "SELECT last_seq,status FROM kickside_projection_cursor WHERE id=$1",
                { (registered :: any).cursor_id })
            test.is_nil(cursor_err)
            test.eq(tonumber((cursor_rows :: any)[1].last_seq), 0)
            test.eq((cursor_rows :: any)[1].status, "active")
            d2:release()
        end)

        -- A cursor registered at the thread head parks its slot, so no advance
        -- ever folds it: registration itself leaves the projection current.
        test.it("registers a caught-up projection as valid and a behind one as pending", function()
            local thread_id = new_thread()
            local posted = as_owner(POST, { thread_id = thread_id, text = "head" })
            test.is_true(posted.ok)
            local d, de = sql.get(DB)
            if de or not d then error(tostring(de)) end
            local function state_of(projection_id: string): table
                local rows, err = d:query("SELECT state,last_event_seq FROM kickside_projection WHERE id=$1",
                    { projection_id })
                if err or not rows or not rows[1] then error("projection unreadable: " .. tostring(err)) end
                return rows[1] :: table
            end
            local spec = { kind = "head-fixture", worker_ref = "func://app:test_count_worker",
                system_identity = true, start_at_head = true }
            local registered, reg_err = projection_writer.register_projection(d, thread_id, spec)
            test.is_nil(reg_err)
            local projection_id = tostring((registered :: any).projection_id)
            local head = state_of(projection_id)
            test.eq(head.state, "valid")
            test.eq(tonumber(head.last_event_seq), 1)

            -- A changed declaration resumes from the reached head; nothing is left to fold.
            local changed = { kind = "head-fixture", worker_ref = "func://app:test_count_worker",
                system_identity = true, start_at_head = true, worker_config = { revision = 2 } }
            local _, change_err = projection_writer.register_projection(d, thread_id, changed)
            test.is_nil(change_err)
            test.eq(state_of(projection_id).state, "valid")

            -- A reset behind the head waits for its advance.
            local rewound = { kind = "head-fixture", worker_ref = "func://app:test_count_worker",
                system_identity = true, start_seq = 0, reset = true }
            local _, reset_err = projection_writer.register_projection(d, thread_id, rewound)
            test.is_nil(reset_err)
            test.eq(state_of(projection_id).state, "pending")
            jobs.cancel(tostring((registered :: any).job_id))
            d:release()
        end)
    end)

end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
