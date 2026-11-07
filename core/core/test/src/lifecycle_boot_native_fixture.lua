local process = require("process")
local channel = require("channel")
local M = {event = process.event, registry = {CONSISTENT = process.registry.CONSISTENT}}
function M.reset(stage: string, source: error?, override: any?, pending: boolean?): ()
    M.stage, M.source, M.override, M.pending = stage, source, override, pending == true
    M.calls, M.ledger, M.events_ch = {}, nil, nil
end
-- Scripts successive ledger reads ("unavailable", "pending", "applied") and
-- keeps the events channel open until a convergence closes it.
function M.script_ledger(reads: { string }): () M.ledger = reads end
local function hit(name: string): () M.calls[name] = (M.calls[name] or 0) + 1 end
local function response(name: string, value: any): (any, error?)
    hit(name)
    if M.stage == name then return M.override, M.source end
    return value, nil
end
function M.new_actor(...): any hit("actor"); return {} end
function M.named_scope(...): (any, error?) return response("scope", {}) end
function M.ensure_system(...): (any, error?) return response("provision", {"system"}) end
function M.converge(...): (any, error?)
    if M.events_ch then M.events_ch:close() end
    return response("converge", {checked = 1, healed = 0, skipped = {}})
end
function M.set_options(opts: table): (any, error?)
    if opts.trap_links ~= true or opts.upgradable ~= true then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "boot fixture requires lifecycle options"})) end
    return response("options", true)
end
-- A closed events channel ends the resident loop the way runtime channel closure does.
function M.events(): any
    hit("events")
    local events = channel.new()
    if M.ledger then M.events_ch = events else events:close() end
    return events
end
-- The migration ledger rows find_migrations reports for the core database.
function M.setup(_database_id: string): any
    return {find_migrations = function(_self: any): (any, string?)
        hit("migrations")
        local read = M.ledger and (M.ledger[M.calls.migrations] or "applied") or nil
        if read == "unavailable" then return nil, "ledger read failed" end
        local pending = M.pending or read == "pending"
        return {{id = "kickside.core.migrations:applied", applied = true},
            {id = "kickside.component.migrations:pending", applied = not pending},
            {id = "kickside.core.jobs.migrations:applied", applied = true},
            {id = "app.other.migrations:pending", applied = false}}, nil
    end}
end
function M.listen(_topic: string): (any, error?) hit("listen"); return channel.new(), nil end
function M.registry.register(_name: string, _pid: any, _scope: any): (boolean?, error?) hit("register"); return true, nil end
return M
