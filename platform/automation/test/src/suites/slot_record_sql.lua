local native = require("sql")
local M = { calls = 0 }
function M.get(...)
    local db, err = native.get(...)
    if err or not db then return nil, err end
    M.calls = M.calls + 1
    if M.calls == 1 then return db, nil end
    return {
        release = function() return db:release() end,
        execute = function() return M.response, M.failure end,
    }, nil
end
return M
