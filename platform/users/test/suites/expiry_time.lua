local time = require("time")
local M = {}
M.failure = errors.new({kind = errors.INVALID, message = "invalid configured lifetime"})
M.now = time.now
function M.parse_duration(_duration) return nil, M.failure end
return M
