-- A recurring task declares one timer drive and one writable action. Scheduling,
-- identity, delivery receipts and recovery belong to the Automation engine.
local automations = require("automations_lib")
local cadence = require("cadence")
local task_target = require("task_target")
local ctx = require("ctx")
local time = require("time")

local M = {}

local function invalid(message: string): error
    return (errors.new({ kind = errors.INVALID, message = message, retryable = false,
        details = { error_kind = "declaration" } }) :: error)
end

local function nonempty(value)
    return type(value) == "string" and value:match("%S") ~= nil
end

M.target = task_target.resolve

local function plan(input)
    if type(input) ~= "table" then return nil, invalid("input is required") end
    local schedule = input.schedule
    if type(schedule) ~= "table" or (schedule.type ~= "cron" and schedule.type ~= "interval") then
        return nil, invalid("schedule requires type cron or interval and expression")
    end
    local _, cadence_err = cadence.next_after({ type = schedule.type, expression = schedule.expression, timezone = "UTC" },
        time.now():utc():format(time.RFC3339))
    if cadence_err then return nil, cadence_err end
    local target, target_err = task_target.validate(input.target)
    if target_err or not target then return nil, target_err end
    local title = nonempty(input.title) and input.title or "Recurring task"
    local enabled = input.enabled ~= false
    local when = schedule.type == "cron" and ("On schedule (" .. schedule.expression .. ")") or ("Every " .. schedule.expression)
    return {
        source = { source_kind = "timer", schedule = { type = schedule.type, expression = schedule.expression } },
        enabled = enabled,
        state = { title = title, schedule = schedule, target = input.target, enabled = enabled },
        public_state = { when = when, enabled = enabled },
        metadata = { title = title, icon = "tabler:calendar-repeat", description = when },
    }, nil
end

function M.install(input)
    return plan(input)
end

function M.reconfigure(input)
    local id = ctx.get("component_id")
    -- Partial edits use the opened component context. No caller identity rides
    -- this declaration, and an omitted enabled field preserves live drive state.
    input = type(input) == "table" and input or {}
    local enabled = input.enabled
    if enabled == nil then enabled = (ctx.get("_portable_input") or {}).enabled end
    local declaration = { title = input.title or ctx.get("title"),
        schedule = input.schedule or ctx.get("schedule"), target = input.target or ctx.get("target"), enabled = enabled }
    local planned, err = plan(declaration)
    if err then return nil, err end
    if input.enabled == nil then
        planned.enabled = nil
        planned.state.enabled = nil
        planned.public_state.enabled = nil
    end
    local meta = planned.public_state
    if input.title ~= nil then meta.title = planned.state.title end
    local applied, apply_err = automations.update_portable_input(id, declaration, {
        source = planned.source, state = planned.state, public_meta = meta, enabled = planned.enabled,
    })
    if apply_err then return nil, apply_err end
    return { success = true, id = id }, nil
end

return M
