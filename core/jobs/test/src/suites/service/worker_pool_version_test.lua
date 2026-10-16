local test = require("test")
local sql = require("sql")
local process = require("process")
local worker_pool = require("worker_pool")

local function define_tests()
    test.describe("job pool registry version handoff", function()
        test.it("keeps a new-version idle slot until the registry commit is observed", function()
            local events_ch = { case_receive = function(self) return self end }
            local registry_ch = { case_receive = function(self) return self end }
            local idle_ch = { case_receive = function(self) return self end }
            local wake_ch = { case_receive = function(self) return self end }
            local selections = 0
            local version_reads = 0
            local claimed = false
            local assignments = 0
            local worker_id = "registry-version-worker"
            local db = {
                type = function() return sql.type.POSTGRES end,
                query = function() return { {} }, nil end,
                release = function() end,
            }
            local pool = worker_pool.new({
                sql_get = function() return db, nil end,
                policy = function() return { worker_count_sqlite = 1, worker_count_postgres = 1, worker_awaited_slots = 1,
                    worker_claim_batch = 10, fairness_shares = { live = 1 },
                    slot_retry_after_ms = 1000, slot_retry_max_delay_ms = 60000,
                    retention_interval_ms = 3600000 }, nil end,
                reclaim = {
                    reclaim_expired = function() return 0, nil end,
                    reclaim_terminated = function() return 0, nil end,
                    close_lost_runs = function() return 0, nil end,
                },
                claim = {
                    due_backlog = function() return { count = 0, oldest_age_ms = 0, overdue = 0 }, nil end,
                    claim_batch = function(_, _, count: integer, _, _, worker_ids)
                        if count > 0 and #worker_ids == 1 and not claimed then
                            claimed = true
                            return { { id = "due-job", worker_id = worker_ids[1],
                                run_ctx = { id = "due-run" } } }, nil
                        end
                        return {}, nil
                    end,
                },
                claim_execution = { release_unstarted = function() return true, nil end },
                process = {
                    event = process.event,
                    pid = function() return "registry-version-pool" end,
                    events = function() return events_ch end,
                    set_options = function() end,
                    listen = function(topic: string)
                        return topic == "kickside.core.jobs:worker_idle" and idle_ch or wake_ch
                    end,
                    unlisten = function() end,
                    registry = {
                        register = function() return true, nil end,
                        unregister = function() return true, nil end,
                    },
                    spawn_linked_monitored = function() return worker_id end,
                    send = function(_, topic: string, message: table)
                        test.eq(topic, "kickside.core.jobs:worker_assign")
                        test.eq(message.job.id, "due-job")
                        assignments = assignments + 1
                        return true, nil
                    end,
                    cancel = function() end,
                },
                time = {
                    now = function() return { unix_nano = function() return 0 end } end,
                    -- Only the retention deadline arms a timer here; it is an
                    -- exact deadline (A52), never selected by this scenario.
                    after = function() return { case_receive = function(self) return self end } end,
                },
                channel = { select = function(cases: any)
                    if cases.default == true then return { default = true } end
                    if #cases == 3 then
                        return { channel = events_ch, value = { kind = process.event.EXIT, from = worker_id } }
                    end
                    selections = selections + 1
                    test.eq(#cases, 5, "no idle discovery timer is armed beyond the exact retention deadline")
                    if selections == 1 then
                        return { channel = idle_ch,
                            value = { kind = "idle", worker_id = worker_id, version = "v2", epoch = 0 } }
                    elseif selections == 2 then
                        return { channel = registry_ch }
                    end
                    test.eq(assignments, 1, "new-version idle slot must claim after pool snapshot refresh")
                    return { channel = events_ch, value = { kind = process.event.CANCEL } }
                end },
                registry = { current_version = function()
                    version_reads = version_reads + 1
                    local value = version_reads == 1 and "v1" or "v2"
                    return { id = function() return value end }, nil
                end },
                events = { subscribe = function()
                    return { channel = function() return registry_ch end, close = function() end }, nil
                end },
            })

            pool.main()

            test.is_true(claimed)
            test.eq(assignments, 1)
        end)
    end)
end

return test.run_cases(define_tests)
