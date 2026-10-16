-- Process-boundary proof for core retained writes. Each probe owns its SQL
-- transaction; termination before commit leaves no row, a committed write
-- survives the probe's death, and later writes keep being accepted.
local test = require("test")
local sql = require("sql")
local uuid = require("uuid")
local process = require("process")
local channel = require("channel")
local pin = require("pin")

local PROBE = "kickside.core.retention.pin_tests:restart_probe"

local function db(): sql.DB
    local handle, err = sql.get("app:db")
    if err or not handle then error("core restart DB unavailable: " .. tostring(err)) end
    return handle :: sql.DB
end

local function query(statement: string, params: table): table[]
    local handle = db()
    local rows, err = handle:query(statement, params)
    handle:release()
    if err or not rows then error("core restart read failed: " .. tostring(err)) end
    return rows :: table[]
end

local function thread(scope: string): ()
    local handle = db()
    local result, err = handle:execute([[INSERT INTO kickside_thread
        (id,thread_class,component_id,event_count)
        VALUES ($1,'restart_test',$2,0)]], { scope, scope })
    handle:release()
    test.is_nil(err)
    test.eq(tonumber(result.rows_affected), 1)
end

local function protect(scope: string): ()
    local handle = db()
    local result, err = pin.pin_lower(handle, { thread_id = scope,
        consumer_key = "restart:event", command_id = "restart:pin",
        command_generation = 1, target_cursor = 0 })
    handle:release()
    test.is_nil(err)
    test.not_nil(result)
end

local function tombstone(scope: string): ()
    local handle = db()
    local result, err = pin.pin_release(handle, { thread_id = scope,
        consumer_key = "first", expected_pin_generation = 1,
        terminal_op_id = "restart:terminal" })
    handle:release()
    test.is_nil(err)
    test.not_nil(result)
end

local function physical(operation: string, scope: string): integer
    local rows: table[]
    if operation == "event" then
        rows = query("SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id=$1", { scope })
    elseif operation == "pin" then
        rows = query([[SELECT COUNT(*) AS n FROM (
            SELECT consumer_key FROM kickside_retention_pin WHERE thread_id=$1
            UNION SELECT consumer_key FROM kickside_retention_pin_tombstone WHERE thread_id=$1
        ) AS consumers]], { scope })
    else
        rows = query("SELECT COUNT(*) AS n FROM kickside_write_receipt WHERE sink_id=$1", { "sink:" .. scope })
    end
    return math.floor(tonumber(rows[1].n) :: number)
end

local function exit_of(events: any, pid: any): any
    while true do
        local selected = channel.select({ events:case_receive() })
        local event = selected.value
        if type(event) == "table" and tostring(event.from) == tostring(pid)
            and event.kind == process.event.EXIT then return event end
    end
end

local function ready_from(inbox: any, events: any, pid: any, nonce: string): ()
    while true do
        local selected = channel.select({ inbox:case_receive(), events:case_receive() })
        if selected.channel == events then
            local event = selected.value
            if type(event) == "table" and tostring(event.from) == tostring(pid) then
                error("core restart probe exited before reservation boundary: "
                    .. tostring(event.result and event.result.error))
            end
        end
        if selected.channel == inbox then
            local message = selected.value
            if message:topic() == "restart_ready" then
                local data = message:payload():data()
                if type(data) == "table" and data.nonce == nonce then
                    test.eq(data.pid, tostring(pid))
                    return
                end
            end
        end
    end
end

local function spawn(operation: string, scope: string, phase: string, key: string): (any, any, any)
    local events = process.events()
    local inbox = process.inbox()
    local nonce = uuid.v7()
    local pid, err = process.spawn_monitored(PROBE, "app:processes", {
        operation = operation, scope = scope, phase = phase, key = key,
        parent_pid = tostring(process.pid()), nonce = nonce,
    })
    test.is_nil(err)
    test.not_nil(pid)
    return pid, events, { inbox = inbox, nonce = nonce }
end

local function kill_at(operation: string, scope: string, phase: string): string
    local pid, events, signal = spawn(operation, scope, phase, "first")
    ready_from(signal.inbox, events, pid, signal.nonce)
    local _, terminate_err = process.terminate(pid)
    test.is_nil(terminate_err)
    exit_of(events, pid)
    return tostring(pid)
end

local function attempt(operation: string, scope: string): string
    local pid, events = spawn(operation, scope, "attempt", "second")
    local event = exit_of(events, pid)
    test.is_nil(event.result.error)
    local answer = event.result.value
    test.is_nil(answer.error)
    test.is_true(answer.accepted)
    return tostring(pid)
end

local function define_tests()
    test.describe("core retained writes across real process restart", function()
        for _, operation in ipairs({ "event", "pin", "receipt" }) do
            test.it(operation .. " writes roll back on death, survive committed death and continue", function()
                local scope = uuid.v7()
                if operation ~= "receipt" then thread(scope) end
                if operation == "event" then protect(scope) end
                local first = kill_at(operation, scope, "uncommitted")
                test.eq(physical(operation, scope), 0)
                local second = kill_at(operation, scope, "committed")
                test.is_true(first ~= second)
                test.eq(physical(operation, scope), 1)
                if operation == "pin" then tombstone(scope) end
                local third = attempt(operation, scope)
                test.is_true(second ~= third)
                test.eq(physical(operation, scope), 2)
            end)
        end
    end)
end

return test.run_cases(define_tests)
