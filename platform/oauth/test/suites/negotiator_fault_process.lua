local process = require("process")
local M = { inbox = process.inbox, events = process.events }
local faults = {}
local response = nil

function M.setup(value)
    faults = value
    response = nil
end

function M.response() return response end

M.registry = {
    CONSISTENT = process.registry.CONSISTENT,
    register = function(_name, _value, _mode) return true, nil end,
    unregister = function(_name, _mode)
        if faults.release then
            return nil, errors.new({ kind = errors.UNAVAILABLE, message = "callback release fault" })
        end
        return true, nil
    end,
}

function M.send(_pid, _topic, value)
    if faults.reply then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "callback reply fault" })
    end
    response = value
    return true, nil
end

return M
