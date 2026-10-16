-- Event-driven maintenance owner. The constructed dependencies keep process
-- ordering testable without replacing mutable production module state.
local time = require("time")
local channel = require("channel")
local logger = require("logger")
local funcs = require("funcs")
local process = require("process")
local registry_events = require("events")
local policy = require("policy")
local run_time = require("run_time")
local schedule = require("maintenance_schedule")
local maintenance_wake = require("maintenance_wake")

local M = {}

local function retry_deadline(time_module: any, settings: any): string
    return (time_module.now():utc():add((settings :: any).completion_initial_ms * time_module.MILLISECOND)
        :format(time_module.RFC3339))
end

local function run(dependencies: any): ()
    local clock = dependencies.time or time
    local select = dependencies.channel or channel
    local log = (dependencies.logger or logger):named("workflows.runs.maintenance")
    local calls = dependencies.funcs or funcs
    local proc = dependencies.process or process
    local events = dependencies.registry_events or registry_events
    local owner_policy = dependencies.policy or policy
    local runtime_time = dependencies.run_time or run_time
    local deadlines = dependencies.schedule or schedule
    local wake = dependencies.maintenance_wake or maintenance_wake

    local subscription, subscribe_err = events.subscribe("registry", "registry.commit")
    if subscribe_err or not subscription then
        error("workflow maintenance registry subscription unavailable: " .. tostring(subscribe_err), 0)
    end
    local registry_channel = (subscription :: any):channel()
    local registered, register_err, cancelled = wake.register()
    if cancelled then
        subscription:close()
        return
    end
    if register_err or not registered then
        error("workflow maintenance process registration failed: " .. tostring(register_err), 0)
    end

    local inbox = proc.inbox()
    local process_events = proc.events()
    local retry_at: string? = nil
    local retry_recovery = false

    local function arm_retry(): ()
        local settings, settings_err = owner_policy.policy()
        if settings_err or not settings then
            error("workflow maintenance policy unavailable after recovery failure: " .. tostring(settings_err), 0)
        end
        retry_at = retry_deadline(clock, settings)
    end

    local function run_tick(recover: boolean): boolean
        local result, tick_err = calls.call("kickside.workflows.runs:maintenance_tick_worker", {
            recover = recover,
        })
        if tick_err then
            log:warn("workflow maintenance tick failed", { error = tostring(tick_err) })
            retry_recovery = retry_recovery or recover
            arm_retry()
            return false
        end
        if type(result) == "table" and (result :: any).retry_recovery == true then
            retry_recovery = true
            arm_retry()
        elseif recover then
            retry_at = nil
            retry_recovery = false
        elseif not retry_recovery then
            retry_at = nil
        end
        return type(result) == "table" and (result :: any).continue_immediately == true
    end

    local continue_immediately = run_tick(true)
    while true do
        if continue_immediately then
            continue_immediately = run_tick(false)
        else
            local deadline_ms, deadline_err = deadlines.next_deadline_ms()
            if deadline_err then
                log:warn("workflow maintenance deadline lookup failed", { error = tostring(deadline_err) })
                if not retry_at then arm_retry() end
            end

            local wait_ms: number? = deadline_ms
            if retry_at then
                local retry_ms, retry_err = runtime_time.until_ms(retry_at)
                if retry_err or retry_ms == nil then error("workflow maintenance retry deadline is invalid", 0) end
                if wait_ms == nil or retry_ms < (wait_ms :: number) then wait_ms = retry_ms end
            end
            local cases = { inbox:case_receive(), registry_channel:case_receive(), process_events:case_receive() }
            local timer: any = nil
            if wait_ms ~= nil then
                timer = clock.after(tostring(math.max(1, math.floor(wait_ms :: number))) .. "ms")
                cases[#cases + 1] = timer:case_receive()
            end
            local selected = select.select(cases)
            if selected.channel == process_events then
                if selected.ok == false then error("workflow maintenance process event channel closed", 0) end
                local event = selected.value
                if event and event.kind == proc.event.CANCEL then
                    wake.unregister()
                    return
                elseif event and event.kind == proc.event.OUTDATED then
                    proc.upgrade()
                end
            elseif selected.channel == registry_channel then
                if selected.ok == false then error("workflow maintenance registry subscription closed", 0) end
                continue_immediately = run_tick(false)
            elseif selected.channel == inbox then
                local message = selected.value
                if message:topic() == wake.TOPIC then continue_immediately = run_tick(false) end
            elseif timer and selected.channel == timer then
                local recover = false
                if retry_at then
                    local retry_ms = runtime_time.until_ms(retry_at)
                    if retry_ms ~= nil and retry_ms <= 0 then
                        recover = retry_recovery
                        retry_at = nil
                        retry_recovery = false
                    end
                end
                continue_immediately = run_tick(recover)
            end
        end
    end
end

function M.run(dependencies: any?): ()
    return run(type(dependencies) == "table" and dependencies or {})
end

function M.main(): ()
    return run({})
end

return M
