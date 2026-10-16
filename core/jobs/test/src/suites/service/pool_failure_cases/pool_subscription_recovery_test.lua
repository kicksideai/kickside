local test = require("test")
local sql = require("sql")
local time = require("time")
local registry = require("registry")
local process = require("process")
local channel = require("channel")
local worker_pool = require("worker_pool")
local lifecycle = require("lifecycle")
local job_fixture = require("job_fixture")
local uuid = require("uuid")

local function unavailable(err: error?): ()
    test.not_nil(err)
    test.eq((err :: error):kind(), errors.UNAVAILABLE)
    test.is_true((err :: any):retryable())
end

local function empty_claim()
    return {
        due_backlog = function() return { count = 0, oldest_age_ms = 0, overdue = 0 }, nil end,
        claim_batch = function() return {}, nil end,
        release_unstarted = function() return false, nil end,
    }
end

local function empty_reclaim()
    return {
        reclaim_expired = function() return 0, nil end,
        reclaim_terminated = function() return 0, nil end,
        close_lost_runs = function() return 0, nil end,
    }
end

local function empty_pool_db(dbtype: string)
    return {
        type = function() return dbtype end,
        query = function() return {}, nil end,
        release = function() end,
    }
end

local function run_deadline_case(kind: string): (integer, integer, { string })
    local event_ch = { case_receive = function(self) return self end }
    local registry_ch = { case_receive = function(self) return self end }
    local idle_ch = { case_receive = function(self) return self end }
    local wake_ch = { case_receive = function(self) return self end }
    local timer_ch = { case_receive = function(self) return self end }
    local deadline_ms = 250
    local now_ms = 0
    local selections = 0
    local timer_durations: { string } = {}
    local reclaim_calls = 0
    local assigned = 0
    local did_claim = false
    local reclaimed_job = false
    local job = { id = "deadline-job", worker_id = "deadline-worker", lease_token = "lease-1",
        execution_seq = 1, lease_until = "2030-01-01T00:00:45Z" }
    local run_ctx = { id = "run-1" }
    local db = {
        type = function() return sql.type.SQLITE end,
        release = function() end,
        query = function(_, statement: string)
            if string.find(statement, "scheduled_at", 1, true) then
                if kind == "due" and not did_claim then
                    return { { ms = deadline_ms - now_ms } }, nil
                end
                return { {} }, nil
            end
            if (kind == "lease" or kind == "renewed") and not did_claim then
                if kind == "renewed" and now_ms >= deadline_ms then return { { ms = 45000 } }, nil end
                return { { ms = deadline_ms - now_ms } }, nil
            end
            if did_claim then return { { ms = 45000 } }, nil end
            return { {} }, nil
        end,
    }
    local pool = worker_pool.new({
        retention_schedule = job_fixture.no_retention_schedule,
        sql_get = function() return db, nil end,
        policy = function() return job_fixture.pool_policy({ worker_count_sqlite = 1,
            worker_count_postgres = 1 }), nil end,
        reclaim = {
            reclaim_expired = function()
                reclaim_calls = reclaim_calls + 1
                if kind == "lease" and now_ms >= deadline_ms then reclaimed_job = true; return 1, nil end
                return 0, nil
            end,
            reclaim_terminated = function() return 0, nil end,
            close_lost_runs = function() return 0, nil end,
        },
        claim = {
            due_backlog = function() return { count = 0, oldest_age_ms = 0, overdue = 0 }, nil end,
            claim_batch = function(_db: any, _dbtype: string, count: integer)
                if count > 0 and now_ms >= deadline_ms and not did_claim
                    and (kind == "due" or reclaimed_job) then
                    did_claim = true
                    return { { id = job.id, worker_id = job.worker_id, lease_token = job.lease_token,
                        execution_seq = job.execution_seq, lease_until = job.lease_until, run_ctx = run_ctx } }, nil
                end
                return {}, nil
            end,
            release_unstarted = function() return false, nil end,
        },
        claim_execution = { release_unstarted = function() return true, nil end },
        process = {
            event = process.event,
            pid = function() return "deadline-pool" end,
            events = function() return event_ch end,
            set_options = function() end,
            listen = function(topic: string) return topic == "kickside.core.jobs:worker_idle" and idle_ch or wake_ch end,
            unlisten = function() end,
            registry = {
                register = function(name: string)
                    test.eq(name, "kickside.core.jobs.worker_pool")
                    return true, nil
                end,
                unregister = function(name: string)
                    test.eq(name, "kickside.core.jobs.worker_pool")
                    return true, nil
                end,
            },
            spawn_linked_monitored = function() return "deadline-worker" end,
            send = function(_pid: string, topic: string, message: table)
                test.eq(topic, "kickside.core.jobs:worker_assign")
                test.eq(message.job.id, job.id)
                assigned = assigned + 1
                return true, nil
            end,
            cancel = function() end,
        },
        time = {
            now = function() return { unix_nano = function() return now_ms * 1000000 end } end,
            after = function(duration: string)
                timer_durations[#timer_durations + 1] = duration
                return timer_ch
            end,
        },
        channel = { select = function(cases: any)
            if cases.default == true then return { default = true } end
            selections = selections + 1
            if selections == 1 then
                test.eq(cases[#cases], timer_ch)
                return { channel = idle_ch,
                    value = { kind = "idle", worker_id = "deadline-worker", version = "v1", epoch = 0 } }
            elseif selections == 2 then
                test.eq(cases[#cases], timer_ch)
                now_ms = deadline_ms
                return { channel = timer_ch }
            end
            return { channel = event_ch, value = { kind = process.event.CANCEL } }
        end },
        registry = { current_version = function() return { id = function() return "v1" end }, nil end },
        events = { subscribe = function()
            return { channel = function() return registry_ch end, close = function() end }, nil
        end },
    })
    pool.main()
    return assigned, reclaim_calls, timer_durations
end

local function define_tests()
    test.describe("job pool registry subscription failures", function()
        test.it("closes and drains a running pool when its subscription closes", function()
            local event_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local timer_ch = { case_receive = function(self) return self end }
            local closed, reads, spawns, drained = 0, 0, 0, 0
            local cancelled: { [string]: boolean } = {}
            local pool = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function() return empty_pool_db(sql.type.POSTGRES) end,
                claim = empty_claim(),
                reclaim = empty_reclaim(),
                policy = function()
                    reads = reads + 1
                    return job_fixture.pool_policy({ worker_count_postgres = 1,
                        worker_count_sqlite = 1, worker_awaited_slots = 1 }), nil
                end,
                process = { registry = job_fixture.process_registry("closed-subscription"),
                    event = process.event, pid = function() return "closed-subscription" end,
                    events = function() return event_ch end, set_options = function() end,
                 listen = function() return { case_receive = function(self) return self end } end,
                 unlisten = function() end,
                    spawn_linked_monitored = function()
                        spawns = spawns + 1
                        return "child-" .. tostring(spawns)
                    end,
                    cancel = function(pid) cancelled[pid] = true end },
                time = { now = function() return { unix_nano = function() return 0 end } end,
                    after = function(duration)
                        test.eq(duration, "5s", "only the drain deadline arms a timer")
                        return timer_ch
                    end },
                channel = { select = function(cases)
                    if cases.default == true then return { default = true } end
                    if #cases == 3 then
                        drained = drained + 1
                        return { channel = event_ch, value = { kind = process.event.EXIT,
                            from = "child-" .. tostring(drained) } }
                    end
                    test.eq(#cases, 4)
                    return { channel = registry_ch, ok = false }
                end },
                events = { subscribe = function() return {
                    channel = function() return registry_ch end,
                    close = function() closed = closed + 1 end,
                } end },
            })
            local result, err = pool.main()
            test.is_nil(result)
            unavailable(err)
            test.eq(reads, 1)
            test.eq(closed, 1)
            test.eq(drained, 2)
            test.eq(spawns, 2, "one general slot and one awaited slot")
            test.is_true(cancelled["child-1"] and cancelled["child-2"], "draining cancels every slot")
        end)

        test.it("restarts the supervised service after a typed subscription failure", function()
            local db, db_err = sql.get("app:db")
            if not db then error("test database unavailable: " .. tostring(db_err)) end
            test.is_nil(db_err)
            local _, table_err = db:execute([[CREATE TABLE jobs_pool_subscription_attempt
                (id TEXT PRIMARY KEY, pid TEXT NOT NULL UNIQUE)]])
            test.is_nil(table_err)
            local keeper_db = db
            local original, version_err = registry.current_version()
            test.is_nil(version_err)
            local _, register_err = process.registry.register("app:jobs_pool_subscription_test")
            test.is_nil(register_err)
            local attempts = process.listen("pool.subscription.attempt", { message = true })
            local snapshot, snapshot_err = registry.snapshot()
            test.is_nil(snapshot_err)
            local changes = snapshot:changes()
            changes:create({
                id = "app:jobs_pool_subscription_service", kind = "process.service",
                data = { process = "app:jobs_pool_subscription_probe", host = "app:processes",
                    lifecycle = { auto_start = true,
                        restart = { initial_delay = "100ms", max_delay = "100ms", max_attempts = 2 },
                        security = { groups = { "wippy.security:process" } } } },
            })
            local _, apply_err = changes:apply()
            test.is_nil(apply_err)
            local first_deadline = time.after("10s")
            local first = channel.select({ attempts:case_receive(), first_deadline:case_receive() })
            test.eq(first.channel, attempts, "first failing pool service did not start")
            test.is_true(first.ok ~= false)
            local first_pid = tostring(first.value:payload():data().pid)
            test.is_true(first_pid ~= "")
            local _, first_ack_err = process.send(first_pid, "pool.subscription.ack", {})
            test.is_nil(first_ack_err)
            local second_deadline = time.after("10s")
            local second = channel.select({ attempts:case_receive(), second_deadline:case_receive() })
            if second.channel ~= attempts then
                local diagnostic, diagnostic_err = sql.get("app:db")
                if not diagnostic then error("test database unavailable: " .. tostring(diagnostic_err)) end
                test.is_nil(diagnostic_err)
                local seen, seen_err = diagnostic:query("SELECT pid FROM jobs_pool_subscription_attempt ORDER BY id")
                diagnostic:release()
                test.is_nil(seen_err)
                error("pool service restart signal timed out; durable attempts=" .. tostring(#seen))
            end
            test.is_true(second.ok ~= false)
            local second_pid = tostring(second.value:payload():data().pid)
            test.is_true(second_pid ~= "")
            local _, second_ack_err = process.send(second_pid, "pool.subscription.ack", {})
            test.is_nil(second_ack_err)
            process.unlisten(attempts)
            local _, unregister_err = process.registry.unregister("app:jobs_pool_subscription_test")
            test.is_nil(unregister_err)
            test.is_true(first_pid ~= second_pid)
            local check, check_err = sql.get("app:db")
            if not check then error("test database unavailable: " .. tostring(check_err)) end
            test.is_nil(check_err)
            local rows, query_err = check:query("SELECT pid FROM jobs_pool_subscription_attempt ORDER BY id")
            check:release()
            test.is_nil(query_err)
            local restored, restore_err = registry.apply_version(original)
            test.is_nil(restore_err)
            test.is_true(restored)
            local cleanup, cleanup_err = sql.get("app:db")
            if not cleanup then error("test database unavailable: " .. tostring(cleanup_err)) end
            test.is_nil(cleanup_err)
            local _, drop_err = cleanup:execute("DROP TABLE jobs_pool_subscription_attempt")
            cleanup:release()
            keeper_db:release()
            test.is_nil(drop_err)
            test.eq(#rows, 2, "the service did not restart after the pool returned UNAVAILABLE")
            test.is_true(rows[1].pid ~= rows[2].pid)
        end)
    end)
end
return test.run_cases(define_tests)
