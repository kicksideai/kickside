local time = require("time")
local M = { now = time.now, RFC3339 = time.RFC3339 }
function M.after(_duration)
    local timer = {}
    function timer:case_receive() return self end
    return timer
end
return M
