local test = require("test")
local sql = require("sql")
local process = require("process")
local worker_pool = require("worker_pool")
local job_fixture = require("job_fixture")

local function run_drain(stop_kind: string, timeout: boolean, stop_during_drain: boolean?): table
    local events_ch = { case_receive = function(self) return self end }
    local registry_ch = { case_receive = function(self) return self end }
    local idle_ch = { case_receive = function(self) return self end }
    local wake_ch = { case_receive = function(self) return self end }
    local timer_ch = { case_receive = function(self) return self end }
    local outcome = { cancels = {}, exits = {}, assignments = 0, upgrades = 0, closed = false,
        released = 0, selections = 0 }
    local spawned = 0
    local desired = 2
    local retired = "drain-slot-2"
    local function closed(): ()
        test.is_true(outcome.exits["drain-slot-1"] == true, "the assigned slot exits before the pool closes")
        test.is_true(outcome.exits[retired] == true, "a retired slot exits before the pool closes")
        outcome.closed = true
    end
    local pool = worker_pool.new({
        retention_schedule = job_fixture.no_retention_schedule,
        sql_get = function() return {
            type = function() return sql.type.SQLITE end,
            query = function() return { {} }, nil end,
            release = function() end,
        }, nil end,
        policy = function() return job_fixture.pool_policy({ worker_count_sqlite = desired,
            worker_count_postgres = desired, worker_awaited_slots = 0 }), nil end,
        reclaim = { reclaim_expired = function() return 0, nil end,
            reclaim_terminated = function() return 0, nil end,
            close_lost_runs = function() return 0, nil end },
        claim = { due_backlog = function() return { count = 0, oldest_age_ms = 0, overdue = 0 }, nil end,
            claim_batch = function(_, _, _, _, _, ids)
            if outcome.assignments == 0 and #ids > 0 then
                return { { id = "drain-job", worker_id = ids[1], run_ctx = { id = "drain-run" } } }, nil
            end
            return {}, nil
        end },
        claim_execution = { release_unstarted = function()
            test.is_true(outcome.exits["drain-slot-1"] == true, "release follows the slot's confirmed exit")
            outcome.released = outcome.released + 1
            return true, nil
        end },
        process = {
            event = process.event, pid = function() return "drain-pool" end,
            events = function() return events_ch end, set_options = function() end,
            listen = function(topic: string)
                return topic == "kickside.core.jobs:worker_idle" and idle_ch or wake_ch
            end,
            unlisten = function() closed() end,
            registry = { register = function() return true, nil end, unregister = function() closed(); return true, nil end },
            spawn_linked_monitored = function()
                spawned = spawned + 1
                return "drain-slot-" .. tostring(spawned)
            end,
            send = function() outcome.assignments = outcome.assignments + 1; return true, nil end,
            cancel = function(pid: string) outcome.cancels[pid] = true; return true, nil end,
            upgrade = function()
                test.is_true(outcome.closed)
                outcome.upgrades = outcome.upgrades + 1
                return nil, nil
            end,
        },
        time = { now = function() return { unix_nano = function() return 0 end } end,
            after = function() return timer_ch end },
        channel = { select = function(cases: any)
            if cases.default == true then return { default = true } end
            outcome.selections = outcome.selections + 1
            local n = outcome.selections
            if n == 1 then
                return { channel = idle_ch, value = { kind = "idle", worker_id = "drain-slot-1", version = "v1", epoch = 0 } }
            elseif n == 2 then
                desired = 1
                return { channel = registry_ch }
            elseif n == 3 then
                return { channel = events_ch, value = { kind = stop_kind } }
            end
            test.is_true(outcome.cancels["drain-slot-1"] == true)
            test.is_true(outcome.cancels[retired] == true)
            if timeout then return { channel = timer_ch } end
            if n == 4 and stop_during_drain then
                return { channel = events_ch, value = { kind = process.event.CANCEL } }
            elseif n == 4 then
                return { channel = idle_ch, value = { kind = "idle", worker_id = "drain-slot-1", version = "v1", epoch = 1 } }
            end
            local pid = n == 5 and "drain-slot-1" or retired
            outcome.exits[pid] = true
            return { channel = events_ch, value = { kind = process.event.EXIT, from = pid } }
        end },
        registry = { current_version = function() return { id = function() return "v1" end }, nil end },
        events = { subscribe = function() return {
            channel = function() return registry_ch end, close = function() closed() end,
        }, nil end },
    })
    local _, err = pool.main()
    outcome.err = err
    return outcome
end

-- A pool driver whose selections are scripted by `script(n, outcome)`. It
-- records cancellations, assignments, releases, spawns, upgrades and the
-- handover the pool passes to its upgraded code.
local function pool_driver(script: any, options: table?): (any, table)
    local opts = options or {}
    local events_ch = { case_receive = function(self) return self end }
    local registry_ch = { case_receive = function(self) return self end }
    local idle_ch = { case_receive = function(self) return self end }
    local wake_ch = { case_receive = function(self) return self end }
    local timer_ch = { case_receive = function(self) return self end }
    local outcome = { cancels = {}, assignments = {}, released = {}, spawned = {}, upgrades = {},
        unregistered = 0, selections = 0, desired = opts.desired or 2, now = 0,
        channels = { events = events_ch, registry = registry_ch, idle = idle_ch, wake = wake_ch, timer = timer_ch } }
    local spawned = 0
    local pool = worker_pool.new({
        retention_schedule = job_fixture.no_retention_schedule,
        sql_get = function() return {
            type = function() return sql.type.SQLITE end,
            query = function() return { {} }, nil end,
            release = function() end,
        }, nil end,
        policy = function() return job_fixture.pool_policy({ worker_count_sqlite = outcome.desired,
            worker_count_postgres = outcome.desired, worker_awaited_slots = 0 }), nil end,
        reclaim = { reclaim_expired = function() return 0, nil end,
            reclaim_terminated = function() return 0, nil end,
            close_lost_runs = function() return 0, nil end },
        claim = { due_backlog = function() return { count = 0, oldest_age_ms = 0, overdue = 0 }, nil end,
            claim_batch = function(_, _, _, _, _, ids)
            if opts.claim_once and #outcome.assignments == 0 and #ids > 0 then
                return { { id = "drain-job", worker_id = ids[1], run_ctx = { id = "drain-run" } } }, nil
            end
            return {}, nil
        end },
        claim_execution = { release_unstarted = function(_, job, worker_id, run_id)
            outcome.released[#outcome.released + 1] = { job_id = job.id, worker_id = worker_id, run_id = run_id }
            return true, nil
        end },
        process = {
            event = process.event, pid = function() return "drain-pool" end,
            events = function() return events_ch end, set_options = function() end,
            listen = function(topic: string)
                return topic == "kickside.core.jobs:worker_idle" and idle_ch or wake_ch
            end,
            unlisten = function() end,
            registry = {
                register = function()
                    if opts.name_held then
                        return false, errors.new({ kind = errors.ALREADY_EXISTS, message = "held" })
                    end
                    return true, nil
                end,
                lookup = function() return "drain-pool", nil end,
                unregister = function() outcome.unregistered = outcome.unregistered + 1; return true, nil end,
            },
            monitor = function() error("a pool holding its own singleton name monitors no owner") end,
            spawn_linked_monitored = function()
                spawned = spawned + 1
                local pid = "drain-slot-" .. tostring(spawned + (opts.pid_offset or 0))
                outcome.spawned[#outcome.spawned + 1] = pid
                return pid
            end,
            send = function(pid: string, _, message: any)
                outcome.assignments[#outcome.assignments + 1] = { pid = pid, epoch = message.epoch }
                if opts.exited_slot == pid then
                    return nil, errors.new({ kind = errors.NOT_FOUND, message = "process not found" })
                end
                return true, nil
            end,
            cancel = function(pid: string) outcome.cancels[pid] = true; return true, nil end,
            upgrade = function(source: any, handover: any)
                outcome.upgrades[#outcome.upgrades + 1] = { source = source, handover = handover }
                return nil, nil
            end,
        },
        time = { now = function() return { unix_nano = function() return outcome.now end } end,
            after = function() return timer_ch end },
        channel = { select = function(cases: any)
            if cases.default == true then return { default = true } end
            outcome.selections = outcome.selections + 1
            return script(outcome.selections, outcome)
        end },
        registry = { current_version = function() return { id = function() return opts.version or "v1" end }, nil end },
        events = { subscribe = function() return {
            channel = function() return registry_ch end, close = function() end,
        }, nil end },
    })
    return pool, outcome
end

-- Scripted lead-in shared by the upgrade cases: slot 1 reports idle and takes
-- one job, then a smaller capacity retires slot 2, then the code changes.
local function busy_then_outdated(n: integer, outcome: table): table
    local c = outcome.channels
    if n == 1 then
        return { channel = c.idle, value = { kind = "idle", worker_id = "drain-slot-1", version = "v1", epoch = 0 } }
    elseif n == 2 then
        outcome.desired = 1
        return { channel = c.registry }
    elseif n == 3 then
        return { channel = c.events, value = { kind = process.event.OUTDATED } }
    end
    error("the pool kept selecting after OUTDATED: selection " .. tostring(n))
end

local function define_tests()
    test.describe("jobs pool drain ordering", function()
        test.it("waits for active and retired loops before it stops on cancel", function()
            local outcome = run_drain(process.event.CANCEL, false)
            test.is_nil(outcome.err)
            test.eq(outcome.assignments, 1, "idle notices during drain never dispatch work")
            test.eq(outcome.released, 1)
            test.eq(outcome.upgrades, 0)
        end)
        test.it("reports a real failure when a cancelled loop does not exit within its drain budget", function()
            local outcome = run_drain(process.event.CANCEL, true)
            test.not_nil(outcome.err)
            test.is_true(string.find(tostring(outcome.err), "drain", 1, true) ~= nil)
            test.eq(outcome.upgrades, 0)
            test.eq(outcome.released, 0)
            test.is_false(outcome.closed)
        end)
    end)

    test.describe("jobs pool in-place upgrade", function()
        test.it("upgrades on OUTDATED without cancelling a busy slot and hands its assignment to the new code", function()
            local pool, outcome = pool_driver(busy_then_outdated, { claim_once = true })
            local _, err = pool.main()
            test.is_nil(err)
            test.eq(#outcome.upgrades, 1)
            test.is_nil(outcome.cancels["drain-slot-1"], "a busy slot keeps its in-flight execution")
            test.is_true(outcome.cancels["drain-slot-2"] == true, "the resize still retires its slot")
            test.eq(outcome.unregistered, 0, "the upgraded pool keeps its singleton name")
            test.eq(#outcome.released, 0)
            local handover = outcome.upgrades[1].handover
            test.not_nil(handover)
            test.eq(handover.size, 1)
            test.eq(#handover.slots, 1)
            test.eq(handover.slots[1].slot, 1)
            test.eq(handover.slots[1].pid, "drain-slot-1")
            test.eq(handover.slots[1].epoch, 1)
            test.eq(handover.slots[1].assignment.job.id, "drain-job")
            test.eq(handover.slots[1].assignment.run_id, "drain-run")
            test.eq(#handover.retired, 1)
            test.eq(handover.retired[1], "drain-slot-2")
        end)

        test.it("adopts handed-over slots: an adopted slot's exit settles its assignment and respawns it", function()
            local first, first_outcome = pool_driver(busy_then_outdated, { claim_once = true })
            first.main()
            local handover = first_outcome.upgrades[1].handover
            local exited: { [string]: boolean } = {}
            local pool, outcome = pool_driver(function(n: integer, state: table): table
                local c = state.channels
                if n == 1 then
                    state.now = 60 * 1e9
                    exited["drain-slot-1"] = true
                    return { channel = c.events, value = { kind = process.event.EXIT, from = "drain-slot-1" } }
                elseif n == 2 then
                    return { channel = c.events, value = { kind = process.event.CANCEL } }
                end
                local pending: string? = nil
                for _, pid in ipairs({ "drain-slot-2", "drain-slot-3" }) do
                    if not exited[pid] then pending = pid; break end
                end
                if not pending then error("the pool kept waiting after every child exited") end
                exited[pending :: string] = true
                return { channel = c.events, value = { kind = process.event.EXIT, from = pending } }
            end, { desired = 1, name_held = true, pid_offset = 2, version = "v2" })
            local _, err = pool.main(handover)
            test.is_nil(err)
            test.eq(#outcome.spawned, 1, "an adopted capacity spawns only the exited slot's replacement")
            test.eq(outcome.spawned[1], "drain-slot-3")
            test.eq(#outcome.released, 1)
            test.eq(outcome.released[1].worker_id, "drain-slot-1")
            test.eq(outcome.released[1].job_id, "drain-job")
            test.eq(outcome.released[1].run_id, "drain-run")
            test.is_true(outcome.cancels["drain-slot-3"] == true)
            test.is_true(exited["drain-slot-2"] == true, "the cancel drain waits for the adopted retired slot")
        end)

        test.it("settles an assignment sent to a slot that already exited through that slot's EXIT", function()
            local exited: { [string]: boolean } = {}
            local pool, outcome = pool_driver(function(n: integer, state: table): table
                local c = state.channels
                if n == 1 then
                    return { channel = c.idle, value = { kind = "idle", worker_id = "drain-slot-1", version = "v1", epoch = 0 } }
                elseif n == 2 then
                    state.now = 60 * 1e9
                    exited["drain-slot-1"] = true
                    return { channel = c.events, value = { kind = process.event.EXIT, from = "drain-slot-1" } }
                elseif n == 3 then
                    return { channel = c.events, value = { kind = process.event.CANCEL } }
                end
                for _, pid in ipairs({ "drain-slot-2", "drain-slot-3" }) do
                    if not exited[pid] then
                        exited[pid] = true
                        return { channel = c.events, value = { kind = process.event.EXIT, from = pid } }
                    end
                end
                error("the pool kept waiting after every child exited")
            end, { claim_once = true, exited_slot = "drain-slot-1" })
            local _, err = pool.main()
            test.is_nil(err)
            test.eq(#outcome.assignments, 1)
            test.is_nil(outcome.cancels["drain-slot-1"], "an exited slot needs no cancellation")
            test.eq(#outcome.released, 1)
            test.eq(outcome.released[1].job_id, "drain-job")
            test.eq(outcome.released[1].worker_id, "drain-slot-1")
            test.eq(outcome.spawned[3], "drain-slot-3", "the exited slot is replaced")
        end)

        test.it("dispatches no work to a handed-over idle slot of the previous version", function()
            local first, first_outcome = pool_driver(function(n: integer, state: table): table
                local c = state.channels
                if n == 1 then
                    return { channel = c.idle, value = { kind = "idle", worker_id = "drain-slot-1", version = "v1", epoch = 0 } }
                elseif n == 2 then
                    return { channel = c.events, value = { kind = process.event.OUTDATED } }
                end
                error("unexpected selection")
            end, { desired = 1 })
            first.main()
            local handover = first_outcome.upgrades[1].handover
            local pool, outcome = pool_driver(function(n: integer, state: table): table
                local c = state.channels
                if n == 1 then return { channel = c.wake } end
                if n == 2 then return { channel = c.events, value = { kind = process.event.CANCEL } } end
                return { channel = c.events, value = { kind = process.event.EXIT, from = "drain-slot-1" } }
            end, { desired = 1, name_held = true, claim_once = true, version = "v2" })
            local _, err = pool.main(handover)
            test.is_nil(err)
            test.eq(#outcome.assignments, 0, "an old-version idle slot recycles before it takes work")
            test.eq(#outcome.spawned, 0)
            test.is_true(outcome.cancels["drain-slot-1"] == true)
        end)
    end)
end

return test.run_cases(define_tests)
