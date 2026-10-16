local channel = require("channel")
local logger = require("logger")
local process = require("process")
local time = require("time")

local engine = require("token_engine")
local models_types = require("models_types")

local M = {}
local log = logger:named("kickside.models.vertex_tokens")

function M.main()
    local registered, register_err = process.registry.register(models_types.VERTEX_TOKEN_SUPERVISOR_PROCESS, nil, process.registry.LOCAL)
    if register_err or not registered then
        return nil, register_err or errors.new({ kind = errors.UNAVAILABLE,
            message = "model token supervisor name registration failed" })
    end

    local events = process.events()
    local messages = process.listen(models_types.PROFILE_CHANGED_TOPIC, { message = true })
    local deadlines: { [string]: integer } = {}
    local refresh_timer: any? = nil
    local timer_due: integer? = nil

    local function arm_timer(): ()
        local earliest: integer? = nil
        for _, due in pairs(deadlines) do
            if earliest == nil or due < earliest then earliest = due end
        end
        if earliest == timer_due then return end
        timer_due = earliest
        refresh_timer = nil
        if earliest ~= nil then
            refresh_timer = time.after(tostring(math.max(0, earliest - time.now():unix())) .. "s")
        end
    end

    log:info("vertex token supervisor started")

    -- Listen before the first profile snapshot so a concurrent committed write
    -- is handled by either this refresh or its queued profile.changed message.
    local initial, initial_err = engine.refresh_once()
    if initial_err then return nil, initial_err end
    deadlines = initial.deadlines or {}
    arm_timer()

    while true do
        local active_timer = refresh_timer
        local cases = { events:case_receive(), messages:case_receive() }
        if active_timer then cases[#cases + 1] = active_timer:case_receive() end
        local result = channel.select(cases)

        if result.channel == events then
            local event = result.value
            if event and event.kind == process.event.CANCEL then
                process.unlisten(messages)
                log:info("vertex token supervisor stopping")
                return { status = "completed" }
            end
        elseif result.channel == messages then
            local payload = result.value and result.value:payload()
            local data = payload and payload:data()
            local update, update_err = engine.handle_profile_changed(data)
            if update_err then return nil, update_err end
            if type(update.deadlines) == "table" then
                deadlines = update.deadlines
                arm_timer()
            end
        elseif active_timer and result.channel == active_timer then
            refresh_timer = nil
            timer_due = nil
            local now = time.now():unix()
            local due_profiles: { string } = {}
            for profile_id, due in pairs(deadlines) do
                if due <= now then due_profiles[#due_profiles + 1] = profile_id end
            end
            local next_deadlines, topology_safe, refresh_err = engine.refresh_due(due_profiles)
            if refresh_err then return nil, refresh_err end
            if not topology_safe then
                deadlines = {}
            else
                for _, profile_id in ipairs(due_profiles) do deadlines[profile_id] = nil end
                for profile_id, due in pairs(next_deadlines) do deadlines[profile_id] = due end
            end
            arm_timer()
        end
    end
end

return M
