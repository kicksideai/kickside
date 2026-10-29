local test = require("test")
local process = require("process")
local sql = require("sql")
local worker_pool = require("worker_pool")
local fixture = require("job_fixture")

return {run = test.run_cases(function()
    test.describe("live pool capacity", function()
        test.it("rechecks capacity on slot exit without opening SQL or rereading committed overrides", function()
            local function ch() return {case_receive = function(self) return self end} end
            local events_ch, registry_ch, idle_ch, wake_ch = ch(), ch(), ch(), ch()
            local sql_reads, override_reads, version_reads, selections, before_exit, spawned = 0, 0, 0, 0, 0, 0
            local pool = worker_pool.new({
                sql_get = function()
                    sql_reads = sql_reads + 1
                    return {type = function() return sql.type.SQLITE end,
                        query = function() return {}, nil end, release = function() end}, nil
                end,
                overrides = {revision = function() return 1, nil end, read = function()
                    override_reads = override_reads + 1
                    return {revision = 1, values = {["worker.count_sqlite"] = 1, ["worker.awaited_slots"] = 1}}, nil
                end},
                policy = function() return fixture.pool_policy(), nil end,
                retention_schedule = fixture.no_retention_schedule,
                reclaim = {reclaim_expired = function() return 0 end, reclaim_terminated = function() return 0 end,
                    close_lost_runs = function() return 0 end},
                claim = {due_backlog = function() return {count = 0}, nil end,
                    claim_batch = function() return {}, nil end},
                process = {
                    event = process.event, pid = function() return "exit-pool" end,
                    events = function() return events_ch end, set_options = function() end,
                    listen = function(topic) return topic == "kickside.core.jobs:worker_idle" and idle_ch or wake_ch end,
                    unlisten = function() end, registry = fixture.process_registry("exit-pool"),
                    spawn_linked_monitored = function() spawned = spawned + 1; return "slot-" .. tostring(spawned) end,
                    cancel = function() return true, nil end,
                },
                registry = {current_version = function()
                    version_reads = version_reads + 1
                    return {id = function() return "exit-version-" .. tostring(version_reads) end}, nil
                end},
                events = {subscribe = function() return {channel = function() return registry_ch end, close = function() end}, nil end},
                time = {now = function() return {unix_nano = function() return 0 end} end,
                    after = function() return ch() end},
                channel = {select = function(cases)
                    if cases.default then return {default = true} end
                    if #cases == 3 then return {channel = events_ch, value = {kind = process.event.EXIT, from = "slot-2"}} end
                    selections = selections + 1
                    if selections == 1 then
                        before_exit = sql_reads
                        return {channel = events_ch, value = {kind = process.event.EXIT, from = "slot-1"}}
                    end
                    test.eq(sql_reads, before_exit, "capacity refresh uses the cached dialect")
                    test.eq(override_reads, 1, "the revision is already resolved by the owner")
                    test.eq(version_reads, 2, "slot exit checks for a lost registry commit hint")
                    return {channel = events_ch, value = {kind = process.event.CANCEL}}
                end},
            })
            local _, err = pool.main()
            test.is_nil(err)
            test.eq(selections, 2)
        end)

        test.it("grows on wake and lets a busy surplus slot finish before retirement", function()
            local function ch() return {case_receive = function(self) return self end} end
            local events_ch, registry_ch, idle_ch, wake_ch = ch(), ch(), ch(), ch()
            local desired, spawned, step, assignments = 2, 0, 0, 0
            local canceled = {}
            local db = {type = function() return sql.type.POSTGRES end,
                query = function() return {}, nil end, release = function() end}
            local pool = worker_pool.new({
                sql_get = function() return db, nil end,
                policy = function() return fixture.pool_policy({worker_count_postgres = desired, worker_awaited_slots = 0}), nil end,
                retention_schedule = fixture.no_retention_schedule,
                reclaim = {reclaim_expired = function() return 0 end, reclaim_terminated = function() return 0 end,
                    close_lost_runs = function() return 0 end},
                claim = {
                    due_backlog = function() return {count = 0}, nil end,
                    claim_batch = function(_, _, count, _, _, ids)
                        if count > 0 and assignments == 0 then
                            assignments = assignments + 1
                            return {{id = "active", job_type = "fixture", worker_id = ids[1], run_ctx = {id = "run"}}}, nil
                        end
                        return {}, nil
                    end,
                },
                claim_execution = {release_unstarted = function() error("active execution must settle before exit") end},
                process = {
                    event = process.event, pid = function() return "resize-pool" end,
                    events = function() return events_ch end, set_options = function() end,
                    listen = function(topic) return topic == "kickside.core.jobs:worker_idle" and idle_ch or wake_ch end,
                    unlisten = function() end, registry = fixture.process_registry("resize-pool"),
                    spawn_linked_monitored = function() spawned = spawned + 1; return "slot-" .. tostring(spawned) end,
                    cancel = function(pid) canceled[pid] = true; return true, nil end,
                    send = function() return true, nil end,
                },
                registry = {current_version = function() return {id = function() return "resize-version" end}, nil end},
                events = {subscribe = function() return {channel = function() return registry_ch end, close = function() end}, nil end},
                time = {now = function() return {unix_nano = function() return 0 end} end,
                    after = function() return ch() end},
                channel = {select = function(cases)
                    if cases.default then return {default = true} end
                    if #cases == 3 then return {channel = events_ch, value = {kind = process.event.EXIT, from = "slot-1"}} end
                    step = step + 1
                    if step == 1 then return {channel = idle_ch, value = {worker_id = "slot-2", kind = "idle", epoch = 0, version = "resize-version"}} end
                    if step == 2 then desired = 3; return {channel = registry_ch} end
                    if step == 3 then
                        test.eq(spawned, 3)
                        return {channel = idle_ch, value = {worker_id = "slot-3", kind = "idle", epoch = 0, version = "resize-version"}}
                    end
                    if step == 4 then desired = 1; return {channel = registry_ch} end
                    if step == 5 then
                        test.is_true(canceled["slot-3"] == true)
                        test.is_nil(canceled["slot-2"], "resize must not cancel a running execution")
                        return {channel = idle_ch, value = {worker_id = "slot-2", kind = "idle", epoch = 1, version = "resize-version"}}
                    end
                    if step == 6 then
                        test.is_true(canceled["slot-2"] == true, "the finished surplus slot exits")
                        return {channel = events_ch, value = {kind = process.event.EXIT, from = "slot-2"}}
                    end
                    if step == 7 then return {channel = events_ch, value = {kind = process.event.EXIT, from = "slot-3"}} end
                    return {channel = events_ch, value = {kind = process.event.CANCEL}}
                end},
            })
            local _, err = pool.main()
            test.is_nil(err)
            test.eq(spawned, 3, "retired slots never respawn")
            test.eq(assignments, 1)
        end)
    end)
end)}
