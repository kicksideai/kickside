-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local process = require("process")
local sql = require("sql")
local pool = require("worker_pool")
local cfg = require("config")
local fixture = require("job_fixture")
local M = {}
function M.run(steps, setup, handover)
    local function ch() return {case_receive = function(self) return self end} end
    local ctx: any = {events = ch(), registry = ch(), idle = ch(), wake = ch(), step = 0, spawned = 0,
        reads = 0, revision_reads = 0, queries = 0, writes = {}, canceled = {}, live = {}, notices = {}, unlistened = 0,
        committed = {revision = 1, values = {["worker.count_sqlite"] = 1, ["worker.awaited_slots"] = 1}}}
    if handover then for _, slot in ipairs(handover.slots) do ctx.live[slot.pid] = true end end
    if setup then setup(ctx) end
    local instance = pool.new({
        policy = cfg.policy,
        sql_get = function()
            if ctx.dialect_error then return nil, ctx.dialect_error end
            return {type = function() return sql.type.SQLITE end, release = function() end,
                query = function() ctx.queries = ctx.queries + 1; return {}, nil end}, nil
        end,
        overrides = {
            revision = function() ctx.revision_reads = ctx.revision_reads + 1; return ctx.committed.revision, ctx.read_error end,
            read = function() ctx.reads = ctx.reads + 1; return ctx.committed, ctx.read_error end,
        },
        applied = {write = function(_, state, err)
            local copy = {}
            for key, value in pairs(state) do copy[key] = value end
            copy.apply_error = err
            ctx.writes[#ctx.writes + 1] = copy
            ctx.applied = copy
            return ctx.write_error
        end},
        notify = ctx.publish and function()
            ctx.notices[#ctx.notices + 1] = true
            local at, response = #ctx.notices, ch()
            local future = {response = function() return response end,
                result = function()
                    if ctx.fail_publication and at == 1 then return nil, ctx.fail_publication end
                    return {data = function() return {success = true} end}, nil
                end}
            ctx.future = response
            return future, nil
        end or nil,
        retention_schedule = fixture.no_retention_schedule,
        reclaim = {reclaim_expired = function() return 0 end, reclaim_terminated = function() return 0 end,
            close_lost_runs = function() return 0 end},
        claim = {due_backlog = function() return {count = 0}, nil end, claim_batch = function() return {}, nil end},
        claim_execution = {release_unstarted = function() return false, nil end},
        process = {event = process.event, registry = fixture.process_registry("policy-pool"),
            pid = function() return "policy-pool" end, events = function() return ctx.events end,
            set_options = function() end,
            listen = function(topic) return topic == cfg.IDLE_TOPIC and ctx.idle or ctx.wake end,
            unlisten = function() ctx.unlistened = ctx.unlistened + 1 end,
            spawn_linked_monitored = function()
                ctx.spawned = ctx.spawned + 1
                local id = "new-slot-" .. tostring(ctx.spawned)
                ctx.live[id] = true
                return id, nil
            end,
            cancel = function(id) ctx.canceled[#ctx.canceled + 1] = id; return true, nil end,
            send = function() return true, nil end,
            upgrade = function(_, state) ctx.handover = state; return state, nil end,
        },
        registry = {current_version = function() return {id = function() return "policy-version" end}, nil end},
        events = {subscribe = function() return {channel = function() return ctx.registry end,
            close = function() ctx.closed = true end}, nil end},
        time = {now = function() return {unix_nano = function() return 0 end} end, after = ch},
        channel = {select = function(cases)
            if cases.default then
                if ctx.queued then local queued = ctx.queued; ctx.queued = nil; return {channel = ctx.wake, value = queued} end
                return {default = true}
            end
            if #cases == 3 then
                local id = next(ctx.live)
                if id then ctx.live[id] = nil end
                return {channel = ctx.events, value = {kind = process.event.EXIT, from = id}}
            end
            ctx.step = ctx.step + 1
            if steps[ctx.step] then return steps[ctx.step](ctx) end
            return {channel = ctx.events, value = {kind = process.event.CANCEL}}
        end},
    })
    ctx.result, ctx.error = instance.main(handover)
    return ctx
end
function M.nudge(ctx, revision)
    return {channel = ctx.wake, value = {revision = revision}}
end
function M.handover()
    local values = {["worker.count_sqlite"] = 1, ["worker.awaited_slots"] = 1}
    return {size = 2, policy = assert(cfg.runtime(values)), policy_values = values, policy_revision = 1, database = "sqlite",
        slots = {{slot = 1, pid = "old-idle", epoch = 0, started_ns = 0},
            {slot = 2, pid = "old-busy", epoch = 1, started_ns = 0,
                assignment = {job = {id = "running"}, run_id = "run"}}}, retired = {}, due = {}}
end
return M
