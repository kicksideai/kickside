local process = require("process")
local time = require("time")
local callback_names = require("callback_names")
local M = {}

-- OAuth init must not publish a usable authorization URL before its callback
-- name is visible. A fast local authorization server can finish before spawn
-- has scheduled the negotiator's first instruction.
function M.await(args: any, runtime: any?): (any?, error?)
    if type(args) ~= "table" or type(args.state_token) ~= "string" or args.state_token == ""
        or type(args.pid) ~= "string" or args.pid == "" then
        return nil, errors.new({kind=errors.INVALID, message="OAuth negotiator state and pid are required"})
    end
    local rt = runtime or {
        now = time.now,
        pause = function() time.sleep("10ms") end,
        lookup = function(name) return process.registry.lookup(name, process.registry.CONSISTENT) end,
    }
    local deadline = rt.now():add(5 * time.SECOND)
    repeat
        local pid, err = rt.lookup(callback_names.NEGOTIATOR_PREFIX .. args.state_token)
        if err and not errors.is(err, errors.NOT_FOUND) then return nil, err end
        if pid then
            if tostring(pid) ~= args.pid then
                return nil, errors.new({kind=errors.CONFLICT, message="OAuth callback state is already registered"})
            end
            return {success=true}, nil
        end
        rt.pause()
    until not rt.now():before(deadline)
    return nil, errors.new({kind=errors.TIMEOUT, message="OAuth callback session did not become ready"})
end

function M.handle(args: any): (any?, error?) return M.await(args) end
return M
