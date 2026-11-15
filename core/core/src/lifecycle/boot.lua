-- boot: provisions the singleton system lifecycle thread and converges declared
-- component state, then stays resident as an upgradable process. Convergence
-- reads the schema of the installed code, so it runs only once every migration
-- in the namespaces that own the tables it reads is applied. The runtime
-- delivers OUTDATED at the registry commit, before a hot install's migrations
-- run; boot answers with process.upgrade(), and the upgraded code converges on
-- entry when the schema is already current. Otherwise it parks until the migrations land: the lifecycle
-- bootloader's migrations-applied message wakes it at once, and a parked boot
-- re-reads the ledger on a fixed retry interval for migrations that arrive
-- without that message.

local process = require("process")
local channel = require("channel")
local time = require("time")
local security = require("security")
local provision = require("provision")
local logger = require("logger"):named("kickside.lifecycle")
local consts = require("lifecycle_consts")
local error_envelope = require("error_envelope")
local proc_supervisor = require("proc_supervisor")
local migration_runner = require("migration_runner")
local core_db = require("core_db")

local function response_error(field: string): error
    return errors.new({kind = errors.INTERNAL, retryable = false, message = "lifecycle boot response is invalid",
        details = {code = "lifecycle_boot_response", field = field}})
end

local continuation: table? = nil
local convergence_actor: any = nil
local convergence_scope: any = nil

local function converge_state(): (integer?, error?)
    local actor = security.new_actor(consts.SYSTEM_ACTOR, {
        system = true,
        groups = { "system", "lifecycle" },
    })
    if not actor then
        return nil, response_error("actor")
    end

    local scope, scope_err = security.named_scope(consts.SYSTEM_SCOPE)
    if scope_err then return nil, errors.wrap(scope_err, "system lifecycle scope unavailable") end
    if not scope then return nil, response_error("scope") end

    local ids, err = provision.ensure_system(actor, scope)
    if err then
        return nil, err
    end

    if type(ids) ~= "table" then return nil, response_error("provision") end
    logger:info("system lifecycle provisioned", { count = #ids })

    convergence_actor, convergence_scope = actor, scope
    continuation = {}
    return #ids, nil
end

local function continue_convergence(): error?
    local actor, scope = convergence_actor, convergence_scope
    local converged, converge_err = provision.converge(actor, scope, continuation)
    if converge_err then return converge_err end
    if type(converged) ~= "table" then return response_error("converge") end
    continuation = converged.continuation
    local skipped = type(converged.skipped) == "table" and #converged.skipped or 0
    if (tonumber(converged.checked) or 0) > 0 or skipped > 0 then
        logger:info("declared-thread convergence", {checked = converged.checked, healed = converged.healed, skipped = skipped})
        for _, entry in ipairs(converged.skipped or {}) do logger:error("declared thread not convergeable", entry) end
    end
    return nil
end

local function converge_reported(): (integer?, error?)
    local count, converge_err = converge_state()
    if converge_err then
        logger:error("system lifecycle convergence failed", { reason = tostring(converge_err), error_native = error_envelope.encode(converge_err) })
    end
    return count, converge_err
end

-- Registry publication precedes a hot install's migrations; the migration
-- ledger is the authority on whether the schema convergence reads exists.
local function schema_ready(): (boolean, error?)
    local rows, err = migration_runner.setup(core_db.id()):find_migrations()
    if err or type(rows) ~= "table" then
        return false, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "lifecycle migration status unavailable: " .. tostring(err),
            details = {code = "lifecycle_migration_status"}})
    end
    local found: { [string]: boolean } = {}
    for _, owner in ipairs(consts.CONVERGE_SCHEMA) do found[owner.namespace] = false end
    local ready = true
    for _, row in ipairs(rows) do
        local namespace = string.match(tostring(row.id), "^([^:]+):")
        if namespace and found[namespace] ~= nil then
            found[namespace] = true
            if row.applied ~= true then ready = false end
        end
    end
    for _, owner in ipairs(consts.CONVERGE_SCHEMA) do
        if owner.required and not found[owner.namespace] then
            return false, errors.new({kind = errors.INTERNAL, retryable = false,
                message = "lifecycle convergence schema has no migrations: " .. owner.namespace,
                details = {code = "lifecycle_migration_namespace", namespace = owner.namespace}})
        end
    end
    return ready, nil
end

local CONVERGED, PARKED = "converged", "parked"

-- Converges when the ledger is current. A pending migration or an unavailable
-- ledger parks convergence for the next retry; the unavailable ledger is
-- logged once per parked stretch through `ledger_failed`.
local function converge_when_ready(ledger_failed: boolean): (string, integer?, error?, boolean)
    local ready, ready_err = schema_ready()
    if ready_err then
        if ready_err:retryable() then
            if not ledger_failed then
                logger:error("system lifecycle migration ledger unavailable", { reason = tostring(ready_err), error_native = error_envelope.encode(ready_err) })
            end
            return PARKED, nil, nil, true
        end
        logger:error("system lifecycle convergence failed", { reason = tostring(ready_err), error_native = error_envelope.encode(ready_err) })
        return CONVERGED, nil, ready_err, false
    end
    if not ready then return PARKED, nil, nil, false end
    local count, converge_err = converge_reported()
    return CONVERGED, count, converge_err, false
end

local function main(_args: any): any
    -- A registry update can reach the process as soon as its singleton name is visible.
    local opts_ok, opts_err = process.set_options({ trap_links = true, upgradable = true })
    if opts_err or opts_ok ~= true then error(opts_err or response_error("options")) end
    -- Listen and claim the boot name before the first convergence so a
    -- migrations-applied message sent meanwhile waits in the listener. An
    -- upgrade keeps the PID, its registered name and the unread listener
    -- messages. A second boot stands by until the owning boot exits.
    local events = process.events()
    local applied, listen_err = process.listen(consts.MIGRATIONS_APPLIED_TOPIC)
    if listen_err or not applied then
        error(listen_err or response_error("listen"))
    end
    local claimed, stopped, claim_err, stop_kind = proc_supervisor.claim_singleton(consts.BOOT_NAME, events, { process = process })
    if claim_err then error(claim_err) end
    if stopped then
        if stop_kind == process.event.OUTDATED then return process.upgrade() end
        return { ok = true }
    end
    if claimed ~= true then error(response_error("claim")) end

    local state, count, converge_err, ledger_failed = converge_when_ready(false)
    local parked = state == PARKED
    if parked then logger:info("system lifecycle convergence awaits migrations") end

    -- Resident from here: upgradable, parked on the events channel and the
    -- migrations-applied listener. A clean return on CANCEL or channel closure
    -- completes graceful shutdown; the supervisor sees no exit otherwise.
    logger:info("system lifecycle resident", { upgradable = opts_ok == true })
    while true do
        -- The migrations-applied message is the immediate wake-up. A parked boot
        -- also re-reads the ledger on the retry interval, because migrations can
        -- land without that message: an install whose changed modules exclude
        -- core, or migrations applied after an install that ran none.
        local cases = { events:case_receive(), applied:case_receive() }
        local advance = continuation and not parked and time.after("1ms") or nil
        if advance then cases[#cases + 1] = advance:case_receive() end
        local retry = parked and time.after(tostring(consts.SCHEMA_RETRY_MS) .. "ms") or nil
        if retry then cases[#cases + 1] = retry:case_receive() end
        local selected = channel.select(cases)
        local ev = selected.value
        if selected.channel ~= retry and (not selected.ok or (selected.channel == events and ev and (ev :: any).kind == process.event.CANCEL)) then
            if converge_err then error(converge_err) end
            return { ok = true, count = count }
        end
        if selected.channel == advance and advance then
            local advance_err = continue_convergence()
            if advance_err then
                continuation = nil
                converge_err = advance_err
                logger:error("system lifecycle convergence failed", {reason = tostring(advance_err), error_native = error_envelope.encode(advance_err)})
            end
        elseif selected.channel == applied or selected.channel == retry then
            local next_state, next_count, next_err, next_ledger_failed = converge_when_ready(ledger_failed)
            ledger_failed = next_ledger_failed
            if next_state == CONVERGED then
                parked = false
                count, converge_err = next_count, next_err
                logger:info("system lifecycle converged after migrations", { failed = converge_err ~= nil })
            elseif selected.channel == applied or not parked then
                parked = true
                logger:info("system lifecycle convergence awaits migrations")
            end
        elseif ev and (ev :: any).kind == process.event.OUTDATED then
            process.upgrade()
        end
    end
end

return { main = main }
