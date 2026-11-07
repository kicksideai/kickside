-- boot: provisions the singleton system lifecycle thread and converges declared
-- component state, then stays resident as an upgradable process. Convergence
-- reads the schema of the installed code, so it runs only once every migration
-- registered for the core database is applied. The runtime delivers OUTDATED at
-- the registry commit, before a hot install's migrations run; boot answers with
-- process.upgrade(), and the upgraded code converges on entry when the schema is
-- already current, otherwise on the migrations-applied message the lifecycle
-- bootloader sends after the install's migrations.

local process = require("process")
local channel = require("channel")
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

    -- Converge every component whose kind declares a primary thread but whose
    -- thread row is missing or has the wrong declared class. It runs once the
    -- core-database schema is current: on start or upgrade, or on the
    -- install's migrations-applied message. No hot-path check or poller drives it.
    local converged, converge_err = provision.converge(actor, scope)
    if converge_err then
        return nil, converge_err
    end
    if type(converged) ~= "table" then return nil, response_error("converge") end
    do
        local skipped = type(converged.skipped) == "table" and #(converged.skipped :: { any }) or 0
        if (tonumber(converged.healed) or 0) > 0 or skipped > 0 then
            logger:info("declared-thread convergence", {
                checked = converged.checked, healed = converged.healed, skipped = skipped,
            })
            for _, s in ipairs((converged.skipped :: { any }) or {}) do
                logger:error("declared thread not convergeable", s :: { [string]: any })
            end
        end
    end
    return #ids, nil
end

local function converge_reported(): (integer?, error?)
    local count, converge_err = converge_state()
    if converge_err then
        logger:error("system lifecycle convergence failed", { reason = tostring(converge_err), error_native = error_envelope.encode(converge_err) })
    end
    return count, converge_err
end

-- Registry publication precedes a hot install's migrations; the migration
-- ledger is the authority on whether the installed code's schema exists.
local function schema_ready(): (boolean, error?)
    local rows, err = migration_runner.setup(core_db.id()):find_migrations()
    if err or type(rows) ~= "table" then
        return false, errors.new({kind = errors.UNAVAILABLE, retryable = true,
            message = "lifecycle migration status unavailable: " .. tostring(err),
            details = {code = "lifecycle_migration_status"}})
    end
    for _, row in ipairs(rows) do
        if row.applied ~= true then return false, nil end
    end
    return true, nil
end

-- Converges when the ledger is current; a pending migration parks convergence
-- until the next migrations-applied message, and parked reports no attempt.
local function converge_when_ready(): (boolean, integer?, error?)
    local ready, ready_err = schema_ready()
    if ready_err then
        logger:error("system lifecycle convergence failed", { reason = tostring(ready_err), error_native = error_envelope.encode(ready_err) })
        return true, nil, ready_err
    end
    if not ready then
        logger:info("system lifecycle convergence awaits migrations")
        return false, nil, nil
    end
    local count, converge_err = converge_reported()
    return true, count, converge_err
end

local function main(_args: any): any
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

    local _, count, converge_err = converge_when_ready()

    -- Resident from here: upgradable, parked on the events channel and the
    -- migrations-applied listener. A clean return on CANCEL or channel closure
    -- completes graceful shutdown; the supervisor sees no exit otherwise.
    local opts_ok, opts_err = process.set_options({ trap_links = true, upgradable = true })
    if opts_err or opts_ok ~= true then
        local primary = opts_err or response_error("options")
        if converge_err then primary = error_envelope.wrap_secondary(primary, converge_err, "system lifecycle options failed") end
        error(primary)
    end
    logger:info("system lifecycle resident", { upgradable = opts_ok == true })
    while true do
        local selected = channel.select({ events:case_receive(), applied:case_receive() })
        local ev = selected.value
        if not selected.ok or (selected.channel == events and ev and (ev :: any).kind == process.event.CANCEL) then
            if converge_err then error(converge_err) end
            return { ok = true, count = count }
        end
        if selected.channel == applied then
            -- Bootloaders also run without migrations, so the message re-reads
            -- the ledger rather than vouching for the schema.
            local attempted, next_count, next_err = converge_when_ready()
            if attempted then
                count, converge_err = next_count, next_err
                logger:info("system lifecycle converged after migrations", { failed = converge_err ~= nil })
            end
        elseif ev and (ev :: any).kind == process.event.OUTDATED then
            process.upgrade()
        end
    end
end

return { main = main }
