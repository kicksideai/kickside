local channel = require("channel")
local consts = require("channel_consts")
local persist = require("channel_persist")
local turn_recovery = require("channel_turn_recovery")
local time = require("time")
local logger = require("logger"):named("kickside.channel.turn_supervisor")

local M = {}
local RETRY_DELAY_SECONDS = 5

local function turn_id(ref: any): string?
    if type(ref) ~= "table" or ref.owner_id ~= "channel.turn"
        or type(ref.record_id) ~= "string" or ref.record_id == ""
        or ref.generation ~= 1 then return nil end
    return ref.record_id
end

function M.new(on_turn: any, forget_seen: any, state: any?): any
    local retry_due_by_turn: { [string]: any } = state and state.retry_due_by_turn or {}
    local retry_timer: any? = nil
    local retry_timer_due: integer? = nil
    local supervisor = {}
    supervisor.turn_id = turn_id

    local function arm_retry_timer(): ()
        local earliest: integer? = nil
        for _, pending in pairs(retry_due_by_turn) do
            local due_number = tonumber(pending.retry_at)
            local due = due_number and math.tointeger(due_number) or nil
            if due and (earliest == nil or due < earliest) then earliest = due end
        end
        if earliest == retry_timer_due then return end
        retry_timer_due = earliest
        retry_timer = nil
        if earliest ~= nil then
            retry_timer = time.after(tostring(math.max(0, earliest - time.now():unix())) .. "s")
        end
    end

    local function clear_retry(id: string): ()
        retry_due_by_turn[id] = nil
        arm_retry_timer()
    end

    function supervisor.schedule_retry(ref: any, retry_at: integer?): ()
        local id = turn_id(ref)
        if not id then return end
        local due = retry_at or (time.now():unix() + RETRY_DELAY_SECONDS)
        local previous = retry_due_by_turn[id]
        local previous_due_number = type(previous) == "table" and tonumber(previous.retry_at) or nil
        local previous_due = previous_due_number and math.tointeger(previous_due_number) or nil
        if previous_due and previous_due < due then due = previous_due end
        local db_id, db_err = consts.db_id()
        if db_err then
            error(db_err)
        elseif not db_id then
            error(errors.new({kind = errors.UNAVAILABLE, retryable = true,
                message = "turn retry deadline database unavailable"}))
        else
            local scheduled, schedule_err = turn_recovery.schedule_retry(db_id, id, due)
            if schedule_err then
                error(schedule_err)
            elseif not scheduled then
                clear_retry(id)
                return
            end
        end
        retry_due_by_turn[id] = { turn_ref = ref, retry_at = due, persisted = true }
        arm_retry_timer()
    end

    function supervisor.track(ref: any): string?
        local id = turn_id(ref)
        if not id then return nil end
        local db_id, db_err = consts.db_id()
        if db_err then
            error(db_err)
        elseif not db_id then
            error(errors.new({kind = errors.UNAVAILABLE, retryable = true,
                message = "turn retry deadline clear database unavailable"}))
        end
        local _, clear_err = turn_recovery.clear_retry(db_id, id)
        if clear_err then
            error(clear_err)
        end
        clear_retry(id)
        return id
    end

    function supervisor.appended(id: string): ()
        clear_retry(id)
    end

    function supervisor.mark_appended(db_id: string, id: string): (boolean, string?)
        local marked, mark_err = turn_recovery.mark_appended(db_id, id)
        if marked then clear_retry(id) end
        return marked, mark_err
    end

    function supervisor.recover(): (boolean, string?)
        local db_id, db_err = consts.db_id()
        if db_err or not db_id then
            return false, "accepted-turn recovery database unavailable: " .. tostring(db_err)
        end
        local pending, pending_err = turn_recovery.list_unappended(db_id)
        if pending_err then
            return false, "accepted-turn recovery read failed: " .. tostring(pending_err)
        end
        local now = time.now():unix()
        for _, turn in ipairs(pending or {}) do
            local ref = { owner_id = "channel.turn", record_id = turn.turn_id, generation = 1 }
            local retry_at_number = tonumber(turn.retry_at)
            local retry_at = retry_at_number and math.tointeger(retry_at_number) or nil
            supervisor.schedule_retry(ref, retry_at and retry_at > now and retry_at or now)
        end
        return true, nil
    end

    function supervisor.timer(): any?
        return retry_timer
    end

    function supervisor.timer_fired(active_timer: any): ()
        if active_timer ~= retry_timer then return end
        retry_timer = nil
        retry_timer_due = nil
        local now = time.now():unix()
        local due: { any } = {}
        for id, pending in pairs(retry_due_by_turn) do
            if tonumber(pending.retry_at) and tonumber(pending.retry_at) <= now then
                due[#due + 1] = { turn_id = id, pending = pending }
            end
        end
        for _, item in ipairs(due) do
            local id = item.turn_id
            local pending = item.pending
            retry_due_by_turn[id] = nil
            local db_id, db_err = consts.db_id()
            if db_err or not db_id then
                logger:error("turn retry database unavailable", { turn_id = id, error = tostring(db_err) })
                supervisor.schedule_retry(pending.turn_ref)
            else
                local deadline_ok = true
                if pending.persisted then
                    local cleared, clear_err = turn_recovery.clear_retry(db_id, id)
                    if clear_err then
                        logger:error("turn retry deadline clear failed", { turn_id = id, error = tostring(clear_err) })
                        supervisor.schedule_retry(pending.turn_ref)
                        deadline_ok = false
                    elseif not cleared then
                        logger:debug("turn retry deadline was already cleared", { turn_id = id })
                    end
                end
                if deadline_ok then
                    local unappended, state_err = turn_recovery.is_unappended(db_id, id)
                    if state_err then
                        logger:error("scheduled accepted turn state read failed", { turn_id = id, error = tostring(state_err) })
                        supervisor.schedule_retry(pending.turn_ref)
                    elseif unappended then
                        local stored, read_err = persist.get_accepted(db_id, id)
                        if read_err then
                            logger:error("scheduled accepted turn could not be loaded", { turn_id = id, error = tostring(read_err) })
                            supervisor.schedule_retry(pending.turn_ref)
                        elseif stored then
                            local inbound = type(stored.inbound) == "table" and stored.inbound or {}
                            local key = tostring(stored.key or "")
                            local message_id = tostring(inbound.external_message_id or "")
                            if key ~= "" and message_id ~= "" then forget_seen(key, message_id) end
                            on_turn(pending.turn_ref)
                        end
                    end
                end
            end
        end
        arm_retry_timer()
    end

    function supervisor.snapshot(): any
        return { retry_due_by_turn = retry_due_by_turn }
    end
    arm_retry_timer()
    return supervisor
end

return M
