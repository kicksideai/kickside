local state = require("state")
local M = {}
function M.get(): (any?, error?, boolean)
    state.reads = state.reads + 1
    if state.hidden or state.reads >= 3 then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "winner is unreadable" }), true
    end
    return nil, errors.new({ kind = errors.NOT_FOUND, message = "thread is absent" }), false
end

return M
