local M = {}

local function lifecycle_ok(_payload: any): table
    return { success = true }
end

M.created = lifecycle_ok
M.updated = lifecycle_ok
M.deleted = lifecycle_ok
M.committed = function(): (any?, any?)
    return { success = true }, nil
end

return M
