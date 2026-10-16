local M = {}
local last: table? = nil
function M.reset(): () last = nil end
function M.notify(change: table): (boolean?, error?) last = change; return true, nil end
function M.last(): table? return last end
return M
