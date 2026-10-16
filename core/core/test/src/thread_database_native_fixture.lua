local sql = require("sql")
local M = {source = nil, malformed = false, value = nil, calls = 0}
function M.reset(source: any, malformed: boolean, value: any)
    M.source, M.malformed, M.value, M.calls = source, malformed, value, 0
end
function M.get(id: string): (any, error?)
    M.calls = M.calls + 1
    if M.source then return nil, M.source end
    if M.malformed then return M.value, nil end
    return sql.get(id)
end
return M
