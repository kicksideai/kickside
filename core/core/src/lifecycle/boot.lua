-- boot: provisions the singleton system lifecycle thread and converges declared
-- component state, then stays resident as an upgradable process. The runtime
-- delivers an OUTDATED event to a running upgradable process whose code graph
-- changes; boot answers with process.upgrade(), which re-enters main on the new
-- code in place. Every code-changing install of this module therefore re-runs
-- provisioning + convergence with no poller, no external hook, and no service
-- exit; an identical-source reinstall changes no code node and re-runs nothing.

local process = require("process")
local security = require("security")
local provision = require("provision")
local logger = require("logger"):named("kickside.lifecycle")
local consts = require("lifecycle_consts")
local error_envelope = require("error_envelope")

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
    -- thread row is missing or has the wrong declared class. Service start and
    -- code-changing in-place upgrades run convergence; an identical-source
    -- reinstall does not. No hot-path check or poller drives it.
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

local function main(_args: any): any
    local count, converge_err = converge_state()
    if converge_err then
        logger:error("system lifecycle convergence failed", { reason = tostring(converge_err), error_native = error_envelope.encode(converge_err) })
    end

    -- Resident from here: upgradable, parked on the events channel. OUTDATED
    -- arrives when this process's code graph changes (a non-upgradable process
    -- drops the event and keeps running old code). process.upgrade() swaps this
    -- instance onto the reloaded code and re-enters main — the install-time
    -- convergence trigger. The supervisor sees no exit, so a clean return here
    -- on CANCEL or channel closure completes graceful shutdown.
    local opts_ok, opts_err = process.set_options({ trap_links = true, upgradable = true })
    if opts_err or opts_ok ~= true then
        local primary = opts_err or response_error("options")
        if converge_err then primary = error_envelope.wrap_secondary(primary, converge_err, "system lifecycle options failed") end
        error(primary)
    end
    local events = process.events()
    logger:info("system lifecycle resident", { upgradable = opts_ok == true })
    while true do
        local ev, ok = events:receive()
        if not ok or (ev and (ev :: any).kind == process.event.CANCEL) then
            if converge_err then error(converge_err) end
            return { ok = true, count = count }
        end
        if ev and (ev :: any).kind == process.event.OUTDATED then
            process.upgrade()
        end
    end
end

return { main = main }
