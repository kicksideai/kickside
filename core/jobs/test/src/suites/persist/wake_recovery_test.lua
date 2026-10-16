local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local channel = require("channel")
local time = require("time")
local jobs = require("jobs")
local lifecycle = require("lifecycle")
local reclaim = require("reclaim")
local wake = require("wake")
local job_fixture = require("job_fixture")
local config = require("config")
local row_bytes = require("row_bytes")

type PoolListener = { channel: any, previous_pid: string? }

local function register_pool_listener(): PoolListener
    local previous_pid = process.registry.lookup(config.POOL_NAME, process.registry.CONSISTENT)
    local listener, listen_err = process.listen(config.WAKE_TOPIC)
    test.is_nil(listen_err)
    local registered, register_err = process.registry.register(config.POOL_NAME, nil, process.registry.CONSISTENT)
    test.is_nil(register_err)
    test.is_true(registered)
    return { channel = listener, previous_pid = type(previous_pid) == "string" and previous_pid or nil }
end

local function unregister_pool_listener(pool: PoolListener): ()
    process.unlisten(pool.channel)
    process.registry.unregister(config.POOL_NAME, process.registry.CONSISTENT)
    if pool.previous_pid ~= nil then
        local restored, restore_err = process.registry.register(config.POOL_NAME, pool.previous_pid, process.registry.CONSISTENT)
        test.is_nil(restore_err)
        test.is_true(restored)
    end
end

local function define_tests()
    test.describe("jobs wake continuation recovery", function()
        test.it("publishes and acknowledges an empty fanout without separate continuation and candidate reads", function()
            local db = assert(sql.get("app:db"))
            local dbtype = tostring(db:type())
            local key = "empty-fanout:" .. uuid.v7()
            local tx = assert(db:begin())
            local reads, writes = 0, 0
            local probe = job_fixture.observe_tx(tx, function() reads = reads + 1 end,
                function() writes = writes + 1 end)
            local result, wake_err = wake.wake_tx(probe, key, dbtype)
            local rows, read_err = tx:query("SELECT demand_generation,ack_generation FROM kickside_wake_fanout WHERE key=$1", { key })
            tx:rollback()
            db:release()
            test.is_nil(wake_err)
            test.is_nil(read_err)
            test.eq(result.touched_count, 0)
            test.eq(result.demand_generation, 1)
            test.eq(tonumber(rows[1].ack_generation), result.demand_generation)
            test.eq(reads + writes, dbtype == sql.type.POSTGRES and 2 or 3)
        end)

        test.it("refuses reusable demand for an existing one-shot identity", function()
            local key = uuid.v7()
            local request = { namespace = "slot-demand", scope = key, key = "consumer",
                owner_locator = { kind = "test", id = key }, job_type = "test.consumer",
                immutable_payload = { scope = key }, parked = true }
            local first, enqueue_err = jobs.enqueue(request)
            test.is_nil(enqueue_err)
            test.not_nil(first)
            request.slot = true
            request.demand = true
            local demanded, demand_err = jobs.enqueue(request)
            test.is_nil(demanded)
            test.not_nil(demand_err)
            test.eq(demand_err:kind(), errors.CONFLICT)
            local unchanged, read_err = jobs.get_job(first.id)
            test.is_nil(read_err)
            test.is_nil(unchanged.scheduled_at)
        end)

        test.it("enqueues reusable demand atomically and retains demand during an active attempt", function()
            local key = uuid.v7()
            local request = { namespace = "slot-demand", scope = key, key = "consumer",
                owner_locator = { kind = "test", id = key }, job_type = "test.consumer",
                concurrency_key = key, immutable_payload = { scope = key }, slot = true,
                parked = true, demand = true }
            local first, enqueue_err = jobs.enqueue(request)
            test.is_nil(enqueue_err)
            test.not_nil(first)
            local repeated, repeated_err = jobs.enqueue(request)
            test.is_nil(repeated_err)
            test.eq(repeated.id, first.id)
            test.is_true(repeated.existing)
            local row, row_err = jobs.get_job(first.id)
            test.is_nil(row_err)
            test.eq(row.status, "pending")
            test.not_nil(row.scheduled_at)
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if not db then error("test database is absent") end
            local dbtype = tostring(db:type())
            local running, claim_err = job_fixture.lease_own(db, dbtype, first.id)
            db:release()
            test.is_nil(claim_err)
            test.not_nil(running)
            local queued, demand_err = jobs.enqueue(request)
            test.is_nil(demand_err)
            test.eq(queued.id, first.id)
            local done, done_err = jobs.complete(first.id,
                { token = running.lease_token, execution_seq = running.execution_seq }, {})
            test.is_nil(done_err)
            test.not_nil(done)
            local pending, pending_err = jobs.get_job(first.id)
            test.is_nil(pending_err)
            test.eq(pending.status, "pending")
            test.not_nil(pending.scheduled_at)
            test.eq(tonumber(pending.attempts), 0)
        end)

        test.it("validates wake changes from the complete transaction-locked batch", function()
            local db, db_err = sql.get("app:db")
            test.is_nil(db_err)
            if not db then error("test database is absent") end
            local dbtype = tostring(db:type())
            local key = "snapshot:" .. uuid.v7()
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "wake_snapshot" },
                job_identity = { namespace = "snapshot", scope = key, key = "watcher" },
                job_type = "test.watcher", wake_key = key, parked = true,
            })
            test.is_nil(enqueue_err)
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            local original = row_bytes.check_update
            local checked = 0
            row_bytes.check_update = function(exec, table_name, job_id, changes, cap, operation, snapshot)
                if snapshot == nil then return errors.new({ message = "wake rereads a retained row", kind = errors.INTERNAL }) end
                checked = checked + 1
                return original(exec, table_name, job_id, changes, cap, operation, snapshot)
            end
            local result, wake_err = wake.wake_tx(tx, key, dbtype)
            row_bytes.check_update = original
            tx:rollback()
            db:release()
            test.is_nil(wake_err)
            test.not_nil(result)
            test.eq(checked, 1)
            test.eq(result.touched_count, 1)
        end)

        test.it("publishes demand without waiting on an unchanged continuation row", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            if dbtype ~= sql.type.POSTGRES then db:release(); return end
            local key = "thread:" .. uuid.v7()
            local continuation_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "wake_recovery_test" },
                job_identity = { namespace = "wake", scope = key, key = "continuation" },
                job_type = wake.CONTINUATION_TYPE, queue_tier = "maintenance",
                payload = { wake_key = key },
            })
            test.is_nil(enqueue_err)
            local held, held_err = db:begin()
            test.is_nil(held_err)
            local _, lock_err = held:query("SELECT id FROM kickside_job WHERE id=$1 FOR UPDATE", { continuation_id })
            test.is_nil(lock_err)
            local other, other_err = sql.get("app:db")
            if not other then error("test database unavailable: " .. tostring(other_err)) end
            test.is_nil(other_err)
            local _, timeout_err = other:execute("SET statement_timeout='150ms'")
            test.is_nil(timeout_err)
            local publishing, begin_err = other:begin()
            test.is_nil(begin_err)
            local result, wake_err = wake.wake_tx(publishing, key, dbtype)
            if wake_err then publishing:rollback() else publishing:commit() end
            local _, reset_err = other:execute("RESET statement_timeout")
            other:release()
            held:rollback()
            db:release()
            test.is_nil(reset_err)
            test.is_nil(wake_err)
            test.eq(result.continuation_id, continuation_id)
            test.eq(result.touched_count, 0)
        end)

        test.it("public enqueue refuses a threadless job without a surviving owner", function()
            local result, err = jobs.enqueue({ namespace = "drive", scope = uuid.v7(), key = "slot",
                job_type = "test.owner.required", immutable_payload = {}, parked = true })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
        end)

        test.it("does not publish an aborted first wake generation", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local key = "thread:" .. uuid.v7()
            local tx, begin_err = db:begin()
            test.is_nil(begin_err)
            local aborted, wake_err = wake.wake_tx(tx, key, dbtype)
            test.is_nil(wake_err)
            test.eq(aborted.demand_generation, 1)
            local _, rollback_err = tx:rollback()
            test.is_nil(rollback_err)
            local missing, read_err = sql.builder.select("key")
                :from("kickside_wake_fanout")
                :where(sql.builder.eq({ key = key }))
                :run_with(db):query()
            test.is_nil(read_err)
            test.eq(#missing, 0)
            local committed, commit_err = job_fixture.wake_key(db, dbtype, key)
            test.is_nil(commit_err)
            test.eq(committed.demand_generation, 1)
            local fanout, fanout_err = sql.builder.select("demand_generation", "ack_generation")
                :from("kickside_wake_fanout")
                :where(sql.builder.eq({ key = key }))
                :run_with(db):query()
            test.is_nil(fanout_err)
            test.eq(tonumber(fanout[1].demand_generation), 1)
            test.eq(tonumber(fanout[1].ack_generation), 1)
            db:release()
        end)

        test.it("signals a live worker after committed wake demand", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local pool = register_pool_listener()
            local listener = pool.channel
            local sent, nudge_err = wake.nudge_workers(db, dbtype)
            test.is_nil(nudge_err)
            test.eq(sent, 1)
            local received = channel.select({ listener:case_receive() })
            test.eq(received.channel, listener)
            unregister_pool_listener(pool)
            db:release()
        end)

        test.it("signals an idle worker to schedule a future enqueue", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local pool = register_pool_listener()
            local listener = pool.channel
            local queued, enqueue_err = jobs.enqueue({
                owner_locator = { kind = "test", id = "wake_recovery_test" },
                namespace = "test", scope = "future", key = uuid.v7(),
                job_type = "app:generic_job_target", immutable_payload = {},
                scheduled_at = lifecycle.future_string(dbtype, 3600),
            })
            local received = channel.select({ listener:case_receive() })
            if queued then db:execute("DELETE FROM kickside_job WHERE id=$1", { queued.id }) end
            unregister_pool_listener(pool)
            db:release()
            test.is_nil(enqueue_err)
            test.eq(received.channel, listener)
        end)

        test.it("does not discover nudge recipients from worker pulse rows", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local pool = register_pool_listener()
            local listener = pool.channel
            local _, nudge_err = wake.nudge_workers(db, dbtype)
            test.is_nil(nudge_err)
            test.eq(channel.select({ listener:case_receive() }).channel, listener)
            unregister_pool_listener(pool)
            db:release()
        end)

        -- A due or future enqueue notifies the one registered pool process;
        -- parked demand does not create an unnecessary claim attempt.
        test.it("notifies the registered pool after enqueue commit", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local pool = register_pool_listener()
            local listener = pool.channel

            local parked, parked_err = jobs.enqueue({ namespace = "drive", scope = "nudge", key = uuid.v7(),
                owner_locator = { kind = "test", id = "wake_recovery_test" },
                job_type = "test.watcher", immutable_payload = {}, parked = true })
            test.is_nil(parked_err)
            local quiet = channel.select({ listener:case_receive(), default = true })
            test.is_true(quiet.default, "a parked job must not signal workers")

            local past, past_err = jobs.enqueue({ namespace = "drive", scope = "nudge", key = uuid.v7(),
                owner_locator = { kind = "test", id = "wake_recovery_test" },
                job_type = "test.watcher", immutable_payload = {}, scheduled_at = lifecycle.format_time(dbtype, time.now():add(-60 * time.SECOND)) })
            test.is_nil(past_err)
            local past_signal = channel.select({ listener:case_receive() })
            test.eq(past_signal.channel, listener)

            local due_at = lifecycle.format_time(dbtype, time.now())
            local explicit_now, explicit_now_err = jobs.enqueue({ namespace = "drive", scope = "nudge", key = uuid.v7(),
                owner_locator = { kind = "test", id = "wake_recovery_test" },
                job_type = "test.watcher", immutable_payload = {}, scheduled_at = due_at })
            test.is_nil(explicit_now_err)
            local now_signal = channel.select({ listener:case_receive() })
            test.eq(now_signal.channel, listener)

            local due, due_err = jobs.enqueue({ namespace = "drive", scope = "nudge", key = uuid.v7(),
                owner_locator = { kind = "test", id = "wake_recovery_test" },
                job_type = "test.watcher", immutable_payload = {} })
            test.is_nil(due_err)
            local received = channel.select({ listener:case_receive() })
            test.eq(received.channel, listener)

            jobs.cancel(parked.id)
            jobs.cancel(past.id)
            jobs.cancel(explicit_now.id)
            jobs.cancel(due.id)
            unregister_pool_listener(pool)
            db:release()
        end)

        test.it("reclaims a crashed continuation and acknowledges retained demand", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local key = "thread:" .. uuid.v7()
            for i = 1, 205 do
                local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                    owner_locator = { kind = "test", id = "wake_recovery_test" },
                    job_identity = { namespace = "drive", scope = key, key = tostring(i) },
                    job_type = "test.watcher", wake_key = key, parked = true,
                })
                test.is_nil(enqueue_err)
                test.not_nil(id)
            end
            local parked, parked_err = sql.builder.select("id")
                :from("kickside_job")
                :where(sql.builder.eq({ wake_key = key, wake_enabled = true, status = "pending" }))
                :where("scheduled_at IS NULL")
                :run_with(db):query()
            test.is_nil(parked_err)
            test.eq(#parked, 205)
            local wake_result, wake_err = job_fixture.wake_key(db, dbtype, key)
            test.is_nil(wake_err)
            test.eq(wake_result.touched_count, 200)
            local repeated, repeated_err = job_fixture.wake_key(db, dbtype, key)
            test.is_nil(repeated_err)
            test.eq(repeated.demand_generation, wake_result.demand_generation + 1)
            test.eq(repeated.continuation_id, wake_result.continuation_id)
            test.eq(repeated.touched_count, 0)

            local identity = lifecycle.identity_parts({
                job_type = "test.watcher",
                job_identity = { namespace = "wake", scope = key, key = "continuation" },
            }, "unused")
            local rows = sql.builder.select("id", "payload", "job_type")
                :from("kickside_job"):where(sql.builder.eq({ job_identity = identity }))
                :run_with(db):query()
            test.eq(#rows, 1)
            local continuation = rows[1]
            local expired_token = uuid.v7()
            local _, expire_err = sql.builder.update("kickside_job")
                :set("status", "running")
                :set("lease_token", expired_token)
                :set("lease_until", "2000-01-01T00:00:00Z")
                :where(sql.builder.eq({ id = continuation.id }))
                :run_with(db):exec()
            test.is_nil(expire_err)
            local reclaimed, reclaim_err = reclaim.reclaim_expired(db, dbtype)
            test.is_nil(reclaim_err)
            test.is_true(reclaimed >= 1)

            continuation.lease_token = uuid.v7()
            local restarted, restart_err = sql.builder.update("kickside_job")
                :set("status", "running")
                :set("lease_token", continuation.lease_token)
                :set("lease_until", lifecycle.future_string(dbtype, 60))
                :where(sql.builder.eq({ id = continuation.id, status = "pending" }))
                :run_with(db):exec()
            test.is_nil(restart_err)
            test.eq(lifecycle.rows_affected(restarted), 1, "the reclaimed continuation enters its new lease")
            local result, continue_err = wake.continue_job(db, dbtype, continuation)
            test.is_nil(continue_err, "the first continuation completes under its new lease")
            test.is_true(result.self_completed)
            test.eq(result.woken, 200, "the first continuation retains the unprocessed generation")
            continuation.lease_token = uuid.v7()
            local retried, retry_err = sql.builder.update("kickside_job")
                :set("status", "running"):set("lease_token", continuation.lease_token)
                :set("lease_until", lifecycle.future_string(dbtype, 60))
                :where(sql.builder.eq({ id = continuation.id, status = "pending" }))
                :run_with(db):exec()
            test.is_nil(retry_err)
            test.eq(lifecycle.rows_affected(retried), 1, "the remaining continuation enters its next lease")
            local final, final_err = wake.continue_job(db, dbtype, continuation)
            test.is_nil(final_err, "the remaining continuation completes under its next lease")
            test.is_true(final.self_completed)
            test.eq(final.woken, 5)
            local fanout = sql.builder.select("demand_generation", "ack_generation")
                :from("kickside_wake_fanout"):where(sql.builder.eq({ key = key }))
                :run_with(db):query()
            test.eq(tonumber(fanout[1].demand_generation), 2)
            test.eq(tonumber(fanout[1].ack_generation), 2)
            local unseen = sql.builder.select("id"):from("kickside_job")
                :where(sql.builder.eq({ wake_key = key }))
                :where("status IN ('pending','running')")
                :where("wake_generation < 2"):run_with(db):query()
            test.eq(#unseen, 0)
            sql.builder.update("kickside_job"):set("status", "cancelled")
                :where(sql.builder.eq({ wake_key = key })):run_with(db):exec()
            db:release()
        end)

        test.it("rewakes a quietly completed watcher on a later append", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local dbtype = tostring(db:type())
            local key = "thread:" .. uuid.v7()
            local id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "wake_recovery_test" },
                job_identity = { namespace = "drive", scope = key, key = "watcher" },
                job_type = "test.watcher", slot = true, wake_key = key, parked = true,
            })
            test.is_nil(enqueue_err)
            local token = uuid.v7()
            local _, run_err = sql.builder.update("kickside_job")
                :set("status", "running"):set("lease_token", token)
                :set("lease_until", lifecycle.future_string(dbtype, 60))
                :where(sql.builder.eq({ id = id, status = "pending" }))
                :run_with(db):exec()
            test.is_nil(run_err)
            local complete_err = lifecycle.complete_job(db, { id = id, lease_token = token }, dbtype)
            test.is_nil(complete_err)
            local parked = sql.builder.select("status", "scheduled_at")
                :from("kickside_job"):where(sql.builder.eq({ id = id }))
                :run_with(db):query()
            test.eq(parked[1].status, "pending")
            test.is_nil(parked[1].scheduled_at)
            local wake_result, wake_err = job_fixture.wake_key(db, dbtype, key)
            test.is_nil(wake_err)
            test.eq(wake_result.touched_count, 1)
            local woken = sql.builder.select("status", "scheduled_at")
                :from("kickside_job"):where(sql.builder.eq({ id = id }))
                :run_with(db):query()
            test.eq(woken[1].status, "pending")
            test.not_nil(woken[1].scheduled_at)
            local ancient = dbtype == sql.type.SQLITE and "1999-01-01 00:00:00" or "1999-01-01T00:00:00Z"
            local _, age_err = sql.builder.update("kickside_job")
                :set("scheduled_at", ancient)
                :where(sql.builder.eq({ id = id }))
                :run_with(db):exec()
            test.is_nil(age_err)
            -- Claim selection has its own suite on a private queue; here the
            -- woken row is leased as its own claim would lease it.
            local claimed, claim_err = job_fixture.lease_own(db, dbtype, tostring(id))
            if not claimed then error("test job lease fails: " .. tostring(claim_err)) end
            test.is_nil(claim_err)
            test.not_nil(claimed)
            test.eq(tostring((claimed :: table).id), tostring(id))
            sql.builder.update("kickside_job"):set("status", "cancelled")
                :where(sql.builder.eq({ id = id })):run_with(db):exec()
            db:release()
        end)
    end)
end

return { run = test.run_cases(define_tests) }
