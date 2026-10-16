local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local json = require("json")
local writer = require("writer")
local apply = require("apply")
local invoke = require("invoke")
local claim = require("claim")
local job_lifecycle_cancel = require("job_lifecycle_cancel")

local function claim_batch(limit: integer): (table[]?, error?)
    local db, db_err = sql.get("app:db")
    if db_err or not db then return nil, db_err end
    local dbtype, type_err = db:type()
    if type_err then db:release(); return nil, type_err end
    local rows, claim_err = claim.claim_batch(db, tostring(dbtype), limit, nil, nil)
    local _, release_err = db:release()
    return rows, claim_err or release_err
end

local function define_tests()
    test.describe("projection cursor slots", function()
        test.it("parks satisfied running demand and preserves work beyond the folded head", function()
            for _, extra in ipairs({ false, true }) do
                local db = assert(sql.get("app:db"))
                local id = uuid.v7()
                local _, thread_err = db:execute("INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,1)", { id, id })
                test.is_nil(thread_err)
                local _, event_err = db:execute("INSERT INTO kickside_event (id,thread_id,type,role,body,seq) VALUES ($1,$2,'test:event','user','{}',1)", { uuid.v7(), id })
                test.is_nil(event_err)
                local registered, register_err = writer.register_projection(db, id, {
                    kind = "satisfied-demand", worker_ref = "func://app:test_count_worker",
                    worker_input_mode = "prefetch_events", system_identity = true,
                })
                test.is_nil(register_err)
                db:release()
                local batch, claim_err = claim_batch(16)
                test.is_nil(claim_err)
                local job: table? = nil
                for _, row in ipairs(batch) do if row.id == registered.job_id then job = row end end
                if not job then error("projection slot is not claimed") end
                db = assert(sql.get("app:db"))
                local _, wake_err = db:execute("UPDATE kickside_job SET wake_demand_at=created_at WHERE id=$1", { job.id })
                test.is_nil(wake_err)
                local snapshot, snapshot_err = db:query([[SELECT c.*,p.body,p.kind FROM kickside_projection_cursor c
                    JOIN kickside_projection p ON p.id=c.projection_id WHERE c.id=$1]], { registered.cursor_id })
                test.is_nil(snapshot_err)
                snapshot[1].body = assert(json.decode(snapshot[1].body))
                if extra then
                    local _, append_err = db:execute("INSERT INTO kickside_event (id,thread_id,type,role,body,seq) VALUES ($1,$2,'test:event','user','{}',2)", { uuid.v7(), id })
                    test.is_nil(append_err)
                    local _, head_err = db:execute("UPDATE kickside_thread SET event_count=2 WHERE id=$1", { id })
                    test.is_nil(head_err)
                end
                db:release()
                local result, apply_err = apply.advance("app:db", job, snapshot[1], 1, {})
                test.is_nil(apply_err)
                test.not_nil(result)
                db = assert(sql.get("app:db"))
                local rows, read_err = db:query("SELECT status,scheduled_at,wake_demand_at FROM kickside_job WHERE id=$1", { job.id })
                db:release()
                test.is_nil(read_err)
                test.eq(rows[1].status, "pending")
                test.is_nil(rows[1].wake_demand_at)
                if extra then test.not_nil(rows[1].scheduled_at) else test.is_nil(rows[1].scheduled_at) end
            end
        end)

        test.it("registers one active cursor with one durable jobs slot", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,0)",
                { thread_id, thread_id })
            test.is_nil(thread_err)

            local first, first_err = writer.register_projection(db :: sql.DB, thread_id, {
                kind = "slot-test", worker_ref = "func://app:test_count_worker", system_identity = true,
            })
            test.is_nil(first_err)
            test.not_nil(first)
            local cursor_id = tostring((first :: table).cursor_id)
            local rows, cursor_err = (db :: sql.DB):query(
                "SELECT status,job_id FROM kickside_projection_cursor WHERE id = $1", { cursor_id })
            test.is_nil(cursor_err)
            test.eq(#(rows :: table), 1)
            test.eq((rows :: table)[1].status, "active")
            local job_id = tostring((rows :: table)[1].job_id or "")
            test.ok(job_id ~= "")
            local jobs, job_err = (db :: sql.DB):query(
                "SELECT id,job_type,slot,wake_key FROM kickside_job WHERE id = $1", { job_id })
            test.is_nil(job_err)
            test.eq(#(jobs :: table), 1)
            test.eq((jobs :: table)[1].job_type, "kickside.core.projections:advance")
            test.eq((jobs :: table)[1].wake_key, "thread:" .. thread_id)
            local _, release_err = (db :: sql.DB):release()
            test.is_nil(release_err)
        end)

        test.it("stores the admitted v2 identity on the cursor", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,0)",
                { thread_id, thread_id })
            test.is_nil(thread_err)
            local identity = { version = 2, principal = { kind = "user", id = thread_id },
                authorized_by = { kind = "user", id = thread_id }, captured_at = "2026-09-26T00:00:00Z" }
            local registered, register_err = writer.register_projection(db :: sql.DB, thread_id, {
                kind = "slot-identity-test", worker_ref = "func://app:test_count_worker",
                execution_identity = identity,
            })
            test.is_nil(register_err)
            local rows, read_err = (db :: sql.DB):query([[SELECT actor_id,execution_identity_json
                FROM kickside_projection_cursor WHERE id=$1]],
                { (registered :: table).cursor_id })
            test.is_nil(read_err)
            test.eq(#(rows :: table), 1)
            local decoded, decode_err = json.decode((rows :: table)[1].execution_identity_json)
            test.is_nil(decode_err)
            test.eq((decoded :: table).principal.id, thread_id)
            test.is_true(type((rows :: table)[1].actor_id) == "string" and (rows :: table)[1].actor_id ~= "")
            local _, release_err = (db :: sql.DB):release()
            test.is_nil(release_err)
        end)

        test.it("removes its slot and cursor with the projection", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,0)",
                { thread_id, thread_id })
            test.is_nil(thread_err)
            local registered, register_err = writer.register_projection(db :: sql.DB, thread_id, {
                kind = "slot-removal-test", worker_ref = "func://app:test_count_worker", system_identity = true,
            })
            test.is_nil(register_err)
            local removed, remove_err = writer.remove_projection(db :: sql.DB, thread_id,
                { projection_id = (registered :: table).projection_id })
            test.is_nil(remove_err)
            test.eq((removed :: table).removed_cursors, 1)
            local cursor, cursor_err = (db :: sql.DB):query(
                "SELECT id FROM kickside_projection_cursor WHERE id=$1", { (registered :: table).cursor_id })
            test.is_nil(cursor_err)
            test.eq(#(cursor :: table), 0)
            local job, job_err = (db :: sql.DB):query(
                "SELECT status FROM kickside_job WHERE id=$1", { (registered :: table).job_id })
            test.is_nil(job_err)
            test.eq((job :: table)[1].status, "cancelled")
            local _, release_err = (db :: sql.DB):release()
            test.is_nil(release_err)
        end)

        test.it("removes every cursor slot and cancels jobs in ascending id order", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,0)",
                { thread_id, thread_id })
            test.is_nil(thread_err)

            local first, first_err = writer.register_projection(db :: sql.DB, thread_id, {
                kind = "slot-multi-removal-test", projection_key = "shared", cursor_key = "first",
                worker_ref = "func://app:test_count_worker", system_identity = true,
            })
            test.is_nil(first_err)
            local second, second_err = writer.register_projection(db :: sql.DB, thread_id, {
                kind = "slot-multi-removal-test", projection_key = "shared", cursor_key = "second",
                worker_ref = "func://app:test_count_worker", system_identity = true,
            })
            test.is_nil(second_err)
            test.eq((second :: table).projection_id, (first :: table).projection_id)

            local first_job = tostring((first :: table).job_id)
            local second_job = tostring((second :: table).job_id)
            local low_job, high_job = first_job < second_job and first_job or second_job,
                first_job < second_job and second_job or first_job
            local cursor_rows, cursor_err = (db :: sql.DB):query(
                "SELECT id FROM kickside_projection_cursor WHERE projection_id=$1 ORDER BY id ASC",
                { (first :: table).projection_id })
            test.is_nil(cursor_err)
            test.eq(#(cursor_rows :: table), 2)

            -- Make the cursor scan's insertion/ID order disagree with job ID
            -- order, so an unordered cursor lookup cannot accidentally pass.
            local _, reverse_first_err = (db :: sql.DB):execute(
                "UPDATE kickside_projection_cursor SET job_id=$1 WHERE id=$2",
                { high_job, (cursor_rows :: table)[1].id })
            test.is_nil(reverse_first_err)
            local _, reverse_second_err = (db :: sql.DB):execute(
                "UPDATE kickside_projection_cursor SET job_id=$1 WHERE id=$2",
                { low_job, (cursor_rows :: table)[2].id })
            test.is_nil(reverse_second_err)

            local calls: { string } = {}
            local previous = writer._modules.job_lifecycle_cancel
            writer._modules.job_lifecycle_cancel = {
                cancel_jobs_tx = function(tx: any, dialect: string, params: table): (integer, error?)
                    calls[#calls + 1] = tostring(params.id)
                    return job_lifecycle_cancel.cancel_jobs_tx(tx, dialect, params)
                end,
                notify_cancellations = function(db: any, dialect: string, executions: table[]): error?
                    test.eq(#executions, 0)
                    return job_lifecycle.notify_cancellations(db, dialect, executions)
                end,
            }
            local removed, remove_err = writer.remove_projection(db :: sql.DB, thread_id,
                { projection_id = (first :: table).projection_id })
            writer._modules.job_lifecycle_cancel = previous

            test.is_nil(remove_err)
            test.eq((removed :: table).removed_cursors, 2)
            test.eq(#calls, 2)
            test.eq(calls[1], low_job)
            test.eq(calls[2], high_job)
            local remaining_cursors, remaining_cursor_err = (db :: sql.DB):query(
                "SELECT id FROM kickside_projection_cursor WHERE projection_id=$1",
                { (first :: table).projection_id })
            test.is_nil(remaining_cursor_err)
            test.eq(#(remaining_cursors :: table), 0)
            local remaining_projection, remaining_projection_err = (db :: sql.DB):query(
                "SELECT id FROM kickside_projection WHERE id=$1", { (first :: table).projection_id })
            test.is_nil(remaining_projection_err)
            test.eq(#(remaining_projection :: table), 0)
            local cancelled, cancelled_err = (db :: sql.DB):query(
                "SELECT id,status FROM kickside_job WHERE id=$1 OR id=$2 ORDER BY id ASC",
                { low_job, high_job })
            test.is_nil(cancelled_err)
            test.eq(#(cancelled :: table), 2)
            test.eq((cancelled :: table)[1].id, low_job)
            test.eq((cancelled :: table)[1].status, "cancelled")
            test.eq((cancelled :: table)[2].id, high_job)
            test.eq((cancelled :: table)[2].status, "cancelled")
            local _, release_err = (db :: sql.DB):release()
            test.is_nil(release_err)
        end)

        test.it("advances a registered cursor through its claimed jobs slot", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,1)",
                { thread_id, thread_id })
            test.is_nil(thread_err)
            local event_id = uuid.v7()
            local body = json.encode({ text = "one" })
            local _, event_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_event (id,thread_id,type,role,body,seq) VALUES ($1,$2,'test:event','user',$3,1)",
                { event_id, thread_id, body })
            test.is_nil(event_err)
            local registered, register_err = writer.register_projection(db :: sql.DB, thread_id, {
                kind = "slot-work-test", worker_ref = "func://app:test_count_worker",
                worker_input_mode = "prefetch_events", system_identity = true,
                worker_config = { read_db = true },
            })
            test.is_nil(register_err)
            test.not_nil(registered)
            local cursor_id = tostring((registered :: table).cursor_id)
            local job_id = tostring((registered :: table).job_id)
            local _, close_err = (db :: sql.DB):release()
            test.is_nil(close_err)

            local claimed, claim_err = claim_batch(16)
            test.is_nil(claim_err)
            local selected: table? = nil
            for _, row in ipairs(claimed :: table[]) do
                if row.id == job_id then selected = row end
            end
            test.not_nil(selected)
            local lease = { token = (selected :: table).lease_token,
                execution_seq = (selected :: table).execution_seq }
            local result, advance_err = invoke.run({
                job = { id = job_id, lease_token = lease.token, execution_seq = lease.execution_seq },
                payload = { cursor_id = cursor_id },
            })
            test.is_nil(advance_err)
            test.eq((result :: table).self_completed, true)
            local check_db, check_err = sql.get("app:db")
            test.is_nil(check_err)
            local rows, read_err = (check_db :: sql.DB):query(
                "SELECT last_seq,status FROM kickside_projection_cursor WHERE id=$1", { cursor_id })
            test.is_nil(read_err)
            test.eq(tonumber((rows :: table)[1].last_seq), 1)
            test.eq((rows :: table)[1].status, "active")
            local models, model_err = (check_db :: sql.DB):query(
                "SELECT body FROM kickside_projection WHERE id=$1", { (registered :: table).projection_id })
            test.is_nil(model_err)
            local model_body = json.decode((models :: table)[1].body)
            test.eq((model_body :: table).stats.count, 1)
            local _, release_err = (check_db :: sql.DB):release()
            test.is_nil(release_err)
        end)

        test.it("applies a claimed batch exactly once when a late attempt replays its lease", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,1)",
                { thread_id, thread_id })
            test.is_nil(thread_err)
            local _, event_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_event (id,thread_id,type,role,body,seq) VALUES ($1,$2,'test:event','user',$3,1)",
                { uuid.v7(), thread_id, json.encode({ text = "once" }) })
            test.is_nil(event_err)
            local registered, register_err = writer.register_projection(db :: sql.DB, thread_id, {
                kind = "slot-once-test", worker_ref = "func://app:test_count_worker",
                worker_input_mode = "prefetch_events", system_identity = true,
            })
            test.is_nil(register_err)
            local cursor_id = tostring((registered :: table).cursor_id)
            local job_id = tostring((registered :: table).job_id)
            local _, close_err = (db :: sql.DB):release()
            test.is_nil(close_err)

            local claimed, claim_err = claim_batch(16)
            test.is_nil(claim_err)
            local selected: table? = nil
            for _, row in ipairs(claimed :: table[]) do if row.id == job_id then selected = row end end
            test.not_nil(selected)
            local lease = { token = (selected :: table).lease_token,
                execution_seq = (selected :: table).execution_seq }
            local attempt = {
                job = { id = job_id, lease_token = lease.token, execution_seq = lease.execution_seq },
                payload = { cursor_id = cursor_id },
            }
            local first, first_err = invoke.run(attempt)
            test.is_nil(first_err)
            test.eq((first :: table).self_completed, true)
            -- The same attempt delivered again (a late or duplicated executor)
            -- holds a lease the completion already released: it applies nothing.
            local _, replay_err = invoke.run(attempt)
            test.not_nil(replay_err)

            local check_db, check_err = sql.get("app:db")
            test.is_nil(check_err)
            local rows = (check_db :: sql.DB):query("SELECT last_seq FROM kickside_projection_cursor WHERE id=$1", { cursor_id })
            local models = (check_db :: sql.DB):query("SELECT body FROM kickside_projection WHERE id=$1",
                { (registered :: table).projection_id })
            local _, release_err = (check_db :: sql.DB):release()
            test.is_nil(release_err)
            test.eq(tonumber((rows :: table)[1].last_seq), 1)
            test.eq((json.decode((models :: table)[1].body) :: table).stats.count, 1)
        end)

        test.it("defers a fresh event within the declared idle debounce", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,1)",
                { thread_id, thread_id })
            test.is_nil(thread_err)
            local event_id = uuid.v7()
            local body = json.encode({ text = "debounce" })
            local _, event_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_event (id,thread_id,type,role,body,seq) VALUES ($1,$2,'test:event','user',$3,1)",
                { event_id, thread_id, body })
            test.is_nil(event_err)
            local registered, register_err = writer.register_projection(db :: sql.DB, thread_id, {
                kind = "slot-debounce-test", worker_ref = "func://app:test_count_worker",
                worker_input_mode = "prefetch_events", system_identity = true,
                debounce_idle_ms = 60000, debounce_max_ms = 120000,
            })
            test.is_nil(register_err)
            local _, close_err = (db :: sql.DB):release()
            test.is_nil(close_err)
            local claimed, claim_err = claim_batch(16)
            test.is_nil(claim_err)
            local selected: table? = nil
            for _, row in ipairs(claimed :: table[]) do
                if row.id == (registered :: table).job_id then selected = row end
            end
            test.not_nil(selected)
            local lease = { token = (selected :: table).lease_token,
                execution_seq = (selected :: table).execution_seq }
            local result, advance_err = invoke.run({
                job = { id = (registered :: table).job_id, lease_token = lease.token,
                    execution_seq = lease.execution_seq },
                payload = { cursor_id = (registered :: table).cursor_id },
            })
            test.is_nil(advance_err)
            test.eq((result :: table).self_completed, true)
            local check_db, check_err = sql.get("app:db")
            test.is_nil(check_err)
            local rows, read_err = (check_db :: sql.DB):query(
                "SELECT last_seq FROM kickside_projection_cursor WHERE id=$1", { (registered :: table).cursor_id })
            test.is_nil(read_err)
            test.eq(tonumber((rows :: table)[1].last_seq), 0)
            local pending, job_err = (check_db :: sql.DB):query(
                "SELECT status,scheduled_at FROM kickside_job WHERE id=$1", { (registered :: table).job_id })
            test.is_nil(job_err)
            test.eq((pending :: table)[1].status, "pending")
            test.not_nil((pending :: table)[1].scheduled_at)
            local _, release_err = (check_db :: sql.DB):release()
            test.is_nil(release_err)
        end)

        test.it("rejects registration below the retained event boundary", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = (db :: sql.DB):execute(
                [[INSERT INTO kickside_thread
                  (id,thread_class,component_id,event_count,max_pruned_seq)
                  VALUES ($1,'test',$2,2,1)]], { thread_id, thread_id })
            test.is_nil(thread_err)
            local value, register_err = writer.register_projection(db :: sql.DB, thread_id, {
                kind = "slot-pruned-test", worker_ref = "func://app:test_count_worker",
                system_identity = true, start_seq = 0,
            })
            test.is_nil(value)
            test.not_nil(register_err)
            local rows, read_err = (db :: sql.DB):query(
                "SELECT COUNT(*) AS n FROM kickside_projection WHERE thread_id=$1", { thread_id })
            test.is_nil(read_err)
            test.eq(tonumber((rows :: table)[1].n), 0)
            local _, release_err = (db :: sql.DB):release()
            test.is_nil(release_err)
        end)

        test.it("rejects malformed debounce and start positions instead of replacing them with defaults", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            local thread_id = uuid.v7()
            local _, thread_err = (db :: sql.DB):execute(
                "INSERT INTO kickside_thread (id,thread_class,component_id,event_count) VALUES ($1,'test',$2,0)",
                { thread_id, thread_id })
            test.is_nil(thread_err)
            for _, options in ipairs({
                { debounce_idle_ms = "invalid", debounce_max_ms = 1000 },
                { debounce_idle_ms = 1000, debounce_max_ms = 0 },
                { start_seq = "invalid" },
            }) do
                options.kind = "slot-invalid-test"
                options.worker_ref = "func://app:test_count_worker"
                options.system_identity = true
                local result, register_err = writer.register_projection(db :: sql.DB, thread_id, options)
                test.is_nil(result)
                test.not_nil(register_err)
            end
            local _, release_err = (db :: sql.DB):release()
            test.is_nil(release_err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = run_cases }
