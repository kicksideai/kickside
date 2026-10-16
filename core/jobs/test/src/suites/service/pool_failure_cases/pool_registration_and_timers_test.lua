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
            test.not_nil((string.find(statement, "scheduled_at", 1, true)))
            test.not_nil((string.find(statement, "lease_until", 1, true)))
            if kind == "due" and not did_claim then
                return { { ms = deadline_ms - now_ms, kind = "due" } }, nil
            end
            if (kind == "lease" or kind == "renewed") and not did_claim then
                if kind == "renewed" and now_ms >= deadline_ms then return { { ms = 45000, kind = "lease" } }, nil end
                return { { ms = deadline_ms - now_ms, kind = "lease" } }, nil
            end
            if did_claim then return { { ms = 45000, kind = "lease" } }, nil end
            return {}, nil
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
                if duration == "5s" then return timer_ch end
                timer_durations[#timer_durations + 1] = duration
                return timer_ch
            end,
        },
        channel = { select = function(cases: any)
            if cases.default == true then return { default = true } end
            if #cases == 3 then
                return { channel = event_ch, value = { kind = process.event.EXIT, from = "deadline-worker" } }
            end
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
        test.it("keeps a shared pool contender alive until the owner exits", function()
            local event_ch = { case_receive = function(self) return self end }
            local registrations, monitors, selections, closed = 0, 0, 0, 0
            local snapshot_failure = errors.new({kind = errors.UNAVAILABLE, retryable = true,
                message = "snapshot failure after takeover", details = {code = "pool_takeover_snapshot"}})
            local pool = worker_pool.new({
                process = {
                    event = process.event,
                    pid = function() return "standby-pool" end,
                    events = function() return event_ch end,
                    set_options = function() end,
                    listen = function() return { case_receive = function(self) return self end } end,
                    unlisten = function() end,
                    monitor = function(owner: string)
                        test.eq(owner, "remote-pool")
                        monitors = monitors + 1
                        return true, nil
                    end,
                    registry = {
                        register = function(name: string, owner: any, scope: any)
                            test.eq(name, "kickside.core.jobs.worker_pool")
                            test.is_nil(owner)
                            test.eq(scope, process.registry.CONSISTENT)
                            registrations = registrations + 1
                            if registrations == 1 then
                                return false, errors.new({ kind = errors.ALREADY_EXISTS, message = "remote owner" })
                            end
                            return true, nil
                        end,
                        lookup = function(name: string, scope: any)
                            test.eq(name, "kickside.core.jobs.worker_pool")
                            test.eq(scope, process.registry.CONSISTENT)
                            return "remote-pool", nil
                        end,
                        unregister = function(name: string, scope: any)
                            test.eq(name, "kickside.core.jobs.worker_pool")
                            test.eq(scope, process.registry.CONSISTENT)
                            return true, nil
                        end,
                    },
                },
                events = { subscribe = function()
                    return { channel = function() return {} end,
                        close = function() closed = closed + 1 end }, nil
                end },
                channel = { select = function(cases: any)
                    if cases.default == true then return { default = true } end
                    test.eq(#cases, 1)
                    test.eq(cases[1], event_ch)
                    selections = selections + 1
                    if selections == 1 then
                        return { channel = event_ch, value = { kind = process.event.EXIT, from = "other-pool" } }
                    end
                    return { channel = event_ch, value = { kind = process.event.EXIT, from = "remote-pool" } }
                end },
                registry = { current_version = function()
                    test.eq(registrations, 2)
                    return nil, snapshot_failure
                end },
            })
            local value, err = pool.main()
            test.is_nil(value)
            unavailable(err)
            test.contains(tostring(err), "snapshot failure after takeover")
            test.eq(err:details().code, "pool_takeover_snapshot")
            test.eq(registrations, 2)
            test.eq(monitors, 1)
            test.eq(selections, 2)
            test.eq(closed, 1)
        end)

        test.it("claims work committed before slot registration without a producer nudge", function()
            local db, dbtype, queue_err = job_fixture.private_queue("app:private_queue_pool_registration_and_timers_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            test.not_nil(db)
            local worker_id = "late-register-worker"
            local _, worker_err = db:execute("INSERT INTO kickside_job_worker"
                .. "(id,registry_version,last_seen_at) VALUES($1,'v1',CURRENT_TIMESTAMP)", { worker_id })
            test.is_nil(worker_err)
            local job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                owner_locator = { kind = "test", id = "worker_pool_failure_test" },
                thread_id = uuid.v7(), job_type = "late-register-job" })
            test.is_nil(enqueue_err)
            test.not_nil(job_id)
            local event_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local idle_ch = { case_receive = function(self) return self end }
            local timer_ch = { case_receive = function(self) return self end }
            local now_ns, selections, sends = 0, 0, 0
            local root = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function() return {
                    type = function() return db:type() end,
                    query = function(_, ...) return db:query(...) end,
                    begin = function() return db:begin() end,
                    release = function() end,
                }, nil end,
                policy = function() return job_fixture.pool_policy({ worker_count_sqlite = 1,
                    worker_count_postgres = 1 }), nil end,
                process = {
                    registry = job_fixture.process_registry("late-register-pool"),
                    event = process.event, pid = function() return "late-register-pool" end,
                    events = function() return event_ch end, set_options = function() end,
                    listen = function() return idle_ch end, unlisten = function() end,
                    spawn_linked_monitored = function() return worker_id end,
                    send = function(_, topic, message)
                        test.eq(topic, "kickside.core.jobs:worker_assign")
                        test.eq(message.job.id, job_id)
                        test.eq(message.epoch, 1)
                        sends = sends + 1
                        return true, nil
                    end,
                    cancel = function() end,
                },
                time = {
                    now = function() return { unix_nano = function() return now_ns end } end,
                    after = function() return timer_ch end,
                },
                channel = { select = function(cases)
                    if cases.default == true then return { default = true } end
                    if #cases == 3 then
                        return { channel = event_ch, value = { kind = process.event.EXIT, from = worker_id } }
                    end
                    selections = selections + 1
                    if selections == 1 then
                        return { channel = idle_ch,
                            value = { kind = "idle", worker_id = worker_id, version = "v1", epoch = 0 } }
                    elseif selections == 2 then
                        now_ns = 2000000
                        return { channel = timer_ch }
                    end
                    return { channel = event_ch, value = { kind = process.event.CANCEL } }
                end },
                registry = { current_version = function()
                    return { id = function() return "v1" end }, nil
                end },
                events = { subscribe = function() return {
                    channel = function() return registry_ch end, close = function() end,
                } end },
            })
            root.main()
            db:release()
            test.eq(sends, 1)
        end)

        test.it("claims a committed enqueue from the pool nudge without a wait timer", function()
            local db, dbtype, queue_err = job_fixture.private_queue("app:private_queue_pool_registration_and_timers_test")
            if not db or not dbtype then error("test queue unavailable: " .. tostring(queue_err)) end
            test.is_nil(queue_err)
            test.not_nil(db)
            local worker_id = "notified-worker"
            local _, worker_err = db:execute("INSERT INTO kickside_job_worker"
                .. "(id,registry_version,last_seen_at) VALUES($1,'v1',CURRENT_TIMESTAMP)", { worker_id })
            test.is_nil(worker_err)
            local event_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local idle_ch = { case_receive = function(self) return self end }
            local wake_ch = { case_receive = function(self) return self end }
            local timer_ch = { case_receive = function(self) return self end }
            local now_ns, selections, sends, timer_count = 0, 0, 0, 0
            local job_id: string? = nil
            local enqueue_err: error? = nil
            local root = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function() return {
                    type = function() return db:type() end,
                    query = function(_, ...) return db:query(...) end,
                    begin = function() return db:begin() end,
                    release = function() end,
                }, nil end,
                policy = function() return job_fixture.pool_policy({ worker_count_sqlite = 1,
                    worker_count_postgres = 1 }), nil end,
                process = {
                    registry = job_fixture.process_registry("notified-pool"),
                    event = process.event, pid = function() return "notified-pool" end,
                    events = function() return event_ch end, set_options = function() end,
                    listen = function(topic)
                        return topic == "kickside.core.jobs:worker_idle" and idle_ch or wake_ch
                    end, unlisten = function() end,
                    spawn_linked_monitored = function() return worker_id end,
                    send = function(_, topic, message)
                        test.eq(topic, "kickside.core.jobs:worker_assign")
                        test.eq(message.job.id, job_id)
                        test.eq(message.epoch, 1)
                        sends = sends + 1
                        return true, nil
                    end,
                    cancel = function() end,
                },
                time = {
                    now = function() return { unix_nano = function() return now_ns end } end,
                    after = function(duration)
                        if duration == "5s" then return timer_ch end
                        timer_count = timer_count + 1
                        test.eq(sends, 1, "the pool nudge must claim before the lease timer")
                        test.is_true(tonumber(string.match(duration, "^(%d+)ms$")) > 40000)
                        return timer_ch
                    end,
                },
                channel = { select = function(cases)
                    if cases.default == true then return { default = true } end
                    if #cases == 3 then
                        return { channel = event_ch, value = { kind = process.event.EXIT, from = worker_id } }
                    end
                    selections = selections + 1
                    if selections == 1 then
                        test.eq(#cases, 4)
                        return { channel = idle_ch,
                            value = { kind = "idle", worker_id = worker_id, version = "v1", epoch = 0 } }
                    elseif selections == 2 then
                        test.eq(timer_count, 0, "the empty pool blocks without an idle re-scan timer")
                        job_id, enqueue_err = lifecycle.enqueue_job(db, dbtype, {
                            owner_locator = { kind = "test", id = "worker_pool_failure_test" },
                            thread_id = uuid.v7(), job_type = "notified-enqueue-job" })
                        return { channel = wake_ch, value = { kind = "committed" } }
                    end
                    test.eq(sends, 1)
                    test.eq(timer_count, 1, "only the claimed lease expiry arms a timer")
                    return { channel = event_ch, value = { kind = process.event.CANCEL } }
                end },
                registry = { current_version = function()
                    return { id = function() return "v1" end }, nil
                end },
                events = { subscribe = function() return {
                    channel = function() return registry_ch end, close = function() end,
                } end },
            })
            root.main()
            db:release()
            test.is_nil(enqueue_err)
            test.not_nil(job_id)
            test.eq(sends, 1)
        end)

        test.it("claims a future scheduled job at its indexed deadline", function()
            local assigned, reclaim_calls, timers = run_deadline_case("due")
            test.eq(assigned, 1)
            test.eq(reclaim_calls, 1)
            test.eq(timers[1], "250ms")
            test.eq(timers[#timers], "45000ms")
        end)

        test.it("reclaims an expired lease at its exact deadline", function()
            local assigned, reclaim_calls, timers = run_deadline_case("lease")
            test.eq(assigned, 1)
            test.eq(reclaim_calls, 2)
            test.eq(timers[1], "250ms")
            test.eq(timers[#timers], "45000ms")
        end)

        test.it("rearms a stale lease timer to the renewed committed expiry", function()
            local assigned, reclaim_calls, timers = run_deadline_case("renewed")
            test.eq(assigned, 0)
            test.eq(reclaim_calls, 2)
            test.eq(timers[1], "250ms")
            test.eq(timers[#timers], "45000ms")
        end)

        test.it("leaves an idle pool blocked without a discovery timer", function()
            local event_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local idle_ch = { case_receive = function(self) return self end }
            local wake_ch = { case_receive = function(self) return self end }
            local timer_ch = { case_receive = function(self) return self end }
            local selections, timer_count, drain_timers = 0, 0, 0
            local pool = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function() return {
                    type = function() return sql.type.SQLITE end,
                    query = function() return { {} }, nil end,
                    release = function() end,
                }, nil end,
                policy = function() return job_fixture.pool_policy({ worker_count_sqlite = 1,
                    worker_count_postgres = 1 }), nil end,
                reclaim = {
                    reclaim_expired = function() return 0, nil end,
                    reclaim_terminated = function() return 0, nil end,
                    close_lost_runs = function() return 0, nil end,
                },
                claim = {
                    due_backlog = function() return { count = 0, oldest_age_ms = 0, overdue = 0 }, nil end,
                    claim_batch = function() return {}, nil end,
                    release_unstarted = function() return false, nil end,
                },
                process = {
                    event = process.event,
                    pid = function() return "idle-pool" end,
                    events = function() return event_ch end,
                    set_options = function() end,
                    listen = function(topic: string) return topic == "kickside.core.jobs:worker_idle" and idle_ch or wake_ch end,
                    unlisten = function() end,
                    registry = { register = function() return true, nil end, unregister = function() return true, nil end },
                    spawn_linked_monitored = function() return "idle-worker" end,
                    send = function() return true, nil end,
                    cancel = function() end,
                },
                time = {
                    now = function() return { unix_nano = function() return 0 end } end,
                    after = function(duration)
                        if duration == "5s" then
                            drain_timers = drain_timers + 1
                            return timer_ch
                        end
                        timer_count = timer_count + 1
                        error("empty pool armed a timer")
                    end,
                },
                channel = { select = function(cases: any)
                    if cases.default == true then return { default = true } end
                    if #cases == 3 then
                        return { channel = event_ch, value = { kind = process.event.EXIT, from = "idle-worker" } }
                    end
                    selections = selections + 1
                    test.eq(#cases, 4)
                    if selections == 1 then
                        return { channel = idle_ch,
                            value = { kind = "idle", worker_id = "idle-worker", version = "v1", epoch = 0 } }
                    end
                    return { channel = event_ch, value = { kind = process.event.CANCEL } }
                end },
                registry = { current_version = function() return { id = function() return "v1" end }, nil end },
                events = { subscribe = function() return {
                    channel = function() return registry_ch end, close = function() end,
                }, nil end },
            })
            pool.main()
            test.eq(selections, 2)
            test.eq(timer_count, 0)
            test.eq(drain_timers, 1)
        end)

        test.it("re-reads pool size when a version-recycling slot exits without a commit hint", function()
            local reads, spawns, selections, drained = 0, 0, 0, 0
            local cancelled: { string } = {}
            local events_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local idle_ch = { case_receive = function(self) return self end }
            local timer_ch = { case_receive = function(self) return self end }
            local pool = worker_pool.new({
                retention_schedule = job_fixture.no_retention_schedule,
                sql_get = function() return empty_pool_db(sql.type.POSTGRES) end,
                claim = empty_claim(),
                reclaim = empty_reclaim(),
                policy = function()
                    reads = reads + 1
                    return job_fixture.pool_policy({ worker_count_postgres = reads == 1 and 2 or 1,
                        worker_count_sqlite = 1, worker_awaited_slots = 1 }), nil
                end,
                process = {
                    registry = job_fixture.process_registry("lost-registry-hint"),
                    event = process.event, pid = function() return "lost-registry-hint" end,
                    events = function() return events_ch end,
                    set_options = function() end,
                    listen = function() return idle_ch end,
                    unlisten = function() end,
                    spawn_linked_monitored = function()
                        spawns = spawns + 1
                        return "slot-" .. tostring(spawns)
                    end,
                    cancel = function(pid) cancelled[#cancelled + 1] = pid end,
                },
                time = {
                    now = function() return { unix_nano = function() return 0 end } end,
                    after = function() return timer_ch end,
                },
                channel = { select = function(cases)
                    if cases.default == true then return { default = true } end
                    if #cases == 3 then
                        drained = drained + 1
                        return { channel = events_ch, value = { kind = process.event.EXIT,
                            from = "slot-" .. tostring(drained + 1) } }
                    end
                    selections = selections + 1
                    if selections == 1 then
                        test.eq(#cases, 4)
                        return { channel = events_ch,
                            value = { kind = process.event.EXIT, from = "slot-1" } }
                    end
                    test.eq(reads, 2, "a lost commit hint must not retain the old pool size")
                    test.eq(cancelled[1], "slot-3")
                    return { channel = events_ch, value = { kind = process.event.CANCEL } }
                end },
                events = { subscribe = function() return {
                    channel = function() return registry_ch end, close = function() end,
                } end },
            })
            pool.main()
            test.eq(spawns, 3)
            test.eq(selections, 2)
            test.eq(drained, 2)
        end)

        test.it("returns typed UNAVAILABLE for an error or missing subscription before reading policy", function()
            for _, mode in ipairs({ "error", "missing" }) do
                local reads = 0
                local pool = worker_pool.new({
                    retention_schedule = job_fixture.no_retention_schedule,
                    sql_get = function() reads = reads + 1; return nil end,
                    policy = function() reads = reads + 1; return nil end,
                    process = { pid = function() return "failed-subscribe" end,
                        events = function() return {} end, set_options = function() end },
                    events = { subscribe = function(system, kind)
                        test.eq(system, "registry")
                        test.eq(kind, "registry.commit")
                        if mode == "error" then
                            return nil, errors.new({ kind = errors.UNAVAILABLE, message = "bus down", retryable = true })
                        end
                        return nil, nil
                    end },
                })
                local result, err = pool.main()
                test.is_nil(result)
                unavailable(err)
                test.eq(reads, 0)
            end
        end)

    end)
end
return test.run_cases(define_tests)
