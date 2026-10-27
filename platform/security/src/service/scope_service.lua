-- Supervised service that projects DB-backed custom scopes into security.scope
-- descriptors and native policy groups. The DB is authoritative. Registry commits
-- reconcile module updates; admin save/delete requests acknowledge their projection.

local logger = require("logger"):named("kickside.security.scope_service")
local channel = require("channel")
local time = require("time")
local consts = require("security_consts")
local projection = require("scope_projection")
local group_sets = require("group_sets")
local registry = require("registry")
local events = require("events")
local error_envelope = require("error_envelope")

local M = {}

-- The service exits with a retryable error only when it cannot start serving.
local function exit_retryable(message: string, cause: error?): (nil, error)
    return nil, (errors.new({kind = errors.UNAVAILABLE, retryable = true, message = message,
        details = cause and {cause = error_envelope.encode(cause)} or nil}) :: error)
end

local function failed_reply(err: error): { [string]: any }
    return {success = false, error = tostring(err), error_native = error_envelope.encode(err)}
end

-- A request names its reply destination; its caller may have left by the time
-- the projection completes, which concerns that caller, never the service.
local function reply_to(message: any, reply: { [string]: any }): ()
    local sent, send_err = process.send(message.reply_pid, message.reply_topic, reply)
    if not sent then
        logger:warn("scope reconcile reply undelivered; the requesting caller has left", {
            reply_pid = message.reply_pid, error = tostring(send_err), success = reply.success })
    end
end

function M.main()
    local opted, options_err = process.set_options({ upgradable = true })
    if options_err or not opted then
        return exit_retryable("scope projection upgrade opt-in failed: " .. tostring(options_err), options_err)
    end
    local subscription, subscribe_err = events.subscribe("registry", "registry.commit")
    if subscribe_err or not subscription then
        return exit_retryable("scope registry subscription failed: " .. tostring(subscribe_err), subscribe_err)
    end
    local registry_ch = subscription:channel()
    local registered, register_err = process.registry.register(consts.SCOPE_PROJECTION_TOPIC, nil, process.registry.LOCAL)
    if register_err or not registered then
        subscription:close()
        return exit_retryable("scope projection name registration failed: " .. tostring(register_err), register_err)
    end
    local events_ch = process.events()
    local msg_ch = process.listen(consts.RECONCILE_TOPIC, { message = true })
    logger:info("scope projection service starting after bootloader completion; reconciling at boot")
    -- The subscription precedes every pass, so a commit that conflicts with a
    -- pass arrives as the next registry event and is projected then. A failed
    -- pass returns its error to the requests it answers; the service keeps
    -- serving, so every request reaches a pass.
    local _, err, projected = projection.reconcile()
    if err then
        projected = nil
        logger:error("boot reconcile failed", { error = err })
    end

    while true do
        local result = channel.select({
            events_ch:case_receive(),
            msg_ch:case_receive(),
            registry_ch:case_receive(),
        })
        if result.channel == events_ch then
            local event = result.value
            if event.kind == process.event.CANCEL or event.kind == process.event.OUTDATED then
                process.unlisten(msg_ch)
                subscription:close()
                if event.kind == process.event.OUTDATED then return process.upgrade() end
                logger:info("scope projection service stopping")
                return
            end
        else
            -- One projection pass answers every request and commit queued so far:
            -- the pass starts after each of them arrived, so it reflects them all.
            local requests = {}
            local function take(selected: any): ()
                if selected.channel == msg_ch then
                    requests[#requests + 1] = selected.value:payload():data()
                end
            end
            take(result)
            -- Queued messages reach their channels only when this process yields,
            -- so the drain waits on the shortest timer: every queued message is
            -- taken first, and the timer ends the drain once none remain.
            while true do
                local drained, timer_err = time.after("1ms")
                if timer_err or not drained then
                    process.unlisten(msg_ch)
                    subscription:close()
                    return exit_retryable("scope request drain timer failed: " .. tostring(timer_err), timer_err)
                end
                local queued = channel.select({ msg_ch:case_receive(), registry_ch:case_receive(), drained:case_receive() })
                if queued.channel == drained then break end
                take(queued)
            end

            local answered, fences = {}, {}
            for _, message in ipairs(requests) do
                if type(message) ~= "table" or type(message.reply_pid) ~= "string" or type(message.reply_topic) ~= "string" then
                    logger:warn("scope reconcile request rejected: it names no reply destination")
                elseif message.plan == true then
                    local planned, plan_err = projection.plan(message.planned)
                    if plan_err then
                        reply_to(message, failed_reply(plan_err))
                    else
                        reply_to(message, { success = true, ops = planned.ops, deferred = planned.deferred })
                    end
                elseif message.groups ~= nil then
                    local set, set_err = projection.group_set(message.groups)
                    if not set then
                        reply_to(message, failed_reply(set_err))
                    elseif set.current then
                        reply_to(message, { success = true, created = 0, updated = 0, deleted = 0, scope_name = set.scope_name })
                    else
                        local _, save_err = group_sets.save(message.groups)
                        if save_err then
                            reply_to(message, failed_reply(save_err))
                        else
                            answered[#answered + 1] = { message = message, scope_name = set.scope_name,
                                require_pass = true }
                        end
                    end
                else
                    for _, group in ipairs(message.fence_groups or {}) do fences[#fences + 1] = group end
                    -- Registry-only callers with a committed-version receipt
                    -- may acknowledge the event-driven pass that already
                    -- reached the current registry version. All DB-backed,
                    -- group-set, and unmarked requests still require a pass.
                    local source = message.source
                    local registry_barrier = (source == "registry.observer" or source == "security.delegation")
                        and type(message.observed_registry_version) == "string"
                        and message.observed_registry_version ~= ""
                    answered[#answered + 1] = { message = message, require_pass = not registry_barrier }
                end
            end
            -- A commit this service applied itself needs no further pass.
            local needs_pass = not projected or #fences > 0
            for _, pending in ipairs(answered) do
                if pending.require_pass then needs_pass = true; break end
            end
            if not needs_pass then
                local current, version_err = registry.current_version()
                needs_pass = version_err ~= nil or not current or current:id() ~= projected:id()
            end
            local stats = {created = 0, updated = 0, deleted = 0}
            local rerr
            local applied
            if needs_pass then
                stats, rerr, applied = projection.reconcile(fences)
            end
            if rerr then
                projected = nil
                logger:error("reconcile failed", { error = rerr })
            elseif applied then
                projected = applied
            end
            for _, pending in ipairs(answered) do
                if rerr then
                    reply_to(pending.message, failed_reply(rerr))
                else
                    reply_to(pending.message, { success = true, created = stats.created, updated = stats.updated,
                        deleted = stats.deleted, scope_name = pending.scope_name })
                end
            end
        end
    end
end

return M
