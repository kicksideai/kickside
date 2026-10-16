local proc_supervisor = require("proc_supervisor")
-- Event-driven Core retention. Boot recovery handles durable eligibility that
-- arose while the service was absent; thereafter only state-change messages,
-- registry commits, and exact row-eligibility deadlines trigger a pass.

local sql = require("sql")
local channel = require("channel")
local time = require("time")
local process = require("process")
local events = require("events")
local core_db = require("core_db")
local runner = require("runner")
local notifier = require("notifier")
local lease_release = require("lease_release")

local MAX_WAKE_BATCH = 100

local REGISTRY_SOURCE = "registry"
local REGISTRY_EVENT = "registry.commit"

local function unavailable(message: string, cause: error?): error
    if cause then return errors.wrap(cause, message) end
    return errors.new({message = message, kind = errors.UNAVAILABLE, retryable = true})
end

local function response_failure(message: string, field: string): error
    return errors.new({message = message, kind = errors.INTERNAL, retryable = false,
        details = {code = "retention_process_response", field = field}})
end

local function has_methods(value: any, methods: { string }): boolean
    if type(value) ~= "table" and type(value) ~= "userdata" then return false end
    for _, method in ipairs(methods) do
        if type(value[method]) ~= "function" then return false end
    end
    return true
end

local function pass_deadline(value: any, field: string): (integer?, error?)
    if type(value) ~= "table" then
        return nil, response_failure("retention runner returns no pass report", field)
    end
    local deadline = value.deadline_ms
    if deadline ~= nil and (type(deadline) ~= "number" or deadline ~= math.floor(deadline)
        or deadline == math.huge or deadline == -math.huge) then
        return nil, response_failure("retention runner returns a malformed deadline", field)
    end
    return deadline :: integer?, nil
end

local function close(db: sql.DB?, subscription: any?, changes: any?, releases: any?): ()
    process.registry.unregister(notifier.NAME, process.registry.CONSISTENT)
    if subscription then subscription:close() end
    if changes then process.unlisten(changes) end
    if releases then process.unlisten(releases) end
    process.registry.unregister(lease_release.NAME, process.registry.CONSISTENT)
    if db then db:release() end
end

local function main(): (any?, error?)
    local pid = tostring(process.pid())
    local process_events = process.events()
    local changes = process.listen(notifier.TOPIC)
    -- Committed eligibility changes reach this process through the notifier's name.
    local registered, cancelled, register_err = proc_supervisor.claim_singleton(notifier.NAME, process_events)
    if register_err or cancelled or registered ~= true then
        process.unlisten(changes)
        if register_err then return nil, unavailable("Core retention process registration failed", register_err) end
        if cancelled then return nil, nil end
        return nil, response_failure("Core retention process registration returns no claim", "singleton.claim")
    end

    local releases = process.listen(lease_release.TOPIC)
    local release_registered, release_register_err = process.registry.register(lease_release.NAME, nil, process.registry.CONSISTENT)
    if release_register_err or release_registered ~= true then
        close(nil, nil, changes, releases)
        if release_register_err then
            return nil, unavailable("Core retention lease listener registration failed", release_register_err)
        end
        return nil, response_failure("Core retention lease registration returns no claim", "lease.register")
    end

    -- Subscribe before the boot recovery read so registry changes cannot fall
    -- between the snapshot and the live event channel.
    local subscription, subscribe_err = events.subscribe(REGISTRY_SOURCE, REGISTRY_EVENT)
    if subscribe_err then
        close(nil, nil, changes, releases)
        return nil, unavailable("Core retention registry subscription failed", subscribe_err)
    end
    if not has_methods(subscription, {"channel", "close"}) then
        close(nil, has_methods(subscription, {"close"}) and subscription or nil, changes, releases)
        return nil, response_failure("Core retention registry returns no subscription", "events.subscription")
    end
    local registry_events = subscription:channel()
    if not has_methods(registry_events, {"case_receive"}) then
        close(nil, subscription, changes, releases)
        return nil, response_failure("Core retention subscription returns no channel", "events.channel")
    end

    local db, db_err = sql.get(core_db.id() :: string)
    if db_err then
        close(nil, subscription, changes, releases)
        return nil, unavailable("Core retention database unavailable", db_err)
    end
    if not has_methods(db, {"release"}) then
        close(nil, subscription, changes, releases)
        return nil, response_failure("Core retention SQL acquisition returns no database", "sql.get")
    end

    local initial, initial_err = runner.recover(db :: sql.DB, pid)
    if initial_err then
        close(db :: sql.DB, subscription, changes, releases)
        return nil, initial_err
    end
    local deadline_ms, initial_report_err = pass_deadline(initial, "runner.recover")
    if initial_report_err then
        close(db :: sql.DB, subscription, changes, releases)
        return nil, initial_report_err
    end

    while true do
        local cases = {
            process_events:case_receive(),
            registry_events:case_receive(),
            changes:case_receive(),
            releases:case_receive(),
        }
        local timer: any = nil
        if deadline_ms ~= nil then
            local now_ms = math.floor(time.now():unix_nano() / 1000000)
            local delay_ms = math.max(1, math.ceil((deadline_ms :: integer) - now_ms))
            timer = time.after(tostring(delay_ms) .. "ms")
            cases[#cases + 1] = timer:case_receive()
        end

        local selected = channel.select(cases)
        if selected.channel == process_events then
            local event = selected.value
            if type(event) == "table" and event.kind == process.event.CANCEL then
                close(db :: sql.DB, subscription, changes, releases)
                return nil, nil
            elseif type(event) == "table" and event.kind == process.event.OUTDATED then
                close(db :: sql.DB, subscription, changes, releases)
                return nil, unavailable("Core retention process is outdated", nil)
            end
        elseif selected.channel == registry_events then
            if selected.ok == false then
                close(db :: sql.DB, subscription, changes, releases)
                return nil, unavailable("Core retention registry subscription closed", nil)
            end
        elseif selected.channel == changes or selected.channel == releases then
            if selected.ok == false then
                close(db :: sql.DB, subscription, changes, releases)
                return nil, unavailable("Core retention process mailbox closed", nil)
            end
        end

        local next_pass, pass_err
        if timer and selected.channel == timer then
            next_pass, pass_err = runner.on_deadline(db :: sql.DB, pid)
        else
            local change: table = { kind = "process_event" }
            if selected.channel == registry_events then
                change = { kind = "registry_commit" }
            elseif (selected.channel == changes or selected.channel == releases) and type(selected.value) == "table"
                and type(selected.value.kind) == "string" then
                change = selected.value
            end
            if selected.channel == changes or selected.channel == releases then
                local pending: table[] = { change }
                for _ = 2, MAX_WAKE_BATCH do
                    local queued = channel.select({ changes:case_receive(), releases:case_receive(), default = true })
                    if queued.default then break end
                    if queued.ok == false then
                        close(db :: sql.DB, subscription, changes, releases)
                        return nil, unavailable("Core retention process mailbox closed", nil)
                    end
                    local value = queued.value
                    pending[#pending + 1] = type(value) == "table" and type(value.kind) == "string"
                        and value or { kind = "process_event" }
                end
                next_pass, pass_err = runner.on_wakes(db :: sql.DB, pid, pending)
            else
                next_pass, pass_err = runner.on_wake(db :: sql.DB, pid, change)
            end
        end
        if pass_err then
            close(db :: sql.DB, subscription, changes, releases)
            return nil, pass_err
        end
        local next_deadline, report_err = pass_deadline(next_pass, "runner.pass")
        if report_err then
            close(db :: sql.DB, subscription, changes, releases)
            return nil, report_err
        end
        deadline_ms = next_deadline
    end
end

return { main = main }
