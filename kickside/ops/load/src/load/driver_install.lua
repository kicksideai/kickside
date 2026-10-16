type Map = { [string]: any }

local support = require("driver_support")
local fail = support.fail
local exec = support.exec
local query = support.query
local state_get = support.state_get
local state_set = support.state_set
local actor_and_threads = support.actor_and_threads
local EVENT_KIND = support.EVENT_KIND
local TIMER_KIND = support.TIMER_KIND
local MANAGE_TOOL = support.MANAGE_TOOL
local PROC_SCOPE = support.PROC_SCOPE

local M = {}

function M.install(): Map
    local funcs = require("funcs")
    local security = require("security")
    local actor = security.new_actor("lane_lod_owner", { security_groups = { "wippy.security:process" } })
    local caller = funcs.new():with_actor(actor):with_scope(security.named_scope(PROC_SCOPE))
    local count = math.max(1, math.floor(tonumber(state_get("automation_count")) or 1))
    local timer_count = math.max(0, math.floor(tonumber(state_get("timers_per_automation")) or 0))
    local thread_count = math.max(1, math.floor(tonumber(state_get("source_thread_count")) or 1))
    local uuid = require("uuid")
    local _actor, threads = actor_and_threads()
    local source_rows = query("SELECT ordinal,thread_id FROM kickside_lod_source_threads ORDER BY ordinal")
    for ordinal = #source_rows + 1, thread_count do
        local result, create_err = threads:upsert({ thread_class = "kickside.load", impl_id = support.THREAD_KIND,
            external_ref = "lane-lod:source:" .. tostring(ordinal) .. ":" .. uuid.v4(),
            title = "Lane LOD source " .. tostring(ordinal) })
        if create_err or type(result) ~= "table" or type((result :: Map).thread_id) ~= "string" then
            fail("source thread creation failed: " .. tostring(create_err))
        end
        exec("INSERT INTO kickside_lod_source_threads(ordinal,thread_id) VALUES($1,$2)",
            { ordinal, tostring((result :: Map).thread_id) })
    end
    source_rows = query("SELECT ordinal,thread_id FROM kickside_lod_source_threads ORDER BY ordinal")
    for ordinal = 1, count do
        local thread_id = tostring(source_rows[((ordinal - 1) % #source_rows) + 1].thread_id)
        local result, err = caller:call(MANAGE_TOOL, { action = "install", type = EVENT_KIND,
            input = { thread_id = thread_id, start = "new" } })
        if err or type(result) ~= "table" or (result :: Map).success ~= true then
            fail("event automation install " .. tostring(ordinal) .. " failed: "
                .. tostring(err or (result and (result :: Map).error)))
        end
        local id = tostring((result :: Map).id)
        exec("INSERT INTO kickside_lod_automations(ordinal,id,thread_id) VALUES($1,$2,$3)",
            { ordinal, id, thread_id })
        if ordinal == 1 then state_set("automation_id", id) end
        if ordinal == 1 then state_set("reference_id", id) end
    end
    -- Each event automation is accompanied by timer_count interval automations;
    -- an automation declares one main source.
    for ordinal = 1, count * timer_count do
        local result, err = caller:call(MANAGE_TOOL, { action = "install", type = TIMER_KIND, input = {} })
        if err or type(result) ~= "table" or (result :: Map).success ~= true then
            fail("timer automation install " .. tostring(ordinal) .. " failed: "
                .. tostring(err or (result and (result :: Map).error)))
        end
        exec("INSERT INTO kickside_lod_timer_automations(ordinal,id) VALUES($1,$2)",
            { ordinal, tostring((result :: Map).id) })
    end
    return { automation_id = state_get("automation_id"), automation_count = count,
        source_threads = #source_rows, timers_per_automation = timer_count }
end

return M
