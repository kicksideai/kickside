local process = require("process")
local M = {event = process.event}
function M.reset(stage: string, source: error?, override: any?): ()
    M.stage, M.source, M.override = stage, source, override
    M.calls = {}
end
local function hit(name: string): () M.calls[name] = (M.calls[name] or 0) + 1 end
local function response(name: string, value: any): (any, error?)
    hit(name)
    if M.stage == name then return M.override, M.source end
    return value, nil
end
function M.new_actor(...): any hit("actor"); return {} end
function M.named_scope(...): (any, error?) return response("scope", {}) end
function M.ensure_system(...): (any, error?) return response("provision", {"system"}) end
function M.converge(...): (any, error?) return response("converge", {checked = 1, healed = 0, skipped = {}}) end
function M.set_options(opts: table): (any, error?)
    if opts.trap_links ~= true or opts.upgradable ~= true then error(errors.new({kind = errors.INTERNAL, retryable = false, message = "boot fixture requires lifecycle options"})) end
    return response("options", true)
end
function M.events(): any hit("events"); return {receive = function(): (any, boolean) hit("receive"); return nil, false end} end
return M
