local proc_supervisor = require("proc_supervisor")
-- Target-sequence waiters for projection cursors. Callers register with the
-- supervised broker before reading the cursor; writers notify it after commit.

local time = require("time")
local channel = require("channel")
local process = require("process")
local logger = require("logger")
local uuid = require("uuid")
local funcs = require("funcs")

local M = {}

local BROKER_NAME = "kickside.core.threads.cursor_waiter_broker"
local REGISTER_TOPIC = "cursor_waiter.register"
local REMOVE_TOPIC = "cursor_waiter.remove"
local COMMIT_TOPIC = "cursor_waiter.commit"
local REPLY_PREFIX = "cursor_waiter.reply:"
local SIGNAL = "kickside.core.threads:cursor_waiter_signal"
local SIGNAL_TOPICS: { [string]: boolean } = { [REGISTER_TOPIC] = true, [REMOVE_TOPIC] = true, [COMMIT_TOPIC] = true }

local function unavailable(message: string): error
    return (errors.new({ message = message, kind = errors.UNAVAILABLE, retryable = true }) :: error)
end

-- signal delivers one message to the registered broker. It runs as the
-- cursor_waiter_signal function under the threads service identity, so callers
-- and writers need no process messaging authority. Returns false when no broker
-- is registered.
function M.signal(topic: string, message: table): (boolean, error?)
    if not SIGNAL_TOPICS[topic] then
        return false, (errors.new({ message = "unknown cursor waiter topic: " .. tostring(topic), kind = errors.INVALID }) :: error)
    end
    local broker_pid, lookup_err = process.registry.lookup(BROKER_NAME, process.registry.CONSISTENT)
    if lookup_err then
        if errors.is(lookup_err, errors.NOT_FOUND) then return false, nil end
        return false, (errors.wrap(lookup_err, "projection cursor waiter broker lookup failed") :: error)
    end
    if not broker_pid then return false, nil end
    local sent, send_err = process.send(tostring(broker_pid), topic, message)
    if send_err then
        return false, (errors.wrap(send_err, "projection cursor waiter broker delivery failed") :: error)
    end
    return sent == true, nil
end

local function send(topic: string, message: table): (boolean, error?)
    local sent, call_err = funcs.call(SIGNAL, topic, message)
    if call_err then return false, call_err end
    return sent == true, nil
end

local function remaining_ms(deadline_ns: number): integer
    local remaining = deadline_ns - time.now():unix_nano()
    if remaining <= 0 then return 0 end
    return math.ceil(remaining / 1000000) :: integer
end

-- begin_wait installs the broker waiter and receives its acknowledgment before
-- returning. The caller must do its initial cursor read only after this point.
function M.begin_wait(cursor_id: string, target_seq: integer, timeout_ms: integer): (table?, error?)
    if type(cursor_id) ~= "string" or cursor_id == "" or type(target_seq) ~= "number"
        or target_seq < 0 or target_seq ~= math.floor(target_seq)
        or type(timeout_ms) ~= "number" or timeout_ms < 1 or timeout_ms ~= math.floor(timeout_ms) then
        return nil, (errors.new({ message = "cursor waiter requires a cursor, target sequence, and positive deadline", kind = errors.INVALID }) :: error)
    end
    local request_id = uuid.v7()
    local reply_topic = REPLY_PREFIX .. request_id
    local reply_ch, listen_err = process.listen(reply_topic)
    if listen_err then
        return nil, (errors.wrap(listen_err, "projection cursor waiter listener failed") :: error)
    end
    if not reply_ch then return nil, unavailable("projection cursor waiter listener returned no channel") end
    local events_ch = process.events()
    local deadline_ns = time.now():unix_nano() + timeout_ms * 1000000
    local request = {
        request_id = request_id,
        cursor_id = cursor_id,
        target_seq = target_seq,
        reply_pid = tostring(process.pid()),
        reply_topic = reply_topic,
        deadline_ns = deadline_ns,
    }
    local sent, send_err = send(REGISTER_TOPIC, request)
    if send_err or not sent then
        process.unlisten(reply_ch)
        if send_err then
            return nil, (errors.wrap(send_err, "projection cursor waiter registration failed") :: error)
        end
        return nil, unavailable("projection cursor waiter broker is not registered")
    end
    while true do
        local remaining = remaining_ms(deadline_ns)
        if remaining == 0 then
            send(REMOVE_TOPIC, { request_id = request_id })
            process.unlisten(reply_ch)
            return nil, unavailable("projection cursor waiter registration exceeded its deadline")
        end
        local timer = time.after(tostring(remaining) .. "ms")
        local registered = channel.select({ reply_ch:case_receive(), events_ch:case_receive(), timer:case_receive() })
        if registered.channel == timer then
            process.unlisten(reply_ch)
            return nil, unavailable("projection cursor waiter registration exceeded its deadline")
        elseif registered.channel == events_ch then
            local event = registered.value
            if type(event) == "table" and ((event :: any).kind == process.event.CANCEL
                or (event :: any).kind == process.event.OUTDATED) then
                send(REMOVE_TOPIC, { request_id = request_id })
                process.unlisten(reply_ch)
                return nil, unavailable("projection cursor waiter caller is stopping")
            end
        else
            local reply = registered.value
            if type(reply) == "table" and (reply :: any).request_id == request_id
                and (reply :: any).kind == "registered" then
                return {
                    request_id = request_id,
                    cursor_id = cursor_id,
                    target_seq = target_seq,
                    reply_topic = reply_topic,
                    reply_ch = reply_ch,
                    events_ch = events_ch,
                    deadline_ns = deadline_ns,
                }, nil
            end
            process.unlisten(reply_ch)
            return nil, unavailable("projection cursor waiter registration was rejected")
        end
    end
end

-- wait_until_reached returns (notice, timed_out, error). Its absolute deadline
-- is inherited from begin_wait, so work before the wait consumes the same bound.
function M.wait_until_reached(waiter: table): (table?, boolean, error?)
    while true do
        local remaining = remaining_ms(waiter.deadline_ns)
        if remaining == 0 then return nil, true, nil end
        local timer = time.after(tostring(remaining) .. "ms")
        local selected = channel.select({
            waiter.reply_ch:case_receive(),
            waiter.events_ch:case_receive(),
            timer:case_receive(),
        })
        if selected.channel == timer then return nil, true, nil end
        if selected.channel == waiter.reply_ch then
            local message = selected.value
            if type(message) == "table" and (message :: any).request_id == waiter.request_id then
                return message, false, nil
            end
            if selected.ok == false then return nil, false, unavailable("projection cursor waiter listener closed") end
        else
            local event = selected.value
            if type(event) == "table" and ((event :: any).kind == process.event.CANCEL
                or (event :: any).kind == process.event.OUTDATED) then
                return nil, false, unavailable("projection cursor waiter caller is stopping")
            end
        end
    end
end

function M.close_wait(waiter: table): ()
    send(REMOVE_TOPIC, { request_id = waiter.request_id })
    process.unlisten(waiter.reply_ch)
end

-- notify_cursor is called by a transaction owner only after its cursor change
-- commits. No broker means no caller could have registered a waiter.
function M.notify_cursor(cursor_id: string, last_seq: number?, status: string?): (boolean, error?)
    return send(COMMIT_TOPIC, { cursor_id = cursor_id, last_seq = last_seq, status = status })
end

local function broker_main(handover: any?): (any?, error?)
    process.set_options({ trap_links = true, upgradable = true })
    local events_ch = process.events()
    local register_ch = process.listen(REGISTER_TOPIC)
    local remove_ch = process.listen(REMOVE_TOPIC)
    local commit_ch = process.listen(COMMIT_TOPIC)
    local registered, cancelled, register_err, stop_kind = proc_supervisor.claim_singleton(BROKER_NAME, events_ch,
        { process = process, channel = channel })
    if cancelled or register_err or not registered then
        process.unlisten(register_ch)
        process.unlisten(remove_ch)
        process.unlisten(commit_ch)
        if cancelled then
            if stop_kind == process.event.OUTDATED then return process.upgrade() end
            return nil, nil
        end
        logger:error("projection cursor waiter broker registration failed: " .. tostring(register_err))
        if register_err then
            return nil, (errors.wrap(register_err, "projection cursor waiter broker registration failed") :: error)
        end
        return nil, unavailable("projection cursor waiter broker registration returned no ownership")
    end

    local waiters: { [string]: table } = {}
    local by_cursor: { [string]: { [string]: boolean } } = {}
    local by_pid: { [string]: { [string]: boolean } } = {}
    local monitored: { [string]: boolean } = {}

    local function add(waiter: table): ()
        waiters[waiter.request_id] = waiter
        by_cursor[waiter.cursor_id] = by_cursor[waiter.cursor_id] or {}
        by_cursor[waiter.cursor_id][waiter.request_id] = true
        by_pid[waiter.reply_pid] = by_pid[waiter.reply_pid] or {}
        by_pid[waiter.reply_pid][waiter.request_id] = true
    end

    if type(handover) == "table" then
        for _, waiter in pairs((handover :: any).waiters or {}) do add(waiter :: table) end
        for pid in pairs((handover :: any).monitored or {}) do monitored[pid] = true end
    end

    local function remove(request_id: string): ()
        local waiter = waiters[request_id]
        if not waiter then return end
        waiters[request_id] = nil
        local cursor_ids = by_cursor[waiter.cursor_id]
        if cursor_ids then
            cursor_ids[request_id] = nil
            if next(cursor_ids) == nil then by_cursor[waiter.cursor_id] = nil end
        end
        local process_ids = by_pid[waiter.reply_pid]
        if process_ids then
            process_ids[request_id] = nil
            if next(process_ids) == nil then by_pid[waiter.reply_pid] = nil end
        end
    end

    local function reply(waiter: table, body: table): boolean
        body["request_id"] = waiter.request_id
        local sent, send_err = process.send(waiter.reply_pid, waiter.reply_topic, body)
        return send_err == nil and sent == true
    end

    local function cleanup(): ()
        for request_id in pairs(waiters) do remove(request_id) end
        process.registry.unregister(BROKER_NAME, process.registry.CONSISTENT)
        process.unlisten(register_ch)
        process.unlisten(remove_ch)
        process.unlisten(commit_ch)
    end

    while true do
        local earliest: number? = nil
        for _, waiter in pairs(waiters) do
            local deadline = tonumber(waiter.deadline_ns)
            if deadline and (earliest == nil or deadline < (earliest :: number)) then earliest = deadline end
        end
        local cases = {
            events_ch:case_receive(),
            register_ch:case_receive(),
            remove_ch:case_receive(),
            commit_ch:case_receive(),
        }
        local timer: any = nil
        if earliest then
            local remaining = math.max(1, math.ceil(((earliest :: number) - time.now():unix_nano()) / 1000000))
            timer = time.after(tostring(remaining) .. "ms")
            cases[#cases + 1] = timer:case_receive()
        end
        local selected = channel.select(cases)
        if selected.channel == events_ch then
            local event = selected.value
            if type(event) == "table" then
                if (event :: any).kind == process.event.CANCEL then
                    cleanup()
                    return nil, nil
                elseif (event :: any).kind == process.event.OUTDATED then
                    return process.upgrade(nil, { waiters = waiters, monitored = monitored })
                elseif (event :: any).kind == process.event.EXIT or (event :: any).kind == process.event.LINK_DOWN then
                    local pid = tostring((event :: any).from or "")
                    local ids = by_pid[pid]
                    if ids then
                        local stale: { string } = {}
                        for request_id in pairs(ids) do stale[#stale + 1] = request_id end
                        for _, request_id in ipairs(stale) do remove(request_id) end
                    end
                end
            end
        elseif selected.channel == register_ch then
            local request = selected.value
            if type(request) == "table" then
                local data = request :: any
                local request_id = tostring(data.request_id or "")
                local cursor_id = tostring(data.cursor_id or "")
                local reply_pid = tostring(data.reply_pid or "")
                local reply_topic = tostring(data.reply_topic or "")
                local target_seq = tonumber(data.target_seq)
                local deadline_ns = tonumber(data.deadline_ns)
                if request_id ~= "" and cursor_id ~= "" and reply_pid ~= "" and reply_topic ~= ""
                    and target_seq and target_seq >= 0 and deadline_ns
                    and deadline_ns > time.now():unix_nano() then
                    if not monitored[reply_pid] then
                        local _, monitor_err = process.monitor(reply_pid)
                        if monitor_err then
                            process.send(reply_pid, reply_topic, { request_id = request_id, kind = "rejected" })
                        else
                            monitored[reply_pid] = true
                        end
                    end
                    if monitored[reply_pid] then
                        local waiter = { request_id = request_id, cursor_id = cursor_id,
                            target_seq = target_seq, reply_pid = reply_pid, reply_topic = reply_topic,
                            deadline_ns = deadline_ns }
                        add(waiter)
                        if not reply(waiter, { kind = "registered", broker_pid = tostring(process.pid()) }) then
                            remove(request_id)
                        end
                    end
                end
            end
        elseif selected.channel == remove_ch then
            local message = selected.value
            if type(message) == "table" then remove(tostring((message :: any).request_id or "")) end
        elseif selected.channel == commit_ch then
            local message = selected.value
            if type(message) == "table" then
                local data = message :: any
                local ids = by_cursor[tostring(data.cursor_id or "")]
                if ids then
                    local reached: { string } = {}
                    for request_id in pairs(ids) do
                        local waiter = waiters[request_id]
                        local status = tostring(data.status or "active")
                        local seq = tonumber(data.last_seq)
                        if waiter and (status ~= "active" or seq ~= nil) then
                            local sent = reply(waiter, { kind = "changed", last_seq = seq, status = status })
                            if not sent or status ~= "active" or (seq and seq >= waiter.target_seq) then
                                reached[#reached + 1] = request_id
                            end
                        end
                    end
                    for _, request_id in ipairs(reached) do remove(request_id) end
                end
            end
        elseif timer and selected.channel == timer then
            local now_ns = time.now():unix_nano()
            local expired: { string } = {}
            for request_id, waiter in pairs(waiters) do
                if tonumber(waiter.deadline_ns) <= now_ns then expired[#expired + 1] = request_id end
            end
            for _, request_id in ipairs(expired) do remove(request_id) end
        end
    end
end

M.main = broker_main
return M
